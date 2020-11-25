'use strict';

const path = require('path');
const excel = require('./lib/excel');
const output = require('./lib/output');
const csv = require('./lib/csv');
const json = require('./lib/out_json');
const ts = require('./lib/out_ts');

module.exports = {

    // isopen : false,

    load () {

    },

    unload () {

    },

    messages: {
        'open' () {
            Editor.Panel.open('xlsx_helper');
        },

        'import-file' (event, file) {
            //定义callback
            excel.import(file, function (error, json) {
                if (error) {
                    Editor.error(error);
                }
                event.reply && event.reply(error, json);
            });
        },

        'output-file' (event, buffer, file_name, save_file, excel_data, s_sheetName, s_sheetIndex) {
            output.output(buffer, file_name, save_file, excel_data, s_sheetName, s_sheetIndex, function (error) {
                if (error) {
                    Editor.log('error!');
                }
                event.reply && event.reply(error);
            });
        },
        'output-csv' (event, buffer, file_name, save_file, excel_data, s_sheetIndex) {
            csv.output(buffer, file_name, save_file, excel_data, s_sheetIndex, function (error) {
                if (error) {
                    Editor.log('csv_error!');
                }
                event.reply && event.reply(error);
            });
        },
        'output-json' (event, buffer, file_name, save_file, excel_data, s_sheetIndex) {
            json.output(buffer, file_name, save_file, excel_data, s_sheetIndex, function (error){
                if (error) {
                    Editor.log('json_error!');
                }
                event.reply && event.reply(error);
            });
        },
        'output-ts' (event,json, dir, namebuf) {
            ts.output(json, dir, namebuf, function (error) {
                if (error) {
                    Editor.log('ts_error!');
                }
                event.reply && event.reply(error);
            });
        },
        'selection:selected'(event) {
            const s_file = Editor.Selection.curSelection('asset');//获取当前选中文件的uuid。
            const t_file = Editor.assetdb.uuidToFspath(s_file);

            let temp = path.basename(t_file).split('.');
            const judge = temp[1];
            if (judge == "csv" || judge == "xlsx" || judge == "xls") {
                Editor.Panel.open('xlsx_helper', t_file);//选中打开面板。
                Editor.Ipc.sendToPanel('xlsx_helper', 'import-file', t_file, function(error){
                    if (error) return;
                });
            }
        }
    }
};
