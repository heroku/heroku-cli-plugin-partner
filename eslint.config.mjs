import {includeIgnoreFile} from '@eslint/compat'
import oclif from 'eslint-config-oclif'
import prettier from 'eslint-config-prettier'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const gitignorePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.gitignore')

export default [
  includeIgnoreFile(gitignorePath),
  ...oclif,
  prettier,
  {
    rules: {
      // Disable object sorting to preserve meaningful order
      'perfectionist/sort-objects': 'off',
    }
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      // Allow snake_case in test fixtures to match API responses
      camelcase: 'off',
    }
  }
]
