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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileMatrixDao = void 0;
/**
 * @module tiles/matrix
 * @see module:dao/dao
 */
var dao_1 = require("../../dao/dao");
var tileMatrix_1 = require("./tileMatrix");
var sqliteQueryBuilder_1 = require("../../db/sqliteQueryBuilder");
var tileColumn_1 = require("../user/tileColumn");
/**
 * Tile Matrix Set Data Access Object
 * @class TileMatrixDao
 * @extends Dao
 */
var TileMatrixDao = /** @class */ (function (_super) {
    __extends(TileMatrixDao, _super);
    function TileMatrixDao() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gpkgTableName = 'gpkg_tile_matrix';
        _this.idColumns = [TileMatrixDao.COLUMN_PK1, TileMatrixDao.COLUMN_PK2];
        _this.columns = [
            TileMatrixDao.COLUMN_TABLE_NAME,
            TileMatrixDao.COLUMN_ZOOM_LEVEL,
            TileMatrixDao.COLUMN_MATRIX_WIDTH,
            TileMatrixDao.COLUMN_MATRIX_HEIGHT,
            TileMatrixDao.COLUMN_TILE_WIDTH,
            TileMatrixDao.COLUMN_TILE_HEIGHT,
            TileMatrixDao.COLUMN_PIXEL_X_SIZE,
            TileMatrixDao.COLUMN_PIXEL_Y_SIZE,
        ];
        return _this;
    }
    TileMatrixDao.prototype.createObject = function (results) {
        var tm = new tileMatrix_1.TileMatrix();
        if (results) {
            tm.table_name = results.table_name;
            tm.zoom_level = results.zoom_level;
            tm.matrix_width = results.matrix_width;
            tm.matrix_height = results.matrix_height;
            tm.tile_width = results.tile_width;
            tm.tile_height = results.tile_height;
            tm.pixel_x_size = results.pixel_x_size;
            tm.pixel_y_size = results.pixel_y_size;
        }
        return tm;
    };
    /**
     * get the Contents of the Tile matrix
     * @param  {TileMatrix} tileMatrix the tile matrix
     */
    TileMatrixDao.prototype.getContents = function (tileMatrix) {
        return this.geoPackage.contentsDao.queryForId(tileMatrix.table_name);
    };
    TileMatrixDao.prototype.getTileMatrixSet = function (tileMatrix) {
        return this.geoPackage.tileMatrixSetDao.queryForId(tileMatrix.table_name);
    };
    TileMatrixDao.prototype.tileCount = function (tileMatrix) {
        var where = this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_ZOOM_LEVEL, tileMatrix.zoom_level);
        var whereArgs = this.buildWhereArgs([tileMatrix.zoom_level]);
        var query = sqliteQueryBuilder_1.SqliteQueryBuilder.buildCount("'" + tileMatrix.table_name + "'", where);
        var result = this.connection.get(query, whereArgs);
        return result === null || result === void 0 ? void 0 : result.count;
    };
    TileMatrixDao.prototype.hasTiles = function (tileMatrix) {
        var where = this.buildWhereWithFieldAndValue(tileColumn_1.TileColumn.COLUMN_ZOOM_LEVEL, tileMatrix.zoom_level);
        var whereArgs = this.buildWhereArgs([tileMatrix.zoom_level]);
        var query = sqliteQueryBuilder_1.SqliteQueryBuilder.buildQuery(false, "'" + tileMatrix.table_name + "'", undefined, where);
        return this.connection.get(query, whereArgs) != null;
    };
    TileMatrixDao.TABLE_NAME = 'gpkg_tile_matrix';
    TileMatrixDao.COLUMN_PK1 = 'table_name';
    TileMatrixDao.COLUMN_PK2 = 'zoom_level';
    TileMatrixDao.COLUMN_TABLE_NAME = 'table_name';
    TileMatrixDao.COLUMN_ZOOM_LEVEL = 'zoom_level';
    TileMatrixDao.COLUMN_MATRIX_WIDTH = 'matrix_width';
    TileMatrixDao.COLUMN_MATRIX_HEIGHT = 'matrix_height';
    TileMatrixDao.COLUMN_TILE_WIDTH = 'tile_width';
    TileMatrixDao.COLUMN_TILE_HEIGHT = 'tile_height';
    TileMatrixDao.COLUMN_PIXEL_X_SIZE = 'pixel_x_size';
    TileMatrixDao.COLUMN_PIXEL_Y_SIZE = 'pixel_y_size';
    return TileMatrixDao;
}(dao_1.Dao));
exports.TileMatrixDao = TileMatrixDao;
//# sourceMappingURL=tileMatrixDao.js.map