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
exports.FeatureColumns = void 0;
var userColumns_1 = require("../../user/userColumns");
var geoPackageDataType_1 = require("../../db/geoPackageDataType");
/**
 * UserCustomColumns
 */
var FeatureColumns = /** @class */ (function (_super) {
    __extends(FeatureColumns, _super);
    function FeatureColumns(tableName, geometryColumn, columns, custom) {
        var _this = _super.call(this, tableName, columns, custom) || this;
        /**
         * Geometry column index
         */
        _this.geometryIndex = -1;
        _this.geometryColumn = geometryColumn;
        _this.updateColumns();
        return _this;
    }
    FeatureColumns.prototype.copy = function () {
        return new FeatureColumns(this.getTableName(), this.getGeometryColumnName(), this.getColumns(), this.isCustom());
    };
    /**
     * {@inheritDoc}
     */
    FeatureColumns.prototype.updateColumns = function () {
        _super.prototype.updateColumns.call(this);
        var index = null;
        if (this.geometryColumn !== null && this.geometryColumn !== undefined) {
            index = this.getColumnIndex(this.geometryColumn, false);
        }
        else {
            for (var i = 0; i < this.getColumns().length; i++) {
                var column = this.getColumns()[i];
                if (column.isGeometry()) {
                    index = column.getIndex();
                    this.geometryColumn = column.getName();
                    break;
                }
            }
        }
        if (!this.isCustom()) {
            this.missingCheck(index, geoPackageDataType_1.GeoPackageDataType.nameFromType(geoPackageDataType_1.GeoPackageDataType.BLOB));
        }
        if (index !== null && index !== undefined) {
            this.geometryIndex = index;
        }
    };
    /**
     * Get the geometry column name
     * @return geometry column name
     */
    FeatureColumns.prototype.getGeometryColumnName = function () {
        return this.geometryColumn;
    };
    /**
     * Set the geometry column name
     * @param geometryColumn geometry column name
     */
    FeatureColumns.prototype.setGeometryColumnName = function (geometryColumn) {
        this.geometryColumn = geometryColumn;
    };
    /**
     * Get the geometry index
     * @return geometry index
     */
    FeatureColumns.prototype.getGeometryIndex = function () {
        return this.geometryIndex;
    };
    /**
     * Set the geometry index
     * @param geometryIndex  geometry index
     */
    FeatureColumns.prototype.setGeometryIndex = function (geometryIndex) {
        this.geometryIndex = geometryIndex;
    };
    /**
     * Check if the table has a geometry column
     * @return true if has a geometry column
     */
    FeatureColumns.prototype.hasGeometryColumn = function () {
        return this.geometryIndex >= 0;
    };
    /**
     * Get the geometry column
     * @return geometry column
     */
    FeatureColumns.prototype.getGeometryColumn = function () {
        var column = null;
        if (this.hasGeometryColumn()) {
            column = this.getColumnForIndex(this.geometryIndex);
        }
        return column;
    };
    return FeatureColumns;
}(userColumns_1.UserColumns));
exports.FeatureColumns = FeatureColumns;
//# sourceMappingURL=featureColumns.js.map