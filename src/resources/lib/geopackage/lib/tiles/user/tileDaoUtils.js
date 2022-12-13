"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileDaoUtils = void 0;
var sortedIndexOf_1 = __importDefault(require("lodash/sortedIndexOf"));
var sortedIndex_1 = __importDefault(require("lodash/sortedIndex"));
var TileDaoUtils = /** @class */ (function () {
    function TileDaoUtils() {
    }
    /**
     * Adjust the tile matrix lengths if needed. Check if the tile matrix width
     * and height need to expand to account for pixel * number of pixels fitting
     * into the tile matrix lengths
     * @param tileMatrixSet tile matrix set
     * @param tileMatrices tile matrices
     */
    TileDaoUtils.adjustTileMatrixLengths = function (tileMatrixSet, tileMatrices) {
        var tileMatrixWidth = tileMatrixSet.max_x - tileMatrixSet.min_x;
        var tileMatrixHeight = tileMatrixSet.max_y - tileMatrixSet.min_y;
        tileMatrices.forEach(function (tileMatrix) {
            var tempMatrixWidth = Math.floor(tileMatrixWidth / (tileMatrix.pixel_x_size * tileMatrix.tile_width));
            var tempMatrixHeight = Math.floor(tileMatrixHeight / (tileMatrix.pixel_y_size * tileMatrix.tile_height));
            if (tempMatrixWidth > tileMatrix.matrix_width) {
                tileMatrix.matrix_width = tempMatrixWidth;
            }
            if (tempMatrixHeight > tileMatrix.matrix_height) {
                tileMatrix.matrix_height = tempMatrixHeight;
            }
        });
    };
    /**
     * Get the zoom level for the provided width and height in the default units
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param length in default units
     * @return tile matrix zoom level
     */
    TileDaoUtils.getZoomLevelForLength = function (widths, heights, tileMatrices, length) {
        return TileDaoUtils._getZoomLevelForLength(widths, heights, tileMatrices, length, true);
    };
    /**
     * Get the zoom level for the provided width and height in the default units
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param width in default units
     * @param height in default units
     * @return tile matrix zoom level
     * @since 1.2.1
     */
    TileDaoUtils.getZoomLevelForWidthAndHeight = function (widths, heights, tileMatrices, width, height) {
        return TileDaoUtils._getZoomLevelForWidthAndHeight(widths, heights, tileMatrices, width, height, true);
    };
    /**
     * Get the closest zoom level for the provided width and height in the
     * default units
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param length in default units
     * @return tile matrix zoom level
     * @since 1.2.1
     */
    TileDaoUtils.getClosestZoomLevelForLength = function (widths, heights, tileMatrices, length) {
        return TileDaoUtils._getZoomLevelForLength(widths, heights, tileMatrices, length, false);
    };
    /**
     * Get the closest zoom level for the provided width and height in the
     * default units
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param width in default units
     * @param height in default units
     * @return tile matrix zoom level
     * @since 1.2.1
     */
    TileDaoUtils.getClosestZoomLevelForWidthAndHeight = function (widths, heights, tileMatrices, width, height) {
        return TileDaoUtils._getZoomLevelForWidthAndHeight(widths, heights, tileMatrices, width, height, false);
    };
    /**
     * Get the zoom level for the provided width and height in the default units
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param length in default units
     * @param lengthChecks perform length checks for values too far away from the zoom level
     * @return tile matrix zoom level
     */
    TileDaoUtils._getZoomLevelForLength = function (widths, heights, tileMatrices, length, lengthChecks) {
        return TileDaoUtils._getZoomLevelForWidthAndHeight(widths, heights, tileMatrices, length, length, lengthChecks);
    };
    /**
     * Get the zoom level for the provided width and height in the default units
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param width width in default units
     * @param height height in default units
     * @param lengthChecks perform length checks for values too far away from the zoom level
     * @return tile matrix zoom level
     * @since 1.2.1
     */
    TileDaoUtils._getZoomLevelForWidthAndHeight = function (widths, heights, tileMatrices, width, height, lengthChecks) {
        var zoomLevel = null;
        var widthIndex = (0, sortedIndexOf_1.default)(widths, width);
        if (widthIndex === -1) {
            widthIndex = (0, sortedIndex_1.default)(widths, width);
        }
        if (widthIndex < 0) {
            widthIndex = (widthIndex + 1) * -1;
        }
        var heightIndex = (0, sortedIndexOf_1.default)(heights, height);
        if (heightIndex === -1) {
            heightIndex = (0, sortedIndex_1.default)(heights, height);
        }
        if (heightIndex < 0) {
            heightIndex = (heightIndex + 1) * -1;
        }
        if (widthIndex == 0) {
            if (lengthChecks && width < TileDaoUtils.getMinLength(widths)) {
                widthIndex = -1;
            }
        }
        else if (widthIndex == widths.length) {
            if (lengthChecks && width >= TileDaoUtils.getMaxLength(widths)) {
                widthIndex = -1;
            }
            else {
                --widthIndex;
            }
        }
        else if (TileDaoUtils.closerToZoomIn(widths, width, widthIndex)) {
            --widthIndex;
        }
        if (heightIndex == 0) {
            if (lengthChecks && height < TileDaoUtils.getMinLength(heights)) {
                heightIndex = -1;
            }
        }
        else if (heightIndex == heights.length) {
            if (lengthChecks && height >= TileDaoUtils.getMaxLength(heights)) {
                heightIndex = -1;
            }
            else {
                --heightIndex;
            }
        }
        else if (TileDaoUtils.closerToZoomIn(heights, height, heightIndex)) {
            --heightIndex;
        }
        if (widthIndex >= 0 || heightIndex >= 0) {
            var index = void 0;
            if (widthIndex < 0) {
                index = heightIndex;
            }
            else if (heightIndex < 0) {
                index = widthIndex;
            }
            else {
                index = Math.min(widthIndex, heightIndex);
            }
            zoomLevel = TileDaoUtils.getTileMatrixAtLengthIndex(tileMatrices, index).zoom_level;
        }
        return zoomLevel;
    };
    /**
     * Determine if the length at the index is closer by a factor of two to the
     * next zoomed in level / lower index
     * @param lengths sorted lengths
     * @param length current length
     * @param lengthIndex length index
     * @return true if closer to zoomed in length
     */
    TileDaoUtils.closerToZoomIn = function (lengths, length, lengthIndex) {
        // Zoom level distance to the zoomed in length
        var zoomInDistance = Math.log(length / lengths[lengthIndex - 1]) / Math.log(2);
        // Zoom level distance to the zoomed out length
        var zoomOutDistance = Math.log(length / lengths[lengthIndex]) / Math.log(0.5);
        return zoomInDistance < zoomOutDistance;
    };
    /**
     * Get the tile matrix represented by the current length index
     * @param tileMatrices tile matrices
     * @param index index location in sorted lengths
     * @return tile matrix
     */
    TileDaoUtils.getTileMatrixAtLengthIndex = function (tileMatrices, index) {
        return tileMatrices[tileMatrices.length - index - 1];
    };
    /**
     * Get the approximate zoom level for the provided length in the default
     * units. Tiles may or may not exist for the returned zoom level. The
     * approximate zoom level is determined using a factor of 2 from the zoom
     * levels with tiles.
     *
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param length length in default units
     * @return actual or approximate tile matrix zoom level
     * @since 2.0.2
     */
    TileDaoUtils.getApproximateZoomLevelForLength = function (widths, heights, tileMatrices, length) {
        return TileDaoUtils.getApproximateZoomLevelForWidthAndHeight(widths, heights, tileMatrices, length, length);
    };
    /**
     * Get the approximate zoom level for the provided width and height in the
     * default units. Tiles may or may not exist for the returned zoom level.
     * The approximate zoom level is determined using a factor of 2 from the
     * zoom levels with tiles.
     *
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param width width in default units
     * @param height height in default units
     * @return actual or approximate tile matrix zoom level
     * @since 2.0.2
     */
    TileDaoUtils.getApproximateZoomLevelForWidthAndHeight = function (widths, heights, tileMatrices, width, height) {
        var widthZoomLevel = TileDaoUtils.getApproximateZoomLevel(widths, tileMatrices, width);
        var heightZoomLevel = TileDaoUtils.getApproximateZoomLevel(heights, tileMatrices, height);
        var expectedZoomLevel;
        if (widthZoomLevel == null) {
            expectedZoomLevel = heightZoomLevel;
        }
        else if (heightZoomLevel == null) {
            expectedZoomLevel = widthZoomLevel;
        }
        else {
            expectedZoomLevel = Math.max(widthZoomLevel, heightZoomLevel);
        }
        return expectedZoomLevel;
    };
    /**
     * Get the approximate zoom level for length using the factor of 2 rule
     * between zoom levels
     * @param lengths sorted lengths
     * @param tileMatrices tile matrices
     * @param length length in default units
     * @return approximate zoom level
     */
    TileDaoUtils.getApproximateZoomLevel = function (lengths, tileMatrices, length) {
        var lengthZoomLevel;
        var minLength = lengths[0];
        var maxLength = lengths[lengths.length - 1];
        // Length is zoomed in further than available tiles
        if (length < minLength) {
            var levelsIn = Math.log(length / minLength) / Math.log(0.5);
            var zoomAbove = Math.floor(levelsIn);
            var zoomBelow = Math.ceil(levelsIn);
            var lengthAbove = minLength * Math.pow(0.5, zoomAbove);
            var lengthBelow = minLength * Math.pow(0.5, zoomBelow);
            lengthZoomLevel = tileMatrices[tileMatrices.length - 1].zoom_level;
            if (lengthAbove - length <= length - lengthBelow) {
                lengthZoomLevel += zoomAbove;
            }
            else {
                lengthZoomLevel += zoomBelow;
            }
        }
        // Length is zoomed out further than available tiles
        else if (length > maxLength) {
            var levelsOut = Math.log(length / maxLength) / Math.log(2);
            var zoomAbove = Math.ceil(levelsOut);
            var zoomBelow = Math.floor(levelsOut);
            var lengthAbove = maxLength * Math.pow(2, zoomAbove);
            var lengthBelow = maxLength * Math.pow(2, zoomBelow);
            lengthZoomLevel = tileMatrices[0].zoom_level;
            if (length - lengthBelow <= lengthAbove - length) {
                lengthZoomLevel -= zoomBelow;
            }
            else {
                lengthZoomLevel -= zoomAbove;
            }
        }
        // Length is between the available tiles
        else {
            var lengthIndex = (0, sortedIndexOf_1.default)(lengths, length);
            if (lengthIndex < 0) {
                lengthIndex = (lengthIndex + 1) * -1;
            }
            var zoomDistance = Math.log(length / lengths[lengthIndex]) / Math.log(0.5);
            var zoomLevelAbove = TileDaoUtils.getTileMatrixAtLengthIndex(tileMatrices, lengthIndex).zoom_level;
            zoomLevelAbove += Math.round(zoomDistance);
            lengthZoomLevel = zoomLevelAbove;
        }
        return lengthZoomLevel;
    };
    /**
     * Get the max distance length that matches the tile widths and heights
     * @param widths sorted tile matrix widths
     * @param heights sorted tile matrix heights
     * @return max length
     * @since 1.2.0
     */
    TileDaoUtils.getMaxLengthForTileWidthsAndHeights = function (widths, heights) {
        var maxWidth = TileDaoUtils.getMaxLength(widths);
        var maxHeight = TileDaoUtils.getMaxLength(heights);
        return Math.min(maxWidth, maxHeight);
    };
    /**
     * Get the min distance length that matches the tile widths and heights
     * @param widths sorted tile matrix widths
     * @param heights sorted tile matrix heights
     * @return min length
     * @since 1.2.0
     */
    TileDaoUtils.getMinLengthForTileWidthsAndHeights = function (widths, heights) {
        var maxWidth = TileDaoUtils.getMinLength(widths);
        var maxHeight = TileDaoUtils.getMinLength(heights);
        return Math.max(maxWidth, maxHeight);
    };
    /**
     * Get the max length distance value from the sorted array of lengths
     * @param lengths sorted tile matrix lengths
     * @return max length
     */
    TileDaoUtils.getMaxLength = function (lengths) {
        return lengths[lengths.length - 1] / 0.51;
    };
    /**
     * Get the min length distance value from the sorted array of lengths
     * @param lengths sorted tile matrix lengths
     * @return min length
     */
    TileDaoUtils.getMinLength = function (lengths) {
        return lengths[0] * 0.51;
    };
    return TileDaoUtils;
}());
exports.TileDaoUtils = TileDaoUtils;
//# sourceMappingURL=tileDaoUtils.js.map