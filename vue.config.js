module.exports = {
  outputDir: 'dist',
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        appId: 'electron_update_test',
        productName: 'electron_update_test',
        publish: [
          {
            provider: 'generic',
            url: 'http://10.10.5.69:8080'
          }
        ],
        linux: {
          target: [
            {
              target: 'AppImage'
            }
          ]
        },
        asar: false
      }
    }
  }
};
