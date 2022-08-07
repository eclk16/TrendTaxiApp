module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
      [
      "babel-plugin-transform-remove-imports",
      {
        "test": [
          'react-toastify',
          'exceljs',
          'file-saver',
        ]
      },
    ],
    'react-native-reanimated/plugin'
  ]
};