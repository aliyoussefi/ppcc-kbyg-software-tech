"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.argv[2] || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new RangeError("Choose a port between 1024 and 65535.");
const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/data.js", ["data.js", "text/javascript; charset=utf-8"]],
  ["/sessions.js", ["sessions.js", "text/javascript; charset=utf-8"]],
  ["/maps.js", ["maps.js", "text/javascript; charset=utf-8"]],
  ["/exporter.js", ["exporter.js", "text/javascript; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/planner.js", ["planner.js", "text/javascript; charset=utf-8"]]
]);
const hosts = new Set([`localhost:${port}`, `127.0.0.1:${port}`]);
const server = http.createServer((request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Cache-Control", "no-store");
  if (!hosts.has(request.headers.host)) { response.writeHead(403); response.end("Localhost requests only."); return; }
  if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405, { Allow: "GET, HEAD" }); response.end("Method not allowed."); return; }
  let url;
  try { url = new URL(request.url, `http://127.0.0.1:${port}`); }
  catch (error) { if (!(error instanceof TypeError)) throw error; response.writeHead(400); response.end("Invalid URL."); return; }
  const file = files.get(url.pathname);
  if (!file) { response.writeHead(404); response.end("Not found."); return; }
  fs.readFile(path.join(__dirname, file[0]), (error, content) => {
    if (error) {
      console.error(`Unable to read ${file[0]}:`, error);
      response.writeHead(error.code === "ENOENT" ? 404 : 500);
      response.end("Unable to load the requested file.");
      return;
    }
    response.writeHead(200, { "Content-Type": file[1], "Content-Length": content.length });
    response.end(request.method === "HEAD" ? undefined : content);
  });
});
server.on("error", (error) => { console.error(`Preview server failed: ${error.message}`); process.exitCode = 1; });
server.listen(port, "127.0.0.1", () => console.log(`PPCC local preview: http://localhost:${port}/#start\nServing ${__dirname}\nLocalhost only; no files are uploaded.`));
process.on("SIGINT", () => server.close());
process.on("SIGTERM", () => server.close());
