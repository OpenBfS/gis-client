/// <reference types="node" />
import proj4 from 'proj4';
import { Feature, FeatureCollection, LineString, MultiPolygon, Point, Polygon } from 'geojson';
import { GeoPackageConnection } from './db/geoPackageConnection';
import { RelatedTablesExtension } from './extension/relatedTables';
import { FeatureStyleExtension } from './extension/style';
import { ContentsIdExtension } from './extension/contents';
import { TileScalingExtension } from './extension/scale';
import { SpatialReferenceSystemDao } from './core/srs/spatialReferenceSystemDao';
import { GeometryColumnsDao } from './features/columns/geometryColumnsDao';
import { FeatureDao } from './features/user/featureDao';
import { ContentsDao } from './core/contents/contentsDao';
import { TileMatrixSetDao } from './tiles/matrixset/tileMatrixSetDao';
import { TileMatrixDao } from './tiles/matrix/tileMatrixDao';
import { DataColumnsDao } from './dataColumns/dataColumnsDao';
import { DataColumnConstraintsDao } from './dataColumnConstraints/dataColumnConstraintsDao';
import { MetadataDao } from './metadata/metadataDao';
import { MetadataReferenceDao } from './metadata/reference/metadataReferenceDao';
import { ExtensionDao } from './extension/extensionDao';
import { TableIndexDao } from './extension/index/tableIndexDao';
import { GeometryIndexDao } from './extension/index/geometryIndexDao';
import { ExtendedRelationDao } from './extension/relatedTables/extendedRelationDao';
import { AttributesDao } from './attributes/attributesDao';
import { TileDao } from './tiles/user/tileDao';
import { ContentsIdDao } from './extension/contents/contentsIdDao';
import { TileScalingDao } from './extension/scale/tileScalingDao';
import { FeatureTable } from './features/user/featureTable';
import { TileTable } from './tiles/user/tileTable';
import { Contents } from './core/contents/contents';
import { GeoPackageDataType } from './db/geoPackageDataType';
import { GeometryColumns } from './features/columns/geometryColumns';
import { TableCreator } from './db/tableCreator';
import { BoundingBox } from './boundingBox';
import { TileMatrixSet } from './tiles/matrixset/tileMatrixSet';
import { UserColumn } from './user/userColumn';
import { DataColumns } from './dataColumns/dataColumns';
import { AttributesRow } from './attributes/attributesRow';
import { SpatialReferenceSystem } from './core/srs/spatialReferenceSystem';
import { FeatureRow } from './features/user/featureRow';
import { GeoPackageValidationError } from './validate/geoPackageValidate';
import { DBValue } from './db/dbAdapter';
import { MediaDao } from './extension/relatedTables/mediaDao';
import { MediaRow } from './extension/relatedTables/mediaRow';
import { ExtendedRelation } from './extension/relatedTables/extendedRelation';
import { RelationType } from './extension/relatedTables/relationType';
import { SimpleAttributesDao } from './extension/relatedTables/simpleAttributesDao';
import { SimpleAttributesRow } from './extension/relatedTables/simpleAttributesRow';
import { TileRow } from './tiles/user/tileRow';
import { AttributesColumn } from './attributes/attributesColumn';
import { UserMappingTable } from './extension/relatedTables/userMappingTable';
import { Constraints } from './db/table/constraints';
declare type ColumnMap = {
    [key: string]: {
        index: number;
        name: string;
        max?: number;
        min?: number;
        notNull?: boolean;
        primaryKey?: boolean;
        dataType?: GeoPackageDataType;
        displayName: string;
        dataColumn?: DataColumns;
    };
};
export interface ClosestFeature {
    feature_count: number;
    coverage: boolean;
    gp_table: string;
    gp_name: string;
    distance?: number;
}
/**
 * A `GeoPackage` instance is the interface to a physical GeoPackage SQLite
 * database.
 */
