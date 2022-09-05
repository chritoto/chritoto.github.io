// vue.config.js
module.exports = {
    publicPath:'./',
    chainWebpack: config => {
        config
        .plugin('html')
        .tap(args => {
          args[0].title = 'Simulateur CHM-1000'
          return args
        })
    }
}