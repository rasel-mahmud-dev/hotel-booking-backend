const {resolve} = require("path");
const nodeExternals = require("webpack-node-externals");
const path = require("path");


const isProd = process.env.NODE_ENV === "production"


module.exports = {
    entry: './src/server.js',
    mode: isProd ?  "production": "development",
    target: "node",
    watch: !isProd,
    output: {
        path: resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.bundle.js',
        chunkFormat: 'commonjs',
        chunkLoading: 'async-node',
        assetModuleFilename: (pathData) => {
            const filepath = path
                .dirname(pathData.filename)
                .split("/")
                .slice(1)
                .join("/");
            return `${filepath}/[name].[hash][ext][query]`;
        },
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    externals: [nodeExternals()],
    resolve: {
        alias: {
            src: path.resolve(__dirname, "src/")
        }
    },
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
                type: 'asset/resource',
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