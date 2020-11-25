'use strict';

const fs = require('fs');
const xlsx = require('node-xlsx');

exports.output = function (buffer, file_name, save_file, excel_data, s_sheetName, s_sheetIndex, callback) {

    var temp = [];
    for (let i = 0;i<excel_data.length;i++) {
        let buf;
        if (i == s_sheetIndex) {
            buf = {
                name: s_sheetName,
                data: buffer
            };
        }
        else {
            buf = {
                name: excel_data[i].name,
                data: excel_data[i].data
            };
        }
        temp.push(buf);
    }
    var buf = xlsx.build(temp);

    if (save_file.length > 0) {
        fs.writeFile(save_file, buf, function (err) {
            if(err) throw err;
        });
    }
    else {
        fs.writeFile(file_name, buf, function (err) {
            if(err) throw err;
        });
    }
    

    callback(null, buf);
};