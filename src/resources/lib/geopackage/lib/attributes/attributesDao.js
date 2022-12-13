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
exports.AttributesDao = void 0;
/**
 * @module attributes/attributesDao
 */
var userDao_1 = require("../user/userDao");
var attributesRow_1 = require("./attributesRow");
/**
 * Attribute DAO for reading attribute user data tables
 * @class AttributesDao
 * @extends UserDao
 * @param  {module:geoPackage~GeoPackage} geoPackage              geopackage object
 * @param  {module:attributes/attributesTable~AttributeTable} table           attribute table
 */
var AttributesDao = /** @class */ (function (_super) {
    __extends(AttributesDao, _super);
    function AttributesDao(geoPackage, table) {
        var _this = _super.call(this, geoPackage, table) || this;
        if (!table.contents) {
            throw new Error('Attributes table has null Contents');
        }
        _this.contents = table.contents;
        return _this;
    }
    Object.defineProperty(AttributesDao.prototype, "table", {
        get: function () {
            return this._table;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Create a new attribute row with the column types and values
     * @param  {Array} columnTypes column types
     * @param  {module:dao/columnValues~ColumnValues[]} values      values
     * @return {module:attributes/attributesRow~AttributeRow}             attribute row
     */
    AttributesDao.prototype.newRow = function (columnTypes, values) {
        return new attributesRow_1.AttributesRow(this.table, columnTypes, values);
    };
    AttributesDao.readTable = function (geoPackage, tableName) {
        return geoPackage.getAttributeDao(tableName);
    };
    return AttributesDao;
}(userDao_1.UserDao));
exports.AttributesDao = AttributesDao;
//# sourceMappingURL=attributesDao.js.map