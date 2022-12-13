"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.GeoPackage = void 0;
var wkx_1 = __importDefault(require("wkx"));
// @ts-ignore
var reproject_1 = __importDefault(require("reproject"));
var point_to_line_distance_1 = __importDefault(require("@turf/point-to-line-distance"));
var polygon_to_line_1 = __importDefault(require("@turf/polygon-to-line"));
var boolean_point_in_polygon_1 = __importDefault(require("@turf/boolean-point-in-polygon"));
// @ts-ignore
var distance_1 = __importDefault(require("@turf/distance"));
var helpers = __importStar(require("@turf/helpers"));
var proj4_1 = __importDefault(require("proj4"));
var geometryData_1 = require("./geom/geometryData");
var crsWkt_1 = require("./extension/crsWkt");
var relatedTables_1 = require("./extension/relatedTables");
var style_1 = require("./extension/style");
var contents_1 = require("./extension/contents");
var scale_1 = require("./extension/scale");
var spatialReferenceSystemDao_1 = require("./core/srs/spatialReferenceSystemDao");
var geometryColumnsDao_1 = require("./features/columns/geometryColumnsDao");
var featureDao_1 = require("./features/user/featureDao");
var featureTableReader_1 = require("./features/user/featureTableReader");
var contentsDao_1 = require("./core/contents/contentsDao");
var tileMatrixSetDao_1 = require("./tiles/matrixset/tileMatrixSetDao");
var tileMatrixDao_1 = require("./tiles/matrix/tileMatrixDao");
var dataColumnsDao_1 = require("./dataColumns/dataColumnsDao");
var dataColumnConstraintsDao_1 = require("./dataColumnConstraints/dataColumnConstraintsDao");
var metadataDao_1 = require("./metadata/metadataDao");
var metadataReferenceDao_1 = require("./metadata/reference/metadataReferenceDao");
var extensionDao_1 = require("./extension/extensionDao");
var tableIndexDao_1 = require("./extension/index/tableIndexDao");
var geometryIndexDao_1 = require("./extension/index/geometryIndexDao");
var extendedRelationDao_1 = require("./extension/relatedTables/extendedRelationDao");
var attributesDao_1 = require("./attributes/attributesDao");
var tileDao_1 = require("./tiles/user/tileDao");
var contentsIdDao_1 = require("./extension/contents/contentsIdDao");
var tileScalingDao_1 = require("./extension/scale/tileScalingDao");
var attributesTable_1 = require("./attributes/attributesTable");
var tileTableReader_1 = require("./tiles/user/tileTableReader");
var attributesTableReader_1 = require("./attributes/attributesTableReader");
var featureTable_1 = require("./features/user/featureTable");
var styleMappingTable_1 = require("./extension/style/styleMappingTable");
var tileTable_1 = require("./tiles/user/tileTable");
var contents_2 = require("./core/contents/contents");
var geoPackageDataType_1 = require("./db/geoPackageDataType");
var schema_1 = require("./extension/schema");
var geometryColumns_1 = require("./features/columns/geometryColumns");
var tableCreator_1 = require("./db/tableCreator");
var tileMatrix_1 = require("./tiles/matrix/tileMatrix");
var tileBoundingBoxUtils_1 = require("./tiles/tileBoundingBoxUtils");
var boundingBox_1 = require("./boundingBox");
var tileMatrixSet_1 = require("./tiles/matrixset/tileMatrixSet");
var userColumn_1 = require("./user/userColumn");
var dataColumns_1 = require("./dataColumns/dataColumns");
var geoPackageValidate_1 = require("./validate/geoPackageValidate");
var featureColumn_1 = require("./features/user/featureColumn");
var mediaTable_1 = require("./extension/relatedTables/mediaTable");
var relationType_1 = require("./extension/relatedTables/relationType");
var simpleAttributesTable_1 = require("./extension/relatedTables/simpleAttributesTable");
var features_1 = require("./tiles/features");
var retriever_1 = require("./tiles/retriever");
var tileScaling_1 = require("./extension/scale/tileScaling");
var tileScalingType_1 = require("./extension/scale/tileScalingType");
var attributesColumn_1 = require("./attributes/attributesColumn");
var alterTable_1 = require("./db/alterTable");
var geoPackageExtensions_1 = require("./extension/geoPackageExtensions");
var contentsDataType_1 = require("./core/contents/contentsDataType");
var geometryType_1 = require("./features/user/geometryType");
var constraints_1 = require("./db/table/constraints");
var projection_1 = require("./projection/projection");
var projectionConstants_1 = require("./projection/projectionConstants");
var sqliteQueryBuilder_1 = require("./db/sqliteQueryBuilder");
/**
 * A `GeoPackage` instance is the interface to a physical GeoPackage SQLite
 * database.
 */
