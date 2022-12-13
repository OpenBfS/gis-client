"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeometryIndex = void 0;
/**
 * Geometry Index object, for indexing data within user tables
 * @class
 */
var GeometryIndex = /** @class */ (function () {
    function GeometryIndex() {
    }
    Object.defineProperty(GeometryIndex.prototype, "tableIndex", {
        set: function (tableIndex) {
            this.table_name = tableIndex.table_name;
        },
        enumerable: false,
        configurable: true
    });
    return GeometryIndex;
}());
exports.GeometryIndex = GeometryIndex;
//# sourceMappingURL=geometryIndex.js.map