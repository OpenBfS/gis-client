"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileScalingType = void 0;
var TileScalingType;
(function (TileScalingType) {
    /**
     * Search for tiles by zooming in
     */
    TileScalingType["IN"] = "in";
    /**
     * Search for tiles by zooming out
     */
    TileScalingType["OUT"] = "out";
    /**
     * Search for tiles by zooming in first, and then zooming out
     */
    TileScalingType["IN_OUT"] = "in_out";
    /**
     * Search for tiles by zooming out first, and then zooming in
     */
    TileScalingType["OUT_IN"] = "out_in";
    /**
     * Search for tiles in closest zoom level order, zoom in levels before zoom
     * out
     */
    TileScalingType["CLOSEST_IN_OUT"] = "closest_in_out";
    /**
     * Search for tiles in closest zoom level order, zoom out levels before zoom
     * in
     */
    TileScalingType["CLOSEST_OUT_IN"] = "closest_out_in";
})(TileScalingType = exports.TileScalingType || (exports.TileScalingType = {}));
//# sourceMappingURL=tileScalingType.js.map