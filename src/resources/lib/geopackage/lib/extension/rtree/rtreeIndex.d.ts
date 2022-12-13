import { GeoPackage } from '../../geoPackage';
import { BaseExtension } from '../baseExtension';
import { Extension } from '../extension';
import { RTreeIndexDao } from './rtreeIndexDao';
import { FeatureDao } from '../../features/user/featureDao';
import { FeatureRow } from '../../features/user/featureRow';
import { FeatureTable } from '../../features/user/featureTable';
/**
 * RTreeIndex extension
 * @class RTreeIndex
 * @extends BaseExtension
 * @param {module:geoPackage~GeoPackage} geoPackage The GeoPackage object
 */
export declare class RTreeIndex extends BaseExtension {
    /**
     * Trigger Insert name
     */
    static TRIGGER_INSERT_NAME: string;
    /**
     * Trigger update 1 name
     */
    static TRIGGER_UPDATE1_NAME: string;
    /**
     * Trigger update 2 name
     */
    static TRIGGER_UPDATE2_NAME: string;
    /**
     * Trigger update 3 name
     */
    static TRIGGER_UPDATE3_NAME: string;
    /**
     * Trigger update 4 name
     */
    static TRIGGER_UPDATE4_NAME: string;
    /**
     * Trigger delete name
     */
    static TRIGGER_DELETE_NAME: string;
    tableName: string;
    primaryKeyColumn: string;
    columnName: string;
    featureCount: number;
    rtreeIndexDao: RTreeIndexDao;
    extensionExists: boolean;
    constructor(geoPackage: GeoPackage, featureDao: FeatureDao<FeatureRow>);
    getRTreeIndexExtension(): Extension[];
    getOrCreateExtension(): Extension;
    /**
     * Create the RTree Index extension for the feature table, geometry column,
     * and id column. Creates the SQL functions, loads the tree, and creates the
     * triggers.
     * @param tableName table name
     * @param geometryColumnName geometry column name
     * @param idColumnName id column name
     * @return extension
     */
    createWithParameters(tableName: string, geometryColumnName: string, idColumnName: string): Extension[];
    /**
     * Create the extension
     * @param {Function} [progress] progress function
     * @returns {Extension[]}
     */
    create(progress?: Function): Extension[];
    createAllTriggers(tableName: string, geometryColumnName: string, idColumnName: string): boolean;
    loadRTreeIndex(tableName: string, geometryColumnName: string, idColumnName: string): boolean;
    createRTreeIndex(tableName: string, columnName: string): boolean;
    createAllFunctions(): void;
    createMinXFunction(): void;
    createMinYFunction(): void;
    createMaxXFunction(): void;
    createMaxYFunction(): void;
    createIsEmptyFunction(): void;
    has(table?: string, column?: string): boolean;
    deleteTable(tableName: string): void;
    /**
     * Delete the RTree Index extension for the table and geometry column. Drops
     * the triggers, RTree table, and deletes the extension.
     * @param tableName table name
     * @param geometryColumnName geometry column name
     */
    deleteTableAndColumn(tableName: string, geometryColumnName: string): void;
    deleteAll(): void;
    /**
     * Drop the the triggers and RTree table for the feature table
     * @param featureTable feature table
     */
    dropByFeatureTable(featureTable: FeatureTable): void;
    /**
     * Drop the the triggers and RTree table for the table and geometry column
     *
     * @param tableName table name
     * @param geometryColumnName geometry column name
     */
    dropTableAndColumn(tableName: string, geometryColumnName: string): void;
    /**
     * Drop the RTree Index Virtual Table
     * @param featureTable feature table
     */
    dropRTreeIndexByFeatureTable(featureTable: FeatureTable): void;
    /**
     * Drop the RTree Index Virtual Table
     * @param tableName table name
     * @param geometryColumnName geometry column name
     */
    dropRTreeIndex(tableName: string, geometryColumnName: string): void;
    /**
     * Check if the feature table has the RTree extension and if found, drop the
     * triggers
     * @param featureTable feature table
     */
    dropTriggersByFeatureTable(featureTable: FeatureTable): void;
    /**
     * Check if the table and column has the RTree extension and if found, drop
     * the triggers
     * @param tableName table name
     * @param columnName column name
     * @return true if dropped
     */
    dropTriggers(tableName: string, columnName: string): boolean;
    /**
     * Drop Triggers that Maintain Spatial Index Values
     * @param featureTable feature table
     */
    dropAllTriggersByFeatureTable(featureTable: FeatureTable): void;
    /**
     * Drop Triggers that Maintain Spatial Index Values
     *
     * @param tableName table name
     * @param geometryColumnName geometry column name
     */
    dropAllTriggers(tableName: string, geometryColumnName: string): void;
    /**
     * Drop insert trigger
     *
     * @param tableName
     *            table name
     * @param geometryColumnName
     *            geometry column name
     */
    dropInsertTrigger(tableName: string, geometryColumnName: string): void;
    /**
     * Drop update 1 trigger
     *
     * @param tableName table name
     * @param geometryColumnName  geometry column name
     */
    dropUpdate1Trigger(tableName: string, geometryColumnName: string): void;
    /**
     * Drop update 2 trigger
     *
     * @param tableName
     *            table name
     * @param geometryColumnName
     *            geometry column name
     */
    dropUpdate2Trigger(tableName: string, geometryColumnName: string): void;
    /**
     * Drop update 3 trigger
     *
     * @param tableName
     *            table name
     * @param geometryColumnName
     *            geometry column name
     */
    dropUpdate3Trigger(tableName: string, geometryColumnName: string): void;
    /**
     * Drop update 4 trigger
     *
     * @param tableName
     *            table name
     * @param geometryColumnName
     *            geometry column name
     */
    dropUpdate4Trigger(tableName: string, geometryColumnName: string): void;
    /**
     * Drop delete trigger
     *
     * @param tableName
     *            table name
     * @param geometryColumnName
     *            geometry column name
     */
    dropDeleteTrigger(tableName: string, geometryColumnName: string): void;
    /**
     * Drop the trigger for the table, geometry column, and trigger name
     * @param tableName table name
     * @param geometryColumnName geometry column name
     * @param triggerName trigger name
     */
    dropTrigger(tableName: string, geometryColumnName: string, triggerName: string): void;
}
