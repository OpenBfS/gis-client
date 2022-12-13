/**
 * SimpleAttributesDao module.
 * @module extension/relatedTables
 */
import { UserDao } from '../../user/userDao';
import { SimpleAttributesTable } from './simpleAttributesTable';
import { SimpleAttributesRow } from './simpleAttributesRow';
import { GeoPackage } from '../../geoPackage';
import { DBValue } from '../../db/dbAdapter';
import { GeoPackageDataType } from '../../db/geoPackageDataType';
/**
 * User Simple Attributes DAO for reading user simple attributes data tables
 * @class
 * @extends UserDao
 * @param  {module:db/geoPackageConnection~GeoPackageConnection} connection        connection
 * @param  {string} table table name
 */
export declare class SimpleAttributesDao<T extends SimpleAttributesRow> extends UserDao<SimpleAttributesRow> {
    constructor(geoPackage: GeoPackage, table: SimpleAttributesTable);
    /**
     * Create a new {module:extension/relatedTables~SimpleAttributesRow} with the column types and values
     * @param  {module:db/geoPackageDataType[]} columnTypes  column types
     * @param  {module:dao/columnValues~ColumnValues[]} values      values
     * @return {module:extension/relatedTables~SimpleAttributesRow}             simple attributes row
     */
    newRow(columnTypes?: {
        [key: string]: GeoPackageDataType;
    }, values?: Record<string, DBValue>): SimpleAttributesRow;
    /**
     * Gets the {module:extension/relatedTables~SimpleAttributesTable}
     * @return {module:extension/relatedTables~SimpleAttributesTable}
     */
    get table(): SimpleAttributesTable;
    /**
     * Get the simple attributes rows from this table by ids
     * @param  {Number[]} ids array of ids
     * @return {module:extension/relatedTables~SimpleAttributesRow[]}
     */
    getRows(ids: number[]): SimpleAttributesRow[];
    static readTable(geoPackage: GeoPackage, tableName: string): SimpleAttributesDao<SimpleAttributesRow>;
}
