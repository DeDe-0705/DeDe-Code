'use strict';

const fs = require('fs');
const path = require('path');
const xlsx = require('node-xlsx');

exports.import = function (file, callback) {
    var json = null;

    if (!fs.existsSync(file)) {
        return callback(new Error('找不到指定文件'), json);
    }

    var extname = path.extname(file);

    switch (extname) {
        case '.xlsx':
            json = xlsx.parse(file);
            //Editor.log(json[1].data[1]);//json[0]指第一个表。
            break;
        case '.csv':
            json = xlsx.parse(file);
            break;
        // default:
        //     callback(new Error('导入 excel 出现错误 - 未知的文件格式'), json);
    }

    callback(null, json);
};