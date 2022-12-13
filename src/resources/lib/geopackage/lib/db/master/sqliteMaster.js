"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteMaster = void 0;
/**
 * SQLite Master table queries (sqlite_master)
 */
var sqliteMasterColumn_1 = require("./sqliteMasterColumn");
var sqliteMasterType_1 = require("./sqliteMasterType");
var tableConstraints_1 = require("../table/tableConstraints");
var constraintParser_1 = require("../table/constraintParser");
var sqliteMasterQuery_1 = require("./sqliteMasterQuery");
var SQLiteMaster = /** @class */ (function () {
    /**
     * Constructor
     * @param results query results
     * @param columns query columns
     */
    function SQLiteMaster(results, columns) {
        /**
         * Mapping between result columns and indices
         */
        this._columns = {};
        if (columns !== null && columns !== undefined && columns.length > 0) {
            this._results = results;
            this._count = results.length;
            for (var i = 0; i < columns.length; i++) {
                this._columns[sqliteMasterColumn_1.SQLiteMasterColumn.nameFromType(columns[i])] = i;
            }
        }
        else {
            // Count only result
            this._results = [];
            this._count = results[0].cnt;
        }
    }
    /**
     * Result count
     * @return count
     */
    SQLiteMaster.prototype.count = function () {
        return this._count;
    };
    /**
     * Get the columns in the result
     * @return columns
     */
    SQLiteMaster.prototype.columns = function () {
        return Object.keys(this._columns).map(function (key) { return sqliteMasterColumn_1.SQLiteMasterColumn.fromName(key); });
    };
    /**
     * Get the type
     * @param row row index
     * @return type
     */
    SQLiteMaster.prototype.getType = function (row) {
        return sqliteMasterType_1.SQLiteMasterType.fromName(this.getTypeString(row).toUpperCase());
    };
    /**
     * Get the type string
     * @param row row index
     * @return type string
     */
    SQLiteMaster.prototype.getTypeString = function (row) {
        return this.getValueForRowAndColumn(row, sqliteMasterColumn_1.SQLiteMasterColumn.TYPE);
    };
    /**
     * Get the name
     * @param row row index
     * @return name
     */
    SQLiteMaster.prototype.getName = function (row) {
        return this.getValueForRowAndColumn(row, sqliteMasterColumn_1.SQLiteMasterColumn.NAME);
    };
    /**
     * Get the table name
     * @param row row index
     * @return name
     */
    SQLiteMaster.prototype.getTableName = function (row) {
        return this.getValueForRowAndColumn(row, sqliteMasterColumn_1.SQLiteMasterColumn.TBL_NAME);
    };
    /**
     * Get the rootpage
     * @param row row index
     * @return name
     */
    SQLiteMaster.prototype.getRootpage = function (row) {
        return this.getValueForRowAndColumn(row, sqliteMasterColumn_1.SQLiteMasterColumn.ROOTPAGE);
    };
    /**
     * Get the sql
     * @param row row index
     * @return name
     */
    SQLiteMaster.prototype.getSql = function (row) {
        return this.getValueForRowAndColumn(row, sqliteMasterColumn_1.SQLiteMasterColumn.SQL);
    };
    /**
     * Get the value of the column at the row index
     *
     * @param row row index
     * @param column column type
     * @return value
     */
    SQLiteMaster.prototype.getValueForRowAndColumn = function (row, column) {
        return SQLiteMaster.getValue(this.getRow(row), column);
    };
    /**
     * Get the row at the row index
     * @param row row index
     * @return row column values
     */
    SQLiteMaster.prototype.getRow = function (row) {
        if (row < 0 || row >= this._results.length) {
            var message = void 0;
            if (this._results.length === 0) {
                message = 'Results are empty';
            }
            else {
                message = 'Row index: ' + row + ', not within range 0 to ' + (this._results.length - 1);
            }
            throw new Error(message);
        }
        return this._results[row];
    };
    /**
     * Get the value in the row at the column index
     * @param row row
     * @param column column type
     * @return value
     */
    SQLiteMaster.getValue = function (row, column) {
        return row[sqliteMasterColumn_1.SQLiteMasterColumn.nameFromType(column).toLowerCase()];
    };
    /**
     * Get the constraints from table SQL
     * @param row row index
     * @return constraints
     */
    SQLiteMaster.prototype.getConstraints = function (row) {
        var constraints = new tableConstraints_1.TableConstraints();
        if (this.getType(row) === sqliteMasterType_1.SQLiteMasterType.TABLE) {
            var sql = this.getSql(row);
            if (sql !== null && sql !== undefined) {
                constraints = constraintParser_1.ConstraintParser.getConstraints(sql);
            }
        }
        return constraints;
    };
    /**
     * Count the sqlite_master table
     *
     * @param db connection
     * @param types result types
     * @param query query
     * @return count
     */
    SQLiteMaster.count = function (db, types, query) {
        return SQLiteMaster.query(db, null, types, query).count();
    };
    /**
     * Query the sqlite_master table
     *
     * @param db connection
     * @param columns result columns
     * @param types result types
     * @param query query
     * @return SQLiteMaster result
     */
    SQLiteMaster.query = function (db, columns, types, query) {
        var sql = 'SELECT ';
        var args = [];
        if (columns !== null && columns !== undefined && columns.length > 0) {
            for (var i = 0; i < columns.length; i++) {
                if (i > 0) {
                    sql = sql.concat(', ');
                }
                sql = sql.concat(sqliteMasterColumn_1.SQLiteMasterColumn.nameFromType(columns[i]).toLowerCase());
            }
        }
        else {
            sql = sql.concat('count(*) as cnt');
        }
        sql = sql.concat(' FROM ');
        sql = sql.concat(SQLiteMaster.TABLE_NAME);
        var hasQuery = query !== null && query !== undefined && query.has();
        var hasTypes = types !== null && types !== undefined && types.length > 0;
        if (hasQuery || hasTypes) {
            sql = sql.concat(" WHERE ");
            if (hasQuery) {
                sql = sql.concat(query.buildSQL());
                args.push.apply(args, __spreadArray([], __read(query.getArguments()), false));
            }
            if (hasTypes) {
                if (hasQuery) {
                    sql = sql.concat(" AND");
                }
                sql = sql.concat(" type IN (");
                for (var i = 0; i < types.length; i++) {
                    if (i > 0) {
                        sql = sql.concat(", ");
                    }
                    sql = sql.concat("?");
                    args.push(sqliteMasterType_1.SQLiteMasterType.nameFromType(types[i]).toLowerCase());
                }
                sql = sql.concat(")");
            }
        }
        var results = db.all(sql, args);
        return new SQLiteMaster(results, columns);
    };
    /**
     * Query the sqlite_master views on the table
     * @param db connection
     * @param columns result columns
     * @param tableName table name
     * @return SQLiteMaster result
     */
    SQLiteMaster.queryViewsOnTable = function (db, columns, tableName) {
        return SQLiteMaster.query(db, columns, [sqliteMasterType_1.SQLiteMasterType.VIEW], sqliteMasterQuery_1.SQLiteMasterQuery.createTableViewQuery(tableName));
    };
    /**
     * Count the sqlite_master views on the table
     * @param db connection
     * @param tableName table name
     * @return count
     */
    SQLiteMaster.countViewsOnTable = function (db, tableName) {
        return SQLiteMaster.count(db, [sqliteMasterType_1.SQLiteMasterType.VIEW], sqliteMasterQuery_1.SQLiteMasterQuery.createTableViewQuery(tableName));
    };
    /**
     * Query for the table constraints
     * @param db  connection
     * @param tableName able name
     * @return SQL constraints
     */
    SQLiteMaster.queryForConstraints = function (db, tableName) {
        var constraints = new tableConstraints_1.TableConstraints();
        var tableMaster = SQLiteMaster.query(db, [sqliteMasterColumn_1.SQLiteMasterColumn.TYPE, sqliteMasterColumn_1.SQLiteMasterColumn.NAME, sqliteMasterColumn_1.SQLiteMasterColumn.TBL_NAME, sqliteMasterColumn_1.SQLiteMasterColumn.ROOTPAGE, sqliteMasterColumn_1.SQLiteMasterColumn.SQL], [sqliteMasterType_1.SQLiteMasterType.TABLE], sqliteMasterQuery_1.SQLiteMasterQuery.createForColumnValue(sqliteMasterColumn_1.SQLiteMasterColumn.TBL_NAME, tableName));
        for (var i = 0; i < tableMaster.count(); i++) {
            constraints.addTableConstraints(tableMaster.getConstraints(i).constraints);
        }
        return constraints;
    };
    /**
     * Table Name
     */
    SQLiteMaster.TABLE_NAME = 'sqlite_master';
    return SQLiteMaster;
}());
exports.SQLiteMaster = SQLiteMaster;
//# sourceMappingURL=sqliteMaster.js.map