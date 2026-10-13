import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import outline from '../outlines.json';

const assetId = (outline as typeof outline & { moduleIdentity?: { id: string } }).moduleIdentity?.id
  ?? '_pending-data-annotation-augmentation';

// Include this course's resources in its standalone review build.
export default defineConfig({
  plugins: [react(), {
    name: 'data-annotation-course-assets',
    async generateBundle() {
      const root = resolve('assets', assetId);
      const emitDirectory = async (directory: string): Promise<void> => {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
          const path = resolve(directory, entry.name);
          if (entry.isDirectory()) await emitDirectory(path);
          else this.emitFile({ type: 'asset', fileName: `${assetId}/${relative(root, path)}`, source: await readFile(path) });
        }
      };
      await emitDirectory(root);
    },
  }],
  publicDir: 'assets',
  server: { host: '127.0.0.1', port: 5184, strictPort: true },
  build: {
    copyPublicDir: false,
    rollupOptions: { input: 'modules/Data-Annotation-Augmentation/preview.html' },
  },
});
