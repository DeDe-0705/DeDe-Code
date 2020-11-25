'use strict';

const { throws } = require('assert');
const { table } = require('console');
const Fs = require('fs');
const { version } = require('os');
const path = require('path');

var vm;
var file_name;
var max_length;
var s_index = []; // 搜索得到的记录在原先总记录的index。
var excel_data;
var s_sheetName;
var s_sheetIndex;
var first = true; // 第一次加载数据标志
var firstSearch = true;

var createVue = function (elem) {
    return new Vue({
        el: elem,
        data: {
            file: null,
            csv_name: "",
            display: false,
            searchKey: false,
            initBox: null,
            initSearch: null,
            search: '',
            table: {
                head: [],
                body: [],
                sheetName: [],
            },
        },
        computed: {
            searchData: function () {
                let search = this.search;
                var call_data = [];
                var h_data = [];
                s_index = []; //init
                var temp = this.table;
                let key = 0;
                if (search.length > 0 && firstSearch) {
                    for (let i = 0; i<temp.body.length; i++) {
                        let buf = temp.body[i];
                        for (let j = 0; j<buf.length; j++) {
                            let item = buf[j];
                            if (item == null || item == undefined || item == '') {
                                item = '';
                            }
                            item = item.toString();
                            if (item.search(search) != -1) {
                            buf.forEach((b_data) => {
                                h_data.push(b_data);
                            });
                            key = 1;
                            break;
                            }
                        }
                        if (key == 1) {
                            call_data.push(h_data);
                            s_index.push(i);
                            h_data = [];//清空缓存
                            key = 0;
                        }
                    }
                    firstSearch = false;
                }
                else {
                    this.searchKey = false;
                    firstSearch = true;
                }
                return call_data;
            }
        },
        methods: {
            _importFile () {
                var result = Editor.Dialog.openFile({
                    defaultPath: Editor.url('packages://xlsx_helper'),
                    properties: ['openFile'],
                    filters: [
                        {name: 'Excel File',extensions: ['xlsx','csv','xls']}
                    ]
                });

                if (!result || !result[0])
                    return;
                //init 复选框
                this.initBox = false; 
                this.display = false;
                //init 搜索框
                this.initSearch = false;
                //file为xlsx文件的对象实例。
                this.file = result[0];
                file_name = result[0];

                var table = this.table;
                let _this = this;
                let display = this.display;
                let funcBuf = this._selection;
                //IPC
                Editor.Ipc.sendToMain('xlsx_helper:import-file', result[0], function(error, json){
                    if (error) return;

                    //init 复选框
                    _this.initBox = true; 
                    //init 搜索框
                    _this.initSearch = true;
                    // init
                    first = true;
                    table.head = [];
                    table.body = []; 
                    table.sheetName = [];
                    for (let i = 0; i<json.length; i++) {
                        let buf = {
                            id: i,
                            name: json[i].name
                        };

                        table.sheetName.push(buf);
                    }
                    excel_data = json;

                    // 对于csv文件
                    let temp = path.basename(file_name).split('.');
                    let result = false;
                    if (temp[1] == "csv") {
                        result = true;
                    }
                    if (display && first && result) {
                        funcBuf({target: { value: 0}});
                        first = false;
                    }
                });
            },
            _onChange (event) {
                let buf = [];
                let index = 0;

                for (let i = 0; i<s_index.length; i++) {
                    buf = this.searchData[i];
                    index = s_index[i];
                    this.table.body[index] = buf;
                }
            },
            //生成的xlsx文件排版有瑕疵。
            _save () {
                let save_file = Editor.Dialog.saveFile({
					defaultPath: Editor.url('packages://xlsx_helper'),
					filters: [
						{name: 'Xlsx File', extensions: ['xlsx'] }
					]
                });
                
                if (!save_file || save_file === -1)
                    return;

                var buffer = [];
                var table = this.table;
                
                table.head.forEach((item) => {
                    buffer.push(item);
                });
                table.body.forEach((item) => {
                    buffer.push(item);
                });
                Editor.Ipc.sendToMain('xlsx_helper:output-file', buffer, file_name, save_file, excel_data, s_sheetName, s_sheetIndex, function(error){
                    if (error) return;
                    Editor.log("文件保存成功");
                });
            },
            _save_local () {
                let save_file = "";
                var buffer = [];
                var table = this.table;
                
                table.head.forEach((item) => {
                    buffer.push(item);
                });
                table.body.forEach((item) => {
                    buffer.push(item);
                });
                Editor.Ipc.sendToMain('xlsx_helper:output-file', buffer, file_name, save_file, excel_data, s_sheetName, s_sheetIndex, function(error){
                    if (error) return;
                    Editor.log("文件保存修改");
                });
            },
            _save_csv () {
                let save_file = Editor.Dialog.saveFile({
					defaultPath: Editor.url('packages://xlsx_helper'),
					filters: [
						{name: 'File', extensions: [''] }
					]
                });
                
                if (!save_file || save_file === -1)
                    return;
                
                this._save_local(); //导出同时保存修改内容。
                var buffer = [];
                var table = this.table;
                
                table.head.forEach((item) => {
                    buffer.push(item);
                });
                table.body.forEach((item) => {
                    buffer.push(item);
                });
                Editor.Ipc.sendToMain('xlsx_helper:output-csv', buffer, file_name, save_file, excel_data, s_sheetIndex, function(error){
                    if (error) return;
                    Editor.log("csv文件保存成功");
                });
            },
            _save_json () {
                let save_file = Editor.Dialog.saveFile({
					defaultPath: Editor.url('packages://xlsx_helper'),
					filters: [
						{name: 'File', extensions: [''] }
					]
                });
                
                if (!save_file || save_file === -1)
                    return;
                    
                this._save_local(); //导出同时保存修改内容。
                var buffer = [];
                var table = this.table;
                
                table.head.forEach((item) => {
                    buffer.push(item);
                });
                table.body.forEach((item) => {
                    buffer.push(item);
                });
                
                Editor.Ipc.sendToMain('xlsx_helper:output-json', buffer, file_name, save_file, excel_data, s_sheetIndex, function(error){
                    if (error) return;
                    Editor.log("json文件保存成功，ts脚本已经生成");
                });
            },
            _delete (index) {
                var table = this.table;
                table.body.splice(index, 1);
            },
            // 搜索中删除
            _delete_2 (index) {
                var table = this.table;
                var d_index = s_index[index];
                table.body.splice(d_index,1);
            },
            _addNew () {
                let e_data = new Array(max_length);
                this.table.body.push(e_data);
            },
            _startSearch () {
                this.searchKey = true;
            },
            _fileType1 () {
                let result = false;
                let temp = path.basename(this.file).split('.');
                if (temp[1] == "csv") {
                    this.csv_name = temp[0];
                    result = true;
                }
                return result;
            },
            _fileType2 () {
                let result = false;
                let temp = path.basename(this.file).split('.');
                if (temp[1] == "xlsx" || temp[1] == "xls") {
                    result = true;
                }
                return result;
            },
            _display(event) {
                this.display = event.currentTarget.value;
                if (this.display && first) {
                    let temp = path.basename(vm.file).split('.');
                    // xlsx文件第一次打开的时候，不会默认打开sheet1
                    if (temp[1] == "xlsx" || temp[1] == "xls") {
                        first = false;
                    }
                    else {
                        this._selection ({target: { value: 0}});
                        first = false;
                    }
                }
            },
            _selection (event) {
                let selected = event.target.value;
                
                if (selected == "a") {
                    this.table.head = [];
                    this.table.body = [];
                    return;
                }
                
                Editor.Ipc.sendToPanel('xlsx_helper', 'print_data', selected, function(error){
                    if (error) return;
                });
            }
        }
    });
};

