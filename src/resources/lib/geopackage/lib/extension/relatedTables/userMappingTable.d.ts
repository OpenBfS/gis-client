/**
 * userMappingTable module.
 * @module extension/relatedTables
 */
import { UserColumn } from '../../user/userColumn';
import { UserCustomTable } from '../../user/custom/userCustomTable';
/**
 * Contains user mapping table factory and utility methods
 * @class
 * @param  {string} tableName table name
 * @param  {module:user/userColumn~UserColumn[]} columns   user mapping columns
 */
export declare class UserMappingTable extends UserCustomTable {
    static readonly COLUMN_BASE_ID: string;
    static readonly COLUMN_RELATED_ID: string;
    get tableType(): string;
    /**
     * Get the base id column
     * @return {module:user/userColumn~UserColumn}
     */
    get baseIdColumn(): UserColumn;
    /**
     * Get the related id column
     * @return {module:user/userColumn~UserColumn}
     */
    get relatedIdColumn(): UserColumn;
    /**
     * Creates a user mapping table with the minimum required columns followed by the additional columns
     * @param  {string} tableName name of the table
     * @param  {module:user/userColumn~UserColumn[]} [columns] additional columns
     * @return {module:extension/relatedTables~UserMappingTable}
     */
    static create(tableName: string, columns?: UserColumn[]): UserMappingTable;
    /**
     * Get the number of required columns
     * @return {Number}
     */
    static numRequiredColumns(): number;
    /**
     * Create the required columns
     * @param  {Number} [startingIndex=0] starting index of the required columns
     * @return {module:user/userColumn~UserColumn[]}
     */
    static createRequiredColumns(startingIndex?: number): UserColumn[];
    /**
     * Create the base id column
     * @param  {Number} index        index of the column
     * @return {module:user/userColumn~UserColumn}
     */
    static createBaseIdColumn(index: number): UserColumn;
    /**
     * Create the related id column
     * @param  {Number} index        index of the column
     * @return {module:user/userColumn~UserColumn}
     */
    static createRelatedIdColumn(index: number): UserColumn;
    /**
     * Get the required columns
     * @return {string[]}
     */
    static requiredColumns(): string[];
}
