// Large Lottie/Bodymovin JSON used to be pasted straight into the page HTML,
// which made pages several MB heavy and froze the browser while it parsed
// and built every animation at load. Instead, each animation's JSON is
// fetched at build time (Sanity's file CDN has no CORS headers, so the
// browser can't fetch it directly) and written to /assets/lottie/<hash>.json
// on our own domain, where the browser can lazy-load it only when needed.
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Kept on globalThis so watch-mode require-cache resets don't lose entries.
const files = (globalThis.__dewoleLottieFiles = globalThis.__dewoleLottieFiles || new Map());

function register(serialized) {
  const hash = crypto.createHash("sha1").update(serialized).digest("hex").slice(0, 12);
  const rel = `/assets/lottie/${hash}.json`;
  files.set(rel, serialized);
  return rel;
}

function writeAll(outDir) {
  for (const [rel, body] of files) {
    const file = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, body);
  }
}

module.exports = { register, writeAll };
