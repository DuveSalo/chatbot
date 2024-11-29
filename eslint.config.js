import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Add Node.js globals
        process: 'readonly', // Explicitly allow 'process'
      },
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    rules: {
      'no-undef': 'error', // Keep this rule enabled
      'no-unused-vars': ['warn', { vars: 'all', args: 'none', ignoreRestSiblings: true }],
    },
  },
  pluginJs.configs.recommended,
];