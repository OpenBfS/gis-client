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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureDao = void 0;
// @ts-ignore
var reproject_1 = __importDefault(require("reproject"));
var line_intersect_1 = __importDefault(require("@turf/line-intersect"));
var intersect_1 = __importDefault(require("@turf/intersect"));
// @ts-ignore
var boolean_within_1 = __importDefault(require("@turf/boolean-within"));
// @ts-ignore
var boolean_point_in_polygon_1 = __importDefault(require("@turf/boolean-point-in-polygon"));
var featureTableIndex_1 = require("../../extension/index/featureTableIndex");
var userDao_1 = require("../../user/userDao");
var dataColumnsDao_1 = require("../../dataColumns/dataColumnsDao");
var featureRow_1 = require("./featureRow");
var geoPackageDataType_1 = require("../../db/geoPackageDataType");
var boundingBox_1 = require("../../boundingBox");
var projectionConstants_1 = require("../../projection/projectionConstants");
/**
 * Feature DAO for reading feature user data tables
 * @class FeatureDao
 * @extends UserDao
 * @param  {any} db              database connection
 * @param  {FeatureTable} table           feature table
 * @param  {GeometryColumns} geometryColumns geometry columns
 * @param  {MetadataDao} metadataDao      metadata dao
 */
var FeatureDao = /** @class */ (function (_super) {
    __extends(FeatureDao, _super);
    function FeatureDao(geoPackage, table, geometryColumns, metadataDao) {
        var _this = _super.call(this, geoPackage, table) || this;
        _this.geometryColumns = geometryColumns;
        _this.metadataDao = metadataDao;
        _this.dataColumnsDao = new dataColumnsDao_1.DataColumnsDao(geoPackage);
        _this.featureTableIndex = new featureTableIndex_1.FeatureTableIndex(geoPackage, _this);
        var dao = geoPackage.geometryColumnsDao;
        if (!dao.getContents(geometryColumns)) {
            throw new Error('Geometry Columns ' + geometryColumns.id + ' has null Contents');
        }
        if (!dao.getSrs(geometryColumns)) {
            throw new Error('Geometry Columns ' + geometryColumns.id + ' has null Spatial Reference System');
        }
        _this.projection = dao.getProjection(geometryColumns);
        return _this;
    }
    FeatureDao.prototype.createObject = function (results) {
        if (results) {
            return this.getRow(results);
        }
        return this.newRow();
    };
    FeatureDao.prototype.getRow = function (results) {
        return _super.prototype.getRow.call(this, results);
    };
    FeatureDao.prototype.getContents = function () {
        var dao = this.geoPackage.geometryColumnsDao;
        return dao.getContents(this.geometryColumns);
    };
    /**
     * Get the feature table
     * @return {FeatureTable} the feature table
     */
    FeatureDao.prototype.getFeatureTable = function () {
        return this.table;
    };
    Object.defineProperty(FeatureDao.prototype, "table", {
        get: function () {
            return this._table;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Create a new feature row with the column types and values
     * @param  {Array} columnTypes column types
     * @param  {Array} values      values
     * @return {FeatureRow}             feature row
     */
    FeatureDao.prototype.newRow = function (columnTypes, values) {
        return new featureRow_1.FeatureRow(this.getFeatureTable(), columnTypes, values);
    };
    /**
     * Get the geometry column name
     * @return {string} the geometry column name
     */
    FeatureDao.prototype.getGeometryColumnName = function () {
        return this.geometryColumns.column_name;
    };
    Object.defineProperty(FeatureDao.prototype, "geometryType", {
        /**
         * Get the geometry types
         * @return {Number} well known binary geometry type
         */
        get: function () {
            return this.geometryColumns.geometryType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FeatureDao.prototype, "srs", {
        get: function () {
            return this.geoPackage.geometryColumnsDao.getSrs(this.geometryColumns);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Determine if the feature table is indexed
     * @returns {Boolean} indexed status of the table
     */
    FeatureDao.prototype.isIndexed = function () {
        return this.featureTableIndex.isIndexed();
    };
    FeatureDao.prototype.index = function (progress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.featureTableIndex.index(progress)];
            });
        });
    };
    /**
     * Query for count in bounding box
     * @param boundingBox
     * @returns {Number}
     */
    FeatureDao.prototype.countWebMercatorBoundingBox = function (boundingBox) {
        return this.countInBoundingBox(boundingBox, projectionConstants_1.ProjectionConstants.EPSG_3857);
    };
    /**
     * Query for count in bounding box
     * @param boundingBox
     * @param projection
     * @returns {Number}}
     */
    FeatureDao.prototype.countInBoundingBox = function (boundingBox, projection) {
        return this.featureTableIndex.countWithBoundingBox(boundingBox, projection);
    };
    /**
     * Fast query web mercator bounding box
     * @param {BoundingBox} boundingBox bounding box to query for
     * @returns {any}
     */
    FeatureDao.prototype.fastQueryWebMercatorBoundingBox = function (boundingBox) {
        var _a;
        var _this = this;
        var iterator = this.featureTableIndex.queryWithBoundingBox(boundingBox, projectionConstants_1.ProjectionConstants.EPSG_3857);
        return _a = {},
            _a[Symbol.iterator] = function () {
                return this;
            },
            _a.next = function () {
                var nextRow = iterator.next();
                if (!nextRow.done) {
                    var featureRow = _this.getRow(nextRow.value);
                    return {
                        value: featureRow,
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
    FeatureDao.prototype.queryIndexedFeaturesWithWebMercatorBoundingBox = function (boundingBox) {
        var _a;
        var srs = this.srs;
        var projection = this.projection;
        var iterator = this.featureTableIndex.queryWithBoundingBox(boundingBox, projectionConstants_1.ProjectionConstants.EPSG_3857);
        var thisGetRow = this.getRow.bind(this);
        var projectedBoundingBox = boundingBox.projectBoundingBox(projectionConstants_1.ProjectionConstants.EPSG_3857, projectionConstants_1.ProjectionConstants.EPSG_4326);
        return _a = {},
            _a[Symbol.iterator] = function () {
                return this;
            },
            _a.next = function () {
                var nextRow = iterator.next();
                if (!nextRow.done) {
                    var featureRow = void 0;
                    var geometry = void 0;
                    while (!nextRow.done && !geometry) {
                        featureRow = thisGetRow(nextRow.value);
                        try {
                            var reporjectedGeometry = FeatureDao.reprojectFeature(featureRow, srs, projection);
                            geometry = FeatureDao.verifyFeature(reporjectedGeometry, projectedBoundingBox);
                        }
                        catch (e) {
                            console.log('Error parsing Geometry', e);
                        }
                        if (geometry) {
                            geometry.properties = featureRow.values;
                            return {
                                value: featureRow,
                                done: false,
                            };
                        }
                        else {
                            nextRow = iterator.next();
                        }
                    }
                }
                return {
                    done: true,
                    value: undefined,
                };
            },
            _a;
    };
    FeatureDao.prototype.fastQueryBoundingBox = function (boundingBox, projection) {
        var _a;
        var iterator = this.featureTableIndex.queryWithBoundingBox(boundingBox, projection);
        var thisgetRow = this.getRow.bind(this);
        return _a = {},
            _a[Symbol.iterator] = function () {
                return this;
            },
            _a.next = function () {
                var nextRow = iterator.next();
                if (!nextRow.done) {
                    var featureRow = thisgetRow(nextRow.value);
                    return {
                        value: featureRow,
                        done: false,
                    };
                }
                else {
                    return {
                        done: true,
                        value: undefined,
                    };
                }
            },
            _a;
    };
    FeatureDao.prototype.queryIndexedFeaturesWithBoundingBox = function (boundingBox) {
        var _a;
        var srs = this.srs;
        var projection = this.projection;
        var iterator = this.featureTableIndex.queryWithBoundingBox(boundingBox, projection);
        var thisgetRow = this.getRow.bind(this);
        var projectedBoundingBox = boundingBox.projectBoundingBox(projection, this.projection);
        return _a = {},
            _a[Symbol.iterator] = function () {
                return this;
            },
            _a.next = function () {
                var nextRow = iterator.next();
                if (!nextRow.done) {
                    var featureRow = void 0;
                    var geometry = void 0;
                    while (!nextRow.done && !geometry) {
                        featureRow = thisgetRow(nextRow.value);
                        try {
                            var reporjectedGeometry = FeatureDao.reprojectFeature(featureRow, srs, projection);
                            geometry = FeatureDao.verifyFeature(reporjectedGeometry, projectedBoundingBox);
                        }
                        catch (e) {
                            console.log('Error parsing Geometry', e);
                        }
                        if (geometry) {
                            geometry.properties = featureRow.values;
                            return {
                                value: featureRow,
                                done: false,
                            };
                        }
                        else {
                            nextRow = iterator.next();
                        }
                    }
                }
                return {
                    done: true,
                    value: undefined,
                };
            },
            _a;
    };
    /**
     * Calls geoJSONFeatureCallback with the geoJSON of each matched feature (always in 4326 projection)
     * @param  {BoundingBox} boundingBox        4326 bounding box to query
     * @param {Boolean} [skipVerification] do not verify if the feature actually exists in the box
     * @returns {any}
     */
    FeatureDao.prototype.queryForGeoJSONIndexedFeaturesWithBoundingBox = function (boundingBox, skipVerification) {
        var _a;
        var _this = this;
        if (skipVerification === void 0) { skipVerification = false; }
        var columns = [];
        var columnMap = {};
        var srs = this.srs;
        var projection = this.projection;
        this.table.getUserColumns().getColumns().forEach(function (column) {
            var dataColumn = _this.dataColumnsDao.getDataColumns(_this.table.getTableName(), column.name);
            columns.push({
                index: column.index,
                name: column.name,
                max: column.max,
                min: column.min,
                notNull: column.notNull,
                primaryKey: column.primaryKey,
                dataType: column.dataType ? geoPackageDataType_1.GeoPackageDataType.nameFromType(column.dataType) : '',
                displayName: dataColumn && dataColumn.name ? dataColumn.name : column.name,
                dataColumn: dataColumn,
            });
            columnMap[column.name] = columns[columns.length - 1];
        });
        var iterator;
        if (boundingBox) {
            iterator = this.featureTableIndex.queryWithBoundingBox(boundingBox, projectionConstants_1.ProjectionConstants.EPSG_4326)[Symbol.iterator]();
        }
        else {
            iterator = this.queryForEach();
        }
        return _a = {
                srs: srs,
                featureDao: this
            },
            _a[Symbol.iterator] = function () {
                return this;
            },
            // eslint-disable-next-line complexity
            _a.next = function () {
                var nextRow = iterator.next();
                if (!nextRow.done) {
                    var featureRow = void 0;
                    var geometry = void 0;
                    while (!nextRow.done && !geometry) {
                        featureRow = _this.getRow(nextRow.value);
                        try {
                            geometry = FeatureDao.reprojectFeature(featureRow, srs, projection);
                            if (!skipVerification && boundingBox) {
                                geometry = FeatureDao.verifyFeature(geometry, boundingBox);
                            }
                        }
                        catch (e) {
                            console.log('Error parsing Geometry', e);
                        }
                        if (geometry) {
                            var geoJson = {
                                id: undefined,
                                type: 'Feature',
                                properties: {},
                                geometry: geometry,
                            };
                            for (var key in featureRow.values) {
                                if (Object.prototype.hasOwnProperty.call(featureRow.values, key) &&
                                    key !== featureRow.geometryColumn.name) {
                                    if (key.toLowerCase() === '_feature_id') {
                                        geoJson.id = featureRow.values[key];
                                    }
                                    else if (key.toLowerCase() === 'id') {
                                        geoJson.properties[key] = featureRow.values[key];
                                    }
                                    else if (key.toLowerCase() === '_properties_id') {
                                        geoJson.properties[key.substring(12)] = featureRow.values[key];
                                    }
                                    else {
                                        geoJson.properties[columnMap[key].displayName] = featureRow.values[key];
                                    }
                                }
                            }
                            geoJson.id = geoJson.id || featureRow.id;
                            return {
                                value: geoJson,
                                done: false,
                            };
                        }
                        else {
                            nextRow = iterator.next();
                        }
                    }
                }
                return {
                    done: true,
                    value: undefined,
                };
            },
            _a;
    };
    FeatureDao.prototype.getBoundingBox = function () {
        var contents = this.getContents();
        return new boundingBox_1.BoundingBox(contents.min_x, contents.max_x, contents.min_y, contents.max_y);
    };
    FeatureDao.reprojectFeature = function (featureRow, srs, projection) {
        var geometry = featureRow.geometry.toGeoJSON();
        if (srs.organization !== projectionConstants_1.ProjectionConstants.EPSG || srs.organization_coordsys_id !== projectionConstants_1.ProjectionConstants.EPSG_CODE_4326) {
            geometry = reproject_1.default.reproject(geometry, projection, projectionConstants_1.ProjectionConstants.EPSG_4326);
        }
        return geometry;
    };
    FeatureDao.verifyFeature = function (geometry, boundingBox) {
        try {
            if (geometry.type === 'Point') {
                return geometry;
            }
            else if (geometry.type === 'LineString') {
                return FeatureDao.verifyLineString(geometry, boundingBox);
            }
            else if (geometry.type === 'Polygon') {
                return FeatureDao.verifyPolygon(geometry, boundingBox);
            }
            else if (geometry.type === 'MultiPoint') {
                return FeatureDao.verifyMultiPoint(geometry, boundingBox);
            }
            else if (geometry.type === 'MultiLineString') {
                return FeatureDao.verifyLineString(geometry, boundingBox);
            }
            else if (geometry.type === 'MultiPolygon') {
                return FeatureDao.verifyPolygon(geometry, boundingBox);
            }
            else if (geometry.type === 'GeometryCollection') {
                return FeatureDao.verifyGeometryCollection(geometry, boundingBox);
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            return undefined;
        }
    };
    FeatureDao.verifyMultiPoint = function (geometry, boundingBox) {
        var multiPointIntersects = FeatureDao.multiPointIntersects(geometry, boundingBox.toGeoJSON().geometry);
        if (multiPointIntersects) {
            return geometry;
        }
        else if ((0, boolean_within_1.default)(geometry, boundingBox.toGeoJSON().geometry)) {
            return geometry;
        }
    };
    FeatureDao.verifyLineString = function (geometry, boundingBox) {
        var intersect = (0, line_intersect_1.default)(geometry, boundingBox.toGeoJSON().geometry);
        if (intersect.features.length) {
            return geometry;
        }
        else if ((0, boolean_within_1.default)(geometry, boundingBox.toGeoJSON().geometry)) {
            return geometry;
        }
    };
    FeatureDao.verifyPolygon = function (geometry, boundingBox) {
        var polyIntersect = (0, intersect_1.default)(geometry, boundingBox.toGeoJSON().geometry);
        if (polyIntersect) {
            return geometry;
        }
        else if ((0, boolean_within_1.default)(geometry, boundingBox.toGeoJSON().geometry)) {
            return geometry;
        }
    };
    FeatureDao.multiPointIntersects = function (geometry, boundsGeometry) {
        var intersects = false;
        for (var i = 0; i < geometry.coordinates.length && !intersects; i++) {
            var point = geometry.coordinates[i];
            intersects = (0, boolean_point_in_polygon_1.default)(point, boundsGeometry);
        }
        return intersects;
    };
    /**
     * Iterate over geometries in GeometryCollection looking for any geometry that intersects the bounding box provided
     * @param geometry
     * @param boundsGeometry
     */
    FeatureDao.geometryCollectionIntersects = function (geometry, boundsGeometry) {
        var intersects = false;
        for (var i = 0; i < geometry.geometries.length && !intersects; i++) {
            var childGeometry = geometry.geometries[i];
            switch (childGeometry.type) {
                case 'Point':
                    intersects = (0, boolean_point_in_polygon_1.default)(childGeometry, boundsGeometry);
                    break;
                case 'LineString':
                case 'MultiLineString':
                    intersects = (0, line_intersect_1.default)(childGeometry, boundsGeometry).features.length > 0;
                    break;
                case 'Polygon':
                case 'MultiPolygon':
                    intersects = (0, intersect_1.default)(childGeometry, boundsGeometry) !== null;
                    break;
                case 'MultiPoint':
                    intersects = FeatureDao.multiPointIntersects(childGeometry, boundsGeometry);
                    break;
                case 'GeometryCollection':
                    intersects = FeatureDao.geometryCollectionIntersects(childGeometry, boundsGeometry);
                    break;
                default:
                    break;
            }
        }
        return intersects;
    };
    FeatureDao.verifyGeometryCollection = function (geometry, boundingBox) {
        var geomCollectionIntersect = FeatureDao.geometryCollectionIntersects(geometry, boundingBox.toGeoJSON().geometry);
        if (geomCollectionIntersect) {
            return geometry;
        }
        else if ((0, boolean_within_1.default)(geometry, boundingBox.toGeoJSON().geometry)) {
            return geometry;
        }
    };
    FeatureDao.readTable = function (geoPackage, tableName) {
        return geoPackage.getFeatureDao(tableName);
    };
    return FeatureDao;
}(userDao_1.UserDao));
exports.FeatureDao = FeatureDao;
//# sourceMappingURL=featureDao.js.map