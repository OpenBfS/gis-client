"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTableReader = void 0;
var userColumn_1 = require("./userColumn");
var tableInfo_1 = require("../db/table/tableInfo");
var sqliteMaster_1 = require("../db/master/sqliteMaster");
/**
 * @class
 */
var UserTableReader = /** @class */ (function () {
    /**
     * @param table_name name of the table
     */
    function UserTableReader(table_name) {
        this.table_name = table_name;
    }
    /**
     * Read the table
     * @param db connection
     * @return table
     */
    UserTableReader.prototype.readTable = function (db) {
        var _this = this;
        var columnList = [];
        var tableInfo = tableInfo_1.TableInfo.info(db, this.table_name);
        if (tableInfo === null || tableInfo === undefined) {
            throw new Error("Table does not exist: " + this.table_name);
        }
        var constraints = sqliteMaster_1.SQLiteMaster.queryForConstraints(db, this.table_name);
        tableInfo.getColumns().forEach(function (tableColumn) {
            if (tableColumn.getDataType() === null || tableColumn.getDataType() === undefined) {
                throw new Error('Unsupported column data type ' + tableColumn.getType());
            }
            var column = _this.createColumn(tableColumn);
            var columnConstraints = constraints.getColumnConstraints(column.getName());
            if (columnConstraints !== null && columnConstraints !== undefined && columnConstraints.hasConstraints()) {
                column.clearConstraints();
                column.addConstraints(columnConstraints.constraints);
            }
            columnList.push(column);
        });
        var table = this.createTable(this.table_name, columnList);
        table.addConstraints(constraints.getTableConstraints());
        return table;
    };
    /**
     * Creates a user column
     */
    UserTableReader.prototype.createColumn = function (tableColumn) {
        return new userColumn_1.UserColumn(tableColumn.index, tableColumn.name, tableColumn.dataType, tableColumn.max, tableColumn.notNull, tableColumn.defaultValue, tableColumn.primaryKey, tableColumn.autoincrement);
    };
    return UserTableReader;
}());
exports.UserTableReader = UserTableReader;
//# sourceMappingURL=userTableReader.js.map