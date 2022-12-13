"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoPackageTileRetriever = void 0;
var tileBoundingBoxUtils_1 = require("../tileBoundingBoxUtils");
var tileCreator_1 = require("../creator/tileCreator");
var tileScalingType_1 = require("../../extension/scale/tileScalingType");
var projection_1 = require("../../projection/projection");
var projectionConstants_1 = require("../../projection/projectionConstants");
var GeoPackageTileRetriever = /** @class */ (function () {
    function GeoPackageTileRetriever(tileDao, width, height) {
        this.tileDao = tileDao;
        this.tileDao.adjustTileMatrixLengths();
        this.width = width;
        this.height = height;
        this.scaling = null;
    }
    GeoPackageTileRetriever.prototype.setScaling = function (scaling) {
        this.scaling = scaling;
    };
    GeoPackageTileRetriever.prototype.getWebMercatorBoundingBox = function () {
        if (this.setWebMercatorBoundingBox == null) {
            this.setWebMercatorBoundingBox = this.tileDao.tileMatrixSet.boundingBox.projectBoundingBox(this.tileDao.projection, projectionConstants_1.ProjectionConstants.EPSG_3857);
        }
        return this.setWebMercatorBoundingBox;
    };
    /**
     * Determine the web mercator bounding box from xyz and see if there is a tile for the bounding box.
     * @param x
     * @param y
     * @param zoom
     */
    GeoPackageTileRetriever.prototype.hasTile = function (x, y, zoom) {
        var hasTile = false;
        if (x >= 0 && y >= 0 && zoom >= 0) {
            var tilesBoundingBox = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getWebMercatorBoundingBoxFromXYZ(x, y, zoom);
            hasTile = this.hasTileForBoundingBox(tilesBoundingBox, projectionConstants_1.ProjectionConstants.EPSG_3857);
        }
        return hasTile;
    };
    GeoPackageTileRetriever.prototype.hasTileForBoundingBox = function (tilesBoundingBox, targetProjection) {
        var projectedBoundingBox = tilesBoundingBox.projectBoundingBox(targetProjection, this.tileDao.projection);
        var tileMatrices = this.getTileMatrices(projectedBoundingBox);
        var hasTile = false;
        for (var i = 0; !hasTile && i < tileMatrices.length; i++) {
            var tileMatrix = tileMatrices[i];
            var tileGrid = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getTileGridWithTotalBoundingBox(this.tileDao.tileMatrixSet.boundingBox, tileMatrix.matrix_width, tileMatrix.matrix_height, projectedBoundingBox);
            hasTile = this.tileDao.countByTileGrid(tileGrid, tileMatrix.zoom_level) > 0;
        }
        return hasTile;
    };
    GeoPackageTileRetriever.prototype.getTile = function (x, y, zoom) {
        return __awaiter(this, void 0, void 0, function () {
            var webMercatorBoundingBox;
            return __generator(this, function (_a) {
                webMercatorBoundingBox = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getWebMercatorBoundingBoxFromXYZ(x, y, zoom);
                return [2 /*return*/, this.getTileWithBounds(webMercatorBoundingBox, projectionConstants_1.ProjectionConstants.EPSG_3857)];
            });
        });
    };
    GeoPackageTileRetriever.prototype.getWebMercatorTile = function (x, y, zoom) {
        return __awaiter(this, void 0, void 0, function () {
            var webMercatorBoundingBox;
            return __generator(this, function (_a) {
                webMercatorBoundingBox = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getWebMercatorBoundingBoxFromXYZ(x, y, zoom);
                return [2 /*return*/, this.getTileWithBounds(webMercatorBoundingBox, projectionConstants_1.ProjectionConstants.EPSG_3857)];
            });
        });
    };
    GeoPackageTileRetriever.prototype.drawTileIn = function (x, y, zoom, canvas) {
        return __awaiter(this, void 0, void 0, function () {
            var webMercatorBoundingBox;
            return __generator(this, function (_a) {
                webMercatorBoundingBox = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getWebMercatorBoundingBoxFromXYZ(x, y, zoom);
                return [2 /*return*/, this.getTileWithBounds(webMercatorBoundingBox, projectionConstants_1.ProjectionConstants.EPSG_3857, canvas)];
            });
        });
    };
    GeoPackageTileRetriever.prototype.getTileWithWgs84Bounds = function (wgs84BoundingBox, canvas) {
        return __awaiter(this, void 0, void 0, function () {
            var webMercatorBoundingBox;
            return __generator(this, function (_a) {
                webMercatorBoundingBox = wgs84BoundingBox.projectBoundingBox(projectionConstants_1.ProjectionConstants.EPSG_4326, projectionConstants_1.ProjectionConstants.EPSG_3857);
                return [2 /*return*/, this.getTileWithBounds(webMercatorBoundingBox, projectionConstants_1.ProjectionConstants.EPSG_3857, canvas)];
            });
        });
    };
    GeoPackageTileRetriever.prototype.getTileWithWgs84BoundsInProjection = function (wgs84BoundingBox, zoom, targetProjection, canvas) {
        return __awaiter(this, void 0, void 0, function () {
            var targetBoundingBox;
            return __generator(this, function (_a) {
                targetBoundingBox = wgs84BoundingBox.projectBoundingBox(projectionConstants_1.ProjectionConstants.EPSG_4326, targetProjection);
                return [2 /*return*/, this.getTileWithBounds(targetBoundingBox, targetProjection, canvas)];
            });
        });
    };
    GeoPackageTileRetriever.prototype.getTileWithBounds = function (targetBoundingBox, targetProjection, canvas) {
        return __awaiter(this, void 0, void 0, function () {
            var targetProjectionDefinition, projectedBoundingBox, tileMatrices, tileFound, tile, i, tileMatrix, tileWidth, tileHeight, creator, iterator, iterator_1, iterator_1_1, tile_1, tileBoundingBox, overlap, src, dest, e_1_1;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        targetProjectionDefinition = projection_1.Projection.hasProjection(targetProjection);
                        if (targetProjectionDefinition == null) {
                            throw new Error('Projection ' + targetProjection + ' is not loaded.');
                        }
                        projectedBoundingBox = targetBoundingBox.projectBoundingBox(targetProjection, this.tileDao.projection);
                        tileMatrices = this.getTileMatrices(projectedBoundingBox);
                        tileFound = false;
                        tile = null;
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(!tileFound && i < tileMatrices.length)) return [3 /*break*/, 12];
                        tileMatrix = tileMatrices[i];
                        tileWidth = tileMatrix.tile_width;
                        tileHeight = tileMatrix.tile_height;
                        return [4 /*yield*/, tileCreator_1.TileCreator.create(this.width || tileWidth, this.height || tileHeight, tileMatrix, this.tileDao.tileMatrixSet, targetBoundingBox, this.tileDao.srs, targetProjection, targetProjectionDefinition, canvas)];
                    case 2:
                        creator = _b.sent();
                        iterator = this.retrieveTileResults(projectedBoundingBox, tileMatrix);
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 8, 9, 10]);
                        iterator_1 = (e_1 = void 0, __values(iterator)), iterator_1_1 = iterator_1.next();
                        _b.label = 4;
                    case 4:
                        if (!!iterator_1_1.done) return [3 /*break*/, 7];
                        tile_1 = iterator_1_1.value;
                        tileBoundingBox = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getTileBoundingBox(this.tileDao.tileMatrixSet.boundingBox, tileMatrix, tile_1.tileColumn, tile_1.row);
                        overlap = tileBoundingBoxUtils_1.TileBoundingBoxUtils.intersection(projectedBoundingBox, tileBoundingBox);
                        if (!(overlap != null)) return [3 /*break*/, 6];
                        src = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getFloatRoundedRectangle(tileMatrix.tile_width, tileMatrix.tile_height, tileBoundingBox, overlap);
                        dest = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getFloatRoundedRectangle(this.width, this.height, projectedBoundingBox, overlap);
                        if (!(src.isValid && dest.isValid)) return [3 /*break*/, 6];
                        return [4 /*yield*/, creator.addTile(tile_1.tileData, tile_1.tileColumn, tile_1.row)];
                    case 5:
                        _b.sent();
                        tileFound = true;
                        _b.label = 6;
                    case 6:
                        iterator_1_1 = iterator_1.next();
                        return [3 /*break*/, 4];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (iterator_1_1 && !iterator_1_1.done && (_a = iterator_1.return)) _a.call(iterator_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 10:
                        if (!canvas && tileFound) {
                            tile = creator.getCompleteTile();
                        }
                        creator.cleanup();
                        _b.label = 11;
                    case 11:
                        i++;
                        return [3 /*break*/, 1];
                    case 12: return [2 /*return*/, tile];
                }
            });
        });
    };
    GeoPackageTileRetriever.prototype.retrieveTileResults = function (tileMatrixProjectionBoundingBox, tileMatrix) {
        if (tileMatrix) {
            var tileGrid = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getTileGridWithTotalBoundingBox(this.tileDao.tileMatrixSet.boundingBox, tileMatrix.matrix_width, tileMatrix.matrix_height, tileMatrixProjectionBoundingBox);
            return this.tileDao.queryByTileGrid(tileGrid, tileMatrix.zoom_level);
        }
    };
    /**
     * Get the tile matrices that may contain the tiles for the bounding box,
     * matches against the bounding box and zoom level options
     * @param projectedRequestBoundingBox bounding box projected to the tiles
     * @return tile matrices
     */
    GeoPackageTileRetriever.prototype.getTileMatrices = function (projectedRequestBoundingBox) {
        var _this = this;
        var tileMatrices = [];
        // Check if the request overlaps the tile matrix set
        if (this.tileDao.tileMatrices.length !== 0 &&
            tileBoundingBoxUtils_1.TileBoundingBoxUtils.intersects(projectedRequestBoundingBox, this.tileDao.tileMatrixSet.boundingBox)) {
            // Get the tile distance
            var distanceWidth = projectedRequestBoundingBox.maxLongitude - projectedRequestBoundingBox.minLongitude;
            var distanceHeight = projectedRequestBoundingBox.maxLatitude - projectedRequestBoundingBox.minLatitude;
            // Get the zoom level to request based upon the tile size
            var requestZoomLevel = void 0;
            if (this.scaling != null) {
                // When options are provided, get the approximate zoom level regardless of whether a tile level exists
                requestZoomLevel = this.tileDao.getApproximateZoomLevelForWidthAndHeight(distanceWidth, distanceHeight);
            }
            else {
                // Get the closest existing zoom level
                requestZoomLevel = this.tileDao.getZoomLevelForWidthAndHeight(distanceWidth, distanceHeight);
            }
            // If there is a matching zoom level
            if (requestZoomLevel != null) {
                var zoomLevels = [];
                // If options are configured, build the possible zoom levels in
                // order to request
                if (this.scaling != null && this.scaling.scaling_type != null) {
                    // Find zoom in levels
                    var zoomInLevels = [];
                    if (this.scaling.isZoomIn()) {
                        var zoomIn = this.scaling.zoom_in != null ? requestZoomLevel + this.scaling.zoom_in : this.tileDao.maxZoom;
                        for (var zoomLevel = requestZoomLevel + 1; zoomLevel <= zoomIn; zoomLevel++) {
                            zoomInLevels.push(zoomLevel);
                        }
                    }
                    // Find zoom out levels
                    var zoomOutLevels = [];
                    if (this.scaling.isZoomOut()) {
                        var zoomOut = this.scaling.zoom_out != null ? requestZoomLevel - this.scaling.zoom_out : this.tileDao.minZoom;
                        for (var zoomLevel = requestZoomLevel - 1; zoomLevel >= zoomOut; zoomLevel--) {
                            zoomOutLevels.push(zoomLevel);
                        }
                    }
                    if (zoomInLevels.length == 0) {
                        // Only zooming out
                        zoomLevels = zoomOutLevels;
                    }
                    else if (zoomOutLevels.length == 0) {
                        // Only zooming in
                        zoomLevels = zoomInLevels;
                    }
                    else {
                        // Determine how to order the zoom in and zoom out
                        // levels
                        var type = this.scaling.scaling_type;
                        switch (type) {
                            case tileScalingType_1.TileScalingType.IN:
                            case tileScalingType_1.TileScalingType.IN_OUT:
                                // Order zoom in levels before zoom out levels
                                zoomLevels = zoomInLevels.concat(zoomOutLevels);
                                break;
                            case tileScalingType_1.TileScalingType.OUT:
                            case tileScalingType_1.TileScalingType.OUT_IN:
                                // Order zoom out levels before zoom in levels
                                zoomLevels = zoomOutLevels.concat(zoomInLevels);
                                break;
                            case tileScalingType_1.TileScalingType.CLOSEST_IN_OUT:
                            case tileScalingType_1.TileScalingType.CLOSEST_OUT_IN:
                                // Alternate the zoom in and out levels
                                var firstLevels = void 0;
                                var secondLevels = void 0;
                                if (type == tileScalingType_1.TileScalingType.CLOSEST_IN_OUT) {
                                    // Alternate starting with zoom in
                                    firstLevels = zoomInLevels;
                                    secondLevels = zoomOutLevels;
                                }
                                else {
                                    // Alternate starting with zoom out
                                    firstLevels = zoomOutLevels;
                                    secondLevels = zoomInLevels;
                                }
                                zoomLevels = [];
                                var maxLevels = Math.max(firstLevels.length, secondLevels.length);
                                for (var i = 0; i < maxLevels; i++) {
                                    if (i < firstLevels.length) {
                                        zoomLevels.push(firstLevels[i]);
                                    }
                                    if (i < secondLevels.length) {
                                        zoomLevels.push(secondLevels[i]);
                                    }
                                }
                                break;
                            default:
                                throw new Error('Unsupported TileScalingType: ' + type);
                        }
                    }
                }
                else {
                    zoomLevels = [];
                }
                // Always check the request zoom level first
                zoomLevels.unshift(requestZoomLevel);
                // Build a list of tile matrices that exist for the zoom levels
                zoomLevels.forEach(function (zoomLevel) {
                    var tileMatrix = _this.tileDao.getTileMatrixWithZoomLevel(zoomLevel);
                    if (tileMatrix != null) {
                        tileMatrices.push(tileMatrix);
                    }
                });
            }
        }
        return tileMatrices;
    };
    return GeoPackageTileRetriever;
}());
exports.GeoPackageTileRetriever = GeoPackageTileRetriever;
//# sourceMappingURL=index.js.map