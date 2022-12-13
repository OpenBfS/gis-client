"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contents = void 0;
/**
 * The Contents class models rows in the [`gpkg_contents`](https://www.geopackage.org/spec121/index.html#_contents)
 * table.  The contents table stores identifying and descriptive information
 * that an application can display to a user in a menu of geospatial data
 * available in a GeoPackage.
 * @see https://www.geopackage.org/spec121/index.html#_contents
 */
var Contents = /** @class */ (function () {
    function Contents() {
    }
    /**
     * Copy function
     */
    Contents.prototype.copy = function () {
        var contents = new Contents();
        contents.table_name = this.table_name;
        contents.data_type = this.data_type;
        contents.identifier = this.identifier;
        contents.description = this.description;
        contents.min_x = this.min_x;
        contents.max_x = this.max_x;
        contents.min_y = this.min_y;
        contents.max_y = this.max_y;
        contents.srs_id = this.srs_id;
        return contents;
    };
    Contents.prototype.getTableName = function () {
        return this.table_name;
    };
    return Contents;
}());
exports.Contents = Contents;
//# sourceMappingURL=contents.js.map