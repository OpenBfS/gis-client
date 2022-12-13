import { Dao } from '../../dao/dao';
import { TableIndex } from './tableIndex';
import { DBValue } from '../../db/dbAdapter';
/**
 * Table Index Data Access Object
 * @class
 * @extends Dao
 * @param {module:geoPackage~GeoPackage}  geoPackage The GeoPackage object
 */
export declare class TableIndexDao extends Dao<TableIndex> {
    static readonly TABLE_NAME: string;
    static readonly COLUMN_TABLE_NAME: string;
    static readonly COLUMN_LAST_INDEXED: string;
    readonly gpkgTableName: string;
    readonly idColumns: string[];
    /**
     * Create a new TableIndex object
     * @return {module:extension/index~TableIndex}
     */
    createObject(results?: Record<string, DBValue>): TableIndex;
    /**
     * Creates the tables necessary
     * @return {boolean}
     */
    createTable(): boolean;
}
