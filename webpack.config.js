const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

var config = {
    context: __dirname + '/src',
	entry: {
		'ngx-ui-ext.umd': ['./ngx-ui-ext.ts'],
		'ngx-ui-ext.umd.min': ['./ngx-ui-ext.ts'],
        'ngx-ui-ext': './ngx-ui-ext.css'
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'src/bundles/[name].js',
		libraryTarget: 'umd',
		library: 'NgxUIExt',
		umdNamedDefine: true
	},
	resolve: {
		extensions: ['.ts', '.json', '.js', '.css', '.scss', '.sass']
	},
	devtool: 'source-map',
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			minimize: true,
			include: /\.min\.js$/,
		}),
        new ExtractTextPlugin("src/bundles/[name].css", {allChunks: true})
	],
	module: {
        rules: [
			{
                test: /\.ts$/,
				loader: 'awesome-typescript-loader',
				exclude: /node_modules|\.(spec|e2e)\.ts$/
			},
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    // use: 'css-loader'
                    use: [
                        {
                            loader: 'css-loader',
                            query: {
                                minimize: true
                            }
                        }
                    ]
                }),
                exclude: [/node_modules/]
            },
            {
                test: /\.(sass|scss)$/,
                loaders: ['to-string-loader', 'css-loader', 'postcss-loader', 'resolve-url-loader', 'sass-loader']
            }
		]
	},
    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    externals: [nodeExternals()] // in order to ignore all modules in node_modules folder
};

module.exports = config;