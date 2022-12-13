/**
 * @module extension/relatedTables
 */
import { UserCustomDao } from '../../user/custom/userCustomDao';
import { GeoPackage } from '../../geoPackage';
import { UserMappingTable } from './userMappingTable';
import { UserMappingRow } from './userMappingRow';
import { UserRow } from '../../user/userRow';
import { DBValue } from '../../db/dbAdapter';
import { GeoPackageDataType } from '../../db/geoPackageDataType';
/**
 * User Mapping DAO for reading user mapping data tables
 * @class
 * @param  {string} table table name
 * @param  {module:geoPackage~GeoPackage} geoPackage      geopackage object
 * @param {UserMappingTable} [userMappingTable]
 */
export declare class UserMappingDao<T extends UserMappingRow> extends UserCustomDao<UserMappingRow> {
    constructor(userCustomDao: UserCustomDao<UserMappingRow>, geoPackage: GeoPackage, userMappingTable?: UserMappingTable);
    /**
     * Create a new {module:user/custom~UserCustomTable}
     * @param  {module:user/custom~UserCustomDao} userCustomDao
     * @return {module:user/custom~UserCustomTable} userCustomTable user custom table
     */
    static createMappingTable(userCustomDao: UserCustomDao<UserRow>): UserMappingTable;
    /**
     * Gets the {module:extension/relatedTables~UserMappingTable}
     * @return {module:extension/relatedTables~UserMappingTable}
     */
    get table(): UserMappingTable;
    /**
     * Create a user mapping row
     * @param  {module:db/geoPackageDataType[]} columnTypes  column types
     * @param  {module:dao/columnValues~ColumnValues[]} values      values
     * @return {module:extension/relatedTables~UserMappingRow}             user mapping row
     */
    newRow(columnTypes?: {
        [key: string]: GeoPackageDataType;
    }, values?: Record<string, DBValue>): UserMappingRow;
    /**
     * Gets the user mapping row from the result
     * @param  {Object} result db result
     * @return {module:extension/relatedTables~UserMappingRow}             user mapping row
     */
    getUserMappingRow(result: Record<string, DBValue>): UserMappingRow;
    /**
     * Query by base id
     * @param  {(UserMappingRow | Number)} baseId base id
     * @return {Object[]}
     */
    queryByBaseId(baseId: UserMappingRow | number): Record<string, DBValue>[];
    /**
     * Query by related id
     * @param  {(Number & UserMappingRow)} relatedId related id
     * @return {Object[]}
     */
    queryByRelatedId(relatedId: UserMappingRow | number): Record<string, DBValue>[];
    /**
     * Query by base id and related id
     * @param  {(UserMappingRow | Number)} baseId base id
     * @param  {(UserMappingRow | Number)} [relatedId] related id
     * @return {Iterable<any>}
     */
    queryByIds(baseId: UserMappingRow | number, relatedId?: UserMappingRow | number): IterableIterator<Record<string, DBValue>>;
    /**
     * The unique related ids
     * @return {Number[]}
     */
    uniqueRelatedIds(): {
        related_id: number;
    }[];
    /**
     * Count user mapping rows by base id and related id
     * @param  {(UserMappingRow | Number)} baseId    base id
     * @param  {(UserMappingRow | Number)} [relatedId] related id
     * @return {Number}
     */
    countByIds(baseId: UserMappingRow | number, relatedId?: UserMappingRow | number): number;
    /**
     * Delete by base id
     * @param  {(UserMappingRow | Number)} baseId base id
     * @return {Number} number of deleted rows
     */
    deleteByBaseId(baseId: UserMappingRow | number): number;
    /**
     * Delete by related id
     * @param  {(UserMappingRow | Number)} relatedId related id
     * @return {Number} number of deleted rows
     */
    deleteByRelatedId(relatedId: UserMappingRow | number): number;
    /**
     * Delete by base id and related id
     * @param  {(UserMappingRow | Number)} baseId    base id
     * @param  {(UserMappingRow | Number)} [relatedId] related id
     * @return {Number} number of deleted rows
     */
    deleteByIds(baseId: UserMappingRow | number, relatedId?: UserMappingRow | number): number;
}
