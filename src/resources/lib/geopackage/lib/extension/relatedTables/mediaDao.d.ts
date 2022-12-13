import { UserDao } from '../../user/userDao';
import { MediaTable } from './mediaTable';
import { MediaRow } from './mediaRow';
import { GeoPackage } from '../../geoPackage';
import { DBValue } from '../../db/dbAdapter';
import { GeoPackageDataType } from '../../db/geoPackageDataType';
/**
 * MediaDao module.
 * @module extension/relatedTables
 */
/**
 * User Media DAO for reading user media data tables
 * @class
 * @param  {module:db/geoPackageConnection~GeoPackageConnection} connection        connection
 * @param  {string} table table name
 */
export declare class MediaDao<T extends MediaRow> extends UserDao<MediaRow> {
    protected _table: MediaTable;
    constructor(geoPackage: GeoPackage, table: MediaTable);
    /**
     * Create a media row with the column types and values
     * @param  {module:db/geoPackageDataType[]} columnTypes  column types
     * @param  {module:dao/columnValues~ColumnValues[]} values      values
     * @return {module:extension/relatedTables~MediaRow}             media row
     */
    newRow(columnTypes?: {
        [key: string]: GeoPackageDataType;
    }, values?: Record<string, DBValue>): MediaRow;
    /**
     * Gets the media table
     * @return {module:extension/relatedTables~MediaTable}
     */
    get table(): MediaTable;
    /**
     * Reads the table specified from the geopackage
     * @param  {module:geoPackage~GeoPackage} geoPackage      geopackage object
     * @param  {string} tableName       table name
     * @return {module:user/userDao~UserDao}
     */
    static readTable(geoPackage: GeoPackage, tableName: string): MediaDao<MediaRow>;
}
