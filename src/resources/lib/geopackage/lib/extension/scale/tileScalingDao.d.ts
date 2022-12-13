import { Dao } from '../../dao/dao';
import { TileScaling } from './tileScaling';
import { DBValue } from '../../db/dbAdapter';
/**
 * Tile Scaling Data Access Object
 * @constructor
 * @extends Dao
 */
export declare class TileScalingDao extends Dao<TileScaling> {
    static readonly TABLE_NAME: string;
    static readonly COLUMN_TABLE_NAME: string;
    static readonly COLUMN_SCALING_TYPE: string;
    static readonly COLUMN_ZOOM_IN: string;
    static readonly COLUMN_ZOOM_OUT: string;
    readonly gpkgTableName: string;
    readonly idColumns: string[];
    /**
     * Create a {module:extension/scale.TileScaling} object
     * @return {module:extension/scale.TileScaling}
     */
    createObject(results?: Record<string, DBValue>): TileScaling;
    /**
     * Create the necessary tables for this dao
     * @return {Promise}
     */
    createTable(): boolean;
    /**
     * Query by table name
     * @param  {string} tableName name of the table
     * @return {module:extension/scale.TileScaling}
     */
    queryForTableName(tableName: string): TileScaling;
    /**
     * Delete by tableName
     * @param  {string} tableName the table name to delete by
     * @return {number} number of deleted rows
     */
    deleteByTableName(tableName: string): number;
}
