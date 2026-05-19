const path = require('path');

/**
 * An esbuild plugin that provides WASI-ext shims for process, fs, and path,
 * and handles `node:` prefixed imports.
 */
function wasiExtPlugin() {
    return {
        name: 'wasi-ext',
        setup(build) {
            const resolves = {
                'process': path.resolve(__dirname, '../lib/process.js'),
                'node:process': path.resolve(__dirname, '../lib/process.js'),
                'fs': path.resolve(__dirname, '../lib/fs.js'),
                'node:fs': path.resolve(__dirname, '../lib/fs.js'),
                'path': require.resolve('path-browserify'),
                'node:path': require.resolve('path-browserify'),
            };

            // Resolve the shimmed modules
            build.onResolve({ filter: /^(node:)?(process|fs|path)$/ }, (args) => {
                if (resolves[args.path]) {
                    return { path: resolves[args.path] };
                }
            });

            // Inject process and Buffer globals
            build.initialOptions.inject = build.initialOptions.inject || [];
            build.initialOptions.define = build.initialOptions.define || {};

            // Inject Buffer global from the buffer package
            const bufferShimPath = path.resolve(__dirname, 'shims/buffer-global.js');
            if (!build.initialOptions.inject.includes(bufferShimPath)) {
                build.initialOptions.inject.push(bufferShimPath);
            }
        },
    };
}

module.exports = wasiExtPlugin;
