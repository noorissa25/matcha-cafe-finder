// Serve the static demo build locally under /matcha-cafe-finder, like GitHub Pages.
// Usage: npm run preview:demo (builds ./out first).
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../out", import.meta.url));
const base = "/matcha-cafe-finder";
const port = Number(process.env.PORT ?? 3102);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".txt": "text/plain; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".woff2": "font/woff2",
};

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (!url.pathname.startsWith(base)) {
    res.writeHead(302, { Location: `${base}/` }).end();
    return;
  }
  let file = normalize(join(root, decodeURIComponent(url.pathname.slice(base.length))));
  if (!file.startsWith(root)) return void res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) file = join(root, "404.html");
  res.writeHead(file.endsWith("404.html") && !url.pathname.endsWith("404.html") ? 404 : 200, {
    "Content-Type": types[extname(file)] ?? "application/octet-stream",
  });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Demo preview on http://localhost:${port}${base}/`));
