var mysql = require('mysql');

var pool = null;

var Model = function (name) {
    this._model = name;
    this._field = false;
    this._page = false;
    this._where = false;
    this._order = false;
}
Model.prototype.debug = function (is_debug) {
    this.is_debug = is_debug;
}
Model.prototype.getPool = function () {
    return pool;
}
Model.prototype.format = function (sql, values, stringifyObjects, timeZone) {
    return mysql.format(sql, values, stringifyObjects, timeZone);
}

Model.prototype.query = function (sql, values, cb) {
    var str_log = mysql.format(sql, values);

    if (this.is_debug) {
        console.log(str_log);
    }

    pool.query(sql, values, cb);
}
Model.prototype.select = function (cb) {
    var sql = "";
    var parameter = false
    if (!this._field) {
        sql = "SELECT * FROM ?? ";
        parameter = [this._model]
    } else {
        if (this._isString(this._field)) {
            sql = "SELECT " + this._field + " FROM ?? ";
            parameter = [this._model]
        } else {
            sql = "SELECT ?? FROM ?? ";
            parameter = [this._field, this._model]
        }
    }

    sql = mysql.format(sql, parameter);

    if (this._where) {
        sql += this._where
    }
    if (this._order) {
        sql += this._order
    }
    if (this._page) {
        sql += this._page
    }

    this.query(sql, function (err, rows, fields) {
        if (err) throw err;
        if (cb)cb(JSON.parse(JSON.stringify(rows)));
    });
}
Model.prototype.find = function (cb) {
    this.page(1, 1).select(function (data) {
        if (cb)cb(data[0])
    });
}
Model.prototype.add = function (data, cb) {
    var callback = function (err, result) {
        if (err) throw err;
        if (cb)cb(result.insertId);
    }
    if (this._isObject(data)) {
        this.query('INSERT INTO ?? SET ?', [this._model, data], callback);
    }
    if (this._isArray(data)) {
        var field = [];
        var value = [];
        var hash = {};
        for (var i = 0; i < data.length; i++) {
            for (var k in data[i]) {
                if (!hash[k]) {
                    field.push(k);
                }
                hash[k] = true;
            }
        }

        for (var i = 0; i < data.length; i++) {
            var tmp = [];
            for (var k = 0; k < field.length; k++) {
                if (!data[i][field[k]])data[i][field[k]] = "";
                tmp.push("'" + data[i][field[k]] + "'");
            }
            var str_tmp;
            str_tmp = "(" + tmp.join(",") + ")"
            value.push(str_tmp);
        }

        var str_field = field.join(",");
        var str_value = value.join(",");

        this.query('INSERT INTO ?? (' + str_field + ') VALUES ' + str_value, this._model, callback);
    }
}
Model.prototype.save = function (data, cb) {
    if (!this._where || this._where == '') {
        if (cb)cb(0);
        return;
    }
    var sql = "UPDATE ?? SET ? ";
    sql += this._where
    this.query(sql, [this._model, data], function (err, result) {
        if (err) throw err;
        if (cb)cb(result.affectedRows);
    })
}
Model.prototype.delete = function (cb) {
    if (!this._where || this._where == '') {
        if (cb)cb(0);
        return;
    }
    var sql = "DELETE FROM ?? ";
    sql += this._where
    this.query(sql, this._model, function (err, result) {
        if (err) throw err;
        if (cb)cb(result.affectedRows);
    })

}

Model.prototype.page = function (p, limit) {
    if (p < 1) {
        p = 1
    }
    var str = "limit ?,? ";
    var l = [];
    l[0] = (p - 1) * limit
    l[1] = limit
    this._page = mysql.format(str, l);
    return this
}
Model.prototype.where = function (data) {
    if (this._isString(data)) {
        this._where = "where " + data + " ";
        return this;
    }

    var str = "";
    for (var i in data) {
        if (this._isNumber(data[i]) || this._isString(data[i])) {
            if (str == "") {
                str = "?? = ?";
            } else {
                str += " and ?? = ?"
            }
            str = mysql.format(str, [i, data[i]]);
        } else {
            if (str == "") {
                str = "?? " + data[i][0] + " ?";
            } else {
                if (data[i][2] && data[i][2].toUpperCase() == 'OR') {
                    str += " or ?? " + data[i][0] + " ?"
                } else {
                    str += " and ?? " + data[i][0] + " ?"
                }
            }
            str = mysql.format(str, [i, data[i][1]]);
        }

    }

    if (str != "") {
        this._where = "where " + str + " ";
    }

    return this;
}

Model.prototype.field = function (data) {
    this._field = data
    return this;
}
Model.prototype.order = function (data) {
    var order = "ORDER BY ";
    var arr_order = []
    if (this._isArray(data)) {
        for (var i = 0; i < data.length; i++) {
            if (this._isString(data[i])) {
                arr_order.push("`" + data[i] + "`")
            } else {
                if (this._isArray(data[i])) {
                    if (!data[i][1])data[i][1] = "";
                    arr_order.push("`" + data[i][0] + "` " + data[i][1] + " ")
                }
                if (this._isObject(data[i])) {
                    for (var k in data[i]) {
                        arr_order.push("`" + k + "` " + data[i][k] + " ")
                    }
                }
            }
        }
        var sql = arr_order.join(",");
        if (sql.length < 1) {
            return this;
        }
        order += sql
        this._order = order
        return this;
    }
    if (this._isObject(data)) {
        for (i in data) {
            arr_order.push("`" + i + "` " + data[i] + " ")
        }
        var sql = arr_order.join(",");
        if (sql.length < 1) {
            return this;
        }
        order += sql
        this._order = order
        return this;
    }

    if (data.length < 1) {
        return this;
    }
    this._order = order + data
    return this;
}


Model.prototype.count = function (cb) {
    this.field("count(*) as m__count").find(function (data) {
        if (cb)cb(parseInt(data['m__count']))
    });
}
Model.prototype.max = function (field, cb) {
    this.field("max(`" + field + "`) as m__max").find(function (data) {
        if (cb)cb(parseFloat(data['m__max']))
    });
}
Model.prototype.min = function (field, cb) {
    this.field("min(`" + field + "`) as m__min").find(function (data) {
        if (cb)cb(parseFloat(data['m__min']))
    });
}
Model.prototype.avg = function (field, cb) {
    this.field("AVG(`" + field + "`) as m__avg").find(function (data) {
        if (cb)cb(parseFloat(data['m__avg']))
    });
}
Model.prototype.sum = function (field, cb) {
    this.field("SUM(`" + field + "`) as m__sum").find(function (data) {
        if (cb)cb(parseFloat(data['m__sum']))
    });
}


Model.prototype._isString = function (data) {
    return (typeof data == 'string') && data.constructor == String
}
Model.prototype._isNumber = function (data) {
    return (typeof data == 'number') && data.constructor == Number;
}
Model.prototype._isArray = function (data) {
    return Object.prototype.toString.call(data) == '[object Array]';
}
Model.prototype._isObject = function (data) {
    return Object.prototype.toString.call(data) == '[object Object]';
}


module.exports = Model;
module.exports.config = function (data) {
    if (!data['connectionLimit'])data['connectionLimit'] = 10;
    if (!data['host'])data['host'] = 'localhost';
    if (!data['port'])data['port'] = 3306;
    pool = mysql.createPool(data)
}