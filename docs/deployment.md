# Deployment Guide: Netlify, Hostinger hPanel & Static Hosts

This personal site is built using Next.js with **static HTML export** (`output: 'export'` in `next.config.mjs`). Building the site compiles all pages into pre-rendered HTML, CSS, JavaScript, and metadata in the `out/` directory.

---

## 1. Netlify Deployment

### Why it failed previously

- **Wrong Publish Directory**: Netlify automatically detected Next.js and defaulted to publishing `.next` or running `@netlify/plugin-nextjs`. Because this site uses `output: 'export'`, the static HTML files are generated into `out/`, not `.next`.
- **Plugin Conflict**: Netlify's Next.js Runtime plugin expects a server-rendered or serverless Next.js app, which conflicts with static exports.
- **Node Version**: The repository baseline in `.nvmrc` is Node 26, which standard Netlify build runners cannot install, causing build errors.

### Solution & Settings

The repository now includes `netlify.toml` which configures Netlify automatically:

```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "22"
  NETLIFY_NEXT_PLUGIN_SKIP = "true"

[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404
```

### Steps to Deploy on Netlify:

1. Connect your repository to Netlify via **Add new site > Import an existing project**.
2. Netlify will automatically detect `netlify.toml` and prefill:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
3. Click **Deploy Site**. The build will complete and deploy cleanly.

---

## 2. Hostinger hPanel Deployment

Hostinger supports two main deployment methods: **Shared Web Hosting (`public_html`)** and **Node.js Application**.

### Method A: Shared / Cloud Web Hosting (`public_html`) — _Recommended_

This is the fastest, most reliable method because static files do not consume Node server memory or crash.

#### Why it failed previously:

- Deploying the raw repository into `public_html` places files like `package.json`, `app/`, and `src/` at the root. Hostinger's web server looks for `index.html` and finds none, throwing **403 Forbidden** or showing the default Hostinger placeholder.
- Uploading the `out` folder itself results in the site living at `yourdomain.com/out/` with broken asset paths.
- Missing `.htaccess` prevented LiteSpeed/Apache from handling clean URLs (e.g. `/about/`), trailing slashes, and custom 404 error handling.

#### Correct Deployment Steps:

1. Build the site locally or in CI:
   ```bash
   npm run build
   ```
2. Open the generated `out/` directory.
3. In Hostinger hPanel, go to **Websites > Manage > File Manager** (or connect via FTP).
4. Navigate into your website's **`public_html/`** folder.
5. Upload the **contents** of `out/` directly into `public_html/` (so that `index.html`, `404.html`, `_next/`, and `.htaccess` are directly inside `public_html/`).
6. The repository's `public/.htaccess` is automatically copied to `out/.htaccess` during build. It handles directory trailing slashes, clean URLs, MIME types, and 404 routing.

---

### Method B: Automated Deployment to Hostinger via GitHub Actions

To automatically build and deploy every commit pushed to `main` to Hostinger:

1. In Hostinger hPanel, obtain your FTP credentials (**Files > FTP Accounts**).
2. In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:
   - `FTP_SERVER`: Your Hostinger FTP Host (e.g. `ftp.yourdomain.com`)
   - `FTP_USERNAME`: Your Hostinger FTP Username
   - `FTP_PASSWORD`: Your Hostinger FTP Password
3. Add a GitHub Actions workflow in `.github/workflows/deploy-hostinger.yml`:
   ```yaml
   name: Deploy to Hostinger
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 22
         - run: npm ci
         - run: npm run build
         - name: Sync to Hostinger FTP
           uses: SamKirkland/FTP-Deploy-Action@v4.3.5
           with:
             server: ${{ secrets.FTP_SERVER }}
             username: ${{ secrets.FTP_USERNAME }}
             password: ${{ secrets.FTP_PASSWORD }}
             local-dir: ./out/
             server-dir: ./public_html/
   ```

---

### Method C: Hostinger Node.js Application (in hPanel)

If you have Hostinger VPS or Business/Cloud hosting with the **Node.js** feature in hPanel:

#### Why it failed previously:

- Hostinger requires an Application startup file (e.g., `server.mjs`) and an `npm start` command.
- Next.js with `output: 'export'` disables `next start`.
- No `start` script existed in `package.json`.

#### How to configure:

1. In hPanel, navigate to **Node.js > Create Application**.
2. Settings:
   - **Node.js version**: `22.x` (or `24.x`)
   - **Application root**: Path to your uploaded project directory
   - **Application startup file**: `server.mjs`
3. In the terminal or build command section:
   ```bash
   npm install
   npm run build
   ```
4. The repo includes `server.mjs` and `"start": "node server.mjs"` in `package.json`. It will serve the exported `out/` static directory on the dynamic port Hostinger assigns.

---

## 3. Site URL & Metadata Configuration

Before deploying to your production domain, update the canonical site URL:

1. **`src/lib/utils.ts`**:
   ```typescript
   export const SITE_URL = 'https://yourdomain.com'; // No trailing slash
   ```
2. **`package.json`**:
   ```json
   "homepage": "https://yourdomain.com/"
   ```
3. Re-run share card and icon generators if branding or URLs changed:
   ```bash
   npm run og
   npm run icons
   ```
4. Rebuild the site:
   ```bash
   npm run build
   ```
