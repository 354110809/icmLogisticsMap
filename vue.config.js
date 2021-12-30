
module.exports = {
    // productionSourceMap:false,
    publicPath: process.env.NODE_ENV === 'production' ? '/' : '/', // TODO: Remember to change this to fit your need
    lintOnSave: false,
    devServer: {
        proxy: {

            '^/icmApi': {
                target: 'http://etest.foton.com.cn', //福田测试环境登录
                pathRewrite: { '^/icmApi': '' },
                ws: true,
                changeOrigin: true
            },            
        },
        host: '0.0.0.0',
        port: 9999,
        // hot: true,
        // disableHostCheck: true,
    }
};