var easy_mysql = require('..');
easy_mysql.config({
    "database": "mytest",
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
em.order("id").select(function (data) {
    if (data[0]['id'] < 2) {
        throw "order";
    }
});
em.page(1, 1).select(function (data) {
    if (data.length != 1) {
        throw "page";
    }
});