require('../patchWebpackMd4');
const path = require("path");
const fs = require("fs");

const createExtensionWebpackConfig = require('../../MapStore2/build/createExtensionWebpackConfig');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const { name } = require('../../config');
const commons = require('./commons');

// read version.txt and produce a temporary updated index.json
const versionFile = path.resolve(__dirname, "..", "..", "version.txt");
const indexSrc = path.resolve(__dirname, "..", "..", "assets", "index.json");
const tmpIndex = path.resolve(__dirname, "..", "..", "assets", "index.json.tmp");

try {
    const versionText = fs.readFileSync(versionFile, 'utf8').trim();
    const indexContent = JSON.parse(fs.readFileSync(indexSrc, 'utf8'));
    if (Array.isArray(indexContent.plugins)) {
        indexContent.plugins = indexContent.plugins.map(p => p && p.name === name ? { ...p, version: versionText } : p);
    }
    fs.writeFileSync(tmpIndex, JSON.stringify(indexContent, null, 4), 'utf8');
} catch (e) {
    // keep behavior silent here; build will fail later if necessary
    console.error('Error updating index.json from version.txt:', e);
}

// the build configuration for production allow to create the final zip file, compressed accordingly
const plugins = [
    new FileManagerPlugin({
        events: {
            onEnd: {
                copy: [
                    { source: path.resolve(__dirname, "..", "..", "assets", "translations"), destination: 'dist/translations' },                    // copy the temporary updated index.json instead of the original
                    { source: tmpIndex, destination: 'dist/index.json' }
                ],
                archive: [
                    {
                        source: 'dist', destination: `dist/${name}.zip`,
                    },
                ],
                // remove the temporary file after packaging
                delete: [
                    tmpIndex
                ]
            },
        },
    })
];

const fileLoader = {
    test: /\.(ttf|eot)(\?v=[0-9].[0-9].[0-9])?$/,
    use: [{
        loader: 'file-loader',
        options: {
            name: "[name].[ext]"
        }
    }]
};

const urlLoader = {
    test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/,
    use: [{
        loader: 'url-loader',
        options: {
            mimetype: "application/font-woff"
        }
    }]
};


const {module: moduleObj, ...extensionConfig} = createExtensionWebpackConfig({ prod: true, name, ...commons, plugins});

module.exports = {
    ...extensionConfig,
    output: { ...extensionConfig.output, hashFunction: 'sha256' },
    module: {...moduleObj, rules: [...moduleObj.rules, fileLoader, urlLoader]}
};
