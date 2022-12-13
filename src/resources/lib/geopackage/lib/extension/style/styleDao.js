"use strict";
/**
 * @memberOf module:extension/style
 * @class StyleDao
 */
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
exports.StyleDao = void 0;
var attributesDao_1 = require("../../attributes/attributesDao");
var styleRow_1 = require("./styleRow");
/**
 * Style DAO for reading style tables
 * @extends {AttributesDao}
 * @param  {module:db/geoPackageConnection~GeoPackageConnection} geoPackage connection
 * @param  {string} table table name
 * @constructor
 */
var StyleDao = /** @class */ (function (_super) {
    __extends(StyleDao, _super);
    function StyleDao(geoPackage, table) {
        return _super.call(this, geoPackage, table) || this;
    }
    /**
     * Creates a StyleRow object from the results
     * @param results
     * @returns {module:extension/style.StyleRow}
     */
    StyleDao.prototype.createObject = function (results) {
        if (results === void 0) { results = undefined; }
        if (results) {
            return this.getRow(results);
        }
        return this.newRow();
    };
    Object.defineProperty(StyleDao.prototype, "table", {
        get: function () {
            return this._table;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Create a style row with the column types and values
     * @param  {module:db/geoPackageDataType[]} columnTypes  column types
     * @param  {module:dao/columnValues~ColumnValues[]} values      values
     * @return {module:extension/style.StyleRow}             icon row
     */
    StyleDao.prototype.newRow = function (columnTypes, values) {
        return new styleRow_1.StyleRow(this.table, columnTypes, values);
    };
    return StyleDao;
}(attributesDao_1.AttributesDao));
exports.StyleDao = StyleDao;
//# sourceMappingURL=styleDao.js.map