/// <reference types="node" />
import { MediaTable } from './mediaTable';
import { UserRow } from '../../user/userRow';
import { DBValue } from '../../db/dbAdapter';
import { UserColumn } from '../../user/userColumn';
import { GeoPackageDataType } from '../../db/geoPackageDataType';
/**
 * MediaRow module.
 * @module extension/relatedTables
 */
/**
 * User Media Row containing the values from a single result set row
 * @class
 * @extends UserRow
 * @param  {module:extension/relatedTables~MediaTable} mediaTable  media table
 * @param  {module:db/geoPackageDataType[]} columnTypes  column types
 * @param  {module:dao/columnValues~ColumnValues[]} values      values
 */
export declare class MediaRow extends UserRow {
    mediaTable: MediaTable;
    constructor(mediaTable: MediaTable, columnTypes?: {
        [key: string]: GeoPackageDataType;
    }, values?: Record<string, DBValue>);
    /**
     * Get the data column
     * @return {module:user/userColumn~UserColumn}
     */
    get dataColumn(): UserColumn;
    /**
     * Gets the data
     * @return {Buffer}
     */
    get data(): Buffer;
    /**
     * Sets the data for the row
     * @param  {Buffer} data data
     */
    set data(data: Buffer);
    /**
     * Get the data image
     *
     * @return {Promise<Image>}
     */
    get dataImage(): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    /**
     * Get the scaled data image
     * @param {Number} scale
     * @return {Promise<Image>}
     */
    getScaledDataImage(scale: number): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    /**
     * Get the content type column
     * @return {module:user/userColumn~UserColumn}
     */
    get contentTypeColumn(): UserColumn;
    /**
     * Gets the content type
     * @return {string}
     */
    get contentType(): string;
    /**
     * Sets the content type for the row
     * @param  {string} contentType contentType
     */
    set contentType(contentType: string);
}
