export default {
  '**/*.{js,mjs,cjs}': ['prettier --write', 'eslint --max-warnings=0'],
  '**/!(*.js|*.mjs|*.cjs)': 'prettier --write --ignore-unknown',
}
