module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        'react-native-reanimated/plugin',
        [
            '@babel/plugin-proposal-optional-chaining',
            ['@babel/plugin-proposal-decorators', {legacy: true}],
            'babel-plugin-transform-remove-imports',
            {
                test: ['react-toastify', 'exceljs', 'file-saver'],
            },
        ],
    ],
};
