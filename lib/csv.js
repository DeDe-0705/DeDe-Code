'use strict';

const fs = require('fs');
const path = require('path');
exports.output = function (buffer, file_name, save_file, excel_data, s_sheetIndex, callback) {
    var buf = '\ufeff';
    var fileName = path.basename(file_name);
    var name_buf = fileName.split('.'); 
    var dir = save_file + '/' + name_buf[0];

    fs.mkdirSync(dir, { recursive: true }, (err) =>{
        if (err) throw err;
    });
    
    for (let i = 0;i<excel_data.length;i++) {
        let temp = excel_data[i].data;
        if ( i == s_sheetIndex) {
            buffer.forEach((item) =>{
                for (let j = 0;j<item.length;j++) {
                    if (item[j] == "null" || item[j] == " " || item[j] == undefined) {
                        item[j] = " ";
                    }
                    if (item[j] != null && item[j] != undefined && item[j] != " " && item[j] == 0) {
                        // isNaN()     number
                        item[j] = '0';
                    }
                    buf += item[j] + ',';
                }
                buf += '\n';  
            });
        }
        else {
            temp.forEach((item) => {
                for (let j = 0;j<item.length;j++) {
                    if (item[j] == "null" || item[j] == "" || item[j] == undefined) {
                        item[j] = "";
                    }
                    buf += item[j] + ',';
                }
                buf += '\n';
            });
        }
        
        var name = "/" + excel_data[i].name + '.csv'; //文件名
        var output_path = dir + name; //存储地址。
        
        fs.writeFile(output_path, buf, function (err) {
            if(err) throw err;
        });
        buf = '\ufeff'; //清零，开始存储下一个表内容。
    }
    callback(null, buf);
};