var easy_mysql = require('..');
easy_mysql.config({
    "database": "mytest",
    "user": "root"
});
em = new easy_mysql("test");
em.debug(true);

em.add({"content": "content"}, function (data) {
    if (!data || data <= 0) {
        console.log(data)
        throw "add error";
    }
    em.field(["id","content"]).where({"id":data}).find(function(_data){
        if(_data['content'] != 'content'){
            console.log(_data)
            throw "add or find error";
        }
        em.where({"id":1}).save({"content": "content_test"},function(){
            em.field(["id","content"]).where({"id":data}).find(function(__data){
                if(__data['content'] != 'content_test'){
                    console.log(__data)
                    throw "save or find error";
                }
            });
        });
    });
});

