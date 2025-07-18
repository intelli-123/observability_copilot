`docker build --no-cache -t observability-copilot:v1 .`

`docker run --env-file .env -d -p 3005:3000 --name observability-copilot observability-copilot:v1`

**NOTE:** Need to create .env file with
## Google Gemini API key
GEMINI_API_KEY=     ("" not required)

## From Vercell KV
REDIS_URL= ("" not required)

## Created by Vercel CLI
VERCEL_OIDC_TOKEN=""


