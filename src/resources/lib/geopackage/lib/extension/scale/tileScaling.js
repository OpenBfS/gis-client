"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileScaling = void 0;
/**
 * @memberOf module:extension/scale
 * @class TileScaling
 */
var tileScalingType_1 = require("./tileScalingType");
/**
 * Tile Scaling object, for scaling tiles from nearby zoom levels for missing
 * @constructor
 */
var TileScaling = /** @class */ (function () {
    function TileScaling() {
    }
    TileScaling.prototype.isZoomIn = function () {
        return (this.zoom_in == null || this.zoom_in > 0) && this.scaling_type != null && this.scaling_type != tileScalingType_1.TileScalingType.OUT;
    };
    TileScaling.prototype.isZoomOut = function () {
        return (this.zoom_out == null || this.zoom_out > 0) && this.scaling_type != null && this.scaling_type != tileScalingType_1.TileScalingType.IN;
    };
    return TileScaling;
}());
exports.TileScaling = TileScaling;
//# sourceMappingURL=tileScaling.js.map