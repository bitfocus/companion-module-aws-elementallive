const { generateEslintConfig } = require('@companion-module/tools/eslint/config.mjs')

const baseConfig = await generateEslintConfig({})

export default baseConfig
