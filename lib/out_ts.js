'use strict'

const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

exports.output = function (json, dir, namebuf, callback) {
    var file_path = path.join(__dirname, '/ts_emplate.ejs');
    var dir = path.join(path.dirname(dir), '/ts');

    fs.mkdirSync(dir,{ recursive: true }, (error) =>{
        if (error) throw error;
    });

    var name = namebuf;
    var data = {
        Json : json,
        Name : name
    }
    var temp = fs.readFileSync(file_path, 'utf-8');
    var ret = ejs.render(temp, {
        users: data,
        filename: file_path
    });
    var s_path = dir + '/' + name + '.ts';
    fs.writeFile(s_path, ret, function (err) {
        if(err) throw err;
    });
};








