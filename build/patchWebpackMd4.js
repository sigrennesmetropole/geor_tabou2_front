/**
 * Patch webpack's internal createHash to replace the unsupported MD4 algorithm
 * with SHA-256 when running on Node.js >= 17 (OpenSSL 3.x).
 *
 * Webpack 5.9.0 hardcodes createHash("md4") in several places (FileSystemInfo,
 * NormalModule, etc.). OpenSSL 3.x dropped MD4 support, causing
 * ERR_OSSL_EVP_UNSUPPORTED at build time.
 *
 * This patch intercepts crypto.createHash calls and transparently substitutes
 * "sha256" whenever "md4" is requested.  It only affects the build toolchain
 * (not the application itself) and uses a stronger algorithm.
 *
 * This file must be required at the very top of every webpack config entry
 * point BEFORE any webpack module is loaded.
 */
const crypto = require("crypto");

const originalCreateHash = crypto.createHash;

crypto.createHash = (algorithm, options) =>
    originalCreateHash(algorithm === "md4" ? "sha256" : algorithm, options);

