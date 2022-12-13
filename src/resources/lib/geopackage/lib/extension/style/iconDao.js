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
exports.IconDao = void 0;
/**
 * @memberOf module:extension/style
 * @class IconDao
 */
var mediaDao_1 = require("../relatedTables/mediaDao");
var iconRow_1 = require("./iconRow");
/**
 * Icon DAO for reading user icon data tables
 * @extends MediaDao
 * @param  {module:db/geoPackageConnection~GeoPackageConnection} geoPackage connection
 * @param  {string} table table name
 * @constructor
 */
var IconDao = /** @class */ (function (_super) {
    __extends(IconDao, _super);
    function IconDao(geoPackage, table) {
        return _super.call(this, geoPackage, table) || this;
    }
    /**
     * Create a icon row with the column types and values
     * @param  {module:db/geoPackageDataType[]} columnTypes  column types
     * @param  {module:dao/columnValues~ColumnValues[]} values      values
     * @return {module:extension/style.IconRow}             icon row
     */
    IconDao.prototype.newRow = function (columnTypes, values) {
        return new iconRow_1.IconRow(this.table, columnTypes, values);
    };
    return IconDao;
}(mediaDao_1.MediaDao));
exports.IconDao = IconDao;
//# sourceMappingURL=iconDao.js.map