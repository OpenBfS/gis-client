/**
 * Query on the SQLiteMaster table
 */
import { SQLiteMasterColumn } from './sqliteMasterColumn';
export declare class SQLiteMasterQuery {
    /**
     * Combine operation for multiple queries
     */
    combineOperation: string;
    /**
     * List of queries
     */
    queries: string[];
    /**
     * List of arguments
     */
    arguments: string[];
    /**
     * Create a query with the combine operation
     * @param combineOperation combine operation
     */
    constructor(combineOperation: string);
    /**
     * Add a query
     * @param column  column
     * @param operation operation
     * @param value value
     */
    add(column: SQLiteMasterColumn, operation: string, value: string): void;
    /**
     * Add an is null query
     * @param column column
     */
    addIsNull(column: SQLiteMasterColumn): void;
    /**
     * Add an is not null query
     * @param column column
     */
    addIsNotNull(column: SQLiteMasterColumn): void;
    /**
     * Validate the state of the query when adding to the query
     */
    validateAdd(): void;
    /**
     * Determine a query has been set
     * @return true if has a query
     */
    has(): boolean;
    /**
     * Build the query SQL
     * @return sql
     */
    buildSQL(): string;
    /**
     * Get the query arguments
     * @return arguments
     */
    getArguments(): string[];
    /**
     * Create an empty query that supports a single query
     * @return query
     */
    static create(): SQLiteMasterQuery;
    /**
     * Create a query with multiple queries combined by an OR
     * @return query
     */
    static createOr(): SQLiteMasterQuery;
    /**
     * Create a query with multiple queries combined by an AND
     * @return query
     */
    static createAnd(): SQLiteMasterQuery;
    /**
     * Create a single equality query
     *
     * @param column column
     * @param value value
     * @return query
     */
    static createForColumnValue(column: SQLiteMasterColumn, value: string): SQLiteMasterQuery;
    /**
     * Create a single query
     * @param column column
     * @param operation operation
     * @param value value
     * @return query
     */
    static createForOperationAndColumnValue(column: SQLiteMasterColumn, operation: string, value: string): SQLiteMasterQuery;
    /**
     * Create an equality query with multiple values for a single column
     * combined with an OR
     * @param column column
     * @param values value
     * @return query
     */
    static createOrForColumnValue(column: SQLiteMasterColumn, values: string[]): SQLiteMasterQuery;
    /**
     * Create a query with multiple values for a single column combined with an
     * OR
     *
     * @param column column
     * @param operation operation
     * @param values value
     * @return query
     */
    static createOrForOperationAndColumnValue(column: SQLiteMasterColumn, operation: string, values: string[]): SQLiteMasterQuery;
    /**
     * Create an equality query with multiple values for a single column
     * combined with an AND
     * @param column column
     * @param values value
     * @return query
     */
    static createAndForColumnValue(column: SQLiteMasterColumn, values: string[]): SQLiteMasterQuery;
    /**
     * Create a query with multiple values for a single column combined with an
     * AND
     * @param column column
     * @param operation operation
     * @param values value
     * @return query
     */
    static createAndForOperationAndColumnValue(column: SQLiteMasterColumn, operation: string, values: string[]): SQLiteMasterQuery;
    /**
     * Create a query to find views in the sql column referring to the table
     * @param tableName table name
     * @return query
     */
    static createTableViewQuery(tableName: string): SQLiteMasterQuery;
}
