var easy_mysql = require('..');
easy_mysql.config({
    "user": "root"
});
em = new easy_mysql("mytest");


em.add({"content": "testtest"}, function (data) {
    if (!data || data <= 0) {
        throw "add";
    }
});


em.select(function (data) {
    if (data[0]['content'] != 'testtest') {
        throw "select";
    }
});