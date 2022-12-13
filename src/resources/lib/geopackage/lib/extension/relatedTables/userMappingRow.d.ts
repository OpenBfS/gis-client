import { UserMappingTable } from './userMappingTable';
import { UserRow } from '../../user/userRow';
import { DBValue } from '../../db/dbAdapter';
import { GeoPackageDataType } from '../../db/geoPackageDataType';
import { UserColumn } from '../../user/userColumn';
/**
 * UserMappingRow module.
 * @module extension/relatedTables
 */
/**
 * User Mapping Row containing the values from a single result set row
 * @class
 * @extends UserRow
 * @param  {module:extension/relatedTables~UserMappingTable} table user mapping table
 * @param  {module:db/geoPackageDataType[]} columnTypes  column types
 * @param  {module:dao/columnValues~ColumnValues[]} values      values
 */
export declare class UserMappingRow extends UserRow {
    table: UserMappingTable;
    row: UserRow;
    constructor(table: UserMappingTable, columnTypes?: {
        [key: string]: GeoPackageDataType;
    }, values?: Record<string, DBValue>);
    /**
     * Get the base id column
     * @return {module:user/userColumn~UserColumn}
     */
    get baseIdColumn(): UserColumn;
    /**
     * Gets the base id
     * @return {Number}
     */
    get baseId(): number;
    /**
     * Sets the base id
     * @param  {Number} baseId base id
     */
    set baseId(baseId: number);
    /**
     * Get the related id column
     * @return {module:user/userColumn~UserColumn}
     */
    get relatedIdColumn(): UserColumn;
    /**
     * Gets the related id
     * @return {Number}
     */
    get relatedId(): number;
    /**
     * Sets the related id
     * @param  {Number} relatedId related id
     */
    set relatedId(relatedId: number);
}
