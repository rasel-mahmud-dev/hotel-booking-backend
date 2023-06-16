const {resolve} = require("path");
const nodeExternals = require("webpack-node-externals");
module.exports = {
    entry: './src/server.js',
    mode: "development",
    target: "node",
    watch: true,
    output: {
        path: resolve(__dirname, 'dist'),
        filename: 'main.js',
        chunkFilename: (pathData) => {
            return pathData.chunk.name === 'main' ? '[name].js' : '[name]/[name].js';
        },
        chunkFormat: 'commonjs',
        chunkLoading: 'async-node',
    },
    externals: [nodeExternals()],
    stats: {
        all: undefined,
        moduleAssets: false,
        dependentModules: false,
        excludeModules: false,
    },
    module: {
        rules: [
            {
                test: /\.(?:js|mjs|cjs)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: "defaults" }]
                        ]
                    }
                }
            }
        ]
    },
};