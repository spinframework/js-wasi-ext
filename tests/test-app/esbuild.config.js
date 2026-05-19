import wasiExtPlugin from "@spinframework/wasi-ext/plugin/esbuild";
import { SpinEsbuildPlugin } from "@spinframework/build-tools/plugins/esbuild/index.js";
import esbuild from "esbuild";

await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'build/bundle-esbuild.js',
    format: 'esm',
    minify: false,
    plugins: [
        await SpinEsbuildPlugin(),
        wasiExtPlugin(),
    ],
});
