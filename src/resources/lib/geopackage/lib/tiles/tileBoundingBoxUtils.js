"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileBoundingBoxUtils = void 0;
var projectionConstants_1 = require("../projection/projectionConstants");
var tileGrid_1 = require("./tileGrid");
var boundingBox_1 = require("../boundingBox");
/**
 * This module exports utility functions for [slippy map (XYZ)](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames)
 * tile calculations.
 *
 * @module tiles/tileBoundingBoxUtils
 */
var TileBoundingBoxUtils = /** @class */ (function () {
    function TileBoundingBoxUtils() {
    }
    /**
     * Calculate the bounds in tile coordinates that covers the given bounding box
     * at the given zoom level.  The result object contains the keys `minX`, `maxX`,
     * `minY`, and `maxY`, which are tile column and row values in the XYZ tile
     * scheme.
     *
     * @param {BoundingBox} webMercatorBoundingBox bounds in EPSG:3857 coordinates (meters)
     * @param {number} zoom the integral zoom level
     * @returns {{minX: number, maxX: number, minY: number, maxY: number}} bounds in tile column and row coordinates
     */
    TileBoundingBoxUtils.webMercatorTileBox = function (webMercatorBoundingBox, zoom) {
        var tilesPerSide = TileBoundingBoxUtils.tilesPerSideWithZoom(zoom);
        var tileSize = TileBoundingBoxUtils.tileSizeWithTilesPerSide(tilesPerSide);
        var minLonClip = Math.max(-projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, webMercatorBoundingBox.minLongitude);
        var maxLonClip = Math.min(projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, webMercatorBoundingBox.maxLongitude);
        var minLatClip = Math.max(-projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, webMercatorBoundingBox.minLatitude);
        var maxLatClip = Math.min(projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, webMercatorBoundingBox.maxLatitude);
        var minX = Math.floor((minLonClip + projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) / tileSize);
        var maxX = Math.max(0, Math.ceil((maxLonClip + projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) / tileSize) - 1);
        var minY = Math.floor((projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH - maxLatClip) / tileSize);
        var maxY = Math.max(0, Math.ceil((projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH - minLatClip) / tileSize) - 1);
        return new boundingBox_1.BoundingBox(minX, maxX, minY, maxY);
    };
    /**
     * Calculate the bounds in tile coordinates that covers the given bounding box
     * at the given zoom level.  The result object contains the keys `minX`, `maxX`,
     * `minY`, and `maxY`, which are tile column and row values in the XYZ tile
     * scheme.
     *
     * @param {BoundingBox} wgs84BoundingBox bounds in EPSG:4326 coordinates (meters)
     * @param {number} zoom the integral zoom level
     * @returns {{minX: number, maxX: number, minY: number, maxY: number}} bounds in tile column and row coordinates
     */
    TileBoundingBoxUtils.wgs84TileBox = function (wgs84BoundingBox, zoom) {
        var tilesPerSideLat = TileBoundingBoxUtils.tilesPerWGS84LatSide(zoom);
        var tilesPerSideLon = TileBoundingBoxUtils.tilesPerWGS84LonSide(zoom);
        var tileSizeLat = TileBoundingBoxUtils.tileSizeLatPerWGS84Side(tilesPerSideLat);
        var tileSizeLon = TileBoundingBoxUtils.tileSizeLonPerWGS84Side(tilesPerSideLon);
        var minLonClip = Math.max(-projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH, wgs84BoundingBox.minLongitude);
        var maxLonClip = Math.min(projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH, wgs84BoundingBox.maxLongitude);
        var minLatClip = Math.max(-projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT, wgs84BoundingBox.minLatitude);
        var maxLatClip = Math.min(projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT, wgs84BoundingBox.maxLatitude);
        var minX = Math.floor((minLonClip + projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH) / tileSizeLon);
        var maxX = Math.max(0, Math.ceil((maxLonClip + projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH) / tileSizeLon) - 1);
        var minY = Math.floor((projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT - maxLatClip) / tileSizeLat);
        var maxY = Math.max(0, Math.ceil((projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT - minLatClip) / tileSizeLat) - 1);
        return new boundingBox_1.BoundingBox(minX, maxX, minY, maxY);
    };
    TileBoundingBoxUtils.determinePositionAndScale = function (geoPackageTileBoundingBox, tileHeight, tileWidth, totalBoundingBox, totalHeight, totalWidth) {
        var p = {};
        var finalTileWidth = totalBoundingBox.maxLongitude - totalBoundingBox.minLongitude;
        var xoffsetMin = geoPackageTileBoundingBox.minLongitude - totalBoundingBox.minLongitude;
        var xpercentageMin = xoffsetMin / finalTileWidth;
        var finalTileHeight = totalBoundingBox.maxLatitude - totalBoundingBox.minLatitude;
        var yoffsetMax = totalBoundingBox.maxLatitude - geoPackageTileBoundingBox.maxLatitude;
        var ypercentageMax = yoffsetMax / finalTileHeight;
        var finalTilePixelsPerUnitWidth = totalWidth / finalTileWidth;
        var widthInFinalTileUnits = (geoPackageTileBoundingBox.maxLongitude - geoPackageTileBoundingBox.minLongitude) * finalTilePixelsPerUnitWidth;
        var finalTilePixelsPerUnitHeight = totalHeight / finalTileHeight;
        var heightInFinalTileUnits = (geoPackageTileBoundingBox.maxLatitude - geoPackageTileBoundingBox.minLatitude) * finalTilePixelsPerUnitHeight;
        p.yPositionInFinalTileStart = ypercentageMax * totalHeight;
        p.xPositionInFinalTileStart = xpercentageMin * totalWidth;
        p.dx = p.xPositionInFinalTileStart;
        p.dy = p.yPositionInFinalTileStart;
        p.sx = 0;
        p.sy = 0;
        p.dWidth = widthInFinalTileUnits;
        p.dHeight = heightInFinalTileUnits;
        p.sWidth = tileWidth;
        p.sHeight = tileHeight;
        return p;
    };
    /**
     * Calculate the bounds in EPSG:3857 coordinates of the tile at the given XYZ
     * coordinates coordinates and zoom level.
     *
     *  @param {number} x tile column
     *  @param {number} y tile row
     *  @param {number} zoom zoom level
     *  @param {*} [options] options object
     *  @return {BoundingBox} a bounding box in EPSG:3857 meters
     */
    TileBoundingBoxUtils.getWebMercatorBoundingBoxFromXYZ = function (x, y, zoom, options) {
        var tilesPerSide = TileBoundingBoxUtils.tilesPerSideWithZoom(zoom);
        var tileSize = TileBoundingBoxUtils.tileSizeWithTilesPerSide(tilesPerSide);
        // correct the x number to be between 0 and tilesPerSide
        while (x < 0) {
            x = x + tilesPerSide;
        }
        while (x >= tilesPerSide) {
            x = x - tilesPerSide;
        }
        var meterBuffer = 0;
        if (options && options.buffer && options.tileSize) {
            var pixelBuffer = options.buffer;
            var metersPerPixel = tileSize / options.tileSize;
            meterBuffer = metersPerPixel * pixelBuffer;
        }
        var minLon = -1 * projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH + x * tileSize - meterBuffer;
        var maxLon = -1 * projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH + (x + 1) * tileSize + meterBuffer;
        var minLat = projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH - (y + 1) * tileSize - meterBuffer;
        var maxLat = projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH - y * tileSize + meterBuffer;
        minLon = Math.max(-1 * projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, minLon);
        maxLon = Math.min(projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, maxLon);
        minLat = Math.max(-1 * projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, minLat);
        maxLat = Math.min(projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, maxLat);
        return new boundingBox_1.BoundingBox(minLon, maxLon, minLat, maxLat);
    };
    TileBoundingBoxUtils.getWGS84BoundingBoxFromXYZ = function (x, y, zoom) {
        var tilesPerLat = TileBoundingBoxUtils.tilesPerWGS84LatSide(zoom);
        var tilesPerLon = TileBoundingBoxUtils.tilesPerWGS84LonSide(zoom);
        var tileSizeLat = TileBoundingBoxUtils.tileSizeLatPerWGS84Side(tilesPerLat);
        var tileSizeLon = TileBoundingBoxUtils.tileSizeLonPerWGS84Side(tilesPerLon);
        var minLon = -1 * projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH + x * tileSizeLon;
        var maxLon = -1 * projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH + (x + 1) * tileSizeLon;
        var minLat = projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT - (y + 1) * tileSizeLat;
        var maxLat = projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT - y * tileSizeLat;
        return new boundingBox_1.BoundingBox(minLon, maxLon, minLat, maxLat);
    };
    /**
     *  Get the tile size in meters
     *
     *  @param tilesPerSide tiles per side
     *
     *  @return meters
     */
    TileBoundingBoxUtils.tileSizeWithTilesPerSide = function (tilesPerSide) {
        return (2 * projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) / tilesPerSide;
    };
    TileBoundingBoxUtils.intersects = function (boundingBoxA, boundingBoxB) {
        return TileBoundingBoxUtils.intersection(boundingBoxA, boundingBoxB) != null;
    };
    TileBoundingBoxUtils.intersection = function (boundingBoxA, boundingBoxB) {
        var x1 = Math.max(boundingBoxA.minLongitude, boundingBoxB.minLongitude);
        var y1 = Math.max(boundingBoxA.minLatitude, boundingBoxB.minLatitude);
        var x2 = Math.min(boundingBoxA.maxLongitude, boundingBoxB.maxLongitude);
        var y2 = Math.min(boundingBoxA.maxLatitude, boundingBoxB.maxLatitude);
        if (x1 > x2 || y1 > y2) {
            return null;
        }
        return new boundingBox_1.BoundingBox(x1, x2, y1, y2);
    };
    /**
     *  Get the tiles per side, width and height, at the zoom level
     *
     *  @param zoom zoom level
     *
     *  @return tiles per side
     */
    TileBoundingBoxUtils.tilesPerSideWithZoom = function (zoom) {
        return 1 << zoom;
    };
    /**
     * Get the tiles per latitude side at the zoom level
     * @param zoom zoom level
     * @return tiles per latitude side
     * @since 1.2.0
     */
    TileBoundingBoxUtils.tilesPerWGS84LatSide = function (zoom) {
        return TileBoundingBoxUtils.tilesPerSide(zoom);
    };
    /**
     * Get the tiles per longitude side at the zoom level
     * @param zoom zoom level
     * @return tiles per longitude side
     * @since 1.2.0
     */
    TileBoundingBoxUtils.tilesPerWGS84LonSide = function (zoom) {
        return 2 * TileBoundingBoxUtils.tilesPerSide(zoom);
    };
    /**
     * Get the tile height in degrees latitude
     *
     * @param tilesPerLat
     *            tiles per latitude side
     *
     * @return degrees
     * @since 1.2.0
     */
    TileBoundingBoxUtils.tileSizeLatPerWGS84Side = function (tilesPerLat) {
        return (2 * projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT) / tilesPerLat;
    };
    /**
     * Get the tile height in degrees longitude
     *
     * @param tilesPerLon
     *            tiles per longitude side
     *
     * @return degrees
     * @since 1.2.0
     */
    TileBoundingBoxUtils.tileSizeLonPerWGS84Side = function (tilesPerLon) {
        return (2 * projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH) / tilesPerLon;
    };
    /**
     *  Get the tile grid
     *  @param {BoundingBox} totalBoundingBox    web mercator total bounding box
     *  @param {Number} matrixWidth            matrix width
     *  @param {Number} matrixHeight           matrix height
     *  @param {BoundingBox} boundingBox            bounding box
     *
     *  @return tile grid
     */
    TileBoundingBoxUtils.getTileGridWithTotalBoundingBox = function (totalBoundingBox, matrixWidth, matrixHeight, boundingBox) {
        var minColumn = TileBoundingBoxUtils.getTileColumnWithTotalBoundingBox(totalBoundingBox, matrixWidth, boundingBox.minLongitude);
        var maxColumn = TileBoundingBoxUtils.getTileColumnWithTotalBoundingBox(totalBoundingBox, matrixWidth, boundingBox.maxLongitude);
        if (minColumn < matrixWidth && maxColumn >= 0) {
            if (minColumn < 0) {
                minColumn = 0;
            }
            if (maxColumn >= matrixWidth) {
                maxColumn = matrixWidth - 1;
            }
        }
        var maxRow = TileBoundingBoxUtils.getRowWithTotalBoundingBox(totalBoundingBox, matrixHeight, boundingBox.minLatitude);
        var minRow = TileBoundingBoxUtils.getRowWithTotalBoundingBox(totalBoundingBox, matrixHeight, boundingBox.maxLatitude);
        if (minRow < matrixHeight && maxRow >= 0) {
            if (minRow < 0) {
                minRow = 0;
            }
            if (maxRow >= matrixHeight) {
                maxRow = matrixHeight - 1;
            }
        }
        return new tileGrid_1.TileGrid(minColumn, maxColumn, minRow, maxRow);
    };
    /**
     *  Get the tile column of the longitude in degrees
     *
     *  @param {BoundingBox} webMercatorTotalBox web mercator total bounding box
     *  @param {Number} matrixWidth         matrix width
     *  @param {Number} longitude           longitude
     *  @param {Boolean} [max]
     *
     *  @return tile column
     */
    TileBoundingBoxUtils.getTileColumnWithTotalBoundingBox = function (webMercatorTotalBox, matrixWidth, longitude) {
        var minX = webMercatorTotalBox.minLongitude;
        var maxX = webMercatorTotalBox.maxLongitude;
        var tileId;
        if (longitude < minX) {
            tileId = -1;
        }
        else if (longitude >= maxX) {
            tileId = matrixWidth;
        }
        else {
            var matrixWidthMeters = maxX - minX;
            var tileWidth = matrixWidthMeters / matrixWidth;
            var tileIdDouble = (longitude - minX) / tileWidth;
            tileId = ~~tileIdDouble;
        }
        return tileId;
    };
    /**
     *  Get the tile row of the latitude in degrees
     *
     *  @param {BoundingBox} webMercatorTotalBox web mercator total bounding box
     *  @param {Number} matrixHeight        matrix height
     *  @param {Number} latitude            latitude
     *  @param {Boolean} [max]
     *  @return tile row
     */
    TileBoundingBoxUtils.getRowWithTotalBoundingBox = function (webMercatorTotalBox, matrixHeight, latitude) {
        var minY = webMercatorTotalBox.minLatitude;
        var maxY = webMercatorTotalBox.maxLatitude;
        var tileId;
        if (latitude < minY) {
            tileId = matrixHeight;
        }
        else if (latitude >= maxY) {
            tileId = -1;
        }
        else {
            var matrixHeightMeters = maxY - minY;
            var tileHeight = matrixHeightMeters / matrixHeight;
            var tileIdDouble = (maxY - latitude) / tileHeight;
            tileId = ~~tileIdDouble;
        }
        return tileId;
    };
    /**
     *  Get the web mercator bounding box of the tile column and row in the tile
     *  matrix using the total bounding box
     *
     *  @param {BoundingBox} box web mercator total bounding box
     *  @param {TileMatrix} tileMatrix          tile matrix
     *  @param {Number} tileColumn          tile column
     *  @param {Number} tileRow             tile row
     *
     *  @return web mercator bounding box
     */
    TileBoundingBoxUtils.getTileBoundingBox = function (box, tileMatrix, tileColumn, tileRow) {
        var tileMatrixWidth = tileMatrix.matrix_width;
        var tileMatrixHeight = tileMatrix.matrix_height;
        var tileGrid = new tileGrid_1.TileGrid(tileColumn, tileColumn, tileRow, tileRow);
        var matrixMinX = box.minLongitude;
        var matrixMaxX = box.maxLongitude;
        var matrixWidth = matrixMaxX - matrixMinX;
        var tileWidth = matrixWidth / tileMatrixWidth;
        // Find the longitude range
        var minLon = matrixMinX + tileWidth * tileGrid.min_x;
        var maxLon = minLon + tileWidth * (tileGrid.max_x + 1 - tileGrid.min_x);
        // Get the tile height
        var matrixMinY = box.minLatitude;
        var matrixMaxY = box.maxLatitude;
        var matrixHeight = matrixMaxY - matrixMinY;
        var tileHeight = matrixHeight / tileMatrixHeight;
        // Find the latitude range
        var maxLat = matrixMaxY - tileHeight * tileGrid.min_y;
        var minLat = maxLat - tileHeight * (tileGrid.max_y + 1 - tileGrid.min_y);
        return new boundingBox_1.BoundingBox(minLon, maxLon, minLat, maxLat);
    };
    TileBoundingBoxUtils.getTileGridBoundingBox = function (matrixSetBoundingBox, tileMatrixWidth, tileMatrixHeight, tileGrid) {
        // Get the tile width
        var matrixMinX = matrixSetBoundingBox.minLongitude;
        var matrixWidth = matrixSetBoundingBox.width;
        var tileWidth = matrixWidth / tileMatrixWidth;
        // Find the longitude range
        var minLon = matrixMinX + tileWidth * tileGrid.min_x;
        var maxLon = minLon + tileWidth * (tileGrid.max_x + 1 - tileGrid.min_x);
        // Get the tile height
        var matrixMaxY = matrixSetBoundingBox.maxLatitude;
        var matrixHeight = matrixSetBoundingBox.height;
        var tileHeight = matrixHeight / tileMatrixHeight;
        // Find the latitude range
        var maxLat = matrixMaxY - tileHeight * tileGrid.min_y;
        var minLat = maxLat - tileHeight * (tileGrid.max_y + 1 - tileGrid.min_y);
        return new boundingBox_1.BoundingBox(minLon, maxLon, minLat, maxLat);
    };
    TileBoundingBoxUtils.getXPixel = function (width, boundingBox, longitude) {
        return ((longitude - boundingBox.minLongitude) / boundingBox.width) * width;
    };
    TileBoundingBoxUtils.getLongitudeFromPixel = function (width, boundingBox, tileBoundingBox, pixel) {
        return (pixel / width) * tileBoundingBox.width + boundingBox.minLongitude;
    };
    TileBoundingBoxUtils.getYPixel = function (height, boundingBox, latitude) {
        return ((boundingBox.maxLatitude - latitude) / boundingBox.height) * height;
    };
    TileBoundingBoxUtils.getLatitudeFromPixel = function (height, boundingBox, tileBoundingBox, pixel) {
        return boundingBox.maxLatitude - (pixel / height) * tileBoundingBox.height;
    };
    /**
     * Get the tile size in meters
     * @param tilesPerSide tiles per side
     * @return {Number} tile size
     */
    TileBoundingBoxUtils.tileSize = function (tilesPerSide) {
        return (2 * projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) / tilesPerSide;
    };
    /**
     * Get the zoom level from the tile size in meters
     * @param tileSize tile size in meters
     * @return {Number} zoom level
     * @since 1.2.0
     */
    TileBoundingBoxUtils.zoomLevelOfTileSize = function (tileSize) {
        var tilesPerSide = (2 * projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) / tileSize;
        return Math.log(tilesPerSide) / Math.log(2);
    };
    /**
     * Get the tile width in degrees
     * @param tilesPerSide tiles per side
     * @return {Number} tile width degrees
     */
    TileBoundingBoxUtils.tileWidthDegrees = function (tilesPerSide) {
        return 360.0 / tilesPerSide;
    };
    /**
     * Get the tile height in degrees
     * @param tilesPerSide tiles per side
     * @return {Number} tile height degrees
     */
    TileBoundingBoxUtils.prototype.statictileHeightDegrees = function (tilesPerSide) {
        return 180.0 / tilesPerSide;
    };
    /**
     * Get the tiles per side, width and height, at the zoom level
     * @param zoom zoom level
     * @return {Number} tiles per side
     */
    TileBoundingBoxUtils.tilesPerSide = function (zoom) {
        return Math.pow(2, zoom);
    };
    /**
     * Get the tile size in meters at the zoom level
     * @param zoom zoom level
     * @return {Number} tile size in meters
     * @since 2.0.0
     */
    TileBoundingBoxUtils.tileSizeWithZoom = function (zoom) {
        var tilesPerSide = this.tilesPerSide(zoom);
        return this.tileSize(tilesPerSide);
    };
    /**
     * Get the tolerance distance in meters for the zoom level and pixels length
     * @param zoom zoom level
     * @param pixels pixel length
     * @return {Number} tolerance distance in meters
     * @since 2.0.0
     */
    TileBoundingBoxUtils.toleranceDistance = function (zoom, pixels) {
        var tileSize = this.tileSizeWithZoom(zoom);
        return tileSize / pixels;
    };
    /**
     * Get the tolerance distance in meters for the zoom level and pixels length
     * @param zoom zoom level
     * @param pixelWidth pixel width
     * @param pixelHeight pixel height
     * @return {Number} tolerance distance in meters
     * @since 2.0.0
     */
    TileBoundingBoxUtils.toleranceDistanceWidthAndHeight = function (zoom, pixelWidth, pixelHeight) {
        return this.toleranceDistance(zoom, Math.max(pixelWidth, pixelHeight));
    };
    TileBoundingBoxUtils.getFloatRoundedRectangle = function (width, height, boundingBox, boundingBoxSection) {
        var left = Math.round(TileBoundingBoxUtils.getXPixel(width, boundingBox, boundingBoxSection.minLongitude));
        var right = Math.round(TileBoundingBoxUtils.getXPixel(width, boundingBox, boundingBoxSection.maxLongitude));
        var top = Math.round(TileBoundingBoxUtils.getYPixel(height, boundingBox, boundingBoxSection.maxLatitude));
        var bottom = Math.round(TileBoundingBoxUtils.getYPixel(height, boundingBox, boundingBoxSection.minLatitude));
        var isValid = left < right && top < bottom;
        return { left: left, right: right, bottom: bottom, top: top, isValid: isValid };
    };
    return TileBoundingBoxUtils;
}());
exports.TileBoundingBoxUtils = TileBoundingBoxUtils;
//# sourceMappingURL=tileBoundingBoxUtils.js.map