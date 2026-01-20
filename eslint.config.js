import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
// OBS: Om defineConfig/globalIgnores inte hittas kan du ta bort importen och bara exportera arrayen direkt.
// Men om det fungerade innan, behåll det!

export default [
    { ignores: ['dist', 'release'] }, // Lägg gärna till 'release' här så den inte klagar på bygget
    {
        files: ['**/*.{js,jsx}'],
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.node   // 👈 HÄR ÄR LÖSNINGEN: Lägg till Node-variabler (som process)
            },
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
        },
    },
]