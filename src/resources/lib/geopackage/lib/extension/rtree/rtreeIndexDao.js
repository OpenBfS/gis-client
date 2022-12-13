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
exports.RTreeIndexDao = void 0;
var dao_1 = require("../../dao/dao");
var rtreeIndex_1 = require("./rtreeIndex");
var sqliteQueryBuilder_1 = require("../../db/sqliteQueryBuilder");
/**
 * RTree module.
 */
/**
 * RTree Index Data Access Object
 * @class
 * @extends Dao
 */
var RTreeIndexDao = /** @class */ (function (_super) {
    __extends(RTreeIndexDao, _super);
    function RTreeIndexDao(geoPackage, featureDao) {
        var _this = _super.call(this, geoPackage) || this;
        _this.gpkgTableName = RTreeIndexDao.TABLE_NAME;
        _this.featureDao = featureDao;
        return _this;
    }
    RTreeIndexDao.prototype.createObject = function (results) {
        var rti = new rtreeIndex_1.RTreeIndex(this.geoPackage, this.featureDao);
        if (results) {
        }
        return rti;
    };
    /**
     * Generate query components
     * @param envelope
     * @returns {{whereArgs: Array, where: string, join: string, tableNameArr: string[]}}
     * @private
     */
    RTreeIndexDao.prototype._generateGeometryEnvelopeQuery = function (envelope) {
        var tableName = this.featureDao.gpkgTableName;
        var where = '';
        var minXLessThanMaxX = envelope.minX < envelope.maxX;
        if (minXLessThanMaxX) {
            where += this.buildWhereWithFieldAndValue('minx', envelope.maxX, '<=');
            where += ' and ';
            where += this.buildWhereWithFieldAndValue('maxx', envelope.minX, '>=');
        }
        else {
            where += '(';
            where += this.buildWhereWithFieldAndValue('minx', envelope.maxX, '<=');
            where += ' or ';
            where += this.buildWhereWithFieldAndValue('maxx', envelope.minX, '>=');
            where += ' or ';
            where += this.buildWhereWithFieldAndValue('minx', envelope.minX, '>=');
            where += ' or ';
            where += this.buildWhereWithFieldAndValue('maxx', envelope.maxX, '<=');
            where += ')';
        }
        where += ' and ';
        where += this.buildWhereWithFieldAndValue('miny', envelope.maxY, '<=');
        where += ' and ';
        where += this.buildWhereWithFieldAndValue('maxy', envelope.minY, '>=');
        var whereArgs = [];
        whereArgs.push(envelope.maxX, envelope.minX);
        if (!minXLessThanMaxX) {
            whereArgs.push(envelope.minX, envelope.maxX);
        }
        whereArgs.push(envelope.maxY, envelope.minY);
        return {
            join: 'inner join "' +
                tableName +
                '" on "' +
                tableName +
                '".' +
                this.featureDao.idColumns[0] +
                ' = "' +
                this.gpkgTableName +
                '".id',
            where: where,
            whereArgs: whereArgs,
            tableNameArr: ['"' + tableName + '".*'],
        };
    };
    /**
     * Query witha geometry envelope
     * @param  {any} envelope envelope
     * @return {IterableIterator<any>}
     */
    RTreeIndexDao.prototype.queryWithGeometryEnvelope = function (envelope) {
        var result = this._generateGeometryEnvelopeQuery(envelope);
        return this.queryJoinWhereWithArgs(result.join, result.where, result.whereArgs, result.tableNameArr);
    };
    RTreeIndexDao.prototype.countWithGeometryEnvelope = function (envelope) {
        var result = this._generateGeometryEnvelopeQuery(envelope);
        return this.connection.get(sqliteQueryBuilder_1.SqliteQueryBuilder.buildCount("'" + this.gpkgTableName + "'", result.where), result.whereArgs).count;
    };
    RTreeIndexDao.TABLE_NAME = 'rtree';
    RTreeIndexDao.PREFIX = 'rtree_';
    RTreeIndexDao.COLUMN_TABLE_NAME = RTreeIndexDao.TABLE_NAME + '.table_name';
    RTreeIndexDao.COLUMN_GEOM_ID = RTreeIndexDao.TABLE_NAME + '.geom_id';
    RTreeIndexDao.COLUMN_MIN_X = RTreeIndexDao.TABLE_NAME + '.minx';
    RTreeIndexDao.COLUMN_MAX_X = RTreeIndexDao.TABLE_NAME + '.maxx';
    RTreeIndexDao.COLUMN_MIN_Y = RTreeIndexDao.TABLE_NAME + '.miny';
    RTreeIndexDao.COLUMN_MAX_Y = RTreeIndexDao.TABLE_NAME + '.maxy';
    RTreeIndexDao.COLUMN_MIN_Z = RTreeIndexDao.TABLE_NAME + '.minz';
    RTreeIndexDao.COLUMN_MAX_Z = RTreeIndexDao.TABLE_NAME + '.maxz';
    RTreeIndexDao.COLUMN_MIN_M = RTreeIndexDao.TABLE_NAME + '.minm';
    RTreeIndexDao.COLUMN_MAX_M = RTreeIndexDao.TABLE_NAME + '.maxm';
    RTreeIndexDao.EXTENSION_NAME = 'gpkg_rtree_index';
    RTreeIndexDao.EXTENSION_RTREE_INDEX_AUTHOR = 'gpkg';
    RTreeIndexDao.EXTENSION_RTREE_INDEX_NAME_NO_AUTHOR = 'rtree_index';
    RTreeIndexDao.EXTENSION_RTREE_INDEX_DEFINITION = 'http://www.geopackage.org/spec/#extension_rtree';
    return RTreeIndexDao;
}(dao_1.Dao));
exports.RTreeIndexDao = RTreeIndexDao;
//# sourceMappingURL=rtreeIndexDao.js.map