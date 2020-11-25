'use strict';

const fs = require('fs');
const path = require('path');

exports.output = function (buffer, file_name, save_file, excel_data, s_sheetIndex, callback) {

    var fileName = path.basename(file_name);
    var name_buf = fileName.split('.');
    var json = [];
    var dir = save_file + '/' + name_buf[0] + '_json';

    fs.mkdirSync(dir, { recursive: true }, (err) =>{
        if (err) throw err;
    });

    for (let i = 1;i<excel_data.length;i++) {
        let temp = excel_data[i].data;
        if ( i == s_sheetIndex) {
            let head = buffer.splice(0,1);
            let b_type = buffer.splice(0,1);
            let b_label = buffer.splice(0, 1);
            let label = b_label[0];// 中文标注
            let type = b_type[0];// 数据类型
            buffer.splice(0,2);
            buffer.forEach((item) => {
                let buf = {};
                head[0].forEach((key, index) => {
                    if (type[index] == "long") {
                        let data = item[index];
                        data = long(data);
                        let detail = {
                            "data": data,
                            "type": type[index],
                            "label": label[index]
                        };
                        buf[key] = detail;
                    }
                    if (type[index] == "intArray") {
                        let data = item[index];
                        data = intArray(data);
                        let detail = {
                            "data": data,
                            "type": type[index],
                            "label": label[index]
                        };
                        buf[key] = detail;
                    }
                    let detail = {
                        "data": item[index],
                        "type": type[index],
                        "label": label[index]
                    };
                    buf[key] = detail;
                });
                json.push(buf);
            });
        }
        else {
            let head = temp.splice(0,1);
            let b_type = temp.splice(0,1);
            let b_label = temp.splice(0, 1);
            let label = b_label[0];// 中文标注
            let type = b_type[0];// 数据类型
            temp.splice(0,2);
            temp.forEach((item) => {
                let buf = {};
                head[0].forEach((key, index) => {
                    if (type[index] == "long") {
                        let data = item[index];
                        data = long(data);
                        let detail = {
                            "data": data,
                            "type": type[index],
                            "label": label[index]
                        };
                        buf[key] = detail;
                    }
                    if (type[index] == "intArray") {
                        let data = item[index];
                        data = intArray(data);
                        let detail = {
                            "data": data,
                            "type": type[index],
                            "label": label[index]
                        };
                        buf[key] = detail;
                    }
                    let detail = {
                        "data": item[index],
                        "type": type[index],
                        "label": label[index]
                    };
                    buf[key] = detail;
                });
                json.push(buf);
            });
        }

        var name = "/" + excel_data[i].name + '.json';
        var namebuf = excel_data[i].name; //发送给输出ts的名。
        var output_path = dir + name; //存储地址。
        fs.writeFileSync(output_path, JSON.stringify(json, null, 4));
        // 生成ts脚本和json在同个路径。
        Editor.Ipc.sendToMain('xlsx_helper:output-ts', json, dir, namebuf, function(error){
            if (error) return;
        });
        json = []; //清零
    }
    callback(null, json);
};

function intArray (data) {
    data = data.split(",");
    let buf = [];
    data.forEach((item) =>{
        item = parseInt(item);
        buf.push(item);
    });
    return buf;
}

function long (data) {
    data = Number(data);
    return data;
}