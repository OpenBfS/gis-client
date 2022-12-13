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
exports.GeometryIndexDao = void 0;
var dao_1 = require("../../dao/dao");
var geometryIndex_1 = require("./geometryIndex");
var tableCreator_1 = require("../../db/tableCreator");
/**
 * Geometry Index Data Access Object
 * @class
 * @extends Dao
 */
var GeometryIndexDao = /** @class */ (function (_super) {
    __extends(GeometryIndexDao, _super);
    function GeometryIndexDao(geoPackage, featureDao) {
        var _this = _super.call(this, geoPackage) || this;
        _this.gpkgTableName = GeometryIndexDao.TABLE_NAME;
        _this.idColumns = ['table_name', 'geom_id'];
        _this.featureDao = featureDao;
        return _this;
    }
    GeometryIndexDao.prototype.createObject = function (results) {
        var gi = new geometryIndex_1.GeometryIndex();
        if (results) {
            gi.table_name = results.table_name;
            gi.geom_id = results.geom_id;
            gi.min_x = results.min_x;
            gi.max_x = results.max_x;
            gi.min_y = results.min_y;
            gi.max_y = results.max_y;
            gi.min_z = results.min_z;
            gi.max_z = results.max_z;
            gi.min_m = results.min_m;
            gi.max_m = results.max_m;
        }
        return gi;
    };
    /**
     * Get the Table Index of the Geometry Index
     *
     * @param {module:extension/index~GeometryIndex} geometryIndex geometry index
     * @return {module:extension/index~TableIndex}
     */
    GeometryIndexDao.prototype.getTableIndex = function (geometryIndex) {
        return this.geoPackage.tableIndexDao.queryForId(geometryIndex.table_name);
    };
    /**
     * Query by table name
     * @param  {string} tableName table name
     * @return {Iterable}
     */
    GeometryIndexDao.prototype.queryForTableName = function (tableName) {
        return this.queryForEach(GeometryIndexDao.COLUMN_TABLE_NAME, tableName);
    };
    /**
     * Count by table name
     * @param  {string}   tableName table name
     * @return {Number}
     */
    GeometryIndexDao.prototype.countByTableName = function (tableName) {
        return this.count(GeometryIndexDao.COLUMN_TABLE_NAME, tableName);
    };
    /**
     * Populate a new goemetry index from an envelope
     * @param  {module:extension/index~TableIndex} tableIndex TableIndex
     * @param  {Number} geometryId id of the geometry
     * @param  {Object} envelope   envelope to store
     * @return {module:extension/index~GeometryIndex}
     */
    GeometryIndexDao.prototype.populate = function (tableIndex, geometryId, envelope) {
        var geometryIndex = new geometryIndex_1.GeometryIndex();
        geometryIndex.tableIndex = tableIndex;
        geometryIndex.geom_id = geometryId;
        geometryIndex.min_x = envelope.minX;
        geometryIndex.min_y = envelope.minY;
        geometryIndex.max_x = envelope.maxX;
        geometryIndex.max_y = envelope.maxY;
        if (envelope.hasZ) {
            geometryIndex.min_z = envelope.minZ;
            geometryIndex.max_z = envelope.maxZ;
        }
        if (envelope.hasM) {
            geometryIndex.min_m = envelope.minM;
            geometryIndex.max_m = envelope.maxM;
        }
        return geometryIndex;
    };
    /**
     * Create the GeometryIndex table
     * @return {boolean}
     */
    GeometryIndexDao.prototype.createTable = function () {
        var exists = this.isTableExists();
        if (exists)
            return true;
        var tc = new tableCreator_1.TableCreator(this.geoPackage);
        return tc.createGeometryIndex();
    };
    /**
     * Query the index with an envelope
     * @param  {Object} envelope envelope
     * @param  {Number} envelope.minX min x
     * @param  {Number} envelope.maxX max x
     * @param  {Number} envelope.minY min y
     * @param  {Number} envelope.maxY max y
     * @param  {Number} envelope.minZ min z
     * @param  {Number} envelope.maxZ max z
     * @param  {Number} envelope.minM min m
     * @param  {Number} envelope.maxM max m
     * @param  {Boolean} envelope.hasM has m
     * @param  {Boolean} envelope.hasZ has z
     * @return {Object}
     */
    GeometryIndexDao.prototype._generateGeometryEnvelopeQuery = function (envelope) {
        var tableName = this.featureDao.gpkgTableName;
        var where = '';
        where += this.buildWhereWithFieldAndValue(GeometryIndexDao.COLUMN_TABLE_NAME, tableName);
        where += ' and ';
        var minXLessThanMaxX = envelope.minX < envelope.maxX;
        if (minXLessThanMaxX) {
            where += this.buildWhereWithFieldAndValue(GeometryIndexDao.COLUMN_MIN_X, envelope.maxX, '<=');
            where += ' and ';
            where += this.buildWhereWithFieldAndValue(GeometryIndexDao.COLUMN_MAX_X, envelope.minX, '>=');
        }
        else {
            where += '(';
            where += this.buildWhereWithFieldAndValue(GeometryIndexDao.COLUMN_MIN_X, envelope.maxX, '<=');
            where += ' or ';
            where += this.buildWhereWithFieldAndValue(GeometryIndexDao.COLUMN_MAX_X, envelope.minX, '>=');
            where += ' or ';
            where += this.buildWhereWithFieldAndValue(GeometryIndexDao.COLUMN_MIN_X, envelope.minX, '>=');
            where += ' or ';
            where += this.buildWhereWithFieldAndValue(GeometryIndexDao.COLUMN_MAX_X, envelope.maxX, '<=');
            where += ')';
        }
        where += ' and ';
        where += this.buildWhereWithFieldAndValue(GeometryIndexDao.COLUMN_MIN_Y, envelope.maxY, '<=');
        where += ' and ';
        where += this.buildWhereWithFieldAndValue(GeometryIndexDao.COLUMN_MAX_Y, envelope.minY, '>=');
        var whereArgs = [tableName, envelope.maxX, envelope.minX];
        if (!minXLessThanMaxX) {
            whereArgs.push(envelope.minX, envelope.maxX);
        }
        whereArgs.push(envelope.maxY, envelope.minY);
        if (envelope.hasZ) {
            where += ' and ';
            where += this.buildWhereWithFieldAndValue(GeometryIndexDao.COLUMN_MIN_Z, envelope.minZ, '<=');
            where += ' and ';
            where += this.buildWhereWithFieldAndValue(GeometryIndexDao.COLUMN_MAX_Z, envelope.maxZ, '>=');
            whereArgs.push(envelope.maxZ, envelope.minZ);
        }
        if (envelope.hasM) {
            where += ' and ';
            where += this.buildWhereWithFieldAndValue(GeometryIndexDao.COLUMN_MIN_M, envelope.minM, '<=');
            where += ' and ';
            where += this.buildWhereWithFieldAndValue(GeometryIndexDao.COLUMN_MAX_M, envelope.maxM, '>=');
            whereArgs.push(envelope.maxM, envelope.minM);
        }
        return {
            join: 'inner join "' +
                tableName +
                '" on "' +
                tableName +
                '".' +
                this.featureDao.idColumns[0] +
                ' = ' +
                GeometryIndexDao.COLUMN_GEOM_ID,
            where: where,
            whereArgs: whereArgs,
            tableNameArr: ['"' + tableName + '".*'],
        };
    };
    /**
     * @param  {Object} envelope envelope
     * @param  {Number} envelope.minX min x
     * @param  {Number} envelope.maxX max x
     * @param  {Number} envelope.minY min y
     * @param  {Number} envelope.maxY max y
     * @param  {Number} envelope.minZ min z
     * @param  {Number} envelope.maxZ max z
     * @param  {Number} envelope.minM min m
     * @param  {Number} envelope.maxM max m
     * @param  {Boolean} envelope.hasM has m
     * @param  {Boolean} envelope.hasZ has z
     */
    GeometryIndexDao.prototype.queryWithGeometryEnvelope = function (envelope) {
        var result = this._generateGeometryEnvelopeQuery(envelope);
        return this.queryJoinWhereWithArgs(result.join, result.where, result.whereArgs, result.tableNameArr);
    };
    /**
     * @param  {Object} envelope envelope
     * @param  {Number} envelope.minX min x
     * @param  {Number} envelope.maxX max x
     * @param  {Number} envelope.minY min y
     * @param  {Number} envelope.maxY max y
     * @param  {Number} envelope.minZ min z
     * @param  {Number} envelope.maxZ max z
     * @param  {Number} envelope.minM min m
     * @param  {Number} envelope.maxM max m
     * @param  {Boolean} envelope.hasM has m
     * @param  {Boolean} envelope.hasZ has z
     */
    GeometryIndexDao.prototype.countWithGeometryEnvelope = function (envelope) {
        var result = this._generateGeometryEnvelopeQuery(envelope);
        return this.countJoinWhereWithArgs(result.join, result.where, result.whereArgs);
    };
    GeometryIndexDao.TABLE_NAME = 'nga_geometry_index';
    GeometryIndexDao.COLUMN_TABLE_NAME = GeometryIndexDao.TABLE_NAME + '.table_name';
    GeometryIndexDao.COLUMN_TABLE_NAME_FIELD = 'table_name';
    GeometryIndexDao.COLUMN_GEOM_ID = GeometryIndexDao.TABLE_NAME + '.geom_id';
    GeometryIndexDao.COLUMN_MIN_X = GeometryIndexDao.TABLE_NAME + '.min_x';
    GeometryIndexDao.COLUMN_MAX_X = GeometryIndexDao.TABLE_NAME + '.max_x';
    GeometryIndexDao.COLUMN_MIN_Y = GeometryIndexDao.TABLE_NAME + '.min_y';
    GeometryIndexDao.COLUMN_MAX_Y = GeometryIndexDao.TABLE_NAME + '.max_y';
    GeometryIndexDao.COLUMN_MIN_Z = GeometryIndexDao.TABLE_NAME + '.min_z';
    GeometryIndexDao.COLUMN_MAX_Z = GeometryIndexDao.TABLE_NAME + '.max_z';
    GeometryIndexDao.COLUMN_MIN_M = GeometryIndexDao.TABLE_NAME + '.min_m';
    GeometryIndexDao.COLUMN_MAX_M = GeometryIndexDao.TABLE_NAME + '.max_m';
    return GeometryIndexDao;
}(dao_1.Dao));
exports.GeometryIndexDao = GeometryIndexDao;
//# sourceMappingURL=geometryIndexDao.js.map