# easy_mysql

[![NPM Version][npm-image]][npm-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Linux Build][travis-image]][travis-url]

## Install
```sh
$ npm install easy_mysql
```

## 配置
```js
var easy_mysql = require('easy_mysql');
easy_mysql.config({
    "database": "mytest",
    "user": "root"
});
```
## 可选配置
* `host`: 要连接到数据库的主机名 (默认:`localhost`)
* `port`: 端口号 (默认: `3306`)
* `user`: MySQL 用户名
* `password`: MySQL 密码
* `database`: 数据库名
* `charset`: 编码 (默认: `'UTF8_GENERAL_CI'`)
* `connectTimeout`: 连接超时 (默认: `10000`)


## 初始化
```js
var em = new easy_mysql(table_name);
```
`table_name` 表名


## 添加数据
```js
em.add({key: value}, function (id) {
    
});
```
* `key`: 字段名
* `value`: 数据
* `id`: 添加成功的主键ID

## 批量添加数据
```js
em.add([{key: value,key2: value2},{key: value3,key2: value4}], function (id) {
    
});
```


## 读取数据
```js
em.select(function (data) {
    
});
```
+ `data`: 数据 `[{key:value,......},......]`


## 读取单条数据
```js
em.find(function (data) {
    
});
```
+ `data`: 数据 `{key:value,......}`


















[npm-image]: https://img.shields.io/npm/v/easy_mysql.svg
[npm-url]: https://npmjs.org/package/easy_mysql
[node-version-image]: https://img.shields.io/node/v/easy_mysql.svg
[node-version-url]: https://nodejs.org/en/download/
[travis-image]: https://travis-ci.org/wailovet/easy_mysql.svg?branch=master
[travis-url]: https://travis-ci.org/wailovet/easy_mysql


