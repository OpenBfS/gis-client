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
exports.TileDao = void 0;
var userDao_1 = require("../../user/userDao");
var tileMatrixDao_1 = require("../matrix/tileMatrixDao");
var tileMatrixSetDao_1 = require("../matrixset/tileMatrixSetDao");
var tileRow_1 = require("./tileRow");
var tileColumn_1 = require("./tileColumn");
var tileGrid_1 = require("../tileGrid");
var columnValues_1 = require("../../dao/columnValues");
var tileBoundingBoxUtils_1 = require("../tileBoundingBoxUtils");
var boundingBox_1 = require("../../boundingBox");
var tileDaoUtils_1 = require("./tileDaoUtils");
var projection_1 = require("../../projection/projection");
var projectionConstants_1 = require("../../projection/projectionConstants");
/**
 * `TileDao` is a {@link module:dao/dao~Dao} subclass for reading
 * [user tile tables]{@link module:tiles/user/tileTable~TileTable}.
 *
 * @class TileDao
 * @extends UserDao
 * @param  {GeoPackageConnection} connection
 * @param  {TileTable} table
 * @param  {TileMatrixSet} tileMatrixSet
 * @param  {TileMatrix[]} tileMatrices
 */
var TileDao = /** @class */ (function (_super) {
    __extends(TileDao, _super);
    function TileDao(geoPackage, table, tileMatrixSet, tileMatrices) {
        var _this = _super.call(this, geoPackage, table) || this;
        _this.tileMatrixSet = tileMatrixSet;
        _this.tileMatrices = tileMatrices;
        _this.zoomLevelToTileMatrix = [];
        _this.widths = [];
        _this.heights = [];
        if (tileMatrices.length === 0) {
            _this.minZoom = 0;
            _this.maxZoom = 0;
        }
        else {
            _this.minZoom = _this.tileMatrices[0].zoom_level;
            _this.maxZoom = _this.tileMatrices[_this.tileMatrices.length - 1].zoom_level;
        }
        // Populate the zoom level to tile matrix and the sorted tile widths and heights
        for (var i = _this.tileMatrices.length - 1; i >= 0; i--) {
            var tileMatrix = _this.tileMatrices[i];
            _this.zoomLevelToTileMatrix[tileMatrix.zoom_level] = tileMatrix;
        }
        _this.initialize();
        return _this;
    }
    TileDao.prototype.initialize = function () {
        var tileMatrixSetDao = this.geoPackage.tileMatrixSetDao;
        this.srs = tileMatrixSetDao.getSrs(this.tileMatrixSet);
        this.projection = [this.srs.organization.toUpperCase(), this.srs.organization_coordsys_id].join(':');
        projection_1.Projection.loadProjection(this.projection, this.srs.definition);
        // Populate the zoom level to tile matrix and the sorted tile widths and heights
        for (var i = this.tileMatrices.length - 1; i >= 0; i--) {
            var tileMatrix = this.tileMatrices[i];
            var width = tileMatrix.pixel_x_size * tileMatrix.tile_width;
            var height = tileMatrix.pixel_y_size * tileMatrix.tile_height;
            var proj4Projection = projection_1.Projection.getConverter(this.projection);
            if (proj4Projection.to_meter) {
                width = proj4Projection.to_meter * tileMatrix.pixel_x_size * tileMatrix.tile_width;
                height = proj4Projection.to_meter * tileMatrix.pixel_y_size * tileMatrix.tile_height;
            }
            this.widths.push(width);
            this.heights.push(height);
        }
        this.setWebMapZoomLevels();
    };
    TileDao.prototype.webZoomToGeoPackageZoom = function (webZoom) {
        var webMercatorBoundingBox = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getWebMercatorBoundingBoxFromXYZ(0, 0, webZoom);
        return this.determineGeoPackageZoomLevel(webMercatorBoundingBox, webZoom);
    };
    TileDao.prototype.setWebMapZoomLevels = function () {
        this.minWebMapZoom = 20;
        this.maxWebMapZoom = 0;
        this.webZoomToGeoPackageZooms = {};
        var totalTileWidth = this.tileMatrixSet.max_x - this.tileMatrixSet.min_x;
        var totalTileHeight = this.tileMatrixSet.max_y - this.tileMatrixSet.min_y;
        for (var i = 0; i < this.tileMatrices.length; i++) {
            var tileMatrix = this.tileMatrices[i];
            var singleTileWidth = totalTileWidth / tileMatrix.matrix_width;
            var singleTileHeight = totalTileHeight / tileMatrix.matrix_height;
            var tileBox = new boundingBox_1.BoundingBox(this.tileMatrixSet.min_x, this.tileMatrixSet.min_x + singleTileWidth, this.tileMatrixSet.min_y, this.tileMatrixSet.min_y + singleTileHeight);
            var proj4Projection = projection_1.Projection.getConverter(this.projection, projectionConstants_1.ProjectionConstants.EPSG_4326);
            var ne = proj4Projection.forward([tileBox.maxLongitude, tileBox.maxLatitude]);
            var sw = proj4Projection.forward([tileBox.minLongitude, tileBox.minLatitude]);
            var width = ne[0] - sw[0];
            var zoom = Math.ceil(Math.log2(360 / width));
            if (this.minWebMapZoom > zoom) {
                this.minWebMapZoom = zoom;
            }
            if (this.maxWebMapZoom < zoom) {
                this.maxWebMapZoom = zoom;
            }
            this.webZoomToGeoPackageZooms[zoom] = tileMatrix.zoom_level;
        }
    };
    TileDao.prototype.determineGeoPackageZoomLevel = function (webMercatorBoundingBox, zoom) {
        return this.webZoomToGeoPackageZooms[zoom];
    };
    /**
     * Get the bounding box of tiles at the zoom level
     * @param  {Number} zoomLevel zoom level
     * @return {BoundingBox}           bounding box of the zoom level, or null if no tiles
     */
    TileDao.prototype.getBoundingBoxWithZoomLevel = function (zoomLevel) {
        var boundingBox;
        var tileMatrix = this.getTileMatrixWithZoomLevel(zoomLevel);
        if (tileMatrix) {
            var tileGrid = this.queryForTileGridWithZoomLevel(zoomLevel);
            if (tileGrid) {
                var matrixSetBoundingBox = this.boundingBox;
                boundingBox = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getTileGridBoundingBox(matrixSetBoundingBox, tileMatrix.matrix_width, tileMatrix.matrix_height, tileGrid);
            }
        }
        return boundingBox;
    };
    Object.defineProperty(TileDao.prototype, "boundingBox", {
        get: function () {
            return this.tileMatrixSet.boundingBox;
        },
        enumerable: false,
        configurable: true
    });
    TileDao.prototype.queryForTileGridWithZoomLevel = function (zoomLevel) {
        var where = this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_ZOOM_LEVEL, zoomLevel);
        var whereArgs = this.buildWhereArgs(zoomLevel);
        var minX = this.minOfColumn(tileColumn_1.TileColumn.COLUMN_TILE_COLUMN, where, whereArgs);
        var maxX = this.maxOfColumn(tileColumn_1.TileColumn.COLUMN_TILE_COLUMN, where, whereArgs);
        var minY = this.minOfColumn(tileColumn_1.TileColumn.COLUMN_TILE_ROW, where, whereArgs);
        var maxY = this.maxOfColumn(tileColumn_1.TileColumn.COLUMN_TILE_ROW, where, whereArgs);
        var tileGrid;
        if (minX != null && minY != null && maxX != null && maxY != null) {
            tileGrid = new tileGrid_1.TileGrid(minX, maxX, minY, maxY);
        }
        return tileGrid;
    };
    /**
     * Get the tile grid of the zoom level
     * @param  {Number} zoomLevel zoom level
     * @return {TileGrid}           tile grid at zoom level, null if no tile matrix at zoom level
     */
    TileDao.prototype.getTileGridWithZoomLevel = function (zoomLevel) {
        var tileGrid;
        var tileMatrix = this.getTileMatrixWithZoomLevel(zoomLevel);
        if (tileMatrix) {
            tileGrid = new tileGrid_1.TileGrid(0, ~~tileMatrix.matrix_width - 1, 0, ~~tileMatrix.matrix_height - 1);
        }
        return tileGrid;
    };
    Object.defineProperty(TileDao.prototype, "table", {
        /**
         * get the tile table
         * @return {TileTable} tile table
         */
        get: function () {
            return this._table;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Create a new tile row with the column types and values
     * @param  {Array} columnTypes column types
     * @param  {Array} values      values
     * @return {TileRow}             tile row
     */
    TileDao.prototype.newRow = function (columnTypes, values) {
        return new tileRow_1.TileRow(this.table, columnTypes, values);
    };
    /**
     * Adjust the tile matrix lengths if needed. Check if the tile matrix width
     * and height need to expand to account for pixel * number of pixels fitting
     * into the tile matrix lengths
     */
    TileDao.prototype.adjustTileMatrixLengths = function () {
        var tileMatrixWidth = this.tileMatrixSet.max_x - this.tileMatrixSet.min_x;
        var tileMatrixHeight = this.tileMatrixSet.max_y - this.tileMatrixSet.min_y;
        for (var i = 0; i < this.tileMatrices.length; i++) {
            var tileMatrix = this.tileMatrices[i];
            var tempMatrixWidth = ~~(tileMatrixWidth / (tileMatrix.pixel_x_size * ~~tileMatrix.tile_width));
            var tempMatrixHeight = ~~(tileMatrixHeight / (tileMatrix.pixel_y_size * ~~tileMatrix.tile_height));
            if (tempMatrixWidth > ~~tileMatrix.matrix_width) {
                tileMatrix.matrix_width = ~~tempMatrixWidth;
            }
            if (tempMatrixHeight > ~~tileMatrix.matrix_height) {
                tileMatrix.matrix_height = ~~tempMatrixHeight;
            }
        }
    };
    /**
     * Get the tile matrix at the zoom level
     * @param  {Number} zoomLevel zoom level
     * @returns {TileMatrix}           tile matrix
     */
    TileDao.prototype.getTileMatrixWithZoomLevel = function (zoomLevel) {
        return this.zoomLevelToTileMatrix[zoomLevel];
    };
    /**
     * Get the zoom level for the provided width and height in the default units
     * @param length in default units
     * @return zoom level
     */
    TileDao.prototype.getZoomLevelForLength = function (length) {
        return tileDaoUtils_1.TileDaoUtils.getZoomLevelForLength(this.widths, this.heights, this.tileMatrices, length);
    };
    /**
     * Get the zoom level for the provided width and height in the default units
     * @param width in default units
     * @param height in default units
     * @return zoom level
     * @since 1.2.1
     */
    TileDao.prototype.getZoomLevelForWidthAndHeight = function (width, height) {
        return tileDaoUtils_1.TileDaoUtils.getZoomLevelForWidthAndHeight(this.widths, this.heights, this.tileMatrices, width, height);
    };
    /**
     * Get the closest zoom level for the provided width and height in the
     * default units
     * @param length in default units
     * @return zoom level
     * @since 1.2.1
     */
    TileDao.prototype.getClosestZoomLevelForLength = function (length) {
        return tileDaoUtils_1.TileDaoUtils.getClosestZoomLevelForLength(this.widths, this.heights, this.tileMatrices, length);
    };
    /**
     * Get the closest zoom level for the provided width and height in the
     * default units
     * @param width in default units
     * @param height in default units
     * @return zoom level
     * @since 1.2.1
     */
    TileDao.prototype.getClosestZoomLevelForWidthAndHeight = function (width, height) {
        return tileDaoUtils_1.TileDaoUtils.getClosestZoomLevelForWidthAndHeight(this.widths, this.heights, this.tileMatrices, width, height);
    };
    /**
     * Get the approximate zoom level for the provided length in the default
     * units. Tiles may or may not exist for the returned zoom level. The
     * approximate zoom level is determined using a factor of 2 from the zoom
     * levels with tiles.
     * @param length length in default units
     * @return approximate zoom level
     * @since 2.0.2
     */
    TileDao.prototype.getApproximateZoomLevelForLength = function (length) {
        return tileDaoUtils_1.TileDaoUtils.getApproximateZoomLevelForLength(this.widths, this.heights, this.tileMatrices, length);
    };
    /**
     * Get the approximate zoom level for the provided width and height in the
     * default units. Tiles may or may not exist for the returned zoom level.
     * The approximate zoom level is determined using a factor of 2 from the
     * zoom levels with tiles.
     * @param width width in default units
     * @param height height in default units
     * @return approximate zoom level
     * @since 2.0.2
     */
    TileDao.prototype.getApproximateZoomLevelForWidthAndHeight = function (width, height) {
        return tileDaoUtils_1.TileDaoUtils.getApproximateZoomLevelForWidthAndHeight(this.widths, this.heights, this.tileMatrices, width, height);
    };
    /**
     * Get the max length in default units that contains tiles
     * @return max distance length with tiles
     * @since 1.2.0
     */
    TileDao.prototype.getMaxLength = function () {
        return tileDaoUtils_1.TileDaoUtils.getMaxLengthForTileWidthsAndHeights(this.widths, this.heights);
    };
    /**
     * Get the min length in default units that contains tiles
     * @return min distance length with tiles
     * @since 1.2.0
     */
    TileDao.prototype.getMinLength = function () {
        return tileDaoUtils_1.TileDaoUtils.getMinLengthForTileWidthsAndHeights(this.widths, this.heights);
    };
    /**
     * Query for a tile
     * @param  {Number} column    column
     * @param  {Number} row       row
     * @param  {Number} zoomLevel zoom level
     */
    TileDao.prototype.queryForTile = function (column, row, zoomLevel) {
        var e_1, _a;
        var fieldValues = new columnValues_1.ColumnValues();
        fieldValues.addColumn(tileColumn_1.TileColumn.COLUMN_TILE_COLUMN, column);
        fieldValues.addColumn(tileColumn_1.TileColumn.COLUMN_TILE_ROW, row);
        fieldValues.addColumn(tileColumn_1.TileColumn.COLUMN_ZOOM_LEVEL, zoomLevel);
        var tileRow;
        try {
            for (var _b = __values(this.queryForFieldValues(fieldValues)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var rawRow = _c.value;
                tileRow = this.getRow(rawRow);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return tileRow;
    };
    TileDao.prototype.queryForTilesWithZoomLevel = function (zoomLevel) {
        var _a;
        var _this = this;
        var iterator = this.queryForEach(tileColumn_1.TileColumn.COLUMN_ZOOM_LEVEL, zoomLevel);
        return _a = {},
            _a[Symbol.iterator] = function () {
                return this;
            },
            _a.next = function () {
                var nextRow = iterator.next();
                if (!nextRow.done) {
                    return {
                        value: _this.getRow(nextRow.value),
                        done: false,
                    };
                }
                return {
                    value: undefined,
                    done: true,
                };
            },
            _a;
    };
    /**
     * Query for Tiles at a zoom level in descending row and column order
     * @param  {Number} zoomLevel    zoom level
     * @returns {IterableIterator<TileRow>}
     */
    TileDao.prototype.queryForTilesDescending = function (zoomLevel) {
        var _a;
        var _this = this;
        var iterator = this.queryForEach(tileColumn_1.TileColumn.COLUMN_ZOOM_LEVEL, zoomLevel, undefined, undefined, tileColumn_1.TileColumn.COLUMN_TILE_COLUMN + ' DESC, ' + tileColumn_1.TileColumn.COLUMN_TILE_ROW + ' DESC');
        return _a = {},
            _a[Symbol.iterator] = function () {
                return this;
            },
            _a.next = function () {
                var nextRow = iterator.next();
                if (!nextRow.done) {
                    return {
                        value: _this.getRow(nextRow.value),
                        done: false,
                    };
                }
                return {
                    value: undefined,
                    done: true,
                };
            },
            _a;
    };
    /**
     * Query for tiles at a zoom level and column
     * @param  {Number} column       column
     * @param  {Number} zoomLevel    zoom level
     * @returns {IterableIterator<TileRow>}
     */
    TileDao.prototype.queryForTilesInColumn = function (column, zoomLevel) {
        var _a;
        var _this = this;
        var fieldValues = new columnValues_1.ColumnValues();
        fieldValues.addColumn(tileColumn_1.TileColumn.COLUMN_TILE_COLUMN, column);
        fieldValues.addColumn(tileColumn_1.TileColumn.COLUMN_ZOOM_LEVEL, zoomLevel);
        var iterator = this.queryForFieldValues(fieldValues);
        return _a = {},
            _a[Symbol.iterator] = function () {
                return this;
            },
            _a.next = function () {
                var nextRow = iterator.next();
                if (!nextRow.done) {
                    var tileRow = _this.getRow(nextRow.value);
                    return {
                        value: tileRow,
                        done: false,
                    };
                }
                else {
                    return {
                        value: undefined,
                        done: true,
                    };
                }
            },
            _a;
    };
    /**
     * Query for tiles at a zoom level and row
     * @param  {Number} row       row
     * @param  {Number} zoomLevel    zoom level
     */
    TileDao.prototype.queryForTilesInRow = function (row, zoomLevel) {
        var _a;
        var _this = this;
        var fieldValues = new columnValues_1.ColumnValues();
        fieldValues.addColumn(tileColumn_1.TileColumn.COLUMN_TILE_ROW, row);
        fieldValues.addColumn(tileColumn_1.TileColumn.COLUMN_ZOOM_LEVEL, zoomLevel);
        var iterator = this.queryForFieldValues(fieldValues);
        return _a = {},
            _a[Symbol.iterator] = function () {
                return this;
            },
            _a.next = function () {
                var nextRow = iterator.next();
                if (!nextRow.done) {
                    var tileRow = _this.getRow(nextRow.value);
                    return {
                        value: tileRow,
                        done: false,
                    };
                }
                else {
                    return {
                        value: undefined,
                        done: true,
                    };
                }
            },
            _a;
    };
    /**
     * Query by tile grid and zoom level
     * @param  {TileGrid} tileGrid  tile grid
     * @param  {Number} zoomLevel zoom level
     * @returns {IterableIterator<any>}
     */
    TileDao.prototype.queryByTileGrid = function (tileGrid, zoomLevel) {
        var _a;
        var _this = this;
        if (!tileGrid)
            return;
        var where = '';
        where += this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_ZOOM_LEVEL, zoomLevel);
        where += ' and ';
        where += this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_TILE_COLUMN, tileGrid.min_x, '>=');
        where += ' and ';
        where += this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_TILE_COLUMN, tileGrid.max_x, '<=');
        where += ' and ';
        where += this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_TILE_ROW, tileGrid.min_y, '>=');
        where += ' and ';
        where += this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_TILE_ROW, tileGrid.max_y, '<=');
        var whereArgs = this.buildWhereArgs([zoomLevel, tileGrid.min_x, tileGrid.max_x, tileGrid.min_y, tileGrid.max_y]);
        var iterator = this.queryWhereWithArgsDistinct(where, whereArgs);
        return _a = {},
            _a[Symbol.iterator] = function () {
                return this;
            },
            _a.next = function () {
                var nextRow = iterator.next();
                if (!nextRow.done) {
                    var tileRow = _this.getRow(nextRow.value);
                    return {
                        value: tileRow,
                        done: false,
                    };
                }
                else {
                    return {
                        value: undefined,
                        done: true,
                    };
                }
            },
            _a;
    };
    /**
     * count by tile grid and zoom level
     * @param  {TileGrid} tileGrid  tile grid
     * @param  {Number} zoomLevel zoom level
     * @returns {Number} count of tiles
     */
    TileDao.prototype.countByTileGrid = function (tileGrid, zoomLevel) {
        if (!tileGrid)
            return;
        var where = '';
        where += this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_ZOOM_LEVEL, zoomLevel);
        where += ' and ';
        where += this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_TILE_COLUMN, tileGrid.min_x, '>=');
        where += ' and ';
        where += this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_TILE_COLUMN, tileGrid.max_x, '<=');
        where += ' and ';
        where += this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_TILE_ROW, tileGrid.min_y, '>=');
        where += ' and ';
        where += this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_TILE_ROW, tileGrid.max_y, '<=');
        var whereArgs = this.buildWhereArgs([zoomLevel, tileGrid.min_x, tileGrid.max_x, tileGrid.min_y, tileGrid.max_y]);
        return this.countWhere(where, whereArgs);
    };
    TileDao.prototype.deleteTile = function (column, row, zoomLevel) {
        var where = '';
        where += this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_ZOOM_LEVEL, zoomLevel);
        where += ' and ';
        where += this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_TILE_COLUMN, column);
        where += ' and ';
        where += this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_TILE_ROW, row);
        var whereArgs = this.buildWhereArgs([zoomLevel, column, row]);
        return this.deleteWhere(where, whereArgs);
    };
    TileDao.prototype.dropTable = function () {
        var tileMatrixDao = this.geoPackage.tileMatrixDao;
        var dropResult = userDao_1.UserDao.prototype.dropTable.call(this);
        var tileMatrixSetDao = this.geoPackage.tileMatrixSetDao;
        tileMatrixSetDao.delete(this.tileMatrixSet);
        for (var i = this.tileMatrices.length - 1; i >= 0; i--) {
            var tileMatrix = this.tileMatrices[i];
            tileMatrixDao.delete(tileMatrix);
        }
        var dao = this.geoPackage.contentsDao;
        dao.deleteById(this.gpkgTableName);
        return dropResult;
    };
    TileDao.prototype.rename = function (newName) {
        _super.prototype.rename.call(this, newName);
        var oldName = this.tileMatrixSet.table_name;
        var values = {};
        values[tileMatrixSetDao_1.TileMatrixSetDao.COLUMN_TABLE_NAME] = newName;
        var where = this.buildWhereWithFieldAndValue(tileMatrixSetDao_1.TileMatrixSetDao.COLUMN_TABLE_NAME, oldName);
        var whereArgs = this.buildWhereArgs([oldName]);
        var contentsDao = this.geoPackage.contentsDao;
        var contents = contentsDao.queryForId(oldName);
        contents.table_name = newName;
        contents.identifier = newName;
        contentsDao.create(contents);
        var tileMatrixSetDao = this.geoPackage.tileMatrixSetDao;
        tileMatrixSetDao.updateWithValues(values, where, whereArgs);
        var tileMatrixDao = this.geoPackage.tileMatrixDao;
        var tileMatrixUpdate = {};
        tileMatrixUpdate[tileMatrixDao_1.TileMatrixDao.COLUMN_TABLE_NAME] = newName;
        var tileMatrixWhere = this.buildWhereWithFieldAndValue(tileMatrixDao_1.TileMatrixDao.COLUMN_TABLE_NAME, oldName);
        tileMatrixDao.updateWithValues(tileMatrixUpdate, tileMatrixWhere, whereArgs);
        contentsDao.deleteById(oldName);
    };
    TileDao.readTable = function (geoPackage, tableName) {
        return geoPackage.getTileDao(tableName);
    };
    return TileDao;
}(userDao_1.UserDao));
exports.TileDao = TileDao;
//# sourceMappingURL=tileDao.js.map