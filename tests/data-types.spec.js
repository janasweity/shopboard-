import { test, expect } from '@playwright/test'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {
  products,
  collections,
  categories,
  categoryAliases,
  retiredProducts,
  rooms,
} from '../src/data.ts'

// Compile isolated consumers using the installed compiler and project rules.
function diagnosticsFor(source) {
  fs.mkdirSync('test-results', { recursive: true })
  const directory = fs.mkdtempSync(path.resolve('test-results/type-contract-'))
  const filename = path.join(directory, 'consumer.ts')
  const configPath = path.join(directory, 'tsconfig.json')
  try {
    fs.writeFileSync(filename, source.replaceAll("'./", "'../../src/"))
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        extends: '../../tsconfig.json',
        include: ['consumer.ts'],
      }),
    )
    const result = spawnSync(
      process.execPath,
      [
        path.resolve('node_modules/typescript/bin/tsc'),
        '--project',
        configPath,
        '--noEmit',
        '--pretty',
        'false',
      ],
      { encoding: 'utf8' },
    )
    if (result.error) throw result.error
    const output = result.stdout + result.stderr
    if (result.status !== 0 && !output.includes('error TS'))
      throw new Error(output)
    return [...output.matchAll(/error TS(\d+): (.*)/g)].map((match) => ({
      code: Number(match[1]),
      message: match[2],
    }))
  } finally {
    for (const file of [filename, configPath]) {
      if (fs.existsSync(file)) fs.unlinkSync(file)
    }
    fs.rmdirSync(directory)
  }
}

test('catalogue declarations match every actual product, variant and metadata export', () => {
  const values = {
    products,
    collections,
    categories,
    categoryAliases,
    retiredProducts,
    rooms,
  }
  const assignments = Object.entries(values)
    .map(
      ([name, value]) =>
        `export const ${name}: typeof import('./data.ts').${name} = ${JSON.stringify(value)};`,
    )
    .join('\n')
  const diagnostics = diagnosticsFor(
    assignments +
      `
    import { products as catalogue, getVariant, money, productURL, categoryName, collectionName } from './data.ts';
    import { selectProducts } from './modules/products/products.logic.ts';
    import { loadProducts } from './modules/products/products.client.ts';
    import { calculateCart, cartKey, resolveCartItem, normalizeCart } from './modules/cart/cart.logic.ts';
    import { calculateRoomArea } from './modules/rooms/rooms.logic.ts';
    import { getCart, addCartItem, changeCartItem, clearCart, claimEntranceSession, CART_STORAGE_KEY } from './state.ts';
    import { initializeUI } from './ui.ts';
    const product = catalogue[0];
    const price: number = getVariant(product).price;
    const labels: string[] = [money(price), productURL(product.id), categoryName(product.category), collectionName(product.collection)];
    const selected: typeof catalogue = selectProducts(catalogue, {query: 'ARC', category: 'living-room', sort: 'price-asc'});
    const subtotal: number = calculateCart(getCart()).subtotal;
    const area: number = calculateRoomArea(4, 3);
    const entranceClaimed: boolean = claimEntranceSession(false);
    const storageKey: string = CART_STORAGE_KEY;
    const key: string = cartKey(product.id, product.variants[0].id);
    const restored = normalizeCart([{productId: product.id, variantId: product.variants[0].id, quantity: 1}]);
    const restoredSubtotal: number = calculateCart(restored.values()).subtotal;
    const resolved = resolveCartItem(getCart()[0]);
    if (resolved) {
      const linePrice: number = resolved.variant.price;
      void linePrice;
    }
    addCartItem(product.id, product.variants[0].id);
    changeCartItem(key, 'increase');
    clearCart();
    initializeUI({products: catalogue, loadProducts, selectProducts, calculateCart, calculateRoomArea, getCart, addCartItem, changeCartItem, clearCart, claimEntranceSession});
    void [labels, selected, subtotal, area, entranceClaimed, storageKey, restoredSubtotal];
  `,
  )
  expect(diagnostics.map((diagnostic) => diagnostic.message)).toEqual([])
})

test('typed boundaries reject incorrect prices, variants, cart entries and UI dependencies', () => {
  const diagnostics = diagnosticsFor(`
    import { products, getVariant, money } from './data.ts';
    import { calculateCart } from './modules/cart/cart.logic.ts';
    import { calculateRoomArea } from './modules/rooms/rooms.logic.ts';
    import { addCartItem, changeCartItem, claimEntranceSession } from './state.ts';
    import { initializeUI } from './ui.ts';
    products[0].price = 'free';
    getVariant(products[0]).available = 'yes';
    money('12');
    calculateCart([{productId: 'arc-sofa', variantId: 'original', quantity: 'two'}]);
    initializeUI({products});
    calculateRoomArea('4', 3);
    addCartItem('arc-sofa', 1);
    changeCartItem('arc-sofa::original', 'delete');
    claimEntranceSession('true');
  `)
  expect(diagnostics).toHaveLength(9)
  expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
    2322, 2322, 2345, 2345, 2740, 2345, 2345, 2345, 2345,
  ])
})
