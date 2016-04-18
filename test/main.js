var expect = require("expect.js")
var easy_mysql = require('..');
easy_mysql.config({
    "user": "root"
});
em = new easy_mysql("test");

it("add", function () {

    em.add({"content":"testtest"},function(data){
        throw "s";
        if(data > 0){

        }
    });
});
