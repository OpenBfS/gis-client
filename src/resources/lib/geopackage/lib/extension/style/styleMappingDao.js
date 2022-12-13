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
exports.StyleMappingDao = void 0;
/**
 * @memberOf module:extension/style
 * @class StyleMappingDao
 */
var userMappingDao_1 = require("../relatedTables/userMappingDao");
var styleMappingTable_1 = require("./styleMappingTable");
var userMappingTable_1 = require("../relatedTables/userMappingTable");
var styleMappingRow_1 = require("./styleMappingRow");
var geometryType_1 = require("../../features/user/geometryType");
/**
 * Style Mapping DAO for reading user mapping data tables
 * @extends UserMappingDao
 * @param  {module:user/custom~UserCustomDao} userCustomDao
 * @param  {module:geoPackage~GeoPackage} geoPackage      geopackage object
 * @param {StyleMappingTable} [styleMappingTable]
 * @constructor
 */
var StyleMappingDao = /** @class */ (function (_super) {
    __extends(StyleMappingDao, _super);
    function StyleMappingDao(userCustomDao, geoPackage, styleMappingTable) {
        return _super.call(this, userCustomDao, geoPackage, styleMappingTable || new styleMappingTable_1.StyleMappingTable(userCustomDao.table.getTableName(), userCustomDao.table.getUserColumns().getColumns(), null)) || this;
    }
    Object.defineProperty(StyleMappingDao.prototype, "table", {
        get: function () {
            return this._table;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Create a new {module:user/custom~UserCustomTable}
     * @param  {module:user/custom~UserCustomDao} userCustomDao
     * @return {module:user/custom~UserCustomTable} userCustomTable user custom table
     */
    StyleMappingDao.prototype.createMappingTable = function (userCustomDao) {
        return new styleMappingTable_1.StyleMappingTable(userCustomDao.table.getTableName(), userCustomDao.table.getUserColumns().getColumns(), null);
    };
    /**
     * Create a user mapping row
     * @param  {module:db/geoPackageDataType[]} columnTypes  column types
     * @param  {module:dao/columnValues~ColumnValues[]} values values
     * @return {module:extension/style.StyleMappingRow} style mapping row
     */
    StyleMappingDao.prototype.newRow = function (columnTypes, values) {
        return new styleMappingRow_1.StyleMappingRow(this.table, columnTypes, values);
    };
    /**
     * Delete by base id and geometry type
     * @param  {Number} baseId base id
     * @param  {GeometryType} geometryType geometry type
     * @return {Number} number of deleted rows
     */
    StyleMappingDao.prototype.deleteByBaseIdAndGeometryType = function (baseId, geometryType) {
        var where = '';
        where += this.buildWhereWithFieldAndValue(userMappingTable_1.UserMappingTable.COLUMN_BASE_ID, baseId);
        where += ' AND ';
        where += this.buildWhereWithFieldAndValue(styleMappingTable_1.StyleMappingTable.COLUMN_GEOMETRY_TYPE_NAME, geometryType_1.GeometryType.nameFromType(geometryType));
        var whereArgs = this.buildWhereArgs([baseId, geometryType_1.GeometryType.nameFromType(geometryType)]);
        return this.deleteWhere(where, whereArgs);
    };
    return StyleMappingDao;
}(userMappingDao_1.UserMappingDao));
exports.StyleMappingDao = StyleMappingDao;
//# sourceMappingURL=styleMappingDao.js.map