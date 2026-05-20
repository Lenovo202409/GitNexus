import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const GITNEXUS_ROOT = path.resolve(import.meta.dirname, '../..');
const SCRIPT = path.join(GITNEXUS_ROOT, 'scripts', 'materialize-vendor-grammars.cjs');

describe('materialize-vendor-grammars.cjs', () => {
  it('copies vendor grammars into node_modules without symlinks', () => {
    const tmp = fs.mkdtempSync(path.join(GITNEXUS_ROOT, '.tmp-materialize-'));
    try {
      for (const name of ['tree-sitter-dart', 'tree-sitter-proto', 'tree-sitter-swift']) {
        const vendorSrc = path.join(GITNEXUS_ROOT, 'vendor', name);
        fs.cpSync(vendorSrc, path.join(tmp, 'vendor', name), { recursive: true });
      }

      const pkg = {
        name: 'gitnexus-test-fixture',
        version: '0.0.0',
        scripts: { postinstall: 'node scripts/materialize-vendor-grammars.cjs' },
      };
      fs.mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
      fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify(pkg));
      fs.copyFileSync(SCRIPT, path.join(tmp, 'scripts', 'materialize-vendor-grammars.cjs'));

      execFileSync(process.execPath, [path.join(tmp, 'scripts', 'materialize-vendor-grammars.cjs')], {
        cwd: tmp,
        stdio: 'pipe',
      });

      const dartDest = path.join(tmp, 'node_modules', 'tree-sitter-dart');
      expect(fs.existsSync(dartDest)).toBe(true);
      const dartItem = fs.lstatSync(dartDest);
      expect(dartItem.isSymbolicLink()).toBe(false);
      expect(dartItem.isDirectory()).toBe(true);
      expect(fs.existsSync(path.join(dartDest, 'binding.gyp'))).toBe(true);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
