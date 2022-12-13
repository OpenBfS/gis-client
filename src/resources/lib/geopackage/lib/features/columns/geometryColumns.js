"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeometryColumns = void 0;
var contentsDataType_1 = require("../../core/contents/contentsDataType");
/**
 * Spatial Reference System object. The coordinate reference system definitions it contains are referenced by the GeoPackage Contents and GeometryColumns objects to relate the vector and tile data in user tables to locations on the earth.
 * @class GeometryColumns
 */
var GeometryColumns = /** @class */ (function () {
    function GeometryColumns() {
    }
    Object.defineProperty(GeometryColumns.prototype, "geometryType", {
        get: function () {
            return this.geometry_type_name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeometryColumns.prototype, "id", {
        get: function () {
            return "".concat(this.table_name, " ").concat(this.column_name);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Set the contents
     * @param contents contents
     */
    GeometryColumns.prototype.setContents = function (contents) {
        if (contents !== null && contents !== undefined) {
            // Verify the Contents have a features data type (Spec Requirement 23)
            var dataType = contents.data_type;
            if (dataType === null || dataType === undefined || dataType !== contentsDataType_1.ContentsDataType.FEATURES) {
                throw new Error("The Contents of a GeometryColumns must have a data type of " + contentsDataType_1.ContentsDataType.nameFromType(contentsDataType_1.ContentsDataType.FEATURES));
            }
            this.table_name = contents.table_name;
        }
        else {
            this.table_name = null;
        }
    };
    GeometryColumns.TABLE_NAME = 'tableName';
    GeometryColumns.COLUMN_NAME = 'columnName';
    GeometryColumns.GEOMETRY_TYPE_NAME = 'geometryTypeName';
    GeometryColumns.SRS_ID = 'srsId';
    GeometryColumns.Z = 'z';
    GeometryColumns.M = 'm';
    return GeometryColumns;
}());
exports.GeometryColumns = GeometryColumns;
//# sourceMappingURL=geometryColumns.js.map