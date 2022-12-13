/// <reference types="node" />
import { DBAdapter, DBValue } from './dbAdapter';
/**
 * This adapter uses better-sqlite3 to execute queries against the GeoPackage database
 * @see {@link https://github.com/JoshuaWise/better-sqlite3|better-sqlite3}
 */
export declare class SqliteAdapter implements DBAdapter {
    filePath: string | Buffer | Uint8Array;
    db: any;
    /**
     * Returns a Promise which, when resolved, returns a DBAdapter which has connected to the GeoPackage database file
     */
    initialize(): Promise<this>;
    constructor(filePath?: string | Buffer | Uint8Array);
    /**
     * Closes the connection to the GeoPackage
     */
    close(): void;
    /**
     * Get the connection to the database file
     * @return {*}
     */
    getDBConnection(): any;
    getFunctionList(): any[];
    /**
     * Returns a Buffer containing the contents of the database as a file
     */
    export(): Promise<any>;
    /**
     * Registers the given function so that it can be used by SQL statements
     * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#registeroptions-function---this|better-sqlite3 register}
     * @param  {string} name               name of function to register
     * @param  {Function} functionDefinition function to register
     * @return {module:db/sqliteAdapter~Adapter} this
     */
    registerFunction(name: string, functionDefinition: Function): this;
    /**
     * Gets one row of results from the statement
     * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#getbindparameters---row|better-sqlite3 get}
     * @param  {string} sql    statement to run
     * @param  {Array|Object} [params] bind parameters
     * @return {Object}
     */
    get(sql: string, params?: [] | Record<string, DBValue>): Record<string, DBValue>;
    /**
     * Determines if a tableName exists in the database
     * @param {String} tableName
     * @returns {Boolean}
     */
    isTableExists(tableName: string): boolean;
    /**
     * Gets all results from the statement in an array
     * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#allbindparameters---array-of-rows|better-sqlite3 all}
     * @param  {String} sql    statement to run
     * @param  {Array|Object} [params] bind parameters
     * @return {Object[]}
     */
    all(sql: string, params?: [] | Record<string, DBValue>): Record<string, DBValue>[];
    /**
     * Returns an `Iterable` with results from the query
     * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#iteratebindparameters---iterator|better-sqlite3 iterate}
     * @param  {String} sql    statement to run
     * @param  {Object|Array} [params] bind parameters
     * @return {Iterable.<Object>}
     */
    each(sql: string, params?: [] | Record<string, DBValue>): IterableIterator<Record<string, DBValue>>;
    /**
     * Run the given statement, returning information about what changed.
     *
     * @see {@link https://github.com/JoshuaWise/better-sqlite3/wiki/API#runbindparameters---object|better-sqlite3}
     * @param  {String} sql    statement to run
     * @param  {Object|Array} [params] bind parameters
     * @return {{changes: number, lastInsertROWID: number}} object: `{ "changes": number, "lastInsertROWID": number }`
     * * `changes`: number of rows the statement changed
     * * `lastInsertROWID`: ID of the last inserted row
     */
    run(sql: string, params?: [] | Record<string, DBValue>): {
        changes: number;
        lastInsertRowid: number;
    };
    /**
     * Runs the specified insert statement and returns the last inserted id or undefined if no insert happened
     * @param  {String} sql    statement to run
     * @param  {Object|Array} [params] bind parameters
     * @return {Number} last inserted row id
     */
    insert(sql: string, params?: [] | Record<string, DBValue>): number;
    /**
     * Prepares a SQL statement
     * @param sql
     */
    prepareStatement(sql: string): any;
    /**
     * Runs an insert statement with the parameters provided
     * @param  {any} statement  statement to run
     * @param  {Object|Array} [params] bind parameters
     * @return {Number} last inserted row id
     */
    bindAndInsert(statement: any, params?: [] | Record<string, DBValue>): number;
    /**
     * Closes a prepared statement
     * @param statement
     */
    closeStatement(statement: any): void;
    /**
     * Runs the specified delete statement and returns the number of deleted rows
     * @param  {String} sql    statement to run
     * @param  {Object|Array} params bind parameters
     * @return {Number} deleted rows
     */
    delete(sql: string, params?: [] | Record<string, DBValue>): number;
    /**
     * Drops the table
     * @param  {String} table table name
     * @return {Boolean} indicates if the table was dropped
     */
    dropTable(table: string): boolean;
    /**
     * Counts rows that match the query
     * @param  {string} tableName table name from which to count
     * @param  {string} [where]     where clause
     * @param  {Object|Array} [whereArgs] where args
     * @return {Number} count
     */
    count(tableName: string, where?: string, whereArgs?: [] | Record<string, DBValue>): number;
    transaction(func: Function): void;
}
