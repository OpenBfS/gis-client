/**
 * UserRow module.
 * @module user/userRow
 */
import { UserTable } from './userTable';
import { GeoPackageDataType } from '../db/geoPackageDataType';
import { DBValue } from '../db/dbAdapter';
import { UserColumn } from './userColumn';
export declare class UserRow {
    table: UserTable<UserColumn>;
    columnTypes?: {
        [key: string]: GeoPackageDataType;
    };
    values?: Record<string, DBValue>;
    /**
     * User Row containing the values from a single result row
     * @param table User Table
     * @param columnTypes Column types of this row, based upon the data values
     * @param values Array of the row values
     */
    constructor(table: UserTable<UserColumn>, columnTypes?: {
        [key: string]: GeoPackageDataType;
    }, values?: Record<string, DBValue>);
    /**
     * Gets the id column
     * @return {module:user/userColumn~UserColumn}
     */
    get idColumn(): UserColumn;
    /**
     * Get the column count
     * @return {number} column count
     */
    get columnCount(): number;
    /**
     * Get the column names
     * @return {Array} column names
     */
    get columnNames(): string[];
    /**
     * Get the column name at the index
     * @param  {Number} index index
     * @return {string}       column name
     */
    getColumnNameWithIndex(index: number): string;
    /**
     * Get the column index of the column name
     * @param  {string} columnName column name
     * @return {Number}            column index
     */
    getColumnIndexWithColumnName(columnName: string): number;
    /**
     * Get the value at the index
     * @param  {Number} index index
     * @return {object}       value
     */
    getValueWithIndex(index: number): any;
    /**
     * Get the value of the column name
     * @param  {string} columnName column name
     * @return {Object}            value
     */
    getValueWithColumnName(columnName: string): any;
    /**
     * Get the value from the database as an object based on the column
     * @param index column index
     * @param value value from the database
     */
    toObjectValue(index: number, value: DBValue): any;
    /**
     * Get the value which will be persisted to the database based on the column
     * @param columnName name of the column
     */
    toDatabaseValue(columnName: string): DBValue;
    /**
     * Get the row column type at the index
     * @param  {Number} index index
     * @return {Number}       row column type
     */
    getRowColumnTypeWithIndex(index: number): number;
    /**
     * Get the row column type of the column name
     * @param  {string} columnName column name
     * @return {Number}            row column type
     */
    getRowColumnTypeWithColumnName(columnName: string): number;
    /**
     * Get the column at the index
     * @param  {Number} index index
     * @return {UserColumn}       column
     */
    getColumnWithIndex(index: number): UserColumn;
    /**
     * Get the column of the column name
     * @param  {string} columnName column name
     * @return {UserColumn}            column
     */
    getColumnWithColumnName(columnName: string): UserColumn;
    /**
     * Get the id value, which is the value of the primary key
     * @return {Number} id value
     */
    get id(): number;
    /**
     * Set the primary key id value
     * @param {Number} id id
     */
    set id(id: number);
    /**
     * Get the primary key column Index
     * @return {Number} pk index
     */
    get pkColumnIndex(): number;
    /**
     * Get the primary key column
     * @return {UserColumn} pk column
     */
    get pkColumn(): UserColumn;
    /**
     * Set the value at the index
     * @param {Number} index index
     * @param {object} value value
     */
    setValueWithIndex(index: number, value: any): void;
    /**
     * Set the value at the index without validation
     * @param {Number} index index
     * @param {Object} value value
     */
    setValueNoValidationWithIndex(index: number, value: any): void;
    /**
     * Set the value of the column name
     * @param {string} columnName column name
     * @param {Object} value      value
     */
    setValueWithColumnName(columnName: string, value: any): void;
    hasIdColumn(): boolean;
    hasId(): boolean;
    /**
     * Clears the id so the row can be used as part of an insert or create
     */
    resetId(): void;
}
