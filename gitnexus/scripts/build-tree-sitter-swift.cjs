#!/usr/bin/env node
/**
 * Activate tree-sitter-swift prebuilds under node_modules/ after materialize.
 *
 * The vendored package ships platform prebuilds; node-gyp-build selects the
 * correct binary. We run it here instead of an npm `install` script on the
 * vendored package (same #836 hygiene as dart/proto).
 */
const fs = require('fs');
const path = require('path');

if (process.env.GITNEXUS_SKIP_OPTIONAL_GRAMMARS === '1') {
  console.warn(
    '[tree-sitter-swift] Skipping prebuild activation (GITNEXUS_SKIP_OPTIONAL_GRAMMARS=1).',
  );
  process.exit(0);
}

const swiftDir = path.join(__dirname, '..', 'node_modules', 'tree-sitter-swift');

try {
  if (!fs.existsSync(path.join(swiftDir, 'bindings', 'node', 'index.js'))) {
    process.exit(0);
  }

  const nodeGypBuild = require('node-gyp-build');
  nodeGypBuild(swiftDir);
} catch (err) {
  console.warn('[tree-sitter-swift] Could not activate prebuild:', err.message);
  console.warn(
    '[tree-sitter-swift] Swift parsing will be unavailable. Non-Swift functionality is unaffected.',
  );
  process.exit(0);
}
