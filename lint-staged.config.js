export default {
  '**/*.{js,mjs,cjs,ts}': ['prettier --write', 'eslint --max-warnings=0'],
  '**/!(*.js|*.mjs|*.cjs|*.ts)': 'prettier --write --ignore-unknown',
}
