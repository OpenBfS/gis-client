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
exports.MediaDao = void 0;
var userDao_1 = require("../../user/userDao");
var mediaRow_1 = require("./mediaRow");
var userCustomTableReader_1 = require("../../user/custom/userCustomTableReader");
/**
 * MediaDao module.
 * @module extension/relatedTables
 */
/**
 * User Media DAO for reading user media data tables
 * @class
 * @param  {module:db/geoPackageConnection~GeoPackageConnection} connection        connection
 * @param  {string} table table name
 */
var MediaDao = /** @class */ (function (_super) {
    __extends(MediaDao, _super);
    function MediaDao(geoPackage, table) {
        return _super.call(this, geoPackage, table) || this;
    }
    /**
     * Create a media row with the column types and values
     * @param  {module:db/geoPackageDataType[]} columnTypes  column types
     * @param  {module:dao/columnValues~ColumnValues[]} values      values
     * @return {module:extension/relatedTables~MediaRow}             media row
     */
    MediaDao.prototype.newRow = function (columnTypes, values) {
        return new mediaRow_1.MediaRow(this.table, columnTypes, values);
    };
    Object.defineProperty(MediaDao.prototype, "table", {
        /**
         * Gets the media table
         * @return {module:extension/relatedTables~MediaTable}
         */
        get: function () {
            return this._table;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Reads the table specified from the geopackage
     * @param  {module:geoPackage~GeoPackage} geoPackage      geopackage object
     * @param  {string} tableName       table name
     * @return {module:user/userDao~UserDao}
     */
    MediaDao.readTable = function (geoPackage, tableName) {
        var reader = new userCustomTableReader_1.UserCustomTableReader(tableName);
        var userTable = reader.readTable(geoPackage.database);
        return new MediaDao(geoPackage, userTable);
    };
    return MediaDao;
}(userDao_1.UserDao));
exports.MediaDao = MediaDao;
//# sourceMappingURL=mediaDao.js.map