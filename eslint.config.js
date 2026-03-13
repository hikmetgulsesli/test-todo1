import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021
            }
        },
        rules: {
            'no-unused-vars': 'warn'
        }
    },
    {
        files: ['jest.config.js', 'jest.setup.js', '__tests__/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest
            }
        }
    },
    {
        files: ['script.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021,
                module: 'readonly'
            }
        }
    }
];
