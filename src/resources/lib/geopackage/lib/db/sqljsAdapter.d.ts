/// <reference types="node" />
import { DBAdapter, DBValue } from './dbAdapter';
/**
 * This adapter uses sql.js to execute queries against the GeoPackage database
 * @module db/sqljsAdapter
 * @see {@link http://kripken.github.io/sql.js/documentation/|sqljs}
 */
export declare class SqljsAdapter implements DBAdapter {
    static SQL: {
        Database: any;
    };
    db: any;
    filePath: string | Buffer | Uint8Array;
    static sqljsWasmLocateFile: (filename: string) => string;
    static setSqljsWasmLocateFile(locateFile: (filename: string) => string): void;
    /**
     * Returns a Promise which, when resolved, returns a DBAdapter which has connected to the GeoPackage database file
     */
    initialize(): Promise<this>;
    /**
     * @param  {string|Buffer|Uint8Array} [filePath] string path to an existing file or a path to where a new file will be created or a url from which to download a GeoPackage or a Uint8Array containing the contents of the file, if undefined, an in memory database is created
     */
    constructor(filePath?: string | Buffer | Uint8Array);
    /**
     * Closes the connection to the GeoPackage
     */
    close(): void;
    /**
     * Get the connection to the database file
     * @return {any}
     */
    getDBConnection(): any;
    /**
     * Returns a Uint8Array containing the contents of the database as a file
     */
    export(): Promise<Uint8Array>;
    /**
     * Registers the given function so that it can be used by SQL statements
     * @see {@link http://kripken.github.io/sql.js/documentation/#http://kripken.github.io/sql.js/documentation/class/Database.html#create_function-dynamic|sqljs create_function}
     * @param  {string} name               name of function to register
     * @param  {Function} functionDefinition function to register
     * @return {module:db/sqljsAdapter~Adapter} this
     */
    registerFunction(name: string, functionDefinition: Function): this;
    /**
     * Gets one row of results from the statement
     * @see {@link http://kripken.github.io/sql.js/documentation/#http://kripken.github.io/sql.js/documentation/class/Statement.html#get-dynamic|sqljs get}
     * @see {@link http://kripken.github.io/sql.js/documentation/#http://kripken.github.io/sql.js/documentation/class/Statement.html#getAsObject-dynamic|sqljs getAsObject}
     * @param  {String} sql    statement to run
     * @param  {Array|Object} [params] substitution parameters
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
     * @param  {String} sql    statement to run
     * @param  {Array|Object} [params] bind parameters
     * @return {Object[]}
     */
    all(sql: string, params?: [] | Record<string, DBValue>): Record<string, DBValue>[];
    /**
     * Returns an Iterable with results from the query
     * @param  {string} sql    statement to run
     * @param  {Object|Array} params bind parameters
     * @return {IterableIterator<Object>}
     */
    each(sql: string, params?: [] | Record<string, DBValue>): IterableIterator<Record<string, DBValue>>;
    /**
     * Runs the statement specified, returning information about what changed
     * @see {@link http://kripken.github.io/sql.js/documentation/#http://kripken.github.io/sql.js/documentation/class/Statement.html#run-dynamic|sqljs run}
     * @param  {string} sql    statement to run
     * @param  {Object|Array} [params] bind parameters
     * @return {Object} object containing a changes property indicating the number of rows changed and a lastInsertROWID indicating the last inserted row
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
     * @param  {Object|Array} [params] bind parameters
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
     * @param  {String} tableName table name from which to count
     * @param  {String} [where]     where clause
     * @param  {Object|Array} [whereArgs] where args
     * @return {Number} count
     */
    count(tableName: string, where?: string, whereArgs?: [] | Record<string, DBValue>): number;
    transaction(func: Function): void;
}
