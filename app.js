const express = require('express');
const path = require('path');
var app = express();
app.use(express.static(path.resolve(__dirname, './dist')))


//监听3002端口
app.listen(5555, '0.0.0.0', () => {
    console.log('项目启动成功：端口5555');
});