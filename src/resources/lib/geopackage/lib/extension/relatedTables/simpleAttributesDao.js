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
exports.SimpleAttributesDao = void 0;
/**
 * SimpleAttributesDao module.
 * @module extension/relatedTables
 */
var userDao_1 = require("../../user/userDao");
var simpleAttributesRow_1 = require("./simpleAttributesRow");
/**
 * User Simple Attributes DAO for reading user simple attributes data tables
 * @class
 * @extends UserDao
 * @param  {module:db/geoPackageConnection~GeoPackageConnection} connection        connection
 * @param  {string} table table name
 */
var SimpleAttributesDao = /** @class */ (function (_super) {
    __extends(SimpleAttributesDao, _super);
    function SimpleAttributesDao(geoPackage, table) {
        return _super.call(this, geoPackage, table) || this;
    }
    /**
     * Create a new {module:extension/relatedTables~SimpleAttributesRow} with the column types and values
     * @param  {module:db/geoPackageDataType[]} columnTypes  column types
     * @param  {module:dao/columnValues~ColumnValues[]} values      values
     * @return {module:extension/relatedTables~SimpleAttributesRow}             simple attributes row
     */
    SimpleAttributesDao.prototype.newRow = function (columnTypes, values) {
        return new simpleAttributesRow_1.SimpleAttributesRow(this.table, columnTypes, values);
    };
    Object.defineProperty(SimpleAttributesDao.prototype, "table", {
        /**
         * Gets the {module:extension/relatedTables~SimpleAttributesTable}
         * @return {module:extension/relatedTables~SimpleAttributesTable}
         */
        get: function () {
            return this._table;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the simple attributes rows from this table by ids
     * @param  {Number[]} ids array of ids
     * @return {module:extension/relatedTables~SimpleAttributesRow[]}
     */
    SimpleAttributesDao.prototype.getRows = function (ids) {
        var simpleAttributesRows = [];
        for (var i = 0; i < ids.length; i++) {
            var row = this.queryForId(ids[i]);
            if (row) {
                simpleAttributesRows.push(row);
            }
        }
        return simpleAttributesRows;
    };
    SimpleAttributesDao.readTable = function (geoPackage, tableName) {
        return geoPackage.relatedTablesExtension.getSimpleAttributesDao(tableName);
    };
    return SimpleAttributesDao;
}(userDao_1.UserDao));
exports.SimpleAttributesDao = SimpleAttributesDao;
//# sourceMappingURL=simpleAttributesDao.js.map