var GeoPackage = /** @class */ (function () {
    /**
     * Construct a new GeoPackage object
     * @param name name to give to this GeoPackage
     * @param path path to the GeoPackage
     * @param connection database connection to the GeoPackage
     */
    function GeoPackage(name, path, connection) {
        this.name = name;
        this.path = path;
        this.connection = connection;
        this.tableCreator = new tableCreator_1.TableCreator(this);
        this.loadSpatialReferenceSystemsIntoProj4();
    }
    GeoPackage.prototype.close = function () {
        this.connection.close();
    };
    Object.defineProperty(GeoPackage.prototype, "database", {
        get: function () {
            return this.connection;
        },
        enumerable: false,
        configurable: true
    });
    GeoPackage.prototype.export = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.connection.export()];
            });
        });
    };
    GeoPackage.prototype.loadSpatialReferenceSystemsIntoProj4 = function () {
        this.spatialReferenceSystemDao.getAllSpatialReferenceSystems().forEach(function (spatialReferenceSystem) {
            try {
                if (spatialReferenceSystem.srs_id > 0 && (spatialReferenceSystem.organization !== projectionConstants_1.ProjectionConstants.EPSG ||
                    (spatialReferenceSystem.organization_coordsys_id !== projectionConstants_1.ProjectionConstants.EPSG_CODE_4326 &&
                        spatialReferenceSystem.organization_coordsys_id !== projectionConstants_1.ProjectionConstants.EPSG_CODE_3857)))
                    projection_1.Projection.loadProjection([spatialReferenceSystem.organization, spatialReferenceSystem.organization_coordsys_id].join(':'), spatialReferenceSystem.definition);
            }
            catch (e) { }
        });
    };
    GeoPackage.prototype.validate = function () {
        var errors = [];
        errors = errors.concat(geoPackageValidate_1.GeoPackageValidate.validateMinimumTables(this));
        return errors;
    };
    Object.defineProperty(GeoPackage.prototype, "spatialReferenceSystemDao", {
        /**
         * @returns {module:core/srs~SpatialReferenceSystemDao} the DAO to access the [SRS table]{@link module:core/srs~SpatialReferenceSystem} in this `GeoPackage`
         */
        get: function () {
            return this._spatialReferenceSystemDao || (this._spatialReferenceSystemDao = new spatialReferenceSystemDao_1.SpatialReferenceSystemDao(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "contentsDao", {
        /**
         * @returns {module:core/contents~ContentsDao} the DAO to access the [contents table]{@link module:core/contents~Contents} in this `GeoPackage`
         */
        get: function () {
            return this._contentsDao || (this._contentsDao = new contentsDao_1.ContentsDao(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "tileMatrixSetDao", {
        /**
         * @returns {module:tiles/matrixset~TileMatrixSetDao} the DAO to access the [tile matrix set]{@link module:tiles/matrixset~TileMatrixSet} in this `GeoPackage`
         */
        get: function () {
            return this._tileMatrixSetDao || (this._tileMatrixSetDao = new tileMatrixSetDao_1.TileMatrixSetDao(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "tileMatrixDao", {
        /**
         * @returns {module:tiles/matrixset~TileMatrixDao} the DAO to access the [tile matrix]{@link module:tiles/matrixset~TileMatrix} in this `GeoPackage`
         */
        get: function () {
            return this._tileMatrixDao || (this._tileMatrixDao = new tileMatrixDao_1.TileMatrixDao(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "dataColumnsDao", {
        get: function () {
            return this._dataColumnsDao || (this._dataColumnsDao = new dataColumnsDao_1.DataColumnsDao(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "extensionDao", {
        get: function () {
            return this._extensionDao || (this._extensionDao = new extensionDao_1.ExtensionDao(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "tableIndexDao", {
        get: function () {
            return this._tableIndexDao || (this._tableIndexDao = new tableIndexDao_1.TableIndexDao(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "geometryColumnsDao", {
        get: function () {
            return this._geometryColumnsDao || (this._geometryColumnsDao = new geometryColumnsDao_1.GeometryColumnsDao(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "dataColumnConstraintsDao", {
        get: function () {
            return this._dataColumnConstraintsDao || (this._dataColumnConstraintsDao = new dataColumnConstraintsDao_1.DataColumnConstraintsDao(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "metadataReferenceDao", {
        get: function () {
            return this._metadataReferenceDao || (this._metadataReferenceDao = new metadataReferenceDao_1.MetadataReferenceDao(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "metadataDao", {
        get: function () {
            return this._metadataDao || (this._metadataDao = new metadataDao_1.MetadataDao(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "extendedRelationDao", {
        get: function () {
            return this._extendedRelationDao || (this._extendedRelationDao = new extendedRelationDao_1.ExtendedRelationDao(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "contentsIdDao", {
        get: function () {
            return this._contentsIdDao || (this._contentsIdDao = new contentsIdDao_1.ContentsIdDao(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "tileScalingDao", {
        get: function () {
            return this._tileScalingDao || (this._tileScalingDao = new tileScalingDao_1.TileScalingDao(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "contentsIdExtension", {
        get: function () {
            return this._contentsIdExtension || (this._contentsIdExtension = new contents_1.ContentsIdExtension(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeoPackage.prototype, "featureStyleExtension", {
        get: function () {
            return this._featureStyleExtension || (this._featureStyleExtension = new style_1.FeatureStyleExtension(this));
        },
        enumerable: false,
        configurable: true
    });
    GeoPackage.prototype.getTileScalingExtension = function (tableName) {
        return new scale_1.TileScalingExtension(this, tableName);
    };
    GeoPackage.prototype.getGeometryIndexDao = function (featureDao) {
        return new geometryIndexDao_1.GeometryIndexDao(this, featureDao);
    };
    Object.defineProperty(GeoPackage.prototype, "relatedTablesExtension", {
        get: function () {
            return this._relatedTablesExtension || (this._relatedTablesExtension = new relatedTables_1.RelatedTablesExtension(this));
        },
        enumerable: false,
        configurable: true
    });
    GeoPackage.prototype.getSrs = function (srsId) {
        var dao = this.spatialReferenceSystemDao;
        return dao.queryForId(srsId);
    };
    GeoPackage.prototype.createRequiredTables = function () {
        this.tableCreator.createRequired();
        return this;
    };
    GeoPackage.prototype.createSupportedExtensions = function () {
        var crs = new crsWkt_1.CrsWktExtension(this);
        crs.getOrCreateExtension();
        var schema = new schema_1.SchemaExtension(this);
        schema.getOrCreateExtension();
        return this;
    };
    /**
     * Get a Tile DAO
     * @param table
     * @returns {TileDao}
     */
    GeoPackage.prototype.getTileDao = function (table) {
        if (table instanceof contents_2.Contents) {
            table = this.contentsDao.getTileMatrixSet(table);
        }
        else if (!(table instanceof tileMatrixSet_1.TileMatrixSet)) {
            var tms = this.tileMatrixSetDao;
            var results_1 = tms.queryForAllEq(tileMatrixSetDao_1.TileMatrixSetDao.COLUMN_TABLE_NAME, table);
            if (results_1.length > 1) {
                throw new Error('Unexpected state. More than one Tile Matrix Set matched for table name: ' +
                    table +
                    ', count: ' +
                    results_1.length);
            }
            else if (results_1.length === 0) {
                throw new Error('No Tile Matrix found for table name: ' + table);
            }
            table = tms.createObject(results_1[0]);
        }
        if (!table) {
            throw new Error('Non null TileMatrixSet is required to create Tile DAO');
        }
        var tileMatrices = [];
        var tileMatrixDao = this.tileMatrixDao;
        var results = tileMatrixDao.queryForAllEq(tileMatrixDao_1.TileMatrixDao.COLUMN_TABLE_NAME, table.table_name, null, null, tileMatrixDao_1.TileMatrixDao.COLUMN_ZOOM_LEVEL +
            ' ASC, ' +
            tileMatrixDao_1.TileMatrixDao.COLUMN_PIXEL_X_SIZE +
            ' DESC, ' +
            tileMatrixDao_1.TileMatrixDao.COLUMN_PIXEL_Y_SIZE +
            ' DESC');
        results.forEach(function (result) {
            var tm = tileMatrixDao.createObject(result);
            // verify first that there are actual tiles at this zoom level due to QGIS doing weird things and
            // creating tile matrix entries for zoom levels that have no tiles
            if (tileMatrixDao.hasTiles(tm)) {
                tileMatrices.push(tm);
            }
        });
        var tableReader = new tileTableReader_1.TileTableReader(table);
        var tileTable = tableReader.readTileTable(this);
        return new tileDao_1.TileDao(this, tileTable, table, tileMatrices);
    };
    GeoPackage.prototype.getTables = function (fullInformation) {
        if (fullInformation === void 0) { fullInformation = false; }
        if (!fullInformation) {
            var tables = {
                features: this.getFeatureTables(),
                tiles: this.getTileTables(),
                attributes: this.getAttributesTables(),
            };
            return tables;
        }
        else {
            var tables = {
                features: this.contentsDao.getContentsForTableType(contentsDataType_1.ContentsDataType.FEATURES),
                tiles: this.contentsDao.getContentsForTableType(contentsDataType_1.ContentsDataType.TILES),
                attributes: this.contentsDao.getContentsForTableType(contentsDataType_1.ContentsDataType.ATTRIBUTES),
            };
            return tables;
        }
    };
    GeoPackage.prototype.getAttributesTables = function () {
        return this.contentsDao.getTables(contentsDataType_1.ContentsDataType.ATTRIBUTES);
    };
    GeoPackage.prototype.hasAttributeTable = function (attributeTableName) {
        var tables = this.getAttributesTables();
        return tables && tables.indexOf(attributeTableName) != -1;
    };
    /**
     *  Get the tile tables
     *  @returns {String[]} tile table names
     */
    GeoPackage.prototype.getTileTables = function () {
        var cd = this.contentsDao;
        if (!cd.isTableExists()) {
            return [];
        }
        return cd.getTables(contentsDataType_1.ContentsDataType.TILES);
    };
    /**
     * Checks if the tile table exists in the GeoPackage
     * @param  {String} tileTableName name of the table to query for
     * @returns {Boolean} indicates the existence of the tile table
     */
    GeoPackage.prototype.hasTileTable = function (tileTableName) {
        var tables = this.getTileTables();
        return tables && tables.indexOf(tileTableName) !== -1;
    };
    /**
     * Checks if the feature table exists in the GeoPackage
     * @param  {String} featureTableName name of the table to query for
     * @returns {Boolean} indicates the existence of the feature table
     */
    GeoPackage.prototype.hasFeatureTable = function (featureTableName) {
        var tables = this.getFeatureTables();
        return tables && tables.indexOf(featureTableName) != -1;
    };
    /**
     *  Get the feature tables
     *  @returns {String[]} feature table names
     */
    GeoPackage.prototype.getFeatureTables = function () {
        var cd = this.contentsDao;
        if (!cd.isTableExists()) {
            return [];
        }
        return cd.getTables(contentsDataType_1.ContentsDataType.FEATURES);
    };
    GeoPackage.prototype.isTable = function (tableName) {
        return !!this.connection.tableExists(tableName);
    };
    GeoPackage.prototype.isTableType = function (type, tableName) {
        return type === this.getTableType(tableName);
    };
    GeoPackage.prototype.getTableType = function (tableName) {
        var contents = this.getTableContents(tableName);
        if (contents) {
            return contents.data_type;
        }
    };
    GeoPackage.prototype.getTableContents = function (tableName) {
        return this.contentsDao.queryForId(tableName);
    };
    GeoPackage.prototype.dropTable = function (tableName) {
        return this.connection.dropTable(tableName);
    };
    /**
     * {@inheritDoc}
     */
    GeoPackage.prototype.deleteTable = function (table) {
        geoPackageExtensions_1.GeoPackageExtensions.deleteTableExtensions(this, table);
        this.contentsDao.deleteTable(table);
    };
    /**
     * {@inheritDoc}
     */
    GeoPackage.prototype.deleteTableQuietly = function (tableName) {
        try {
            this.deleteTable(tableName);
        }
        catch (e) {
            // eat
        }
    };
    GeoPackage.prototype.getTableCreator = function () {
        return this.tableCreator;
    };
    GeoPackage.prototype.index = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tables, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tables = this.getFeatureTables();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < tables.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.indexFeatureTable(tables[i])];
                    case 2:
                        if (!(_a.sent())) {
                            throw new Error('Unable to index table ' + tables[i]);
                        }
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, true];
                }
            });
        });
    };
    GeoPackage.prototype.indexFeatureTable = function (table, progress) {
        return __awaiter(this, void 0, void 0, function () {
            var featureDao, fti;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        featureDao = this.getFeatureDao(table);
                        fti = featureDao.featureTableIndex;
                        if (fti.isIndexed()) {
                            return [2 /*return*/, true];
                        }
                        return [4 /*yield*/, fti.index(progress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get a Feature DAO from Contents
     *  @returns {FeatureDao}
     * @param table
     */
    GeoPackage.prototype.getFeatureDao = function (table) {
        if (table instanceof contents_2.Contents) {
            table = this.contentsDao.getGeometryColumns(table);
        }
        else if (!(table instanceof geometryColumns_1.GeometryColumns)) {
            table = this.geometryColumnsDao.queryForTableName(table);
        }
        if (!table) {
            throw new Error('Non null Geometry Columns is required to create Feature DAO');
        }
        var tableReader = new featureTableReader_1.FeatureTableReader(table);
        var featureTable = tableReader.readFeatureTable(this);
        return new featureDao_1.FeatureDao(this, featureTable, table, this.metadataDao);
    };
    /**
     * Queries for GeoJSON features in a feature table
     * @param  {String}   tableName   Table name to query
     * @param  {BoundingBox}   boundingBox BoundingBox to query
     * @returns {Object[]} array of GeoJSON features
     */
    GeoPackage.prototype.queryForGeoJSONFeaturesInTable = function (tableName, boundingBox) {
        var e_1, _a;
        var featureDao = this.getFeatureDao(tableName);
        var features = [];
        var iterator = featureDao.queryForGeoJSONIndexedFeaturesWithBoundingBox(boundingBox);
        try {
            for (var iterator_1 = __values(iterator), iterator_1_1 = iterator_1.next(); !iterator_1_1.done; iterator_1_1 = iterator_1.next()) {
                var feature = iterator_1_1.value;
                features.push(feature);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (iterator_1_1 && !iterator_1_1.done && (_a = iterator_1.return)) _a.call(iterator_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return features;
    };
    /**
     * Create the Geometry Columns table if it does not already exist
     * @returns {Promise}
     */
    GeoPackage.prototype.createGeometryColumnsTable = function () {
        if (this.geometryColumnsDao.isTableExists()) {
            return true;
        }
        return this.tableCreator.createGeometryColumns();
    };
    /**
     * Get a Attribute DAO
     * @param  {Contents}   contents Contents
     * @returns {AttributesDao}
     */
    GeoPackage.prototype.getAttributeDao = function (table) {
        if (!(table instanceof contents_2.Contents)) {
            table = this.contentsDao.queryForId(table);
        }
        if (!table) {
            throw new Error('Non null Contents is required to create an Attributes DAO');
        }
        var reader = new attributesTableReader_1.AttributesTableReader(table.table_name);
        var attributeTable = reader.readTable(this.connection);
        attributeTable.setContents(table);
        return new attributesDao_1.AttributesDao(this, attributeTable);
    };
    /**
     * Create AttributesTable from properties
     * @param tableName
     * @param properties
     */
    GeoPackage.prototype.createAttributesTableFromProperties = function (tableName, properties) {
        var attributeColumns = [];
        var columnNumber = 0;
        var dataColumns = [];
        attributeColumns.push(userColumn_1.UserColumn.createPrimaryKeyColumn(columnNumber++, 'id'));
        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            attributeColumns.push(userColumn_1.UserColumn.createColumn(columnNumber++, property.name, geoPackageDataType_1.GeoPackageDataType.fromName(property.dataType)));
            if (property.dataColumn) {
                var dc = new dataColumns_1.DataColumns();
                dc.table_name = property.dataColumn.table_name;
                dc.column_name = property.dataColumn.column_name;
                dc.name = property.dataColumn.name;
                dc.title = property.dataColumn.title;
                dc.description = property.dataColumn.description;
                dc.mime_type = property.dataColumn.mime_type;
                dc.constraint_name = property.dataColumn.constraint_name;
                dataColumns.push(dc);
            }
        }
        return this.createAttributesTable(tableName, attributeColumns, new constraints_1.Constraints(), dataColumns);
    };
    /**
     * Create attributes table for these columns, will add id column if no primary key column is defined
     * @param tableName
     * @param additionalColumns
     * @param constraints
     * @param dataColumns
     */
    GeoPackage.prototype.createAttributesTable = function (tableName, additionalColumns, constraints, dataColumns) {
        var columns = [];
        // Check for primary key field
        if (additionalColumns.findIndex(function (c) { return c.isPrimaryKey(); }) === -1) {
            columns.push(attributesColumn_1.AttributesColumn.createPrimaryKeyColumn(attributesColumn_1.AttributesColumn.NO_INDEX, 'id'));
        }
        additionalColumns.forEach(function (c) {
            columns.push(c.copy());
        });
        // Build the user attributes table
        var table = new attributesTable_1.AttributesTable(tableName, columns);
        // Add unique constraints
        if (constraints !== null && constraints !== undefined) {
            table.addConstraints(constraints);
        }
        // Create the user attributes table
        this.tableCreator.createUserTable(table);
        try {
            // Create the contents
            var contents = new contents_2.Contents();
            contents.table_name = tableName;
            contents.data_type = contentsDataType_1.ContentsDataType.ATTRIBUTES;
            contents.identifier = tableName;
            contents.last_change = new Date().toISOString();
            this.contentsDao.create(contents);
            table.setContents(contents);
            // create passed in data columns
            if (dataColumns && dataColumns.length) {
                this.createDataColumns();
                var dataColumnsDao_2 = this.dataColumnsDao;
                dataColumns.forEach(function (dataColumn) {
                    dataColumnsDao_2.create(dataColumn);
                });
            }
        }
        catch (e) {
            this.deleteTableQuietly(tableName);
            throw new Error("Failed to create table and metadata: " + tableName);
        }
        return true;
    };
    /**
     * Create a media table with the properties specified.  These properties are added to the required columns
     * @param {module:geoPackage~GeoPackage} geopackage the geopackage object
     * @param {Object[]} properties properties to create columns from
     * @param {string} properties.name name of the column
     * @param {string} properties.dataType name of the data type
     * @return {Promise}
     */
    GeoPackage.prototype.createMediaTable = function (tableName, properties) {
        var relatedTables = this.relatedTablesExtension;
        var columns = [];
        var columnNumber = mediaTable_1.MediaTable.numRequiredColumns();
        if (properties) {
            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                columns.push(userColumn_1.UserColumn.createColumn(columnNumber++, property.name, geoPackageDataType_1.GeoPackageDataType.fromName(property.dataType), property.notNull, property.defaultValue, property.max));
            }
        }
        var mediaTable = mediaTable_1.MediaTable.create(tableName, columns);
        relatedTables.createRelatedTable(mediaTable);
        return relatedTables.getMediaDao(mediaTable);
    };
    GeoPackage.prototype.linkMedia = function (baseTableName, baseId, mediaTableName, mediaId) {
        return this.linkRelatedRows(baseTableName, baseId, mediaTableName, mediaId, relationType_1.RelationType.MEDIA);
    };
    /**
     * Links related rows together
     * @param baseId
     * @param baseTableName
     * @param relatedId
     * @param relatedTableName
     * @param  {string} relationType        relation type
     * @param  {string|UserMappingTable} [mappingTable]        mapping table
     * @param  {module:dao/columnValues~ColumnValues} [mappingColumnValues] column values
     * @return {number}
     */
    GeoPackage.prototype.linkRelatedRows = function (baseTableName, baseId, relatedTableName, relatedId, relationType, mappingTable, mappingColumnValues) {
        var rte = this.relatedTablesExtension;
        var relationship = rte
            .getRelationshipBuilder()
            .setBaseTableName(baseTableName)
            .setRelatedTableName(relatedTableName)
            .setRelationType(relationType);
        var mappingTableName;
        if (!mappingTable || typeof mappingTable === 'string') {
            mappingTable = mappingTable || baseTableName + '_' + relatedTableName;
            relationship.setMappingTableName(mappingTable);
            mappingTableName = mappingTable;
        }
        else {
            relationship.setUserMappingTable(mappingTable);
            mappingTableName = mappingTable.getTableName();
        }
        rte.addRelationship(relationship);
        var userMappingDao = rte.getMappingDao(mappingTableName);
        var userMappingRow = userMappingDao.newRow();
        userMappingRow.baseId = baseId;
        userMappingRow.relatedId = relatedId;
        for (var column in mappingColumnValues) {
            userMappingRow.setValueWithColumnName(column, mappingColumnValues[column]);
        }
        return userMappingDao.create(userMappingRow);
    };
    GeoPackage.prototype.getLinkedMedia = function (baseTableName, baseId) {
        var relationships = this.getRelatedRows(baseTableName, baseId);
        var mediaRelationships = [];
        for (var i = 0; i < relationships.length; i++) {
            var relationship = relationships[i];
            if (relationship.relation_name === relationType_1.RelationType.MEDIA.name) {
                for (var r = 0; r < relationship.mappingRows.length; r++) {
                    var row = relationship.mappingRows[r].row;
                    mediaRelationships.push(row);
                }
            }
        }
        return mediaRelationships;
    };
    /**
     * Adds a list of features to a FeatureTable. Inserts features from the list in batches, providing progress updates
     * after each batch completes.
     * @param  {module:geoPackage~GeoPackage}   geopackage open GeoPackage object
     * @param  {object}   features    GeoJSON features to add
     * @param  {string}   tableName  name of the table that will store the feature
     * @param {boolean} index updates the FeatureTableIndex extension if it exists
     * @param {number} batchSize how many features are inserted in a single transaction,
     * progress is published after each batch is inserted. 1000 is recommended, 100 is about 25% slower,
     * but provides more updates and keeps the thread open.
     * @param  {function}  progress  optional progress function that is called after a batch of features has been
     * processed. The number of features added is sent as an argument to that function.
     * @return {Promise<number>} number of features inserted
     */
    GeoPackage.prototype.addGeoJSONFeaturesToGeoPackage = function (features, tableName, index, batchSize, progress) {
        if (index === void 0) { index = false; }
        if (batchSize === void 0) { batchSize = 1000; }
        return __awaiter(this, void 0, void 0, function () {
            var inserted, featureDao, srs, geometryData, featureRow, emptyPoint, reprojectionNeeded, progressFunction, insertSql, stepFunction;
            var _this = this;
            return __generator(this, function (_a) {
                inserted = 0;
                featureDao = this.getFeatureDao(tableName);
                srs = featureDao.srs;
                featureRow = featureDao.newRow();
                emptyPoint = wkx_1.default.Geometry.parse('POINT EMPTY');
                reprojectionNeeded = !(srs.organization === projectionConstants_1.ProjectionConstants.EPSG && srs.organization_coordsys_id === projectionConstants_1.ProjectionConstants.EPSG_CODE_4326);
                progressFunction = function (featuresAdded) {
                    setTimeout((progress || function () { }), 0, featuresAdded);
                };
                insertSql = sqliteQueryBuilder_1.SqliteQueryBuilder.buildInsert("'" + featureDao.gpkgTableName + "'", featureRow);
                stepFunction = function (start, end, resolve) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        // execute step if there are still features
                        if (start < end) {
                            featureDao.connection.transaction(function () {
                                // builds the insert sql statement
                                var insertStatement = featureDao.connection.adapter.prepareStatement(insertSql);
                                // determine if indexing is needed
                                var fti;
                                var tableIndex;
                                if (index) {
                                    fti = featureDao.featureTableIndex;
                                    tableIndex = fti.tableIndex;
                                }
                                for (var i = start; i < end; i++) {
                                    var feature = features[i];
                                    featureRow = featureDao.newRow();
                                    geometryData = new geometryData_1.GeometryData();
                                    geometryData.setSrsId(srs.srs_id);
                                    if (reprojectionNeeded) {
                                        feature = reproject_1.default.reproject(feature, projectionConstants_1.ProjectionConstants.EPSG_4326, featureDao.projection);
                                    }
                                    var featureGeometry = typeof feature.geometry === 'string' ? JSON.parse(feature.geometry) : feature.geometry;
                                    geometryData.setGeometry(featureGeometry ? wkx_1.default.Geometry.parseGeoJSON(featureGeometry) : emptyPoint);
                                    featureRow.geometry = geometryData;
                                    for (var propertyKey in feature.properties) {
                                        if (Object.prototype.hasOwnProperty.call(feature.properties, propertyKey)) {
                                            featureRow.setValueWithColumnName(propertyKey, feature.properties[propertyKey]);
                                        }
                                    }
                                    // bind this feature's data to the insert statement and insert into the table
                                    var id = featureDao.connection.adapter.bindAndInsert(insertStatement, sqliteQueryBuilder_1.SqliteQueryBuilder.buildUpdateOrInsertObject(featureRow));
                                    inserted++;
                                    // if table index exists, be sure to index the row (note, rtree will run using a trigger)
                                    if (tableIndex != null) {
                                        fti.indexRow(tableIndex, id, geometryData);
                                    }
                                }
                                if (tableIndex != null) {
                                    fti.updateLastIndexed(tableIndex);
                                }
                                // close the prepared statement
                                featureDao.connection.adapter.closeStatement(insertStatement);
                            });
                            progressFunction(end);
                            setTimeout(function () {
                                stepFunction(end, Math.min(end + batchSize, features.length), resolve);
                            });
                        }
                        else {
                            resolve(inserted);
                        }
                        return [2 /*return*/];
                    });
                }); };
                return [2 /*return*/, new Promise(function (resolve) {
                        setTimeout(function () {
                            stepFunction(0, Math.min(batchSize, features.length), resolve);
                        });
                    })];
            });
        });
    };
    GeoPackage.prototype.addGeoJSONFeatureToGeoPackage = function (feature, tableName, index) {
        if (index === void 0) { index = false; }
        var featureDao = this.getFeatureDao(tableName);
        return this.addGeoJSONFeatureToGeoPackageWithFeatureDaoAndSrs(feature, featureDao, featureDao.srs, index);
    };
    /**
     * Adds a GeoJSON feature to the GeoPackage
     * @param  {module:geoPackage~GeoPackage}   geopackage open GeoPackage object
     * @param  {object}   feature    GeoJSON feature to add
     * @param  {string}   featureDao  feature dao for the table
     * @param  {string}   srs  srs of the table
     * @param {boolean} index updates the FeatureTableIndex extension if it exists
     */
    GeoPackage.prototype.addGeoJSONFeatureToGeoPackageWithFeatureDaoAndSrs = function (feature, featureDao, srs, index) {
        if (index === void 0) { index = false; }
        var featureRow = featureDao.newRow();
        var geometryData = new geometryData_1.GeometryData();
        geometryData.setSrsId(srs.srs_id);
        if (!(srs.organization === projectionConstants_1.ProjectionConstants.EPSG && srs.organization_coordsys_id === projectionConstants_1.ProjectionConstants.EPSG_CODE_4326)) {
            feature = reproject_1.default.reproject(feature, projectionConstants_1.ProjectionConstants.EPSG_4326, featureDao.projection);
        }
        var featureGeometry = typeof feature.geometry === 'string' ? JSON.parse(feature.geometry) : feature.geometry;
        if (featureGeometry !== null) {
            var geometry = wkx_1.default.Geometry.parseGeoJSON(featureGeometry);
            geometryData.setGeometry(geometry);
        }
        else {
            var temp = wkx_1.default.Geometry.parse('POINT EMPTY');
            geometryData.setGeometry(temp);
        }
        featureRow.geometry = geometryData;
        for (var propertyKey in feature.properties) {
            if (Object.prototype.hasOwnProperty.call(feature.properties, propertyKey)) {
                featureRow.setValueWithColumnName(propertyKey, feature.properties[propertyKey]);
            }
        }
        var id = featureDao.create(featureRow);
        if (index) {
            var fti = featureDao.featureTableIndex;
            var tableIndex = fti.tableIndex;
            if (!tableIndex)
                return id;
            fti.indexRow(tableIndex, id, geometryData);
            fti.updateLastIndexed(tableIndex);
        }
        return id;
    };
    GeoPackage.prototype.addAttributeRow = function (tableName, row) {
        var attributeDao = this.getAttributeDao(tableName);
        var attributeRow = attributeDao.getRow(row);
        return attributeDao.create(attributeRow);
    };
    /**
     * Create a simple attributes table with the properties specified.
     * @param {Object[]} properties properties to create columns from
     * @param {string} properties.name name of the column
     * @param {string} properties.dataType name of the data type
     * @return {Promise}
     */
    GeoPackage.prototype.createSimpleAttributesTable = function (tableName, properties) {
        var relatedTables = this.relatedTablesExtension;
        var columns = [];
        var columnNumber = simpleAttributesTable_1.SimpleAttributesTable.numRequiredColumns();
        if (properties) {
            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                columns.push(userColumn_1.UserColumn.createColumn(columnNumber++, property.name, geoPackageDataType_1.GeoPackageDataType.fromName(property.dataType), true));
            }
        }
        var simpleAttributesTable = simpleAttributesTable_1.SimpleAttributesTable.create(tableName, columns);
        relatedTables.createRelatedTable(simpleAttributesTable);
        return relatedTables.getSimpleAttributesDao(simpleAttributesTable);
    };
    GeoPackage.prototype.addMedia = function (tableName, dataBuffer, contentType, additionalProperties) {
        var relatedTables = this.relatedTablesExtension;
        var mediaDao = relatedTables.getMediaDao(tableName);
        var row = mediaDao.newRow();
        row.contentType = contentType;
        row.data = dataBuffer;
        for (var key in additionalProperties) {
            row.setValueWithColumnName(key, additionalProperties[key]);
        }
        return mediaDao.create(row);
    };
    GeoPackage.prototype.getRelatedRows = function (baseTableName, baseId) {
        return this.relatedTablesExtension.getRelatedRows(baseTableName, baseId);
    };
    /**
     * Create the given {@link module:features/user/featureTable~FeatureTable}
     * @param  {FeatureTable}   featureTable    feature table
     */
    GeoPackage.prototype.createUserFeatureTable = function (featureTable) {
        return this.tableCreator.createUserTable(featureTable);
    };
    GeoPackage.prototype.createFeatureTableFromProperties = function (tableName, properties) {
        var geometryColumn = new geometryColumns_1.GeometryColumns();
        geometryColumn.table_name = tableName;
        geometryColumn.column_name = 'geometry';
        geometryColumn.geometry_type_name = 'GEOMETRY';
        geometryColumn.z = 0;
        geometryColumn.m = 0;
        var columns = [];
        var columnNumber = 0;
        columns.push(featureColumn_1.FeatureColumn.createPrimaryKeyColumn(columnNumber++, 'id'));
        columns.push(featureColumn_1.FeatureColumn.createGeometryColumn(columnNumber++, geometryColumn.column_name, geometryType_1.GeometryType.GEOMETRY, false, null));
        for (var i = 0; properties && i < properties.length; i++) {
            var property = properties[i];
            columns.push(featureColumn_1.FeatureColumn.createColumn(columnNumber++, property.name, geoPackageDataType_1.GeoPackageDataType.fromName(property.dataType)));
        }
        return this.createFeatureTable(tableName, geometryColumn, columns);
    };
    GeoPackage.prototype.createFeatureTable = function (tableName, geometryColumns, featureColumns, boundingBox, srsId, dataColumns) {
        if (boundingBox === void 0) { boundingBox = new boundingBox_1.BoundingBox(-180, 180, -90, 90); }
        if (srsId === void 0) { srsId = projectionConstants_1.ProjectionConstants.EPSG_CODE_4326; }
        var srs = this.spatialReferenceSystemDao.getBySrsId(srsId);
        if (!srs) {
            throw new Error('Spatial reference system (' + srsId + ') is not defined.');
        }
        this.createGeometryColumnsTable();
        var geometryColumn;
        if (geometryColumns) {
            geometryColumn = geometryColumns;
        }
        else {
            geometryColumn = new geometryColumns_1.GeometryColumns();
            geometryColumn.table_name = tableName;
            geometryColumn.column_name = 'geometry';
            geometryColumn.geometry_type_name = 'GEOMETRY';
            geometryColumn.z = 0;
            geometryColumn.m = 0;
        }
        var columns = [];
        if (featureColumns && featureColumns.length > 0 && featureColumns[0] instanceof userColumn_1.UserColumn) {
            columns = featureColumns;
        }
        else {
            var columnNumber = 0;
            columns.push(featureColumn_1.FeatureColumn.createPrimaryKeyColumn(columnNumber++, 'id'));
            columns.push(featureColumn_1.FeatureColumn.createGeometryColumn(columnNumber++, geometryColumn.column_name, geometryType_1.GeometryType.GEOMETRY, false, null));
            for (var i = 0; featureColumns && i < featureColumns.length; i++) {
                var property = featureColumns[i];
                columns.push(featureColumn_1.FeatureColumn.createColumn(columnNumber++, property.name, geoPackageDataType_1.GeoPackageDataType.fromName(property.dataType)));
            }
        }
        var featureTable = new featureTable_1.FeatureTable(geometryColumn.table_name, geometryColumn.column_name, columns);
        this.createUserFeatureTable(featureTable);
        var contents = new contents_2.Contents();
        contents.table_name = geometryColumn.table_name;
        contents.data_type = contentsDataType_1.ContentsDataType.FEATURES;
        contents.identifier = geometryColumn.table_name;
        contents.last_change = new Date().toISOString();
        contents.min_x = boundingBox.minLongitude;
        contents.min_y = boundingBox.minLatitude;
        contents.max_x = boundingBox.maxLongitude;
        contents.max_y = boundingBox.maxLatitude;
        contents.srs_id = srsId;
        this.contentsDao.create(contents);
        geometryColumn.srs_id = srsId;
        this.geometryColumnsDao.create(geometryColumn);
        if (dataColumns) {
            this.createDataColumns();
            var dataColumnsDao_3 = this.dataColumnsDao;
            dataColumns.forEach(function (dataColumn) {
                dataColumnsDao_3.create(dataColumn);
            });
        }
        return true;
    };
    /**
     * Create the Tile Matrix Set table if it does not already exist
     * @returns {Promise} resolves when the table is created
     */
    GeoPackage.prototype.createTileMatrixSetTable = function () {
        if (this.tileMatrixSetDao.isTableExists()) {
            return true;
        }
        return this.tableCreator.createTileMatrixSet();
    };
    /**
     * Create the Tile Matrix table if it does not already exist
     * @returns {Promise} resolves when the table is created
     */
    GeoPackage.prototype.createTileMatrixTable = function () {
        if (this.tileMatrixDao.isTableExists()) {
            return true;
        }
        return this.tableCreator.createTileMatrix();
    };
    /**
     * Create the given tile table in this GeoPackage.
     *
     * @param  {module:tiles/user/tileTable~TileTable} tileTable
     * @return {object} the result of {@link module:db/geoPackageConnection~GeoPackageConnection#run}
     */
    GeoPackage.prototype.createTileTable = function (tileTable) {
        return this.tableCreator.createUserTable(tileTable);
    };
    /**
     * Adds a spatial reference system to the gpkg_spatial_ref_sys table to be used by feature and tile tables.
     * @param spatialReferenceSystem
     */
    GeoPackage.prototype.createSpatialReferenceSystem = function (spatialReferenceSystem) {
        projection_1.Projection.loadProjection([spatialReferenceSystem.organization.toUpperCase(), spatialReferenceSystem.organization_coordsys_id].join(':'), spatialReferenceSystem.definition);
        this.spatialReferenceSystemDao.create(spatialReferenceSystem);
    };
    /**
     * Create a new [tile table]{@link module:tiles/user/tileTable~TileTable} in this GeoPackage.
     *
     * @param {String} tableName tile table name
     * @param {BoundingBox} contentsBoundingBox bounding box of the contents table
     * @param {Number} contentsSrsId srs id of the contents table
     * @param {BoundingBox} tileMatrixSetBoundingBox bounding box of the matrix set
     * @param {Number} tileMatrixSetSrsId srs id of the matrix set
     * @returns {TileMatrixSet} `Promise` of the created {@link module:tiles/matrixset~TileMatrixSet}
     */
    GeoPackage.prototype.createTileTableWithTableName = function (tableName, contentsBoundingBox, contentsSrsId, tileMatrixSetBoundingBox, tileMatrixSetSrsId) {
        var srs = this.spatialReferenceSystemDao.getBySrsId(contentsSrsId);
        if (!srs) {
            throw new Error('Spatial reference system (' + contentsSrsId + ') is not defined.');
        }
        srs = this.spatialReferenceSystemDao.getBySrsId(tileMatrixSetSrsId);
        if (!srs) {
            throw new Error('Spatial reference system (' + tileMatrixSetSrsId + ') is not defined.');
        }
        var columns = tileTable_1.TileTable.createRequiredColumns(0);
        var tileTable = new tileTable_1.TileTable(tableName, columns);
        var contents = new contents_2.Contents();
        contents.table_name = tableName;
        contents.data_type = contentsDataType_1.ContentsDataType.TILES;
        contents.identifier = tableName;
        contents.last_change = new Date().toISOString();
        contents.min_x = contentsBoundingBox.minLongitude;
        contents.min_y = contentsBoundingBox.minLatitude;
        contents.max_x = contentsBoundingBox.maxLongitude;
        contents.max_y = contentsBoundingBox.maxLatitude;
        contents.srs_id = contentsSrsId;
        var tileMatrixSet = new tileMatrixSet_1.TileMatrixSet();
        tileMatrixSet.contents = contents;
        tileMatrixSet.srs_id = tileMatrixSetSrsId;
        tileMatrixSet.min_x = tileMatrixSetBoundingBox.minLongitude;
        tileMatrixSet.min_y = tileMatrixSetBoundingBox.minLatitude;
        tileMatrixSet.max_x = tileMatrixSetBoundingBox.maxLongitude;
        tileMatrixSet.max_y = tileMatrixSetBoundingBox.maxLatitude;
        this.createTileMatrixSetTable();
        this.createTileMatrixTable();
        this.createTileTable(tileTable);
        this.contentsDao.create(contents);
        this.tileMatrixSetDao.create(tileMatrixSet);
        return tileMatrixSet;
    };
    /**
     * Create the [tables and rows](https://www.geopackage.org/spec121/index.html#tiles)
     * necessary to store tiles according to the ubiquitous [XYZ web/slippy-map tiles](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames) scheme.
     * The extent for the [contents table]{@link module:core/contents~Contents} row,
     * `contentsBoundingBox`, is [informational only](https://www.geopackage.org/spec121/index.html#gpkg_contents_cols),
     * and need not match the [tile matrix set]{@link module:tiles/matrixset~TileMatrixSet}
     * extent, `tileMatrixSetBoundingBox`, which should be the precise bounding box
     * used to calculate the tile row and column coordinates of all tiles in the
     * tile set.  The two SRS ID parameters, `contentsSrsId` and `tileMatrixSetSrsId`,
     * must match, however.  See {@link module:tiles/matrixset~TileMatrixSet} for
     * more information about how GeoPackage consumers use the bouding boxes for a
     * tile set.
     *
     * @param {string} tableName the name of the table that will store the tiles
     * @param {BoundingBox} contentsBoundingBox the bounds stored in the [`gpkg_contents`]{@link module:core/contents~Contents} table row for the tile matrix set
     * @param {SRSRef} contentsSrsId the ID of a [spatial reference system]{@link module:core/srs~SpatialReferenceSystem}; must match `tileMatrixSetSrsId`
     * @param {BoundingBox} tileMatrixSetBoundingBox the bounds stored in the [`gpkg_tile_matrix_set`]{@link module:tiles/matrixset~TileMatrixSet} table row
     * @param {SRSRef} tileMatrixSetSrsId the ID of a [spatial reference system]{@link module:core/srs~SpatialReferenceSystem}
     *   for the [tile matrix set](https://www.geopackage.org/spec121/index.html#_tile_matrix_set) table; must match `contentsSrsId`
     * @param {number} minZoom the zoom level of the lowest resolution [tile matrix]{@link module:tiles/matrix~TileMatrix} in the tile matrix set
     * @param {number} maxZoom the zoom level of the highest resolution [tile matrix]{@link module:tiles/matrix~TileMatrix} in the tile matrix set
     * @param tileSize the width and height in pixels of the tile images; defaults to 256
     * @returns {TileMatrixSet} the created {@link module:tiles/matrixset~TileMatrixSet} object, or rejects with an `Error`
     *
     */
    GeoPackage.prototype.createStandardWGS84TileTable = function (tableName, contentsBoundingBox, contentsSrsId, tileMatrixSetBoundingBox, tileMatrixSetSrsId, minZoom, maxZoom, tileSize) {
        if (tileSize === void 0) { tileSize = 256; }
        var wgs84 = this.spatialReferenceSystemDao.getByOrganizationAndCoordSysId(projectionConstants_1.ProjectionConstants.EPSG, projectionConstants_1.ProjectionConstants.EPSG_CODE_4326);
        if (!wgs84) {
            this.spatialReferenceSystemDao.createWebMercator();
            wgs84 = this.spatialReferenceSystemDao.getByOrganizationAndCoordSysId(projectionConstants_1.ProjectionConstants.EPSG, projectionConstants_1.ProjectionConstants.EPSG_CODE_4326);
        }
        var wgs84SrsId = wgs84.srs_id;
        var srs = this.spatialReferenceSystemDao.getBySrsId(contentsSrsId);
        if (!srs) {
            throw new Error('Spatial reference system (' + contentsSrsId + ') is not defined.');
        }
        srs = this.spatialReferenceSystemDao.getBySrsId(tileMatrixSetSrsId);
        if (!srs) {
            throw new Error('Spatial reference system (' + tileMatrixSetSrsId + ') is not defined.');
        }
        if (contentsSrsId !== wgs84SrsId) {
            var srsDao = new spatialReferenceSystemDao_1.SpatialReferenceSystemDao(this);
            var from = srsDao.getBySrsId(contentsSrsId).projection;
            contentsBoundingBox = contentsBoundingBox.projectBoundingBox(from, projectionConstants_1.ProjectionConstants.EPSG_4326);
        }
        if (tileMatrixSetSrsId !== wgs84SrsId) {
            var srsDao = new spatialReferenceSystemDao_1.SpatialReferenceSystemDao(this);
            var from = srsDao.getBySrsId(tileMatrixSetSrsId).projection;
            tileMatrixSetBoundingBox = tileMatrixSetBoundingBox.projectBoundingBox(from, projectionConstants_1.ProjectionConstants.EPSG_4326);
        }
        var tileMatrixSet = this.createTileTableWithTableName(tableName, contentsBoundingBox, wgs84SrsId, tileMatrixSetBoundingBox, wgs84SrsId);
        this.createStandardWGS84TileMatrix(tileMatrixSetBoundingBox, tileMatrixSet, minZoom, maxZoom, tileSize);
        return tileMatrixSet;
    };
    /**
     * Create the tables and rows necessary to store tiles in a {@link module:tiles/matrixset~TileMatrixSet}.
     * This will create a [tile matrix row]{@link module:tiles/matrix~TileMatrix}
     * for every integral zoom level in the range `[minZoom..maxZoom]`.
     *
     * @param {BoundingBox} wgs84BoundingBox
     * @param {TileMatrixSet} tileMatrixSet
     * @param {number} minZoom
     * @param {number} maxZoom
     * @param {number} [tileSize=256] optional tile size in pixels
     * @returns {module:geoPackage~GeoPackage} `this` `GeoPackage`
     */
    GeoPackage.prototype.createStandardWGS84TileMatrix = function (wgs84BoundingBox, tileMatrixSet, minZoom, maxZoom, tileSize) {
        if (tileSize === void 0) { tileSize = 256; }
        tileSize = tileSize || 256;
        var tileMatrixDao = this.tileMatrixDao;
        for (var zoom = minZoom; zoom <= maxZoom; zoom++) {
            this.createWGS84TileMatrixRow(wgs84BoundingBox, tileMatrixSet, tileMatrixDao, zoom, tileSize);
        }
        return this;
    };
    /**
     * Create the [tables and rows](https://www.geopackage.org/spec121/index.html#tiles)
     * necessary to store tiles according to the ubiquitous [XYZ web/slippy-map tiles](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames) scheme.
     * The extent for the [contents table]{@link module:core/contents~Contents} row,
     * `contentsBoundingBox`, is [informational only](https://www.geopackage.org/spec121/index.html#gpkg_contents_cols),
     * and need not match the [tile matrix set]{@link module:tiles/matrixset~TileMatrixSet}
     * extent, `tileMatrixSetBoundingBox`, which should be the precise bounding box
     * used to calculate the tile row and column coordinates of all tiles in the
     * tile set.  The two SRS ID parameters, `contentsSrsId` and `tileMatrixSetSrsId`,
     * must match, however.  See {@link module:tiles/matrixset~TileMatrixSet} for
     * more information about how GeoPackage consumers use the bouding boxes for a
     * tile set.
     *
     * @param {string} tableName the name of the table that will store the tiles
     * @param {BoundingBox} contentsBoundingBox the bounds stored in the [`gpkg_contents`]{@link module:core/contents~Contents} table row for the tile matrix set
     * @param {SRSRef} contentsSrsId the ID of a [spatial reference system]{@link module:core/srs~SpatialReferenceSystem}; must match `tileMatrixSetSrsId`
     * @param {BoundingBox} tileMatrixSetBoundingBox the bounds stored in the [`gpkg_tile_matrix_set`]{@link module:tiles/matrixset~TileMatrixSet} table row
     * @param {SRSRef} tileMatrixSetSrsId the ID of a [spatial reference system]{@link module:core/srs~SpatialReferenceSystem}
     *   for the [tile matrix set](https://www.geopackage.org/spec121/index.html#_tile_matrix_set) table; must match `contentsSrsId`
     * @param {number} minZoom the zoom level of the lowest resolution [tile matrix]{@link module:tiles/matrix~TileMatrix} in the tile matrix set
     * @param {number} maxZoom the zoom level of the highest resolution [tile matrix]{@link module:tiles/matrix~TileMatrix} in the tile matrix set
     * @param tileSize the width and height in pixels of the tile images; defaults to 256
     * @returns {TileMatrixSet} the created {@link module:tiles/matrixset~TileMatrixSet} object, or rejects with an `Error`
     *
     * @todo make `tileMatrixSetSrsId` optional because it always has to be the same anyway
     */
    GeoPackage.prototype.createStandardWebMercatorTileTable = function (tableName, contentsBoundingBox, contentsSrsId, tileMatrixSetBoundingBox, tileMatrixSetSrsId, minZoom, maxZoom, tileSize) {
        if (tileSize === void 0) { tileSize = 256; }
        var webMercator = this.spatialReferenceSystemDao.getByOrganizationAndCoordSysId(projectionConstants_1.ProjectionConstants.EPSG, projectionConstants_1.ProjectionConstants.EPSG_CODE_3857);
        if (!webMercator) {
            this.spatialReferenceSystemDao.createWebMercator();
            webMercator = this.spatialReferenceSystemDao.getByOrganizationAndCoordSysId(projectionConstants_1.ProjectionConstants.EPSG, projectionConstants_1.ProjectionConstants.EPSG_CODE_3857);
        }
        var webMercatorSrsId = webMercator.srs_id;
        var srs = this.spatialReferenceSystemDao.getBySrsId(contentsSrsId);
        if (!srs) {
            throw new Error('Spatial reference system (' + contentsSrsId + ') is not defined.');
        }
        srs = this.spatialReferenceSystemDao.getBySrsId(tileMatrixSetSrsId);
        if (!srs) {
            throw new Error('Spatial reference system (' + tileMatrixSetSrsId + ') is not defined.');
        }
        if (contentsSrsId !== webMercatorSrsId) {
            var srsDao = new spatialReferenceSystemDao_1.SpatialReferenceSystemDao(this);
            var from = srsDao.getBySrsId(contentsSrsId).projection;
            contentsBoundingBox = contentsBoundingBox.projectBoundingBox(from, projectionConstants_1.ProjectionConstants.EPSG_3857);
        }
        if (tileMatrixSetSrsId !== webMercatorSrsId) {
            var srsDao = new spatialReferenceSystemDao_1.SpatialReferenceSystemDao(this);
            var from = srsDao.getBySrsId(tileMatrixSetSrsId).projection;
            tileMatrixSetBoundingBox = tileMatrixSetBoundingBox.projectBoundingBox(from, projectionConstants_1.ProjectionConstants.EPSG_3857);
        }
        var tileMatrixSet = this.createTileTableWithTableName(tableName, contentsBoundingBox, webMercatorSrsId, tileMatrixSetBoundingBox, webMercatorSrsId);
        this.createStandardWebMercatorTileMatrix(tileMatrixSetBoundingBox, tileMatrixSet, minZoom, maxZoom, tileSize);
        return tileMatrixSet;
    };
    /**
     * Create the [tables and rows](https://www.geopackage.org/spec121/index.html#tiles)
     * necessary to store tiles according to the ubiquitous [XYZ web/slippy-map tiles](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames) scheme.
     * The extent for the [contents table]{@link module:core/contents~Contents} row,
     * `contentsBoundingBox`, is [informational only](https://www.geopackage.org/spec121/index.html#gpkg_contents_cols),
     * and need not match the [tile matrix set]{@link module:tiles/matrixset~TileMatrixSet}
     * extent, `tileMatrixSetBoundingBox`, which should be the precise bounding box
     * used to calculate the tile row and column coordinates of all tiles in the
     * tile set.
     *
     * @param {string} tableName the name of the table that will store the tiles
     * @param {BoundingBox} contentsBoundingBox the bounds stored in the [`gpkg_contents`]{@link module:core/contents~Contents} table row for the tile matrix set. MUST BE EPSG:3857
     * @param {BoundingBox} tileMatrixSetBoundingBox the bounds stored in the [`gpkg_tile_matrix_set`]{@link module:tiles/matrixset~TileMatrixSet} table row. MUST BE EPSG:3857
     * @param {Set<number>} zoomLevels create tile of all resolutions in the set.
     * @param tileSize the width and height in pixels of the tile images; defaults to 256
     * @returns {Promise} a `Promise` that resolves with the created {@link module:tiles/matrixset~TileMatrixSet} object, or rejects with an `Error`
     *
     * @todo make `tileMatrixSetSrsId` optional because it always has to be the same anyway
     */
    GeoPackage.prototype.createStandardWebMercatorTileTableWithZoomLevels = function (tableName, contentsBoundingBox, tileMatrixSetBoundingBox, zoomLevels, tileSize) {
        if (tileSize === void 0) { tileSize = 256; }
        return __awaiter(this, void 0, void 0, function () {
            var webMercator, webMercatorSrsId, tileMatrixSet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        webMercator = this.spatialReferenceSystemDao.getByOrganizationAndCoordSysId(projectionConstants_1.ProjectionConstants.EPSG, projectionConstants_1.ProjectionConstants.EPSG_CODE_3857);
                        if (!webMercator) {
                            this.spatialReferenceSystemDao.createWebMercator();
                            webMercator = this.spatialReferenceSystemDao.getByOrganizationAndCoordSysId(projectionConstants_1.ProjectionConstants.EPSG, projectionConstants_1.ProjectionConstants.EPSG_CODE_3857);
                        }
                        webMercatorSrsId = webMercator.srs_id;
                        return [4 /*yield*/, this.createTileTableWithTableName(tableName, contentsBoundingBox, webMercatorSrsId, tileMatrixSetBoundingBox, webMercatorSrsId)];
                    case 1:
                        tileMatrixSet = _a.sent();
                        this.createStandardWebMercatorTileMatrixWithZoomLevels(tileMatrixSetBoundingBox, tileMatrixSet, zoomLevels, tileSize);
                        return [2 /*return*/, tileMatrixSet];
                }
            });
        });
    };
    /**
     * Create the tables and rows necessary to store tiles in a {@link module:tiles/matrixset~TileMatrixSet}.
     * This will create a [tile matrix row]{@link module:tiles/matrix~TileMatrix}
     * for every integral zoom level in the range `[minZoom..maxZoom]`.
     *
     * @param {BoundingBox} epsg3857TileBoundingBox
     * @param {TileMatrixSet} tileMatrixSet
     * @param {number} minZoom
     * @param {number} maxZoom
     * @param {number} [tileSize=256] optional tile size in pixels
     * @returns {module:geoPackage~GeoPackage} `this` `GeoPackage`
     */
    GeoPackage.prototype.createStandardWebMercatorTileMatrix = function (epsg3857TileBoundingBox, tileMatrixSet, minZoom, maxZoom, tileSize) {
        if (tileSize === void 0) { tileSize = 256; }
        tileSize = tileSize || 256;
        var tileMatrixDao = this.tileMatrixDao;
        for (var zoom = minZoom; zoom <= maxZoom; zoom++) {
            this.createTileMatrixRow(epsg3857TileBoundingBox, tileMatrixSet, tileMatrixDao, zoom, tileSize);
        }
        return this;
    };
    /**
     * Create the tables and rows necessary to store tiles in a {@link module:tiles/matrixset~TileMatrixSet}.
     * This will create a [tile matrix row]{@link module:tiles/matrix~TileMatrix}
     * for every item in the set zoomLevels.
     *
     * @param {BoundingBox} epsg3857TileBoundingBox
     * @param {TileMatrixSet} tileMatrixSet
     * @param {Set<number>} zoomLevels
     * @param {number} [tileSize=256] optional tile size in pixels
     * @returns {module:geoPackage~GeoPackage} `this` `GeoPackage`
     */
    GeoPackage.prototype.createStandardWebMercatorTileMatrixWithZoomLevels = function (epsg3857TileBoundingBox, tileMatrixSet, zoomLevels, tileSize) {
        var _this = this;
        if (tileSize === void 0) { tileSize = 256; }
        tileSize = tileSize || 256;
        var tileMatrixDao = this.tileMatrixDao;
        zoomLevels.forEach(function (zoomLevel) {
            _this.createTileMatrixRow(epsg3857TileBoundingBox, tileMatrixSet, tileMatrixDao, zoomLevel, tileSize);
        });
        return this;
    };
    /**
     * Adds row to tileMatrixDao
     *
     * @param {BoundingBox} epsg4326TileBoundingBox
     * @param {TileMatrixSet} tileMatrixSet
     * @param {TileMatrixDao} tileMatrixDao
     * @param {number} zoomLevel
     * @param {number} [tileSize=256]
     * @returns {number}
     * @memberof GeoPackage
     */
    GeoPackage.prototype.createWGS84TileMatrixRow = function (epsg4326TileBoundingBox, tileMatrixSet, tileMatrixDao, zoomLevel, tileSize) {
        if (tileSize === void 0) { tileSize = 256; }
        var box = tileBoundingBoxUtils_1.TileBoundingBoxUtils.wgs84TileBox(epsg4326TileBoundingBox, zoomLevel);
        var matrixWidth = box.maxLongitude - box.minLongitude + 1;
        var matrixHeight = box.maxLatitude - box.minLatitude + 1;
        var pixelXSize = (epsg4326TileBoundingBox.maxLongitude - epsg4326TileBoundingBox.minLongitude) / matrixWidth / tileSize;
        var pixelYSize = (epsg4326TileBoundingBox.maxLatitude - epsg4326TileBoundingBox.minLatitude) / matrixHeight / tileSize;
        var tileMatrix = new tileMatrix_1.TileMatrix();
        tileMatrix.table_name = tileMatrixSet.table_name;
        tileMatrix.zoom_level = zoomLevel;
        tileMatrix.matrix_width = matrixWidth;
        tileMatrix.matrix_height = matrixHeight;
        tileMatrix.tile_width = tileSize;
        tileMatrix.tile_height = tileSize;
        tileMatrix.pixel_x_size = pixelXSize;
        tileMatrix.pixel_y_size = pixelYSize;
        return tileMatrixDao.create(tileMatrix);
    };
    /**
     * Adds row to tileMatrixDao
     *
     * @param {BoundingBox} epsg3857TileBoundingBox
     * @param {TileMatrixSet} tileMatrixSet
     * @param {TileMatrixDao} tileMatrixDao
     * @param {number} zoomLevel
     * @param {number} [tileSize=256]
     * @returns {number}
     * @memberof GeoPackage
     */
    GeoPackage.prototype.createTileMatrixRow = function (epsg3857TileBoundingBox, tileMatrixSet, tileMatrixDao, zoomLevel, tileSize) {
        if (tileSize === void 0) { tileSize = 256; }
        var box = tileBoundingBoxUtils_1.TileBoundingBoxUtils.webMercatorTileBox(epsg3857TileBoundingBox, zoomLevel);
        var matrixWidth = box.maxLongitude - box.minLongitude + 1;
        var matrixHeight = box.maxLatitude - box.minLatitude + 1;
        var pixelXSize = (epsg3857TileBoundingBox.maxLongitude - epsg3857TileBoundingBox.minLongitude) / matrixWidth / tileSize;
        var pixelYSize = (epsg3857TileBoundingBox.maxLatitude - epsg3857TileBoundingBox.minLatitude) / matrixHeight / tileSize;
        var tileMatrix = new tileMatrix_1.TileMatrix();
        tileMatrix.table_name = tileMatrixSet.table_name;
        tileMatrix.zoom_level = zoomLevel;
        tileMatrix.matrix_width = matrixWidth;
        tileMatrix.matrix_height = matrixHeight;
        tileMatrix.tile_width = tileSize;
        tileMatrix.tile_height = tileSize;
        tileMatrix.pixel_x_size = pixelXSize;
        tileMatrix.pixel_y_size = pixelYSize;
        return tileMatrixDao.create(tileMatrix);
    };
    /**
     * Adds a tile to the GeoPackage
     * @param  {object}   tileStream       Byte array or Buffer containing the tile bytes
     * @param  {String}   tableName  Table name to add the tile to
     * @param  {Number}   zoom       zoom level of this tile
     * @param  {Number}   tileRow    row of this tile
     * @param  {Number}   tileColumn column of this tile
     */
    GeoPackage.prototype.addTile = function (tileStream, tableName, zoom, tileRow, tileColumn) {
        var tileDao = this.getTileDao(tableName);
        var newRow = tileDao.newRow();
        newRow.zoomLevel = zoom;
        newRow.tileColumn = tileColumn;
        newRow.tileRow = tileRow;
        newRow.tileData = tileStream;
        return tileDao.create(newRow);
    };
    /**
     * Gets a tile from the specified table
     * @param  {string}   table      name of the table to get the tile from
     * @param  {Number}   zoom       zoom level of the tile
     * @param  {Number}   tileRow    row of the tile
     * @param  {Number}   tileColumn column of the tile
     *
     * @todo jsdoc return value
     */
    GeoPackage.prototype.getTileFromTable = function (table, zoom, tileRow, tileColumn) {
        var tileDao = this.getTileDao(table);
        return tileDao.queryForTile(tileColumn, tileRow, zoom);
    };
    /**
     * Gets the tiles in the EPSG:4326 bounding box
     * @param  {module:geoPackage~GeoPackage}   geopackage open GeoPackage object
     * @param  {string}   table      name of the tile table
     * @param  {Number}   zoom       Zoom of the tiles to query for
     * @param  {Number}   west       EPSG:4326 western boundary
     * @param  {Number}   east       EPSG:4326 eastern boundary
     * @param  {Number}   south      EPSG:4326 southern boundary
     * @param  {Number}   north      EPSG:4326 northern boundary
     */
    GeoPackage.prototype.getTilesInBoundingBox = function (table, zoom, west, east, south, north) {
        var e_2, _a;
        var tiles = {
            columns: [],
            srs: undefined,
            tiles: [],
            west: undefined,
            east: undefined,
            south: undefined,
            north: undefined,
            zoom: undefined,
        };
        var tileDao = this.getTileDao(table);
        if (zoom < tileDao.minZoom || zoom > tileDao.maxZoom) {
            return;
        }
        for (var i = 0; i < tileDao.table.getUserColumns().getColumns().length; i++) {
            var column = tileDao.table.getUserColumns().getColumns()[i];
            tiles.columns.push({
                index: column.index,
                name: column.name,
                max: column.max,
                min: column.min,
                notNull: column.notNull,
                primaryKey: column.primaryKey,
            });
        }
        var srs = tileDao.srs;
        tiles.srs = srs;
        tiles.tiles = [];
        var tms = tileDao.tileMatrixSet;
        var tm = tileDao.getTileMatrixWithZoomLevel(zoom);
        if (!tm) {
            return tiles;
        }
        var mapBoundingBox = new boundingBox_1.BoundingBox(Math.max(-180, west), Math.min(east, 180), south, north);
        tiles.west = Math.max(-180, west).toFixed(2);
        tiles.east = Math.min(east, 180).toFixed(2);
        tiles.south = south.toFixed(2);
        tiles.north = north.toFixed(2);
        tiles.zoom = zoom;
        mapBoundingBox = mapBoundingBox.projectBoundingBox(projectionConstants_1.ProjectionConstants.EPSG_4326, tileDao.srs.organization.toUpperCase() + ':' + tileDao.srs.organization_coordsys_id);
        var grid = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getTileGridWithTotalBoundingBox(tms.boundingBox, tm.matrix_width, tm.matrix_height, mapBoundingBox);
        var iterator = tileDao.queryByTileGrid(grid, zoom);
        try {
            for (var iterator_2 = __values(iterator), iterator_2_1 = iterator_2.next(); !iterator_2_1.done; iterator_2_1 = iterator_2.next()) {
                var row = iterator_2_1.value;
                var tile = {};
                tile.tableName = table;
                tile.id = row.id;
                var tileBB = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getTileBoundingBox(tms.boundingBox, tm, row.tileColumn, row.row);
                tile.minLongitude = tileBB.minLongitude;
                tile.maxLongitude = tileBB.maxLongitude;
                tile.minLatitude = tileBB.minLatitude;
                tile.maxLatitude = tileBB.maxLatitude;
                tile.projection = tileDao.srs.organization.toUpperCase() + ':' + tileDao.srs.organization_coordsys_id;
                tile.values = [];
                for (var i = 0; i < tiles.columns.length; i++) {
                    var value = row.values[tiles.columns[i].name];
                    if (tiles.columns[i].name === 'tile_data') {
                        tile.values.push('data');
                    }
                    else if (value === null || value === 'null') {
                        tile.values.push('');
                    }
                    else {
                        tile.values.push(value.toString());
                        tile[tiles.columns[i].name] = value;
                    }
                }
                tiles.tiles.push(tile);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (iterator_2_1 && !iterator_2_1.done && (_a = iterator_2.return)) _a.call(iterator_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return tiles;
    };
    /**
     * Gets the tiles in the EPSG:4326 bounding box
     * @param  {module:geoPackage~GeoPackage}   geopackage open GeoPackage object
     * @param  {string}   table      name of the tile table
     * @param  {Number}   webZoom       Zoom of the tiles to query for
     * @param  {Number}   west       EPSG:4326 western boundary
     * @param  {Number}   east       EPSG:4326 eastern boundary
     * @param  {Number}   south      EPSG:4326 southern boundary
     * @param  {Number}   north      EPSG:4326 northern boundary
     */
    GeoPackage.prototype.getTilesInBoundingBoxWebZoom = function (table, webZoom, west, east, south, north) {
        var e_3, _a;
        var tiles = {
            columns: [],
            srs: undefined,
            tiles: [],
            west: undefined,
            east: undefined,
            south: undefined,
            north: undefined,
            zoom: undefined,
        };
        var tileDao = this.getTileDao(table);
        if (webZoom < tileDao.minWebMapZoom || webZoom > tileDao.maxWebMapZoom) {
            return;
        }
        tiles.columns = [];
        for (var i = 0; i < tileDao.table.getUserColumns().getColumns().length; i++) {
            var column = tileDao.table.getUserColumns().getColumns()[i];
            tiles.columns.push({
                index: column.index,
                name: column.name,
                max: column.max,
                min: column.min,
                notNull: column.notNull,
                primaryKey: column.primaryKey,
            });
        }
        var srs = tileDao.srs;
        tiles.srs = srs;
        tiles.tiles = [];
        var zoom = tileDao.webZoomToGeoPackageZoom(webZoom);
        var tms = tileDao.tileMatrixSet;
        var tm = tileDao.getTileMatrixWithZoomLevel(zoom);
        if (!tm) {
            return tiles;
        }
        var mapBoundingBox = new boundingBox_1.BoundingBox(Math.max(-180, west), Math.min(east, 180), south, north);
        tiles.west = Math.max(-180, west).toFixed(2);
        tiles.east = Math.min(east, 180).toFixed(2);
        tiles.south = south.toFixed(2);
        tiles.north = north.toFixed(2);
        tiles.zoom = zoom;
        mapBoundingBox = mapBoundingBox.projectBoundingBox(projectionConstants_1.ProjectionConstants.EPSG_4326, tileDao.srs.organization.toUpperCase() + ':' + tileDao.srs.organization_coordsys_id);
        var grid = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getTileGridWithTotalBoundingBox(tms.boundingBox, tm.matrix_width, tm.matrix_height, mapBoundingBox);
        var iterator = tileDao.queryByTileGrid(grid, zoom);
        try {
            for (var iterator_3 = __values(iterator), iterator_3_1 = iterator_3.next(); !iterator_3_1.done; iterator_3_1 = iterator_3.next()) {
                var row = iterator_3_1.value;
                var tile = {
                    tableName: undefined,
                    id: undefined,
                    minLongitude: undefined,
                    maxLongitude: undefined,
                    minLatitude: undefined,
                    maxLatitude: undefined,
                    projection: undefined,
                    values: [],
                };
                tile.tableName = table;
                tile.id = row.id;
                var tileBB = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getTileBoundingBox(tms.boundingBox, tm, row.tileColumn, row.row);
                tile.minLongitude = tileBB.minLongitude;
                tile.maxLongitude = tileBB.maxLongitude;
                tile.minLatitude = tileBB.minLatitude;
                tile.maxLatitude = tileBB.maxLatitude;
                tile.projection = tileDao.srs.organization.toUpperCase() + ':' + tileDao.srs.organization_coordsys_id;
                tile.values = [];
                for (var i = 0; i < tiles.columns.length; i++) {
                    var value = row.values[tiles.columns[i].name];
                    if (tiles.columns[i].name === 'tile_data') {
                        tile.values.push('data');
                    }
                    else if (value === null || value === 'null') {
                        tile.values.push('');
                    }
                    else {
                        tile.values.push(value.toString());
                        tile[tiles.columns[i].name] = value;
                    }
                }
                tiles.tiles.push(tile);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (iterator_3_1 && !iterator_3_1.done && (_a = iterator_3.return)) _a.call(iterator_3);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return tiles;
    };
    GeoPackage.prototype.getFeatureTileFromXYZ = function (table, x, y, z, width, height) {
        return __awaiter(this, void 0, void 0, function () {
            var featureDao, ft;
            return __generator(this, function (_a) {
                x = Number(x);
                y = Number(y);
                z = Number(z);
                width = Number(width);
                height = Number(height);
                featureDao = this.getFeatureDao(table);
                if (!featureDao)
                    return [2 /*return*/];
                ft = new features_1.FeatureTiles(featureDao, width, height);
                return [2 /*return*/, ft.drawTile(x, y, z)];
            });
        });
    };
    GeoPackage.prototype.getClosestFeatureInXYZTile = function (table, x, y, z, latitude, longitude) {
        var e_4, _a;
        x = Number(x);
        y = Number(y);
        z = Number(z);
        var featureDao = this.getFeatureDao(table);
        if (!featureDao)
            return;
        var ft = new features_1.FeatureTiles(featureDao, 256, 256);
        var tileCount = ft.getFeatureCountXYZ(x, y, z);
        var boundingBox = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getWebMercatorBoundingBoxFromXYZ(x, y, z);
        boundingBox = boundingBox.projectBoundingBox(projectionConstants_1.ProjectionConstants.EPSG_3857, projectionConstants_1.ProjectionConstants.EPSG_4326);
        if (tileCount > 10000) {
            // too many, send back the entire tile
            // add the goepackage name and table
            var gj = boundingBox.toGeoJSON();
            gj.feature_count = tileCount;
            gj.coverage = true;
            gj.gp_table = table;
            gj.gp_name = this.name;
            return gj;
        }
        var ne = [boundingBox.maxLongitude, boundingBox.maxLatitude];
        var sw = [boundingBox.minLongitude, boundingBox.minLatitude];
        var width = ne[0] - sw[0];
        var widthPerPixel = width / 256;
        var tolerance = 10 * widthPerPixel;
        boundingBox.maxLongitude = longitude + tolerance;
        boundingBox.minLongitude = longitude - tolerance;
        boundingBox.maxLatitude = latitude + tolerance;
        boundingBox.minLatitude = latitude - tolerance;
        var iterator = featureDao.queryForGeoJSONIndexedFeaturesWithBoundingBox(boundingBox);
        var features = [];
        var closestDistance = 100000000000;
        var closest;
        var centerPoint = helpers.point([longitude, latitude]);
        try {
            for (var iterator_4 = __values(iterator), iterator_4_1 = iterator_4.next(); !iterator_4_1.done; iterator_4_1 = iterator_4.next()) {
                var feature = iterator_4_1.value;
                feature.type = 'Feature';
                var distance = GeoPackage.determineDistance(centerPoint.geometry, feature);
                if (distance < closestDistance) {
                    closest = feature;
                    closestDistance = distance;
                }
                else if (distance === closestDistance && closest != null && closest.geometry.type !== 'Point') {
                    closest = feature;
                    closestDistance = distance;
                }
                features.push(feature);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (iterator_4_1 && !iterator_4_1.done && (_a = iterator_4.return)) _a.call(iterator_4);
            }
            finally { if (e_4) throw e_4.error; }
        }
        if (closest) {
            closest.gp_table = table;
            closest.gp_name = this.name;
            closest.distance = closestDistance;
        }
        return closest;
    };
    GeoPackage.determineDistance = function (point, feature) {
        if (feature.type === 'FeatureCollection') {
            feature.features.forEach(function (feature) {
                GeoPackage.determineDistance(point, feature);
            });
        }
        else {
            var geometry = feature.geometry;
            if (geometry.type === 'Point') {
                return (0, distance_1.default)(point, geometry);
            }
            if (geometry.type === 'LineString') {
                return this.determineDistanceFromLine(point, geometry);
            }
            if (geometry.type === 'MultiLineString') {
                var distance_2 = Number.MAX_SAFE_INTEGER;
                geometry.coordinates.forEach(function (lineStringCoordinate) {
                    var lineString = helpers.lineString(lineStringCoordinate);
                    distance_2 = Math.min(distance_2, GeoPackage.determineDistance(point, lineString));
                });
                return distance_2;
            }
            if (geometry.type === 'Polygon') {
                return GeoPackage.determineDistanceFromPolygon(point, geometry);
            }
            if (geometry.type === 'MultiPolygon') {
                return GeoPackage.determineDistanceFromPolygon(point, geometry);
            }
            return Number.MAX_SAFE_INTEGER;
        }
    };
    GeoPackage.determineDistanceFromLine = function (point, lineString) {
        return (0, point_to_line_distance_1.default)(point, lineString);
    };
    GeoPackage.determineDistanceFromPolygon = function (point, polygon) {
        if ((0, boolean_point_in_polygon_1.default)(point, polygon)) {
            return 0;
        }
        return GeoPackage.determineDistance(point, (0, polygon_to_line_1.default)(polygon));
    };
    /**
     * Create the Data Columns table if it does not already exist
     */
    GeoPackage.prototype.createDataColumns = function () {
        if (this.dataColumnsDao.isTableExists()) {
            return true;
        }
        return this.tableCreator.createDataColumns();
    };
    /**
     * Create the Data Column Constraints table if it does not already exist
     */
    GeoPackage.prototype.createDataColumnConstraintsTable = function () {
        if (this.dataColumnConstraintsDao.isTableExists()) {
            return true;
        }
        return this.tableCreator.createDataColumnConstraints();
    };
    GeoPackage.prototype.createMetadataTable = function () {
        if (this.metadataDao.isTableExists()) {
            return true;
        }
        return this.tableCreator.createMetadata();
    };
    GeoPackage.prototype.createMetadataReferenceTable = function () {
        if (this.metadataReferenceDao.isTableExists()) {
            return true;
        }
        return this.tableCreator.createMetadataReference();
    };
    GeoPackage.prototype.createExtensionTable = function () {
        if (this.extensionDao.isTableExists()) {
            return true;
        }
        return this.tableCreator.createExtensions();
    };
    GeoPackage.prototype.createTableIndexTable = function () {
        if (this.tableIndexDao.isTableExists()) {
            return true;
        }
        return this.tableCreator.createTableIndex();
    };
    GeoPackage.prototype.createGeometryIndexTable = function () {
        var dao = this.getGeometryIndexDao(null);
        if (dao.isTableExists()) {
            return true;
        }
        return this.tableCreator.createGeometryIndex();
    };
    GeoPackage.prototype.createStyleMappingTable = function (tableName, columns, dataColumns) {
        var attributeTable = new styleMappingTable_1.StyleMappingTable(tableName, columns, null);
        this.tableCreator.createUserTable(attributeTable);
        var contents = new contents_2.Contents();
        contents.table_name = tableName;
        contents.data_type = contentsDataType_1.ContentsDataType.ATTRIBUTES;
        contents.identifier = tableName;
        contents.last_change = new Date().toISOString();
        this.contentsDao.create(contents);
        if (dataColumns) {
            this.createDataColumns();
            var dataColumnsDao_4 = this.dataColumnsDao;
            dataColumns.forEach(function (dataColumn) {
                dataColumnsDao_4.create(dataColumn);
            });
        }
        return true;
    };
    /**
     * Get the application id of the GeoPackage
     * @returns {string} application id
     */
    GeoPackage.prototype.getApplicationId = function () {
        return this.database.getApplicationId();
    };
    GeoPackage.createDataColumnMap = function (featureDao) {
        var columnMap = {};
        var dcd = new dataColumnsDao_1.DataColumnsDao(featureDao.geoPackage);
        featureDao.table.getUserColumns().getColumns().forEach(function (column) {
            var dataColumn = dcd.getDataColumns(featureDao.table.getTableName(), column.name);
            columnMap[column.name] = {
                index: column.index,
                name: column.name,
                max: column.max,
                min: column.min,
                notNull: column.notNull,
                primaryKey: column.primaryKey,
                dataType: column.dataType ? geoPackageDataType_1.GeoPackageDataType.nameFromType(column.dataType) : '',
                displayName: dataColumn && dataColumn.name ? dataColumn.name : column.name,
                dataColumn: dataColumn,
            };
        }.bind(this));
        return columnMap;
    };
    GeoPackage.prototype.iterateGeoJSONFeatures = function (tableName, boundingBox) {
        var featureDao = this.getFeatureDao(tableName);
        return featureDao.queryForGeoJSONIndexedFeaturesWithBoundingBox(boundingBox);
    };
    /**
     * Gets a GeoJSON feature from the table by id
     * @param  {module:geoPackage~GeoPackage}   geopackage open GeoPackage object
     * @param  {string}   table      name of the table to get the feature from
     * @param  {Number}   featureId  ID of the feature
     */
    GeoPackage.prototype.getFeature = function (table, featureId) {
        var featureDao = this.getFeatureDao(table);
        var srs = featureDao.srs;
        var feature = featureDao.queryForId(featureId);
        if (!feature) {
            var features = featureDao.queryForAllEq('_feature_id', featureId);
            if (features.length) {
                feature = featureDao.getRow(features[0]);
            }
            else {
                features = featureDao.queryForAllEq('_properties_id', featureId);
                if (features.length) {
                    feature = featureDao.getRow(features[0]);
                }
            }
        }
        if (feature) {
            return GeoPackage.parseFeatureRowIntoGeoJSON(feature, srs);
        }
    };
    // eslint-disable-next-line complexity
    GeoPackage.parseFeatureRowIntoGeoJSON = function (featureRow, srs, columnMap) {
        var geoJson = {
            type: 'Feature',
            properties: {},
            id: undefined,
            geometry: undefined,
        };
        var geometry = featureRow.geometry;
        if (geometry && geometry.geometry) {
            var geoJsonGeom = geometry.geometry.toGeoJSON();
            if (srs.definition &&
                srs.definition !== 'undefined' &&
                srs.organization.toUpperCase() + ':' + srs.organization_coordsys_id !== projectionConstants_1.ProjectionConstants.EPSG_4326) {
                geoJsonGeom = reproject_1.default.reproject(geoJsonGeom, srs.projection, projectionConstants_1.ProjectionConstants.EPSG_4326);
            }
            geoJson.geometry = geoJsonGeom;
        }
        for (var key in featureRow.values) {
            if (Object.prototype.hasOwnProperty.call(featureRow.values, key) &&
                key !== featureRow.geometryColumn.name &&
                key !== 'id') {
                if (key.toLowerCase() === '_feature_id') {
                    geoJson.id = featureRow.values[key];
                }
                else if (key.toLowerCase() === '_properties_id') {
                    geoJson.properties[key.substring(12)] = featureRow.values[key];
                }
                else if (columnMap && columnMap[key]) {
                    geoJson.properties[columnMap[key].displayName] = featureRow.values[key];
                }
                else {
                    geoJson.properties[key] = featureRow.values[key];
                }
            }
            else if (featureRow.geometryColumn.name === key) {
                // geoJson.properties[key] = geometry && !geometry.geometryError ? 'Valid' : geometry.geometryError;
            }
        }
        geoJson.id = geoJson.id || featureRow.id;
        return geoJson;
    };
    /**
     * Gets the features in the EPSG:3857 tile
     * @param  {string}   table      name of the feature table
     * @param  {Number}   x       x tile number
     * @param  {Number}   y       y tile number
     * @param  {Number}   z      z tile number
     * @param  {Boolean}   [skipVerification]      skip the extra verification to determine if the feature really is within the tile
     */
    GeoPackage.prototype.getGeoJSONFeaturesInTile = function (table, x, y, z, skipVerification) {
        if (skipVerification === void 0) { skipVerification = false; }
        return __awaiter(this, void 0, void 0, function () {
            var webMercatorBoundingBox, bb, featureDao, features, iterator, iterator_5, iterator_5_1, feature;
            var e_5, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        webMercatorBoundingBox = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getWebMercatorBoundingBoxFromXYZ(x, y, z);
                        bb = webMercatorBoundingBox.projectBoundingBox(projectionConstants_1.ProjectionConstants.EPSG_3857, projectionConstants_1.ProjectionConstants.EPSG_4326);
                        return [4 /*yield*/, this.indexFeatureTable(table)];
                    case 1:
                        _b.sent();
                        featureDao = this.getFeatureDao(table);
                        if (!featureDao)
                            return [2 /*return*/];
                        features = [];
                        iterator = featureDao.queryForGeoJSONIndexedFeaturesWithBoundingBox(bb, skipVerification);
                        try {
                            for (iterator_5 = __values(iterator), iterator_5_1 = iterator_5.next(); !iterator_5_1.done; iterator_5_1 = iterator_5.next()) {
                                feature = iterator_5_1.value;
                                features.push(feature);
                            }
                        }
                        catch (e_5_1) { e_5 = { error: e_5_1 }; }
                        finally {
                            try {
                                if (iterator_5_1 && !iterator_5_1.done && (_a = iterator_5.return)) _a.call(iterator_5);
                            }
                            finally { if (e_5) throw e_5.error; }
                        }
                        return [2 /*return*/, features];
                }
            });
        });
    };
    /**
     * Gets the features in the EPSG:4326 bounding box
     * @param  {string}   table      name of the feature table
     * @param  {Number}   west       EPSG:4326 western boundary
     * @param  {Number}   east       EPSG:4326 eastern boundary
     * @param  {Number}   south      EPSG:4326 southern boundary
     * @param  {Number}   north      EPSG:4326 northern boundary
     */
    GeoPackage.prototype.getFeaturesInBoundingBox = function (table, west, east, south, north) {
        return __awaiter(this, void 0, void 0, function () {
            var featureDao, bb, iterator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.indexFeatureTable(table)];
                    case 1:
                        _a.sent();
                        featureDao = this.getFeatureDao(table);
                        if (!featureDao)
                            throw new Error('Unable to find table ' + table);
                        bb = new boundingBox_1.BoundingBox(west, east, south, north);
                        iterator = featureDao.queryIndexedFeaturesWithBoundingBox(bb);
                        return [2 /*return*/, iterator];
                }
            });
        });
    };
    /**
     * Get the standard 3857 XYZ tile from the GeoPackage.  If a canvas is provided, the tile will be drawn in the canvas
     * @param  {string}   table      name of the table containing the tiles
     * @param  {Number}   x          x index of the tile
     * @param  {Number}   y          y index of the tile
     * @param  {Number}   z          zoom level of the tile
     * @param  {Number}   width      width of the resulting tile
     * @param  {Number}   height     height of the resulting tile
     * @param  {any}   canvas     canvas element to draw the tile into
     */
    GeoPackage.prototype.xyzTile = function (table, x, y, z, width, height, canvas) {
        if (width === void 0) { width = 256; }
        if (height === void 0) { height = 256; }
        return __awaiter(this, void 0, void 0, function () {
            var tileDao, retriever, tileScaling;
            return __generator(this, function (_a) {
                width = Number(width);
                height = Number(height);
                tileDao = this.getTileDao(table);
                retriever = new retriever_1.GeoPackageTileRetriever(tileDao, width, height);
                if (this.getTileScalingExtension(table).has()) {
                    tileScaling = this.getTileScalingExtension(table).dao.queryForTableName(table);
                    if (tileScaling) {
                        retriever.setScaling(tileScaling);
                    }
                }
                if (!canvas) {
                    return [2 /*return*/, retriever.getTile(x, y, z)];
                }
                else {
                    return [2 /*return*/, retriever.drawTileIn(x, y, z, canvas)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get the standard 3857 XYZ tile from the GeoPackage.  If a canvas is provided, the tile will be drawn in the canvas
     * @param  {string}   table      name of the table containing the tiles
     * @param  {Number}   x          x index of the tile
     * @param  {Number}   y          y index of the tile
     * @param  {Number}   z          zoom level of the tile
     * @param  {Number}   width      width of the resulting tile
     * @param  {Number}   height     height of the resulting tile
     * @param  {any}   canvas     canvas element to draw the tile into
     */
    GeoPackage.prototype.xyzTileScaled = function (table, x, y, z, width, height, canvas, zoomIn, zoomOut) {
        if (width === void 0) { width = 256; }
        if (height === void 0) { height = 256; }
        return __awaiter(this, void 0, void 0, function () {
            var tileDao, retriever, tileScaling, tileScaling_2, tileScalingExtension;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        width = Number(width);
                        height = Number(height);
                        tileDao = this.getTileDao(table);
                        retriever = new retriever_1.GeoPackageTileRetriever(tileDao, width, height);
                        return [4 /*yield*/, this.getTileScalingExtension(table).getOrCreateExtension()];
                    case 1:
                        _a.sent();
                        tileScaling = this.getTileScalingExtension(table).dao.queryForTableName(table);
                        if (tileScaling) {
                            retriever.setScaling(tileScaling);
                        }
                        else {
                            tileScaling_2 = new tileScaling_1.TileScaling();
                            tileScaling_2.zoom_in = zoomIn;
                            tileScaling_2.zoom_out = zoomOut;
                            tileScaling_2.table_name = table;
                            tileScaling_2.scaling_type = tileScalingType_1.TileScalingType.CLOSEST_IN_OUT;
                            tileScalingExtension = this.getTileScalingExtension(table);
                            // await tileScalingExtension.getOrCreateExtension();
                            tileScalingExtension.createOrUpdate(tileScaling_2);
                            retriever.setScaling(tileScaling_2);
                        }
                        if (!canvas) {
                            return [2 /*return*/, retriever.getTile(x, y, z)];
                        }
                        else {
                            return [2 /*return*/, retriever.drawTileIn(x, y, z, canvas)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Draws a tile projected into the specified projection, bounded by the specified by the bounds in EPSG:4326 into the canvas or the image is returned if no canvas is passed in.
     * @param  {string}   table      name of the table containing the tiles
     * @param  {Number}   minLat     minimum latitude bounds of tile
     * @param  {Number}   minLon     minimum longitude bounds of tile
     * @param  {Number}   maxLat     maximum latitude bounds of tile
     * @param  {Number}   maxLon     maximum longitude bounds of tile
     * @param  {Number}   z          zoom level of the tile
     * @param  {string}   projection project from tile's projection to this one.
     * @param  {Number}   width      width of the resulting tile
     * @param  {Number}   height     height of the resulting tile
     * @param  {any}   canvas     canvas element to draw the tile into
     */
    GeoPackage.prototype.projectedTile = function (table, minLat, minLon, maxLat, maxLon, z, projection, width, height, canvas) {
        if (projection === void 0) { projection = projectionConstants_1.ProjectionConstants.EPSG_4326; }
        if (width === void 0) { width = 256; }
        if (height === void 0) { height = 256; }
        return __awaiter(this, void 0, void 0, function () {
            var tileDao, retriever, bounds;
            return __generator(this, function (_a) {
                tileDao = this.getTileDao(table);
                retriever = new retriever_1.GeoPackageTileRetriever(tileDao, width, height);
                bounds = new boundingBox_1.BoundingBox(minLon, maxLon, minLat, maxLat);
                return [2 /*return*/, retriever.getTileWithWgs84BoundsInProjection(bounds, z, projection, canvas)];
            });
        });
    };
    GeoPackage.prototype.getInfoForTable = function (tableDao) {
        var info = {
            tableName: tableDao.table_name,
            tableType: tableDao.table.tableType,
            count: tableDao.getCount(),
            geometryColumns: undefined,
            minZoom: undefined,
            maxZoom: undefined,
            minWebMapZoom: undefined,
            maxWebMapZoom: undefined,
            zoomLevels: undefined,
            tileMatrixSet: undefined,
            contents: undefined,
            srs: undefined,
            columns: undefined,
            columnMap: undefined,
        };
        if (tableDao instanceof featureDao_1.FeatureDao) {
            info.geometryColumns = {
                tableName: tableDao.geometryColumns.table_name,
                geometryColumn: tableDao.geometryColumns.column_name,
                geometryTypeName: tableDao.geometryColumns.geometry_type_name,
                z: tableDao.geometryColumns.z,
                m: tableDao.geometryColumns.m,
            };
        }
        if (tableDao instanceof tileDao_1.TileDao) {
            info.minZoom = tableDao.minZoom;
            info.maxZoom = tableDao.maxZoom;
            info.minWebMapZoom = tableDao.minWebMapZoom;
            info.maxWebMapZoom = tableDao.maxWebMapZoom;
            info.zoomLevels = tableDao.tileMatrices.length;
        }
        var contents;
        if (tableDao instanceof featureDao_1.FeatureDao) {
            contents = this.geometryColumnsDao.getContents(tableDao.geometryColumns);
        }
        else if (tableDao instanceof tileDao_1.TileDao) {
            contents = this.tileMatrixSetDao.getContents(tableDao.tileMatrixSet);
            info.tileMatrixSet = {
                srsId: tableDao.tileMatrixSet.srs_id,
                minX: tableDao.tileMatrixSet.min_x,
                maxX: tableDao.tileMatrixSet.max_x,
                minY: tableDao.tileMatrixSet.min_y,
                maxY: tableDao.tileMatrixSet.max_y,
            };
        }
        var contentsSrs = this.contentsDao.getSrs(contents);
        info.contents = {
            tableName: contents.table_name,
            dataType: contents.data_type,
            identifier: contents.identifier,
            description: contents.description,
            lastChange: contents.last_change,
            minX: contents.min_x,
            maxX: contents.max_x,
            minY: contents.min_y,
            maxY: contents.max_y,
            srs: {
                name: contentsSrs.srs_name,
                id: contentsSrs.srs_id,
                organization: contentsSrs.organization,
                organization_coordsys_id: contentsSrs.organization_coordsys_id,
                definition: contentsSrs.definition,
                description: contentsSrs.description,
            },
        };
        info.contents.srs = {
            name: contentsSrs.srs_name,
            id: contentsSrs.srs_id,
            organization: contentsSrs.organization,
            organization_coordsys_id: contentsSrs.organization_coordsys_id,
            definition: contentsSrs.definition,
            description: contentsSrs.description,
        };
        var srs = tableDao.srs;
        info.srs = {
            name: srs.srs_name,
            id: srs.srs_id,
            organization: srs.organization,
            organization_coordsys_id: srs.organization_coordsys_id,
            definition: srs.definition,
            description: srs.description,
        };
        info.columns = [];
        info.columnMap = {};
        var dcd = this.dataColumnsDao;
        tableDao.table.getUserColumns().getColumns().forEach(function (column) {
            var dataColumn = dcd.getDataColumns(tableDao.table.getTableName(), column.name);
            info.columns.push({
                index: column.index,
                name: column.name,
                max: column.max,
                min: column.min,
                notNull: column.notNull,
                primaryKey: column.primaryKey,
                dataType: column.dataType,
                displayName: dataColumn && dataColumn.name ? dataColumn.name : column.name,
                dataColumn: dataColumn,
            });
            info.columnMap[column.name] = info.columns[info.columns.length - 1];
        }.bind(this));
        return info;
    };
    GeoPackage.addProjection = function (name, definition) {
        if (!name || !definition)
            throw new Error('Invalid projection name/definition');
        proj4_1.default.defs(name, definition);
    };
    GeoPackage.hasProjection = function (name) {
        return proj4_1.default.defs(name);
    };
    GeoPackage.prototype.renameTable = function (tableName, newTableName) {
        var tableDataType = this.getTableDataType(tableName);
        if (tableDataType !== null && tableDataType !== undefined) {
            this.copyTableAndExtensions(tableName, newTableName);
            this.deleteTable(tableName);
        }
        else {
            alterTable_1.AlterTable.renameTable(this.connection, tableName, newTableName);
        }
    };
    GeoPackage.prototype.copyTableAndExtensions = function (tableName, newTableName) {
        this.copyTable(tableName, newTableName, true, true);
    };
    GeoPackage.prototype.copyTableNoExtensions = function (tableName, newTableName) {
        this.copyTable(tableName, newTableName, true, false);
    };
    GeoPackage.prototype.copyTableAsEmpty = function (tableName, newTableName) {
        this.copyTable(tableName, newTableName, false, false);
    };
    GeoPackage.prototype.getTableDataType = function (tableName) {
        var tableType = null;
        var contentsDao = this.contentsDao;
        var contents = contentsDao.queryForId(tableName);
        if (contents !== null && contents !== undefined) {
            tableType = contents.data_type;
        }
        return tableType;
    };
    /**
     * Copy the table
     * @param tableName table name
     * @param newTableName new table name
     * @param transferContent transfer content flag
     * @param extensions extensions copy flag
     */
    GeoPackage.prototype.copyTable = function (tableName, newTableName, transferContent, extensions) {
        var dataType = this.getTableDataType(tableName);
        if (dataType !== null && dataType !== undefined) {
            switch (dataType) {
                case contentsDataType_1.ContentsDataType.ATTRIBUTES:
                    this.copyAttributeTable(tableName, newTableName, transferContent);
                    break;
                case contentsDataType_1.ContentsDataType.FEATURES:
                    this.copyFeatureTable(tableName, newTableName, transferContent);
                    break;
                case contentsDataType_1.ContentsDataType.TILES:
                    this.copyTileTable(tableName, newTableName, transferContent);
                    break;
                default:
                    throw new Error('Unsupported data type: ' + dataType);
            }
        }
        else {
            this.copyUserTable(tableName, newTableName, transferContent, false);
        }
        // Copy extensions
        if (extensions) {
            geoPackageExtensions_1.GeoPackageExtensions.copyTableExtensions(this, tableName, newTableName);
        }
    };
    /**
     * Copy the attribute table
     * @param tableName table name
     * @param newTableName new table name
     * @param transferContent transfer content flag
     */
    GeoPackage.prototype.copyAttributeTable = function (tableName, newTableName, transferContent) {
        this.copyUserTable(tableName, newTableName, transferContent);
    };
    /**
     * Copy the feature table
     * @param tableName table name
     * @param newTableName new table name
     * @param transferContent transfer content flag
     */
    GeoPackage.prototype.copyFeatureTable = function (tableName, newTableName, transferContent) {
        var geometryColumnsDao = this.geometryColumnsDao;
        var geometryColumns = null;
        try {
            geometryColumns = geometryColumnsDao.queryForTableName(tableName);
        }
        catch (e) {
            throw new Error('Failed to retrieve table geometry columns: ' + tableName);
        }
        if (geometryColumns === null || geometryColumns === undefined) {
            throw new Error('No geometry columns for table: ' + tableName);
        }
        var contents = this.copyUserTable(tableName, newTableName, transferContent);
        geometryColumns.setContents(contents);
        try {
            geometryColumnsDao.create(geometryColumns);
        }
        catch (e) {
            throw new Error('Failed to create geometry columns for feature table: ' + newTableName);
        }
    };
    /**
     * Copy the tile table
     * @param tableName table name
     * @param newTableName new table name
     * @param transferContent transfer content flag
     */
    GeoPackage.prototype.copyTileTable = function (tableName, newTableName, transferContent) {
        var tileMatrixSetDao = this.tileMatrixSetDao;
        var tileMatrixSet = null;
        try {
            tileMatrixSet = tileMatrixSetDao.queryForId(tableName);
        }
        catch (e) {
            throw new Error('Failed to retrieve table tile matrix set: ' + tableName);
        }
        if (tileMatrixSet === null || tileMatrixSet === undefined) {
            throw new Error('No tile matrix set for table: ' + tableName);
        }
        var tileMatrixDao = this.tileMatrixDao;
        var tileMatrices = null;
        try {
            tileMatrices = tileMatrixDao.queryForAllEq(tileMatrixDao_1.TileMatrixDao.COLUMN_TABLE_NAME, tableName).map(function (results) { return tileMatrixDao.createObject(results); });
        }
        catch (e) {
            throw new Error('Failed to retrieve table tile matrices: ' + tableName);
        }
        var contents = this.copyUserTable(tableName, newTableName, transferContent);
        tileMatrixSet.contents = contents;
        try {
            tileMatrixSetDao.create(tileMatrixSet);
        }
        catch (e) {
            throw new Error('Failed to create tile matrix set for tile table: ' + newTableName);
        }
        tileMatrices.forEach(function (tileMatrix) {
            tileMatrix.contents = contents;
            try {
                tileMatrixDao.create(tileMatrix);
            }
            catch (e) {
                throw new Error('Failed to create tile matrix for tile table: ' + newTableName);
            }
        });
    };
    /**
     * Copy the user table
     *
     * @param tableName table name
     * @param newTableName new table name
     * @param transferContent  transfer user table content flag
     * @param validateContents true to validate a contents was copied
     * @return copied contents
     * @since 3.3.0
     */
    GeoPackage.prototype.copyUserTable = function (tableName, newTableName, transferContent, validateContents) {
        if (validateContents === void 0) { validateContents = true; }
        alterTable_1.AlterTable.copyTableWithName(this.database, tableName, newTableName, transferContent);
        var contents = this.copyContents(tableName, newTableName);
        if ((contents === null || contents === undefined) && validateContents) {
            throw new Error('No table contents found for table: ' + tableName);
        }
        return contents;
    };
    /**
     * Copy the contents
     * @param tableName table name
     * @param newTableName new table name
     * @return copied contents
     */
    GeoPackage.prototype.copyContents = function (tableName, newTableName) {
        var contents = this.getTableContents(tableName);
        if (contents !== null && contents !== undefined) {
            contents.table_name = newTableName;
            contents.identifier = newTableName;
            try {
                this.contentsDao.create(contents);
            }
            catch (e) {
                throw new Error('Failed to create contents for table: ' + newTableName + ', copied from table: ' + tableName);
            }
        }
        return contents;
    };
    return GeoPackage;
}());
exports.GeoPackage = GeoPackage;
//# sourceMappingURL=geoPackage.js.map