export declare class GeoPackage {
    /** name of the GeoPackage */
    name: string;
    /** path to the GeoPackage */
    path: string;
    connection: GeoPackageConnection;
    tableCreator: TableCreator;
    private _spatialReferenceSystemDao;
    private _contentsDao;
    private _tileMatrixSetDao;
    private _tileMatrixDao;
    private _dataColumnsDao;
    private _extensionDao;
    private _tableIndexDao;
    private _geometryColumnsDao;
    private _dataColumnConstraintsDao;
    private _metadataReferenceDao;
    private _metadataDao;
    private _extendedRelationDao;
    private _contentsIdDao;
    private _tileScalingDao;
    private _contentsIdExtension;
    private _featureStyleExtension;
    private _relatedTablesExtension;
    /**
     * Construct a new GeoPackage object
     * @param name name to give to this GeoPackage
     * @param path path to the GeoPackage
     * @param connection database connection to the GeoPackage
     */
    constructor(name: string, path: string, connection: GeoPackageConnection);
    close(): void;
    get database(): GeoPackageConnection;
    export(): Promise<any>;
    loadSpatialReferenceSystemsIntoProj4(): void;
    validate(): GeoPackageValidationError[];
    /**
     * @returns {module:core/srs~SpatialReferenceSystemDao} the DAO to access the [SRS table]{@link module:core/srs~SpatialReferenceSystem} in this `GeoPackage`
     */
    get spatialReferenceSystemDao(): SpatialReferenceSystemDao;
    /**
     * @returns {module:core/contents~ContentsDao} the DAO to access the [contents table]{@link module:core/contents~Contents} in this `GeoPackage`
     */
    get contentsDao(): ContentsDao;
    /**
     * @returns {module:tiles/matrixset~TileMatrixSetDao} the DAO to access the [tile matrix set]{@link module:tiles/matrixset~TileMatrixSet} in this `GeoPackage`
     */
    get tileMatrixSetDao(): TileMatrixSetDao;
    /**
     * @returns {module:tiles/matrixset~TileMatrixDao} the DAO to access the [tile matrix]{@link module:tiles/matrixset~TileMatrix} in this `GeoPackage`
     */
    get tileMatrixDao(): TileMatrixDao;
    get dataColumnsDao(): DataColumnsDao;
    get extensionDao(): ExtensionDao;
    get tableIndexDao(): TableIndexDao;
    get geometryColumnsDao(): GeometryColumnsDao;
    get dataColumnConstraintsDao(): DataColumnConstraintsDao;
    get metadataReferenceDao(): MetadataReferenceDao;
    get metadataDao(): MetadataDao;
    get extendedRelationDao(): ExtendedRelationDao;
    get contentsIdDao(): ContentsIdDao;
    get tileScalingDao(): TileScalingDao;
    get contentsIdExtension(): ContentsIdExtension;
    get featureStyleExtension(): FeatureStyleExtension;
    getTileScalingExtension(tableName: string): TileScalingExtension;
    getGeometryIndexDao(featureDao: FeatureDao<FeatureRow>): GeometryIndexDao;
    get relatedTablesExtension(): RelatedTablesExtension;
    getSrs(srsId: number): SpatialReferenceSystem;
    createRequiredTables(): GeoPackage;
    createSupportedExtensions(): GeoPackage;
    /**
     * Get a Tile DAO
     * @param table
     * @returns {TileDao}
     */
    getTileDao(table: string | Contents | TileMatrixSet): TileDao<TileRow>;
    /**
     * Return a hash containing arrays of table names grouped under keys `features`,
     * `tiles`, and `attributes`.
     * @return {{features: string[], tiles: string[], attributes: string[]}}
     */
    getTables(): {
        features: string[];
        tiles: string[];
        attributes: string[];
    };
    getAttributesTables(): string[];
    hasAttributeTable(attributeTableName: string): boolean;
    /**
     *  Get the tile tables
     *  @returns {String[]} tile table names
     */
    getTileTables(): string[];
    /**
     * Checks if the tile table exists in the GeoPackage
     * @param  {String} tileTableName name of the table to query for
     * @returns {Boolean} indicates the existence of the tile table
     */
    hasTileTable(tileTableName: string): boolean;
    /**
     * Checks if the feature table exists in the GeoPackage
     * @param  {String} featureTableName name of the table to query for
     * @returns {Boolean} indicates the existence of the feature table
     */
    hasFeatureTable(featureTableName: string): boolean;
    /**
     *  Get the feature tables
     *  @returns {String[]} feature table names
     */
    getFeatureTables(): string[];
    isTable(tableName: string): boolean;
    isTableType(type: string, tableName: string): boolean;
    getTableType(tableName: string): string;
    getTableContents(tableName: string): Contents;
    dropTable(tableName: string): boolean;
    /**
     * {@inheritDoc}
     */
    deleteTable(table: string): void;
    /**
     * {@inheritDoc}
     */
    deleteTableQuietly(tableName: string): void;
    getTableCreator(): TableCreator;
    index(): Promise<boolean>;
    indexFeatureTable(table: string, progress?: Function): Promise<boolean>;
    /**
     * Get a Feature DAO from Contents
     *  @returns {FeatureDao}
     * @param table
     */
    getFeatureDao(table: string | Contents | GeometryColumns): FeatureDao<FeatureRow>;
    /**
     * Queries for GeoJSON features in a feature table
     * @param  {String}   tableName   Table name to query
     * @param  {BoundingBox}   boundingBox BoundingBox to query
     * @returns {Object[]} array of GeoJSON features
     */
    queryForGeoJSONFeaturesInTable(tableName: string, boundingBox: BoundingBox): Feature[];
    /**
     * Create the Geometry Columns table if it does not already exist
     * @returns {Promise}
     */
    createGeometryColumnsTable(): boolean;
    /**
     * Get a Attribute DAO
     * @param  {Contents}   contents Contents
     * @returns {AttributesDao}
     */
    getAttributeDao(table: Contents | string): AttributesDao<AttributesRow>;
    /**
     * Create AttributesTable from properties
     * @param tableName
     * @param properties
     */
    createAttributesTableFromProperties(tableName: string, properties: {
        name: string;
        dataType: string;
        dataColumn?: {
            table_name: string;
            column_name: string;
            name?: string;
            title?: string;
            description?: string;
            mime_type?: string;
            constraint_name?: string;
        };
    }[]): boolean;
    /**
     * Create attributes table for these columns, will add id column if no primary key column is defined
     * @param tableName
     * @param additionalColumns
     * @param constraints
     * @param dataColumns
     */
    createAttributesTable(tableName: string, additionalColumns: AttributesColumn[], constraints?: Constraints, dataColumns?: DataColumns[]): boolean;
    /**
     * Create a media table with the properties specified.  These properties are added to the required columns
     * @param {module:geoPackage~GeoPackage} geopackage the geopackage object
     * @param {Object[]} properties properties to create columns from
     * @param {string} properties.name name of the column
     * @param {string} properties.dataType name of the data type
     * @return {Promise}
     */
    createMediaTable(tableName: string, properties: {
        name: string;
        dataType: string;
        notNull?: boolean;
        defaultValue?: DBValue;
        max?: number;
    }[]): MediaDao<MediaRow>;
    linkMedia(baseTableName: string, baseId: number, mediaTableName: string, mediaId: number): number;
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
    linkRelatedRows(baseTableName: string, baseId: number, relatedTableName: string, relatedId: number, relationType: RelationType, mappingTable?: string | UserMappingTable, mappingColumnValues?: Record<string, any>): number;
    getLinkedMedia(baseTableName: string, baseId: number): MediaRow[];
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
    addGeoJSONFeaturesToGeoPackage(features: Feature[], tableName: string, index?: boolean, batchSize?: number, progress?: (featuresAdded: number) => void): Promise<number>;
    addGeoJSONFeatureToGeoPackage(feature: Feature, tableName: string, index?: boolean): number;
    /**
     * Adds a GeoJSON feature to the GeoPackage
     * @param  {module:geoPackage~GeoPackage}   geopackage open GeoPackage object
     * @param  {object}   feature    GeoJSON feature to add
     * @param  {string}   featureDao  feature dao for the table
     * @param  {string}   srs  srs of the table
     * @param {boolean} index updates the FeatureTableIndex extension if it exists
     */
    addGeoJSONFeatureToGeoPackageWithFeatureDaoAndSrs(feature: Feature, featureDao: FeatureDao<FeatureRow>, srs: SpatialReferenceSystem, index?: boolean): number;
    addAttributeRow(tableName: string, row: Record<string, DBValue>): number;
    /**
     * Create a simple attributes table with the properties specified.
     * @param {Object[]} properties properties to create columns from
     * @param {string} properties.name name of the column
     * @param {string} properties.dataType name of the data type
     * @return {Promise}
     */
    createSimpleAttributesTable(tableName: string, properties: {
        name: string;
        dataType: string;
    }[]): SimpleAttributesDao<SimpleAttributesRow>;
    addMedia(tableName: string, dataBuffer: Buffer, contentType: string, additionalProperties?: Record<string, DBValue>): number;
    getRelatedRows(baseTableName: string, baseId: number): ExtendedRelation[];
    /**
     * Create the given {@link module:features/user/featureTable~FeatureTable}
     * @param  {FeatureTable}   featureTable    feature table
     */
    createUserFeatureTable(featureTable: FeatureTable): {
        lastInsertRowid: number;
        changes: number;
    };
    createFeatureTableFromProperties(tableName: string, properties: {
        name: string;
        dataType: string;
    }[]): boolean;
    createFeatureTable(tableName: string, geometryColumns?: GeometryColumns, featureColumns?: UserColumn[] | {
        name: string;
        dataType: string;
    }[], boundingBox?: BoundingBox, srsId?: number, dataColumns?: DataColumns[]): boolean;
    /**
     * Create the Tile Matrix Set table if it does not already exist
     * @returns {Promise} resolves when the table is created
     */
    createTileMatrixSetTable(): boolean;
    /**
     * Create the Tile Matrix table if it does not already exist
     * @returns {Promise} resolves when the table is created
     */
    createTileMatrixTable(): boolean;
    /**
     * Create the given tile table in this GeoPackage.
     *
     * @param  {module:tiles/user/tileTable~TileTable} tileTable
     * @return {object} the result of {@link module:db/geoPackageConnection~GeoPackageConnection#run}
     */
    createTileTable(tileTable: TileTable): {
        lastInsertRowid: number;
        changes: number;
    };
    /**
     * Adds a spatial reference system to the gpkg_spatial_ref_sys table to be used by feature and tile tables.
     * @param spatialReferenceSystem
     */
    createSpatialReferenceSystem(spatialReferenceSystem: SpatialReferenceSystem): void;
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
    createTileTableWithTableName(tableName: string, contentsBoundingBox: BoundingBox, contentsSrsId: number, tileMatrixSetBoundingBox: BoundingBox, tileMatrixSetSrsId: number): TileMatrixSet;
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
    createStandardWGS84TileTable(tableName: string, contentsBoundingBox: BoundingBox, contentsSrsId: number, tileMatrixSetBoundingBox: BoundingBox, tileMatrixSetSrsId: number, minZoom: number, maxZoom: number, tileSize?: number): TileMatrixSet;
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
    createStandardWGS84TileMatrix(wgs84BoundingBox: BoundingBox, tileMatrixSet: TileMatrixSet, minZoom: number, maxZoom: number, tileSize?: number): GeoPackage;
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
    createStandardWebMercatorTileTable(tableName: string, contentsBoundingBox: BoundingBox, contentsSrsId: number, tileMatrixSetBoundingBox: BoundingBox, tileMatrixSetSrsId: number, minZoom: number, maxZoom: number, tileSize?: number): TileMatrixSet;
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
    createStandardWebMercatorTileTableWithZoomLevels(tableName: string, contentsBoundingBox: BoundingBox, tileMatrixSetBoundingBox: BoundingBox, zoomLevels: Set<number>, tileSize?: number): Promise<TileMatrixSet>;
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
    createStandardWebMercatorTileMatrix(epsg3857TileBoundingBox: BoundingBox, tileMatrixSet: TileMatrixSet, minZoom: number, maxZoom: number, tileSize?: number): GeoPackage;
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
    createStandardWebMercatorTileMatrixWithZoomLevels(epsg3857TileBoundingBox: BoundingBox, tileMatrixSet: TileMatrixSet, zoomLevels: Set<number>, tileSize?: number): GeoPackage;
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
    createWGS84TileMatrixRow(epsg4326TileBoundingBox: BoundingBox, tileMatrixSet: TileMatrixSet, tileMatrixDao: TileMatrixDao, zoomLevel: number, tileSize?: number): number;
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
    createTileMatrixRow(epsg3857TileBoundingBox: BoundingBox, tileMatrixSet: TileMatrixSet, tileMatrixDao: TileMatrixDao, zoomLevel: number, tileSize?: number): number;
    /**
     * Adds a tile to the GeoPackage
     * @param  {object}   tileStream       Byte array or Buffer containing the tile bytes
     * @param  {String}   tableName  Table name to add the tile to
     * @param  {Number}   zoom       zoom level of this tile
     * @param  {Number}   tileRow    row of this tile
     * @param  {Number}   tileColumn column of this tile
     */
    addTile(tileStream: any, tableName: string, zoom: number, tileRow: number, tileColumn: number): number;
    /**
     * Gets a tile from the specified table
     * @param  {string}   table      name of the table to get the tile from
     * @param  {Number}   zoom       zoom level of the tile
     * @param  {Number}   tileRow    row of the tile
     * @param  {Number}   tileColumn column of the tile
     *
     * @todo jsdoc return value
     */
    getTileFromTable(table: string, zoom: number, tileRow: number, tileColumn: number): TileRow;
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
    getTilesInBoundingBox(table: string, zoom: number, west: number, east: number, south: number, north: number): {
        columns: {
            index: number;
            name: string;
            max?: number;
            min?: number;
            notNull?: boolean;
            primaryKey?: boolean;
        }[];
        srs: SpatialReferenceSystem;
        tiles: {
            tableName: string;
            id: number;
            minLongitude: number;
            maxLongitude: number;
            minLatitude: number;
            maxLatitude: number;
            projection: string;
            values: string[];
        }[];
        west?: string;
        east?: string;
        south?: string;
        north?: string;
        zoom?: number;
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
    getTilesInBoundingBoxWebZoom(table: string, webZoom: number, west: number, east: number, south: number, north: number): {
        columns: {
            index: number;
            name: string;
            max?: number;
            min?: number;
            notNull?: boolean;
            primaryKey?: boolean;
        }[];
        srs: SpatialReferenceSystem;
        tiles: {
            tableName: string;
            id: number;
            minLongitude: number;
            maxLongitude: number;
            minLatitude: number;
            maxLatitude: number;
            projection: string;
            values: string[];
        }[];
        west?: string;
        east?: string;
        south?: string;
        north?: string;
        zoom?: number;
    };
    getFeatureTileFromXYZ(table: string, x: number, y: number, z: number, width: number, height: number): Promise<any>;
    getClosestFeatureInXYZTile(table: string, x: number, y: number, z: number, latitude: number, longitude: number): Feature & ClosestFeature;
    static determineDistance(point: Point, feature: Feature | FeatureCollection): number;
    static determineDistanceFromLine(point: Point, lineString: LineString): number;
    static determineDistanceFromPolygon(point: Point, polygon: Polygon | MultiPolygon): number;
    /**
     * Create the Data Columns table if it does not already exist
     */
    createDataColumns(): boolean;
    /**
     * Create the Data Column Constraints table if it does not already exist
     */
    createDataColumnConstraintsTable(): boolean;
    createMetadataTable(): boolean;
    createMetadataReferenceTable(): boolean;
    createExtensionTable(): boolean;
    createTableIndexTable(): boolean;
    createGeometryIndexTable(): boolean;
    createStyleMappingTable(tableName: string, columns?: UserColumn[], dataColumns?: DataColumns[]): boolean;
    /**
     * Get the application id of the GeoPackage
     * @returns {string} application id
     */
    getApplicationId(): string;
    static createDataColumnMap(featureDao: FeatureDao<FeatureRow>): ColumnMap;
    iterateGeoJSONFeatures(tableName: string, boundingBox?: BoundingBox): IterableIterator<Feature> & {
        srs: SpatialReferenceSystem;
        featureDao: FeatureDao<FeatureRow>;
    };
    /**
     * Gets a GeoJSON feature from the table by id
     * @param  {module:geoPackage~GeoPackage}   geopackage open GeoPackage object
     * @param  {string}   table      name of the table to get the feature from
     * @param  {Number}   featureId  ID of the feature
     */
    getFeature(table: string, featureId: number): Feature;
    static parseFeatureRowIntoGeoJSON(featureRow: FeatureRow, srs: SpatialReferenceSystem, columnMap?: ColumnMap): Feature;
    /**
     * Gets the features in the EPSG:3857 tile
     * @param  {string}   table      name of the feature table
     * @param  {Number}   x       x tile number
     * @param  {Number}   y       y tile number
     * @param  {Number}   z      z tile number
     * @param  {Boolean}   [skipVerification]      skip the extra verification to determine if the feature really is within the tile
     */
    getGeoJSONFeaturesInTile(table: string, x: number, y: number, z: number, skipVerification?: boolean): Promise<Feature[]>;
    /**
     * Gets the features in the EPSG:4326 bounding box
     * @param  {string}   table      name of the feature table
     * @param  {Number}   west       EPSG:4326 western boundary
     * @param  {Number}   east       EPSG:4326 eastern boundary
     * @param  {Number}   south      EPSG:4326 southern boundary
     * @param  {Number}   north      EPSG:4326 northern boundary
     */
    getFeaturesInBoundingBox(table: string, west: number, east: number, south: number, north: number): Promise<IterableIterator<FeatureRow>>;
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
    xyzTile(table: string, x: number, y: number, z: number, width?: number, height?: number, canvas?: any): Promise<any>;
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
    xyzTileScaled(table: string, x: number, y: number, z: number, width?: number, height?: number, canvas?: any, zoomIn?: 2, zoomOut?: 2): Promise<any>;
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
    projectedTile(table: string, minLat: number, minLon: number, maxLat: number, maxLon: number, z: number, projection?: string, width?: number, height?: number, canvas?: any): Promise<any>;
    getInfoForTable(tableDao: TileDao<TileRow> | FeatureDao<FeatureRow>): any;
    static addProjection(name: string, definition: string): void;
    static hasProjection(name: string): proj4.ProjectionDefinition;
    renameTable(tableName: any, newTableName: any): void;
    copyTableAndExtensions(tableName: any, newTableName: any): void;
    copyTableNoExtensions(tableName: any, newTableName: any): void;
    copyTableAsEmpty(tableName: any, newTableName: any): void;
    getTableDataType(tableName: any): any;
    /**
     * Copy the table
     * @param tableName table name
     * @param newTableName new table name
     * @param transferContent transfer content flag
     * @param extensions extensions copy flag
     */
    copyTable(tableName: any, newTableName: any, transferContent: any, extensions: any): void;
    /**
     * Copy the attribute table
     * @param tableName table name
     * @param newTableName new table name
     * @param transferContent transfer content flag
     */
    copyAttributeTable(tableName: any, newTableName: any, transferContent: any): void;
    /**
     * Copy the feature table
     * @param tableName table name
     * @param newTableName new table name
     * @param transferContent transfer content flag
     */
    copyFeatureTable(tableName: any, newTableName: any, transferContent: any): void;
    /**
     * Copy the tile table
     * @param tableName table name
     * @param newTableName new table name
     * @param transferContent transfer content flag
     */
    copyTileTable(tableName: any, newTableName: any, transferContent: any): void;
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
    copyUserTable(tableName: any, newTableName: any, transferContent: any, validateContents?: boolean): Contents;
    /**
     * Copy the contents
     * @param tableName table name
     * @param newTableName new table name
     * @return copied contents
     */
    copyContents(tableName: string, newTableName: string): Contents;
}
export {};
