import { UserTable } from '../user/userTable';
import { GeoPackage } from '../geoPackage';
import { GeoPackageConnection } from './geoPackageConnection';
import { UserColumn } from '../user/userColumn';
declare type TableCreatorScripts = 'spatial_reference_system' | 'contents' | 'geometry_columns' | 'tile_matrix_set' | 'tile_matrix' | 'data_columns' | 'data_column_constraints' | 'metadata' | 'metadata_reference' | 'extensions' | 'table_index' | 'geometry_index' | 'feature_tile_link' | 'extended_relations' | 'contents_id' | 'tile_scaling';
/**
 * `TableCreator` provides methods for creating the various standard tables in
 * a GeoPackage database.
 *
 * @class
 * @param {module:geoPackage~GeoPackage} geopackage GeoPackage object
 */
export declare class TableCreator {
    geopackage: GeoPackage;
    connection: GeoPackageConnection;
    constructor(geopackage: GeoPackage);
    /**
     * Creates all required tables and Spatial Reference Systems, in addition to EPSG:3857
     * @return {boolean}
     */
    createRequired(): boolean;
    /**
     * Creates the spatial reference system tables
     * @return {boolean}
     */
    createSpatialReferenceSystem(): boolean;
    /**
     * Creates the contents tables
     * @return {boolean}
     */
    createContents(): boolean;
    /**
     * Creates the geometry columns tables
     * @return {boolean}
     */
    createGeometryColumns(): boolean;
    /**
     * Creates the tile matrix set tables
     * @return {boolean}
     */
    createTileMatrixSet(): boolean;
    /**
     * Creates the tile matrix tables
     * @return {boolean}
     */
    createTileMatrix(): boolean;
    /**
     * Creates the data columns tables
     * @return {boolean}
     */
    createDataColumns(): boolean;
    /**
     * Creates the data column constraints tables
     * @return {boolean}
     */
    createDataColumnConstraints(): boolean;
    /**
     * Creates the metadata tables
     * @return {boolean}
     */
    createMetadata(): boolean;
    /**
     * Creates the metadata reference tables
     * @return {boolean}
     */
    createMetadataReference(): boolean;
    /**
     * Creates the extensions tables
     * @return {boolean}
     */
    createExtensions(): boolean;
    /**
     * Creates the table index tables
     * @return {boolean}
     */
    createTableIndex(): boolean;
    /**
     * Creates the geometry index tables
     * @return {boolean}
     */
    createGeometryIndex(): boolean;
    /**
     * Creates the feature tile link tables
     * @return {boolean}
     */
    createFeatureTileLink(): boolean;
    /**
     * Creates the extended relations tables
     * @return {boolean}
     */
    createExtendedRelations(): boolean;
    /**
     * Creates the contentsId tables
     * @return {boolean}
     */
    createContentsId(): boolean;
    /**
     * Creates the tileScaling tables
     * @return {boolean}
     */
    createTileScaling(): boolean;
    /**
     * Creates all tables necessary for the specified table creation script name in the GeoPackage
     * @param  {string} creationScriptName creation scripts to run
     * @return {boolean}
     */
    createTable(creationScriptName: TableCreatorScripts): boolean;
    /**
     * Create the given user table.
     *
     * @param {UserTable} userTable user table to create
     * @return {object} the result of {@link module:db/geoPackageConnection~GeoPackageConnection#run}
     * @throws {Error} if the table already exists
     */
    createUserTable(userTable: UserTable<UserColumn>): {
        lastInsertRowid: number;
        changes: number;
    };
    /**
     * Drop the table if it exists
     * @param table table name
     */
    dropTable(table: string): void;
    static readonly tableCreationScripts: {
        spatial_reference_system: string[];
        contents: string[];
        geometry_columns: string[];
        tile_matrix_set: string[];
        tile_matrix: string[];
        data_columns: string[];
        data_column_constraints: string[];
        metadata: string[];
        metadata_reference: string[];
        extensions: string[];
        table_index: string[];
        geometry_index: string[];
        feature_tile_link: string[];
        extended_relations: string[];
        contents_id: string[];
        tile_scaling: string[];
    };
}
export {};
