type ElementConstructor<T extends Element> = new () => T

export function findElement<T extends Element>(
  selector: string,
  constructor: ElementConstructor<T>,
  root: ParentNode = document,
): T | null {
  const element = root.querySelector(selector)
  if (element === null) return null
  if (!(element instanceof constructor)) {
    throw new Error(`Unexpected element type for ${selector}`)
  }
  return element
}

export function requireElement<T extends Element>(
  selector: string,
  constructor: ElementConstructor<T>,
  root: ParentNode = document,
): T {
  const element = findElement(selector, constructor, root)
  if (!element) throw new Error(`Missing required element: ${selector}`)
  return element
}

export function findElements<T extends Element>(
  selector: string,
  constructor: ElementConstructor<T>,
  root: ParentNode = document,
): T[] {
  return Array.from(root.querySelectorAll(selector)).filter(
    (element): element is T => element instanceof constructor,
  )
}