Editor.Panel.extend({

    // jquery等操作在这里执行
    
    style: Fs.readFileSync(Editor.url('packages://xlsx_helper/panel/index.css')) + '',
    template: Fs.readFileSync(Editor.url('packages://xlsx_helper/panel/index.html')) + '',
    
    ready () {
        vm = createVue(this.shadowRoot);//如果删去shadowRoot，html就无法访问js的vue实例。
    },

    run (t_file) {
        //init 复选框
        vm.initBox = false; 
        vm.display = false;
        //init 搜索框
        vm.initSearch = false;

        Editor.Ipc.sendToPanel('xlsx_helper', 'import-file', t_file, function(error){
            if (error) return;
        });
    },
    dependencies: [
        // cocos的插件加载方式和平常的不太一样，在package.json中，
        // 我们main进去的是js，由js生成页面，所以要导入外部的js文件需要从这儿导入。
    ],
    messages: {
        'import-file' (event, file) {

            vm.initBox = true; // init 复选框。
            vm.initSearch = true;// init 搜索框

            Editor.Ipc.sendToMain('xlsx_helper:import-file', file, function(error, json){
                if (error)  {
                    Editor.error("读取文件失败！！！");
                    return;
                }

                // init
                file_name = file;
                first = true; // 每次加载数据的时候，first为true。
                vm.file = file_name;
                vm.table.head = [];
                vm.table.body = []; 
                vm.table.sheetName = [];
                
                for (let i = 0; i<json.length; i++) {
                    let buf = {
                        id: i,
                        name: json[i].name
                    };

                    vm.table.sheetName.push(buf);
                }
                excel_data = json;
                // 对于csv文件
                let temp = path.basename(vm.file).split('.');
                let result = false;
                if (temp[1] == "csv") {
                    result = true;
                }
                if (vm.display && first && result) {
                    vm._selection ({target: { value: 0}});
                    first = false;
                }
            });
        },
        'print_data' (event, s_signal) {
                let data = JSON.parse(JSON.stringify(excel_data[s_signal].data));// 深拷贝。
                s_sheetName = excel_data[s_signal].name;// 选中的表的名字。
                s_sheetIndex = s_signal;// 选中的表的序号。
                var table = vm.table;
                let data_length;
                let temp = [];
                // 表头
                var h_buf = data.splice(0, 3);
                //data.splice(0, 2); //删去表中不清楚的两条记录。
                table.head = []; // init
                
                h_buf.forEach((item) =>{
                    table.head.push(item);
                });

                // 计算某条长度最长的记录的长度为多少，max_length。
                for (let q = 0; q<=data.length-1; q++) {
                    temp.push(data[q].length);
                }

                for (let k = 0; k<temp.length-1; k++) {
                    for (let p = 0; p<temp.length-k-1; p++) {
                        if (temp[p] > temp[p+1]) {
                            let max = temp[p];
                            temp[p] = temp[p+1];
                            temp[p+1] = max;
                        }
                    }
                }
                data_length = temp[temp.length-1];
                max_length = data_length;
                for (let i = 0;i<=data.length-1;i++) {
                    if (data[i].length != data_length) {
                        let temp = data_length - data[i].length;
                        let e_buf = new Array(1);
                        for (let j = 0; j<temp; j++) {
                            data[i].push(e_buf);
                        }
                    }
                }
                table.body = data;
                data = [];
        },
    }
});