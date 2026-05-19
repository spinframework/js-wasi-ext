module.exports = class WasiExtPlugin {
    constructor() {
        this.fallbacks = {
            process: require.resolve('../lib/process'),
            fs: require.resolve('../lib/fs'),
            path: require.resolve('path-browserify'),
        };

    }

    apply(compiler) {
        const webpack = compiler.webpack;

        const providePlugin = new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: [require.resolve('../lib/process'), 'default'],
        });

        // Add a NormalModuleReplacementPlugin to handle `node:` imports
        const normalModuleReplacements = [
            ['node:fs', 'fs'],
            ['node:process', 'process'],
            ['node:path', 'path'],
        ].map(([from, to]) => new webpack.NormalModuleReplacementPlugin(
            new RegExp(`^${from}$`),
            to
        ));

        compiler.options.resolve.fallback = {
            ...compiler.options.resolve.fallback,
            ...this.fallbacks,
        };


        compiler.options.plugins = compiler.options.plugins || [];
        compiler.options.plugins.push(providePlugin, ...normalModuleReplacements);
    }
};
