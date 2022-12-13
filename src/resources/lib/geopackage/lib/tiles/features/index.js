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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureTiles = void 0;
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
var polygon_to_line_1 = __importDefault(require("@turf/polygon-to-line"));
var boolean_clockwise_1 = __importDefault(require("@turf/boolean-clockwise"));
var simplify_js_1 = __importDefault(require("simplify-js"));
var tileBoundingBoxUtils_1 = require("../tileBoundingBoxUtils");
var boundingBox_1 = require("../../boundingBox");
var iconCache_1 = require("../../extension/style/iconCache");
var geometryCache_1 = require("./geometryCache");
var featureDrawType_1 = require("./featureDrawType");
var featurePaintCache_1 = require("./featurePaintCache");
var paint_1 = require("./paint");
var featureTableStyles_1 = require("../../extension/style/featureTableStyles");
var canvas_1 = require("../../canvas/canvas");
var projection_1 = require("../../projection/projection");
var projectionConstants_1 = require("../../projection/projectionConstants");
/**
 * FeatureTiles module.
 * @module tiles/features
 */
/**
 *  Tiles drawn from or linked to features. Used to query features and optionally draw tiles
 *  from those features.
 */
var FeatureTiles = /** @class */ (function () {
    function FeatureTiles(featureDao, tileWidth, tileHeight) {
        if (tileWidth === void 0) { tileWidth = 256; }
        if (tileHeight === void 0) { tileHeight = 256; }
        this.featureDao = featureDao;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.projection = null;
        this.webMercatorProjection = null;
        this.simplifyGeometries = true;
        this.simplifyToleranceInPixels = 1;
        this.compressFormat = 'png';
        this.pointRadius = 4.0;
        this.pointPaint = new paint_1.Paint();
        this.pointIcon = null;
        this.linePaint = new paint_1.Paint();
        this._lineStrokeWidth = 2.0;
        this.polygonPaint = new paint_1.Paint();
        this._polygonStrokeWidth = 2.0;
        this.fillPolygon = true;
        this.polygonFillPaint = new paint_1.Paint();
        this.featurePaintCache = new featurePaintCache_1.FeaturePaintCache();
        this.geometryCache = new geometryCache_1.GeometryCache();
        this.cacheGeometries = true;
        this.iconCache = new iconCache_1.IconCache();
        this._scale = 1.0;
        this.maxFeaturesPerTile = null;
        this.maxFeaturesTileDraw = null;
        this.projection = this.featureDao.projection;
        this.linePaint.strokeWidth = 2.0;
        this.polygonPaint.strokeWidth = 2.0;
        this.polygonFillPaint.color = '#00000011';
        this.geoPackage = this.featureDao.geoPackage;
        if (this.geoPackage != null) {
            this.featureTableStyles = new featureTableStyles_1.FeatureTableStyles(this.geoPackage, featureDao.table);
            if (!this.featureTableStyles.has()) {
                this.featureTableStyles = null;
            }
        }
        this.webMercatorProjection = projection_1.Projection.getWebMercatorToWGS84Converter();
        this.calculateDrawOverlap();
    }
    /**
     * Will handle disposing any saved icons
     */
    FeatureTiles.prototype.cleanup = function () {
        this.clearIconCache();
        if (this.pointIcon) {
            canvas_1.Canvas.disposeImage(this.pointIcon.getIcon());
            this.pointIcon = null;
        }
    };
    Object.defineProperty(FeatureTiles.prototype, "drawOverlap", {
        /**
         * Manually set the width and height draw overlap
         * @param {Number} pixels pixels
         */
        set: function (pixels) {
            this.widthDrawOverlap = pixels;
            this.heightDrawOverlap = pixels;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FeatureTiles.prototype, "simplifyTolerance", {
        /**
         * Get the simplify tolerance in pixels
         * @return {Number} width draw overlap
         */
        get: function () {
            return this.simplifyToleranceInPixels;
        },
        /**
         * Set the tolerance in pixels used for simplifying rendered geometries
         * @param {Number} pixels pixels
         */
        set: function (pixels) {
            this.simplifyToleranceInPixels = pixels;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FeatureTiles.prototype, "widthDrawOverlap", {
        /**
         * Get the width draw overlap
         * @return {Number} width draw overlap
         */
        get: function () {
            return this.widthOverlap;
        },
        /**
         * Manually set the width draw overlap
         * @param {Number} pixels pixels
         */
        set: function (pixels) {
            this.widthOverlap = pixels;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FeatureTiles.prototype, "heightDrawOverlap", {
        /**
         * Get the height draw overlap
         * @return {Number} height draw overlap
         */
        get: function () {
            return this.heightOverlap;
        },
        /**
         * Manually set the height draw overlap
         * @param {Number} pixels pixels
         */
        set: function (pixels) {
            this.heightOverlap = pixels;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Ignore the feature table styles within the GeoPackage
     */
    FeatureTiles.prototype.ignoreFeatureTableStyles = function () {
        this.featureTableStyles = null;
        this.calculateDrawOverlap();
    };
    /**
     * Clear all caches
     */
    FeatureTiles.prototype.clearCache = function () {
        this.clearStylePaintCache();
        this.clearIconCache();
    };
    /**
     * Clear the style paint cache
     */
    FeatureTiles.prototype.clearStylePaintCache = function () {
        this.featurePaintCache.clear();
    };
    Object.defineProperty(FeatureTiles.prototype, "stylePaintCacheSize", {
        /**
         * Set / resize the style paint cache size
         *
         * @param {Number} size
         * @since 3.3.0
         */
        set: function (size) {
            this.featurePaintCache.resize(size);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Clear the icon cache
     */
    FeatureTiles.prototype.clearIconCache = function () {
        this.iconCache.clear();
    };
    Object.defineProperty(FeatureTiles.prototype, "iconCacheSize", {
        /**
         * Set / resize the icon cache size
         * @param {Number} size new size
         */
        set: function (size) {
            this.iconCache.resize(size);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FeatureTiles.prototype, "scale", {
        get: function () {
            return this._scale;
        },
        /**
         * Set the scale
         *
         * @param {Number} scale scale factor
         */
        set: function (scale) {
            this._scale = scale;
            this.linePaint.strokeWidth = scale * this.lineStrokeWidth;
            this.polygonPaint.strokeWidth = scale * this.polygonStrokeWidth;
            this.featurePaintCache.clear();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FeatureTiles.prototype, "geometryCacheMaxSize", {
        /**
         * Set geometry cache's max size
         * @param {Number} maxSize
         */
        set: function (maxSize) {
            this.geometryCache.resize(maxSize);
        },
        enumerable: false,
        configurable: true
    });
    FeatureTiles.prototype.calculateDrawOverlap = function () {
        if (this.pointIcon) {
            this.heightOverlap = this.scale * this.pointIcon.getHeight();
            this.widthOverlap = this.scale * this.pointIcon.getWidth();
        }
        else {
            this.heightOverlap = this.scale * this.pointRadius;
            this.widthOverlap = this.scale * this.pointRadius;
        }
        var lineHalfStroke = (this.scale * this.lineStrokeWidth) / 2.0;
        this.heightOverlap = Math.max(this.heightOverlap, lineHalfStroke);
        this.widthOverlap = Math.max(this.widthOverlap, lineHalfStroke);
        var polygonHalfStroke = (this.scale * this.polygonStrokeWidth) / 2.0;
        this.heightOverlap = Math.max(this.heightOverlap, polygonHalfStroke);
        this.widthOverlap = Math.max(this.widthOverlap, polygonHalfStroke);
        if (this.featureTableStyles != null && this.featureTableStyles.has()) {
            var styleRowIds_1 = [];
            var tableStyleIds = this.featureTableStyles.getAllTableStyleIds();
            if (tableStyleIds != null) {
                styleRowIds_1 = styleRowIds_1.concat(tableStyleIds);
            }
            var styleIds = this.featureTableStyles.getAllStyleIds();
            if (styleIds != null) {
                styleRowIds_1 = styleRowIds_1.concat(styleIds.filter(function (id) { return styleRowIds_1.indexOf(id) === -1; }));
            }
            var styleDao = this.featureTableStyles.getStyleDao();
            for (var i = 0; i < styleRowIds_1.length; i++) {
                var styleRowId = styleRowIds_1[i];
                var styleRow = styleDao.queryForId(styleRowId);
                var styleHalfWidth = this.scale * (styleRow.getWidthOrDefault() / 2.0);
                this.widthOverlap = Math.max(this.widthOverlap, styleHalfWidth);
                this.heightOverlap = Math.max(this.heightOverlap, styleHalfWidth);
            }
            var iconRowIds_1 = [];
            var tableIconIds = this.featureTableStyles.getAllTableIconIds();
            if (tableIconIds != null) {
                iconRowIds_1 = iconRowIds_1.concat(tableIconIds);
            }
            var iconIds = this.featureTableStyles.getAllIconIds();
            if (iconIds != null) {
                iconRowIds_1 = iconRowIds_1.concat(iconIds.filter(function (id) { return iconRowIds_1.indexOf(id) === -1; }));
            }
            var iconDao = this.featureTableStyles.getIconDao();
            for (var i = 0; i < iconRowIds_1.length; i++) {
                var iconRowId = iconRowIds_1[i];
                var iconRow = iconDao.queryForId(iconRowId);
                var iconDimensions = iconRow.derivedDimensions;
                var iconWidth = this.scale * Math.ceil(iconDimensions[0]);
                var iconHeight = this.scale * Math.ceil(iconDimensions[1]);
                this.widthOverlap = Math.max(this.widthOverlap, iconWidth);
                this.heightOverlap = Math.max(this.heightOverlap, iconHeight);
            }
        }
    };
    Object.defineProperty(FeatureTiles.prototype, "drawOverlapsWithPixels", {
        set: function (pixels) {
            this.widthOverlap = pixels;
            this.heightOverlap = pixels;
        },
        enumerable: false,
        configurable: true
    });
    FeatureTiles.prototype.getFeatureStyle = function (featureRow) {
        var featureStyle = null;
        if (this.featureTableStyles != null) {
            featureStyle = this.featureTableStyles.getFeatureStyleForFeatureRow(featureRow);
        }
        return featureStyle;
    };
    /**
     * Get the point paint for the feature style, or return the default paint
     * @param featureStyle feature style
     * @return paint
     */
    FeatureTiles.prototype.getPointPaint = function (featureStyle) {
        var paint = this.getFeatureStylePaint(featureStyle, featureDrawType_1.FeatureDrawType.CIRCLE);
        if (paint == null) {
            paint = this.pointPaint;
        }
        return paint;
    };
    /**
     * Get the line paint for the feature style, or return the default paint
     * @param featureStyle feature style
     * @return paint
     */
    FeatureTiles.prototype.getLinePaint = function (featureStyle) {
        var paint = this.getFeatureStylePaint(featureStyle, featureDrawType_1.FeatureDrawType.STROKE);
        if (paint == null) {
            paint = this.linePaint;
        }
        return paint;
    };
    /**
     * Get the polygon paint for the feature style, or return the default paint
     * @param featureStyle feature style
     * @return paint
     */
    FeatureTiles.prototype.getPolygonPaint = function (featureStyle) {
        var paint = this.getFeatureStylePaint(featureStyle, featureDrawType_1.FeatureDrawType.STROKE);
        if (paint == null) {
            paint = this.polygonPaint;
        }
        return paint;
    };
    /**
     * Get the polygon fill paint for the feature style, or return the default
     * paint
     * @param featureStyle feature style
     * @return paint
     */
    FeatureTiles.prototype.getPolygonFillPaint = function (featureStyle) {
        var paint = null;
        var hasStyleColor = false;
        if (featureStyle != null) {
            var style = featureStyle.style;
            if (style != null) {
                if (style.hasFillColor()) {
                    paint = this.getStylePaint(style, featureDrawType_1.FeatureDrawType.FILL);
                }
                else {
                    hasStyleColor = style.hasColor();
                }
            }
        }
        if (paint === null && !hasStyleColor && this.fillPolygon) {
            paint = this.polygonFillPaint;
        }
        return paint;
    };
    /**
     * Get the feature style paint from cache, or create and cache it
     * @param featureStyle feature style
     * @param drawType draw type
     * @return feature style paint
     */
    FeatureTiles.prototype.getFeatureStylePaint = function (featureStyle, drawType) {
        var paint = null;
        if (featureStyle != null) {
            var style = featureStyle.style;
            if (style != null && style.hasColor()) {
                paint = this.getStylePaint(style, drawType);
            }
        }
        return paint;
    };
    /**
     * Get the style paint from cache, or create and cache it
     * @param style style row
     * @param drawType draw type
     * @return {Paint} paint
     */
    FeatureTiles.prototype.getStylePaint = function (style, drawType) {
        var paint = this.featurePaintCache.getPaintForStyleRow(style, drawType);
        if (paint === undefined || paint === null) {
            var color = null;
            var strokeWidth = null;
            if (drawType === featureDrawType_1.FeatureDrawType.CIRCLE) {
                color = style.getColor();
            }
            else if (drawType === featureDrawType_1.FeatureDrawType.STROKE) {
                color = style.getColor();
                strokeWidth = this.scale * style.getWidthOrDefault();
            }
            else if (drawType === featureDrawType_1.FeatureDrawType.FILL) {
                color = style.getFillColor();
                strokeWidth = this.scale * style.getWidthOrDefault();
            }
            else {
                throw new Error('Unsupported Draw Type: ' + drawType);
            }
            var stylePaint = new paint_1.Paint();
            stylePaint.color = color;
            if (strokeWidth != null) {
                stylePaint.strokeWidth = strokeWidth;
            }
            paint = this.featurePaintCache.getPaintForStyleRow(style, drawType);
            if (paint === undefined || paint === null) {
                this.featurePaintCache.setPaintForStyleRow(style, drawType, stylePaint);
                paint = stylePaint;
            }
        }
        return paint;
    };
    Object.defineProperty(FeatureTiles.prototype, "pointColor", {
        /**
         * Get point color
         * @return {String} color
         */
        get: function () {
            return this.pointPaint.color;
        },
        /**
         * Set point color
         * @param {String} pointColor point color
         */
        set: function (pointColor) {
            this.pointPaint.color = pointColor;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FeatureTiles.prototype, "lineStrokeWidth", {
        /**
         * Get line stroke width
         * @return {Number} width
         */
        get: function () {
            return this._lineStrokeWidth;
        },
        /**
         * Set line stroke width
         * @param {Number} lineStrokeWidth line stroke width
         */
        set: function (lineStrokeWidth) {
            this._lineStrokeWidth = lineStrokeWidth;
            this.linePaint.strokeWidth = this.scale * this.lineStrokeWidth;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FeatureTiles.prototype, "lineColor", {
        /**
         * Get line color
         * @return {String} color
         */
        get: function () {
            return this.linePaint.color;
        },
        /**
         * Set line color
         * @param {String} lineColor line color
         */
        set: function (lineColor) {
            this.linePaint.color = lineColor;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FeatureTiles.prototype, "polygonStrokeWidth", {
        /**
         * Get polygon stroke width
         * @return {Number} width
         */
        get: function () {
            return this._polygonStrokeWidth;
        },
        /**
         * Set polygon stroke width
         * @param {Number} polygonStrokeWidth polygon stroke width
         */
        set: function (polygonStrokeWidth) {
            this._polygonStrokeWidth = polygonStrokeWidth;
            this.polygonPaint.strokeWidth = this.scale * polygonStrokeWidth;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FeatureTiles.prototype, "polygonColor", {
        /**
         * Get polygon color
         * @return {String} color
         */
        get: function () {
            return this.polygonPaint.color;
        },
        /**
         * Set polygon color
         * @param {String} polygonColor polygon color
         */
        set: function (polygonColor) {
            this.polygonPaint.color = polygonColor;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FeatureTiles.prototype, "polygonFillColor", {
        /**
         * Get polygon fill color
         * @return {String} color
         */
        get: function () {
            return this.polygonFillPaint.color;
        },
        /**
         * Set polygon fill color
         * @param {String} polygonFillColor polygon fill color
         */
        set: function (polygonFillColor) {
            this.polygonFillPaint.color = polygonFillColor;
        },
        enumerable: false,
        configurable: true
    });
    FeatureTiles.prototype.getFeatureCountXYZ = function (x, y, z) {
        var boundingBox = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getWebMercatorBoundingBoxFromXYZ(x, y, z);
        boundingBox = this.expandBoundingBox(boundingBox, projectionConstants_1.ProjectionConstants.EPSG_3857);
        return this.featureDao.countWebMercatorBoundingBox(boundingBox);
    };
    /**
     * Renders the web mercator (EPSG:3857) xyz tile
     * @param x
     * @param y
     * @param z
     * @param canvas
     */
    FeatureTiles.prototype.drawTile = function (x, y, z, canvas) {
        if (canvas === void 0) { canvas = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.draw3857Tile(x, y, z, canvas)];
            });
        });
    };
    /**
     * Renders the web mercator (EPSG:3857) xyz tile
     * @param x
     * @param y
     * @param z
     * @param canvas
     */
    FeatureTiles.prototype.draw3857Tile = function (x, y, z, canvas) {
        if (canvas === void 0) { canvas = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.featureDao.isIndexed()) {
                    return [2 /*return*/, this.drawTileQueryIndex(x, y, z, projectionConstants_1.ProjectionConstants.EPSG_3857, canvas)];
                }
                else {
                    return [2 /*return*/, this.drawTileQueryAll(x, y, z, projectionConstants_1.ProjectionConstants.EPSG_3857, canvas)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Renders the wgs84 (EPSG:4326) xyz tile
     * @param x
     * @param y
     * @param z
     * @param canvas
     */
    FeatureTiles.prototype.draw4326Tile = function (x, y, z, canvas) {
        if (canvas === void 0) { canvas = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.featureDao.isIndexed()) {
                    return [2 /*return*/, this.drawTileQueryIndex(x, y, z, projectionConstants_1.ProjectionConstants.EPSG_4326, canvas)];
                }
                else {
                    return [2 /*return*/, this.drawTileQueryAll(x, y, z, projectionConstants_1.ProjectionConstants.EPSG_4326, canvas)];
                }
                return [2 /*return*/];
            });
        });
    };
    FeatureTiles.prototype.drawTileQueryAll = function (x, y, zoom, tileProjection, canvas) {
        return __awaiter(this, void 0, void 0, function () {
            var boundingBox, count;
            return __generator(this, function (_a) {
                boundingBox = tileProjection === projectionConstants_1.ProjectionConstants.EPSG_3857
                    ? tileBoundingBoxUtils_1.TileBoundingBoxUtils.getWebMercatorBoundingBoxFromXYZ(x, y, zoom)
                    : tileBoundingBoxUtils_1.TileBoundingBoxUtils.getWGS84BoundingBoxFromXYZ(x, y, zoom);
                count = this.featureDao.getCount();
                if (this.maxFeaturesPerTile === null || count <= this.maxFeaturesPerTile) {
                    return [2 /*return*/, this.drawTileWithBoundingBox(boundingBox, zoom, tileProjection, canvas)];
                }
                else if (this.maxFeaturesTileDraw != null) {
                    return [2 /*return*/, this.maxFeaturesTileDraw.drawUnindexedTile(this.tileWidth, this.tileHeight, canvas)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handles the generation of a function for transforming coordinates from the source projection into the target tile's
     * projection. These coordinates are then converted into pixel coordinates.
     * @param targetProjection
     */
    FeatureTiles.prototype.getTransformFunction = function (targetProjection) {
        var _this = this;
        var projection = projection_1.Projection.getConverter(targetProjection);
        if (projection_1.Projection.convertersMatch(projection, this.projection)) {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            return function (coordinate) { return coordinate; };
        }
        else if (projection_1.Projection.isWebMercator(projection) && projection_1.Projection.isWGS84(this.projection)) {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            return function (coordinate) {
                return projection_1.Projection.getConverterFromConverters(_this.projection, targetProjection).forward([
                    Math.max(projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MIN_LON_RANGE, Math.min(projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MAX_LON_RANGE, coordinate[0])),
                    Math.max(projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MIN_LAT_RANGE, Math.min(projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MAX_LAT_RANGE, coordinate[1])),
                ]);
            };
        }
        else {
            return projection_1.Projection.getConverterFromConverters(this.projection, targetProjection).forward;
        }
    };
    FeatureTiles.prototype.drawTileQueryIndex = function (x, y, z, tileProjection, tileCanvas) {
        return __awaiter(this, void 0, void 0, function () {
            var canvas, context, dispose, image, boundingBox, expandedBoundingBox, width, height, featureCount, transform, iterator, iterator_1, iterator_1_1, featureRow, geojson, style, e_1, e_2_1;
            var e_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        dispose = false;
                        boundingBox = tileProjection === projectionConstants_1.ProjectionConstants.EPSG_3857
                            ? tileBoundingBoxUtils_1.TileBoundingBoxUtils.getWebMercatorBoundingBoxFromXYZ(x, y, z)
                            : tileBoundingBoxUtils_1.TileBoundingBoxUtils.getWGS84BoundingBoxFromXYZ(x, y, z);
                        expandedBoundingBox = this.expandBoundingBox(boundingBox, tileProjection);
                        width = this.tileWidth;
                        height = this.tileHeight;
                        return [4 /*yield*/, canvas_1.Canvas.initializeAdapter()];
                    case 1:
                        _b.sent();
                        // create Canvas if user does not provide canvas.
                        if (tileCanvas != null) {
                            canvas = tileCanvas;
                            context = canvas.getContext('2d');
                            context.clearRect(0, 0, width, height);
                        }
                        else {
                            canvas = canvas_1.Canvas.create(width, height);
                            context = canvas.getContext('2d');
                            dispose = true;
                        }
                        featureCount = this.featureDao.countInBoundingBox(expandedBoundingBox, tileProjection);
                        if (!(featureCount > 0)) return [3 /*break*/, 16];
                        if (!(this.maxFeaturesPerTile == null || featureCount <= this.maxFeaturesPerTile)) return [3 /*break*/, 13];
                        transform = this.getTransformFunction(tileProjection);
                        iterator = this.featureDao.fastQueryBoundingBox(expandedBoundingBox, tileProjection);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 9, 10, 11]);
                        iterator_1 = __values(iterator), iterator_1_1 = iterator_1.next();
                        _b.label = 3;
                    case 3:
                        if (!!iterator_1_1.done) return [3 /*break*/, 8];
                        featureRow = iterator_1_1.value;
                        if (!(featureRow.geometry != null)) return [3 /*break*/, 7];
                        geojson = null;
                        if (this.cacheGeometries) {
                            geojson = this.geometryCache.getGeometry(featureRow.id);
                        }
                        if (geojson == null) {
                            geojson = featureRow.geometry.geometry.toGeoJSON();
                            this.geometryCache.setGeometry(featureRow.id, geojson);
                        }
                        style = this.getFeatureStyle(featureRow);
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.drawGeometry(geojson, context, boundingBox, style, transform)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_1 = _b.sent();
                        console.error('Failed to draw feature in tile. Id: ' + featureRow.id + ', Table: ' + this.featureDao.table_name);
                        return [3 /*break*/, 7];
                    case 7:
                        iterator_1_1 = iterator_1.next();
                        return [3 /*break*/, 3];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_2_1 = _b.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (iterator_1_1 && !iterator_1_1.done && (_a = iterator_1.return)) _a.call(iterator_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 11: return [4 /*yield*/, canvas_1.Canvas.toDataURL(canvas, 'image/' + this.compressFormat)];
                    case 12:
                        image = _b.sent();
                        return [3 /*break*/, 15];
                    case 13:
                        if (!(this.maxFeaturesTileDraw != null)) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.maxFeaturesTileDraw.drawTile(width, height, featureCount.toString(), canvas)];
                    case 14:
                        // Draw the max features tile
                        image = _b.sent();
                        _b.label = 15;
                    case 15: return [3 /*break*/, 18];
                    case 16: return [4 /*yield*/, canvas_1.Canvas.toDataURL(canvas, 'image/' + this.compressFormat)];
                    case 17:
                        image = _b.sent();
                        _b.label = 18;
                    case 18:
                        if (dispose) {
                            canvas_1.Canvas.disposeCanvas(canvas);
                        }
                        return [2 /*return*/, image];
                }
            });
        });
    };
    FeatureTiles.prototype.drawTileWithBoundingBox = function (boundingBox, zoom, tileProjection, tileCanvas) {
        return __awaiter(this, void 0, void 0, function () {
            var width, height, canvas, dispose, context, featureDao, each, transform, each_1, each_1_1, row, fr, gj, style, e_3, e_4_1, image;
            var e_4, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        width = this.tileWidth;
                        height = this.tileHeight;
                        dispose = false;
                        return [4 /*yield*/, canvas_1.Canvas.initializeAdapter()];
                    case 1:
                        _b.sent();
                        if (tileCanvas != null) {
                            canvas = tileCanvas;
                        }
                        else {
                            canvas = canvas_1.Canvas.create(width, height);
                            dispose = true;
                        }
                        context = canvas.getContext('2d');
                        context.clearRect(0, 0, width, height);
                        featureDao = this.featureDao;
                        each = featureDao.queryForEach(undefined, undefined, undefined, undefined, undefined, [
                            featureDao.table.getIdColumn().getName(),
                            featureDao.table.getGeometryColumn().getName(),
                        ]);
                        transform = this.getTransformFunction(tileProjection);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 9, 10, 11]);
                        each_1 = __values(each), each_1_1 = each_1.next();
                        _b.label = 3;
                    case 3:
                        if (!!each_1_1.done) return [3 /*break*/, 8];
                        row = each_1_1.value;
                        fr = featureDao.getRow(row);
                        if (!(fr.geometry != null)) return [3 /*break*/, 7];
                        gj = null;
                        if (this.cacheGeometries) {
                            gj = this.geometryCache.getGeometryForFeatureRow(fr);
                        }
                        if (gj == null) {
                            gj = fr.geometry.geometry.toGeoJSON();
                            this.geometryCache.setGeometry(fr.id, gj);
                        }
                        if (!(gj != null)) return [3 /*break*/, 7];
                        style = this.getFeatureStyle(fr);
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.drawGeometry(gj, context, boundingBox, style, transform)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_3 = _b.sent();
                        console.error('Failed to draw feature in tile. Id: ' + fr.id + ', Table: ' + this.featureDao.table_name);
                        return [3 /*break*/, 7];
                    case 7:
                        each_1_1 = each_1.next();
                        return [3 /*break*/, 3];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_4_1 = _b.sent();
                        e_4 = { error: e_4_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (each_1_1 && !each_1_1.done && (_a = each_1.return)) _a.call(each_1);
                        }
                        finally { if (e_4) throw e_4.error; }
                        return [7 /*endfinally*/];
                    case 11: return [4 /*yield*/, canvas_1.Canvas.toDataURL(canvas, 'image/' + this.compressFormat)];
                    case 12:
                        image = _b.sent();
                        if (dispose) {
                            canvas_1.Canvas.disposeCanvas(canvas);
                        }
                        return [2 /*return*/, image];
                }
            });
        });
    };
    /**
     * Draw a point in the context
     * @param geoJson
     * @param context
     * @param boundingBox
     * @param featureStyle
     * @param transform
     */
    FeatureTiles.prototype.drawPoint = function (geoJson, context, boundingBox, featureStyle, transform) {
        return __awaiter(this, void 0, void 0, function () {
            var width, height, iconX, iconY, coordinate, x, y, iconRow, image, radius, styleRow, pointPaint, circleX, circleY;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        coordinate = transform(geoJson.coordinates);
                        x = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getXPixel(this.tileWidth, boundingBox, coordinate[0]);
                        y = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getYPixel(this.tileHeight, boundingBox, coordinate[1]);
                        if (!(featureStyle != null && featureStyle.useIcon())) return [3 /*break*/, 2];
                        iconRow = featureStyle.icon;
                        return [4 /*yield*/, this.iconCache.createIcon(iconRow)];
                    case 1:
                        image = _a.sent();
                        width = Math.round(this.scale * image.width);
                        height = Math.round(this.scale * image.height);
                        if (x >= 0 - width && x <= this.tileWidth + width && y >= 0 - height && y <= this.tileHeight + height) {
                            iconX = Math.round(x - iconRow.anchorUOrDefault * width);
                            iconY = Math.round(y - iconRow.anchorVOrDefault * height);
                            context.drawImage(image.image, iconX, iconY, width, height);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        if (this.pointIcon != null) {
                            width = Math.round(this.scale * this.pointIcon.getWidth());
                            height = Math.round(this.scale * this.pointIcon.getHeight());
                            if (x >= 0 - width && x <= this.tileWidth + width && y >= 0 - height && y <= this.tileHeight + height) {
                                iconX = Math.round(x - this.scale * this.pointIcon.getXOffset());
                                iconY = Math.round(y - this.scale * this.pointIcon.getYOffset());
                                try {
                                    context.drawImage(this.pointIcon.getIcon().image, iconX, iconY, width, height);
                                }
                                catch (e) {
                                    // ignore error
                                }
                            }
                        }
                        else {
                            context.save();
                            radius = null;
                            if (featureStyle != null) {
                                styleRow = featureStyle.style;
                                if (styleRow != null) {
                                    radius = this.scale * (styleRow.getWidthOrDefault() / 2.0);
                                }
                            }
                            if (radius == null) {
                                radius = this.scale * this.pointRadius;
                            }
                            pointPaint = this.getPointPaint(featureStyle);
                            if (x >= 0 - radius && x <= this.tileWidth + radius && y >= 0 - radius && y <= this.tileHeight + radius) {
                                circleX = Math.round(x);
                                circleY = Math.round(y);
                                context.beginPath();
                                context.arc(circleX, circleY, radius, 0, 2 * Math.PI, true);
                                context.closePath();
                                context.fillStyle = pointPaint.colorRGBA;
                                context.fill();
                            }
                            context.restore();
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Simplify x,y tile coordinates by 1 pixel
     * @param coordinatesArray GeoJSON with coordinates in pixels
     * @param isPolygon determines if the first and last point need to stay connected
     * @return simplified GeoJSON
     * @since 2.0.0
     */
    FeatureTiles.prototype.simplifyPoints = function (coordinatesArray, isPolygon) {
        if (isPolygon === void 0) { isPolygon = false; }
        return (0, simplify_js_1.default)(coordinatesArray.map(function (coordinate) {
            return { x: coordinate[0], y: coordinate[1] };
        }), this.simplifyToleranceInPixels, false).map(function (point) { return [point.x, point.y]; });
    };
    /**
     * Get the path of the line string
     * @param lineString
     * @param context
     * @param boundingBox
     * @param isPolygon if this was a polygon
     * @param transform
     */
    FeatureTiles.prototype.getPath = function (lineString, context, boundingBox, isPolygon, transform) {
        var _this = this;
        if (isPolygon === void 0) { isPolygon = false; }
        var line = lineString.coordinates.map(function (coordinate) {
            var transformedCoordinate = transform(coordinate.slice());
            return [
                tileBoundingBoxUtils_1.TileBoundingBoxUtils.getXPixel(_this.tileWidth, boundingBox, transformedCoordinate[0]),
                tileBoundingBoxUtils_1.TileBoundingBoxUtils.getYPixel(_this.tileHeight, boundingBox, transformedCoordinate[1]),
            ];
        });
        var simplifiedLineString = this.simplifyGeometries ? this.simplifyPoints(line, isPolygon) : line;
        if (simplifiedLineString.length > 1) {
            context.moveTo(simplifiedLineString[0][0], simplifiedLineString[0][1]);
            for (var i = 1; i < simplifiedLineString.length; i++) {
                context.lineTo(simplifiedLineString[i][0], simplifiedLineString[i][1]);
            }
        }
    };
    /**
     * Draw a line in the context
     * @param geoJson
     * @param context
     * @param featureStyle
     * @param boundingBox
     * @param transform
     */
    FeatureTiles.prototype.drawLine = function (geoJson, context, featureStyle, boundingBox, transform) {
        context.save();
        context.beginPath();
        var paint = this.getLinePaint(featureStyle);
        context.strokeStyle = paint.colorRGBA;
        context.lineWidth = paint.strokeWidth;
        this.getPath(geoJson, context, boundingBox, false, transform);
        context.stroke();
        context.closePath();
        context.restore();
    };
    /**
     * Draw a polygon in the context
     * @param externalRing
     * @param internalRings
     * @param context
     * @param featureStyle
     * @param boundingBox
     * @param transform
     * @param fill
     */
    FeatureTiles.prototype.drawPolygon = function (externalRing, internalRings, context, featureStyle, boundingBox, transform, fill) {
        if (fill === void 0) { fill = true; }
        // get paint
        context.save();
        context.beginPath();
        if (!(0, boolean_clockwise_1.default)(externalRing.coordinates)) {
            externalRing.coordinates = externalRing.coordinates.reverse();
        }
        this.getPath(externalRing, context, boundingBox, true, transform);
        context.closePath();
        for (var i = 0; i < internalRings.length; i++) {
            if ((0, boolean_clockwise_1.default)(internalRings[i].coordinates)) {
                internalRings[i].coordinates = internalRings[i].coordinates.reverse();
            }
            this.getPath(internalRings[i], context, boundingBox, true, transform);
            context.closePath();
        }
        var fillPaint = this.getPolygonFillPaint(featureStyle);
        if (fill && fillPaint !== undefined && fillPaint != null) {
            context.fillStyle = fillPaint.colorRGBA;
            context.fill();
        }
        var paint = this.getPolygonPaint(featureStyle);
        context.strokeStyle = paint.colorRGBA;
        context.lineWidth = paint.strokeWidth;
        context.stroke();
        context.restore();
    };
    /**
     * Add a feature to the batch
     * @param geoJson
     * @param context
     * @param boundingBox
     * @param featureStyle
     * @param transform
     */
    FeatureTiles.prototype.drawGeometry = function (geoJson, context, boundingBox, featureStyle, transform) {
        return __awaiter(this, void 0, void 0, function () {
            var i, converted, externalRing, internalRings;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(geoJson.type === 'Point')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.drawPoint(geoJson, context, boundingBox, featureStyle, transform)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 19];
                    case 2:
                        if (!(geoJson.type === 'LineString')) return [3 /*break*/, 3];
                        this.drawLine(geoJson, context, featureStyle, boundingBox, transform);
                        return [3 /*break*/, 19];
                    case 3:
                        if (!(geoJson.type === 'Polygon')) return [3 /*break*/, 4];
                        converted = (0, polygon_to_line_1.default)(geoJson);
                        if (converted.type === 'Feature') {
                            if (converted.geometry.type === 'LineString') {
                                this.drawPolygon(converted.geometry, [], context, featureStyle, boundingBox, transform);
                            }
                            else if (converted.geometry.type === 'MultiLineString') {
                                externalRing = { type: 'LineString', coordinates: converted.geometry.coordinates[0] };
                                internalRings = converted.geometry.coordinates.slice(1).map(function (coords) {
                                    return {
                                        type: 'LineString',
                                        coordinates: coords,
                                    };
                                });
                                this.drawPolygon(externalRing, internalRings, context, featureStyle, boundingBox, transform);
                            }
                        }
                        else {
                            converted.features.forEach(function (feature) {
                                if (feature.geometry.type === 'LineString') {
                                    _this.drawPolygon(feature.geometry, [], context, featureStyle, boundingBox, transform);
                                }
                                else if (feature.geometry.type === 'MultiLineString') {
                                    var externalRing = { type: 'LineString', coordinates: feature.geometry.coordinates[0] };
                                    var internalRings = feature.geometry.coordinates.slice(1).map(function (coords) {
                                        return {
                                            type: 'LineString',
                                            coordinates: coords,
                                        };
                                    });
                                    _this.drawPolygon(externalRing, internalRings, context, featureStyle, boundingBox, transform);
                                }
                            });
                        }
                        return [3 /*break*/, 19];
                    case 4:
                        if (!(geoJson.type === 'MultiPoint')) return [3 /*break*/, 9];
                        i = 0;
                        _a.label = 5;
                    case 5:
                        if (!(i < geoJson.coordinates.length)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.drawPoint({
                                type: 'Point',
                                coordinates: geoJson.coordinates[i],
                            }, context, boundingBox, featureStyle, transform)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 19];
                    case 9:
                        if (!(geoJson.type === 'MultiLineString')) return [3 /*break*/, 10];
                        for (i = 0; i < geoJson.coordinates.length; i++) {
                            this.drawLine({
                                type: 'LineString',
                                coordinates: geoJson.coordinates[i],
                            }, context, featureStyle, boundingBox, transform);
                        }
                        return [3 /*break*/, 19];
                    case 10:
                        if (!(geoJson.type === 'MultiPolygon')) return [3 /*break*/, 15];
                        i = 0;
                        _a.label = 11;
                    case 11:
                        if (!(i < geoJson.coordinates.length)) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.drawGeometry({
                                type: 'Polygon',
                                coordinates: geoJson.coordinates[i],
                            }, context, boundingBox, featureStyle, transform)];
                    case 12:
                        _a.sent();
                        _a.label = 13;
                    case 13:
                        i++;
                        return [3 /*break*/, 11];
                    case 14: return [3 /*break*/, 19];
                    case 15:
                        if (!(geoJson.type === 'GeometryCollection')) return [3 /*break*/, 19];
                        i = 0;
                        _a.label = 16;
                    case 16:
                        if (!(i < geoJson.geometries.length)) return [3 /*break*/, 19];
                        return [4 /*yield*/, this.drawGeometry(geoJson.geometries[i], context, boundingBox, featureStyle, transform)];
                    case 17:
                        _a.sent();
                        _a.label = 18;
                    case 18:
                        i++;
                        return [3 /*break*/, 16];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create an expanded bounding box to handle features outside the tile that overlap
     * @param boundingBox bounding box
     * @param tileProjection projection - only EPSG:3857 and EPSG:4326 are supported
     * @return {BoundingBox} bounding box
     */
    FeatureTiles.prototype.expandBoundingBox = function (boundingBox, tileProjection) {
        // Create an expanded bounding box to handle features outside the tile that overlap
        var minLongitude = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getLongitudeFromPixel(this.tileWidth, boundingBox, boundingBox, 0 - this.widthOverlap);
        var maxLongitude = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getLongitudeFromPixel(this.tileWidth, boundingBox, boundingBox, this.tileWidth + this.widthOverlap);
        var maxLatitude = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getLatitudeFromPixel(this.tileHeight, boundingBox, boundingBox, 0 - this.heightOverlap);
        var minLatitude = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getLatitudeFromPixel(this.tileHeight, boundingBox, boundingBox, this.tileHeight + this.heightOverlap);
        // Choose the most expanded longitudes and latitudes
        minLongitude = Math.min(minLongitude, boundingBox.minLongitude);
        maxLongitude = Math.max(maxLongitude, boundingBox.maxLongitude);
        minLatitude = Math.min(minLatitude, boundingBox.minLatitude);
        maxLatitude = Math.max(maxLatitude, boundingBox.maxLatitude);
        // Bound with limits
        if (tileProjection === projectionConstants_1.ProjectionConstants.EPSG_3857) {
            minLongitude = Math.max(minLongitude, -1 * projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH);
            maxLongitude = Math.min(maxLongitude, projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH);
            minLatitude = Math.max(minLatitude, -1 * projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH);
            maxLatitude = Math.min(maxLatitude, projectionConstants_1.ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH);
        }
        else {
            minLongitude = Math.max(minLongitude, -1 * projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH);
            maxLongitude = Math.min(maxLongitude, projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH);
            minLatitude = Math.max(minLatitude, -1 * projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT);
            maxLatitude = Math.min(maxLatitude, projectionConstants_1.ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT);
        }
        return new boundingBox_1.BoundingBox(minLongitude, maxLongitude, minLatitude, maxLatitude);
    };
    return FeatureTiles;
}());
exports.FeatureTiles = FeatureTiles;
//# sourceMappingURL=index.js.map