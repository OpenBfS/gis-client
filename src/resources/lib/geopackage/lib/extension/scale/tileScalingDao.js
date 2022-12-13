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
exports.TileScalingDao = void 0;
var dao_1 = require("../../dao/dao");
var tileScaling_1 = require("./tileScaling");
/**
 * Tile Scaling Data Access Object
 * @constructor
 * @extends Dao
 */
var TileScalingDao = /** @class */ (function (_super) {
    __extends(TileScalingDao, _super);
    function TileScalingDao() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gpkgTableName = TileScalingDao.TABLE_NAME;
        _this.idColumns = [TileScalingDao.COLUMN_TABLE_NAME];
        return _this;
    }
    /**
     * Create a {module:extension/scale.TileScaling} object
     * @return {module:extension/scale.TileScaling}
     */
    TileScalingDao.prototype.createObject = function (results) {
        var c = new tileScaling_1.TileScaling();
        if (results) {
            c.table_name = results.table_name;
            c.scaling_type = results.scaling_type;
            c.zoom_in = results.zoom_in;
            c.zoom_out = results.zoom_out;
        }
        return c;
    };
    /**
     * Create the necessary tables for this dao
     * @return {Promise}
     */
    TileScalingDao.prototype.createTable = function () {
        return this.geoPackage.getTableCreator().createTileScaling();
    };
    /**
     * Query by table name
     * @param  {string} tableName name of the table
     * @return {module:extension/scale.TileScaling}
     */
    TileScalingDao.prototype.queryForTableName = function (tableName) {
        var tileScaling = this.queryForAll(this.buildWhereWithFieldAndValue(TileScalingDao.COLUMN_TABLE_NAME, tableName), this.buildWhereArgs(tableName));
        if (tileScaling.length > 0) {
            return this.createObject(tileScaling[0]);
        }
        else {
            return null;
        }
    };
    /**
     * Delete by tableName
     * @param  {string} tableName the table name to delete by
     * @return {number} number of deleted rows
     */
    TileScalingDao.prototype.deleteByTableName = function (tableName) {
        return this.deleteWhere(this.buildWhereWithFieldAndValue(TileScalingDao.COLUMN_TABLE_NAME, tableName), this.buildWhereArgs(tableName));
    };
    TileScalingDao.TABLE_NAME = 'nga_tile_scaling';
    TileScalingDao.COLUMN_TABLE_NAME = 'table_name';
    TileScalingDao.COLUMN_SCALING_TYPE = 'scaling_type';
    TileScalingDao.COLUMN_ZOOM_IN = 'zoom_in';
    TileScalingDao.COLUMN_ZOOM_OUT = 'zoom_out';
    return TileScalingDao;
}(dao_1.Dao));
exports.TileScalingDao = TileScalingDao;
//# sourceMappingURL=tileScalingDao.js.map