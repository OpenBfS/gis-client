"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCustomTableReader = void 0;
/**
 * @module user/custom
 */
var userCustomTable_1 = require("./userCustomTable");
var userTableReader_1 = require("../userTableReader");
var userCustomColumn_1 = require("./userCustomColumn");
/**
 * User custom table reader
 * @class
 * @param  {string} tableName       table name
 * @param  {string[]} requiredColumns required columns
 */
var UserCustomTableReader = /** @class */ (function (_super) {
    __extends(UserCustomTableReader, _super);
    function UserCustomTableReader(table_name) {
        return _super.call(this, table_name) || this;
    }
    UserCustomTableReader.prototype.readUserCustomTable = function (geoPackage) {
        return this.readTable(geoPackage.database);
    };
    /**
     * @inheritDoc
     */
    UserCustomTableReader.prototype.createTable = function (tableName, columns) {
        return new userCustomTable_1.UserCustomTable(tableName, columns, null);
    };
    /**
     * @inheritDoc
     */
    UserCustomTableReader.prototype.createColumn = function (tableColumn) {
        return new userCustomColumn_1.UserCustomColumn(tableColumn.index, tableColumn.name, tableColumn.dataType, tableColumn.max, tableColumn.notNull, tableColumn.defaultValue, tableColumn.primaryKey, tableColumn.autoincrement);
    };
    return UserCustomTableReader;
}(userTableReader_1.UserTableReader));
exports.UserCustomTableReader = UserCustomTableReader;
//# sourceMappingURL=userCustomTableReader.js.map