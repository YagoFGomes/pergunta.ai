const { defineConfig } = require('orval');

const env = process.env;
const apiBaseUrl =
  env.NEXT_PUBLIC_API_URL ?? env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:8000';

const normalizedApiBaseUrl = apiBaseUrl.endsWith('/')
  ? apiBaseUrl.slice(0, -1)
  : apiBaseUrl;

const openApiSchemaUrl =
  env.OPENAPI_SCHEMA_URL ?? `${normalizedApiBaseUrl}/api/schema/`;

module.exports = defineConfig({
  backend: {
    input: {
      target: openApiSchemaUrl
    },
    output: {
      mode: 'split',
      target: './src/lib/api/generated/endpoints.ts',
      schemas: './src/lib/api/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      prettier: true,
      override: {
        query: {
          useQuery: true,
          useInfinite: true
        },
        mutator: {
          path: './src/lib/api/orval-fetcher.ts',
          name: 'customFetch'
        }
      }
    }
  }
});
