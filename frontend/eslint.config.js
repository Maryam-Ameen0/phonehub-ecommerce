import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // This rule flags the standard "fetch data in useEffect" pattern used
      // throughout this app's pages (Shop, ProductDetail, etc.) as an error.
      // That pattern is intentional here, so it's downgraded to a warning.
      'react-hooks/set-state-in-effect': 'warn',
      // AuthContext.jsx intentionally exports both the AuthProvider component
      // and the useAuth hook from the same file — a standard context pattern.
      'react-refresh/only-export-components': 'warn',
    },
  },
])
