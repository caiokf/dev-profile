# Notion Proxy Worker

Cloudflare Worker that proxies requests to the Notion API, adding authentication and CORS headers.

## Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Add your Notion API key**
   ```bash
   pnpm cf:secret NOTION_API_KEY
   # Paste your secret_xxx key when prompted
   ```

3. **Deploy**
   ```bash
   pnpm cf:deploy
   ```

4. **Note the worker URL**
   After deployment, you'll get a URL like:
   ```
   https://notion-proxy.<your-subdomain>.workers.dev
   ```

5. **Configure the web app**
   Add to `apps/web/.env`:
   ```bash
   VITE_NOTION_PAGE_ID=your-page-id
   VITE_NOTION_WORKER_URL=https://notion-proxy.<your-subdomain>.workers.dev
   ```

## Local Development

```bash
pnpm dev
```

This starts the worker locally at `http://localhost:8787`.

## Configuration

### Allowed Origins

By default, these origins are allowed:
- `http://localhost:5173`
- `http://localhost:4173`
- `http://127.0.0.1:5173`
- `https://caiokf.github.io`

To customize, set the `ALLOWED_ORIGINS` environment variable (comma-separated):

```bash
wrangler secret put ALLOWED_ORIGINS
# Enter: https://yourdomain.com,https://app.yourdomain.com
```

## API Usage

The worker proxies all requests to Notion's API. Just replace `https://api.notion.com` with your worker URL:

```js
// Instead of:
fetch('https://api.notion.com/v1/blocks/xxx/children', { ... })

// Use:
fetch('https://notion-proxy.xxx.workers.dev/v1/blocks/xxx/children')
```

The worker automatically adds:
- `Authorization` header with your Notion API key
- `Notion-Version` header
- CORS headers for browser requests
