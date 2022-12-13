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
exports.ContentsDao = void 0;
var dao_1 = require("../../dao/dao");
var tileMatrixDao_1 = require("../../tiles/matrix/tileMatrixDao");
var tileMatrixSetDao_1 = require("../../tiles/matrixset/tileMatrixSetDao");
var geometryColumnsDao_1 = require("../../features/columns/geometryColumnsDao");
var contents_1 = require("./contents");
var columnValues_1 = require("../../dao/columnValues");
var boundingBox_1 = require("../../boundingBox");
var contentsDataType_1 = require("./contentsDataType");
var projectionConstants_1 = require("../../projection/projectionConstants");
/**
 * Contents object. Provides identifying and descriptive information that an
 * application can display to a user in a menu of geospatial data that is
 * available for access and/or update.
 * @class ContentsDao
 * @extends Dao
 */
var ContentsDao = /** @class */ (function (_super) {
    __extends(ContentsDao, _super);
    function ContentsDao() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gpkgTableName = ContentsDao.TABLE_NAME;
        _this.idColumns = [ContentsDao.COLUMN_PK];
        return _this;
    }
    /**
     * Creates a new Contents object
     * @return {module:core/contents~Contents} new Contents object
     */
    ContentsDao.prototype.createObject = function (results) {
        var c = new contents_1.Contents();
        if (results) {
            c.table_name = results.table_name;
            c.data_type = results.data_type;
            c.identifier = results.identifier;
            c.description = results.description;
            c.last_change = results.last_change;
            c.min_y = results.min_y;
            c.max_y = results.max_y;
            c.min_x = results.min_x;
            c.max_x = results.max_x;
            c.srs_id = results.srs_id;
        }
        return c;
    };
    /**
     * Get table names by table type
     * @param  {string} [tableType] table type to query for
     * @return {string[]}           Array of table names
     */
    ContentsDao.prototype.getTables = function (tableType) {
        var results;
        if (tableType) {
            var fieldValues = new columnValues_1.ColumnValues();
            fieldValues.addColumn(ContentsDao.COLUMN_DATA_TYPE, tableType);
            results = this.queryForColumns('table_name', fieldValues);
        }
        else {
            results = this.queryForColumns('table_name');
        }
        var tableNames = [];
        for (var i = 0; i < results.length; i++) {
            tableNames.push(results[i].table_name);
        }
        return tableNames;
    };
    ContentsDao.prototype.getContentsForTableType = function (tableType, reprojectTo4326) {
        var e_1, _a;
        if (reprojectTo4326 === void 0) { reprojectTo4326 = false; }
        var results = [];
        if (tableType) {
            var fieldValues = new columnValues_1.ColumnValues();
            fieldValues.addColumn(ContentsDao.COLUMN_DATA_TYPE, tableType);
            try {
                for (var _b = __values(this.queryForFieldValues(fieldValues)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var row = _c.value;
                    var contents = row;
                    if (reprojectTo4326) {
                        var bb = new boundingBox_1.BoundingBox(contents.min_x, contents.max_x, contents.min_y, contents.max_y).projectBoundingBox(this.getProjection(contents), projectionConstants_1.ProjectionConstants.EPSG_4326);
                        contents.min_x = bb.minLongitude;
                        contents.max_x = bb.maxLongitude;
                        contents.min_y = bb.minLatitude;
                        contents.max_y = bb.maxLatitude;
                    }
                    results.push(contents);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return results;
    };
    /**
     * Returns the proj4 projection for the Contents
     * @param  {module:core/contents~Contents} contents Contents to get the projection from
     * @return {*}          proj4 projection
     */
    ContentsDao.prototype.getProjection = function (contents) {
        var srs = this.getSrs(contents);
        return this.geoPackage.spatialReferenceSystemDao.getProjection(srs);
    };
    /**
     * Get the SpatialReferenceSystemDao for the Contents
     * @param  {module:core/contents~Contents} contents Contents to get the SpatialReferenceSystemDao from
     * @return {module:core/srs~SpatialReferenceSystemDao}
     */
    ContentsDao.prototype.getSrs = function (contents) {
        return this.geoPackage.spatialReferenceSystemDao.queryForId(contents.srs_id);
    };
    /**
     * Get the GeometryColumns for the Contents
     * @param  {module:core/contents~Contents} contents Contents
     * @return {module:features/columns~GeometryColumns}
     */
    ContentsDao.prototype.getGeometryColumns = function (contents) {
        var dao = this.geoPackage.geometryColumnsDao;
        var results = dao.queryForAllEq(geometryColumnsDao_1.GeometryColumnsDao.COLUMN_TABLE_NAME, contents.table_name);
        if (results === null || results === void 0 ? void 0 : results.length) {
            var gc = dao.createObject(results[0]);
            return gc;
        }
        return undefined;
    };
    /**
     * Get the TileMatrixSet for the Contents
     * @param  {module:core/contents~Contents} contents Contents
     * @return {module:tiles/matrixset~TileMatrixSet}
     */
    ContentsDao.prototype.getTileMatrixSet = function (contents) {
        var dao = this.geoPackage.tileMatrixSetDao;
        var results = dao.queryForAllEq(tileMatrixSetDao_1.TileMatrixSetDao.COLUMN_TABLE_NAME, contents.table_name);
        if (results === null || results === void 0 ? void 0 : results.length) {
            return dao.createObject(results[0]);
        }
        return undefined;
    };
    /**
     * Get the TileMatrix for the Contents
     * @param  {module:core/contents~Contents} contents Contents
     * @return {module:tiles/matrix~TileMatrix}
     */
    ContentsDao.prototype.getTileMatrix = function (contents) {
        var dao = this.geoPackage.tileMatrixDao;
        var results = dao.queryForAllEq(tileMatrixDao_1.TileMatrixDao.COLUMN_TABLE_NAME, contents.table_name);
        if (!results || !results.length)
            return undefined;
        var tileMatrices = [];
        for (var i = 0; i < results.length; i++) {
            var gc = dao.createObject(results[i]);
            tileMatrices.push(gc);
        }
        return tileMatrices;
    };
    ContentsDao.prototype.deleteCascadeContents = function (contents) {
        var count = 0;
        if (contents !== null && contents !== undefined) {
            var dataType = contentsDataType_1.ContentsDataType.fromName(contents.data_type);
            if (dataType !== null && dataType !== undefined) {
                switch (dataType) {
                    case contentsDataType_1.ContentsDataType.FEATURES:
                        // Delete Geometry Columns
                        var geometryColumnsDao = this.geoPackage.geometryColumnsDao;
                        if (geometryColumnsDao.isTableExists()) {
                            var geometryColumns = this.getGeometryColumns(contents);
                            if (geometryColumns !== null && geometryColumns !== undefined) {
                                geometryColumnsDao.deleteByMultiId([geometryColumns.table_name, geometryColumns.column_name]);
                            }
                        }
                        break;
                    case contentsDataType_1.ContentsDataType.TILES:
                        // case GRIDDED_COVERAGE:
                        // Delete Tile Matrix collection
                        var tileMatrixDao_2 = this.geoPackage.tileMatrixDao;
                        if (tileMatrixDao_2.isTableExists()) {
                            var tileMatrixCollection = this.getTileMatrix(contents);
                            if (tileMatrixCollection !== null && tileMatrixCollection !== undefined && tileMatrixCollection.length > 0) {
                                tileMatrixCollection.forEach(function (tileMatrix) {
                                    tileMatrixDao_2.deleteByMultiId([tileMatrix.table_name, tileMatrix.zoom_level]);
                                });
                            }
                        }
                        // Delete Tile Matrix Set
                        var tileMatrixSetDao = this.geoPackage.tileMatrixSetDao;
                        if (tileMatrixSetDao.isTableExists()) {
                            var tileMatrixSet = this.getTileMatrixSet(contents);
                            if (tileMatrixSet !== null && tileMatrixSet !== undefined) {
                                tileMatrixSetDao.deleteById(tileMatrixSet.table_name);
                            }
                        }
                        break;
                    case contentsDataType_1.ContentsDataType.ATTRIBUTES:
                        this.dropTableWithTableName(contents.table_name);
                        break;
                }
            }
            else {
                this.dropTableWithTableName(contents.table_name);
            }
            count = this.delete(contents);
        }
        return count;
    };
    ContentsDao.prototype.deleteCascade = function (contents, userTable) {
        var count = this.deleteCascadeContents(contents);
        if (userTable) {
            this.dropTableWithTableName(contents.table_name);
        }
        return count;
    };
    ContentsDao.prototype.deleteByIdCascade = function (id, userTable) {
        var count = 0;
        if (id !== null && id !== undefined) {
            var contents = this.queryForId(id);
            if (contents !== null && contents !== undefined) {
                count = this.deleteCascade(contents, userTable);
            }
            else if (userTable) {
                this.dropTableWithTableName(id);
            }
        }
        return count;
    };
    ContentsDao.prototype.deleteTable = function (table) {
        try {
            this.deleteByIdCascade(table, true);
        }
        catch (e) {
            throw new Error('Failed to delete table: ' + table);
        }
    };
    ContentsDao.TABLE_NAME = 'gpkg_contents';
    ContentsDao.COLUMN_PK = 'table_name';
    ContentsDao.COLUMN_TABLE_NAME = 'table_name';
    ContentsDao.COLUMN_DATA_TYPE = 'data_type';
    ContentsDao.COLUMN_IDENTIFIER = 'identifier';
    ContentsDao.COLUMN_DESCRIPTION = 'description';
    ContentsDao.COLUMN_LAST_CHANGE = 'last_change';
    ContentsDao.COLUMN_MIN_X = 'min_x';
    ContentsDao.COLUMN_MIN_Y = 'min_y';
    ContentsDao.COLUMN_MAX_X = 'max_x';
    ContentsDao.COLUMN_MAX_Y = 'max_y';
    ContentsDao.COLUMN_SRS_ID = 'srs_id';
    return ContentsDao;
}(dao_1.Dao));
exports.ContentsDao = ContentsDao;
//# sourceMappingURL=contentsDao.js.map