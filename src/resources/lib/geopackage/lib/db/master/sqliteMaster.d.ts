/**
 * SQLite Master table queries (sqlite_master)
 */
import { SQLiteMasterColumn } from './sqliteMasterColumn';
import { SQLiteMasterType } from './sqliteMasterType';
import { TableConstraints } from '../table/tableConstraints';
import { GeoPackageConnection } from '../geoPackageConnection';
import { SQLiteMasterQuery } from './sqliteMasterQuery';
export declare class SQLiteMaster {
    /**
     * Table Name
     */
    static TABLE_NAME: string;
    /**
     * SQLiteMaster query results
     */
    _results: any[];
    /**
     * Mapping between result columns and indices
     */
    _columns: {};
    /**
     * Query result count
     */
    _count: number;
    /**
     * Constructor
     * @param results query results
     * @param columns query columns
     */
    constructor(results: any[], columns: SQLiteMasterColumn[]);
    /**
     * Result count
     * @return count
     */
    count(): number;
    /**
     * Get the columns in the result
     * @return columns
     */
    columns(): SQLiteMasterColumn[];
    /**
     * Get the type
     * @param row row index
     * @return type
     */
    getType(row: number): SQLiteMasterType;
    /**
     * Get the type string
     * @param row row index
     * @return type string
     */
    getTypeString(row: number): string;
    /**
     * Get the name
     * @param row row index
     * @return name
     */
    getName(row: number): string;
    /**
     * Get the table name
     * @param row row index
     * @return name
     */
    getTableName(row: number): string;
    /**
     * Get the rootpage
     * @param row row index
     * @return name
     */
    getRootpage(row: number): number;
    /**
     * Get the sql
     * @param row row index
     * @return name
     */
    getSql(row: number): string;
    /**
     * Get the value of the column at the row index
     *
     * @param row row index
     * @param column column type
     * @return value
     */
    getValueForRowAndColumn(row: number, column: SQLiteMasterColumn): any;
    /**
     * Get the row at the row index
     * @param row row index
     * @return row column values
     */
    getRow(row: number): any[];
    /**
     * Get the value in the row at the column index
     * @param row row
     * @param column column type
     * @return value
     */
    static getValue(row: any[], column: SQLiteMasterColumn): any;
    /**
     * Get the constraints from table SQL
     * @param row row index
     * @return constraints
     */
    getConstraints(row: number): TableConstraints;
    /**
     * Count the sqlite_master table
     *
     * @param db connection
     * @param types result types
     * @param query query
     * @return count
     */
    static count(db: GeoPackageConnection, types: SQLiteMasterType[], query: SQLiteMasterQuery): number;
    /**
     * Query the sqlite_master table
     *
     * @param db connection
     * @param columns result columns
     * @param types result types
     * @param query query
     * @return SQLiteMaster result
     */
    static query(db: GeoPackageConnection, columns: SQLiteMasterColumn[], types: SQLiteMasterType[], query: SQLiteMasterQuery): SQLiteMaster;
    /**
     * Query the sqlite_master views on the table
     * @param db connection
     * @param columns result columns
     * @param tableName table name
     * @return SQLiteMaster result
     */
    static queryViewsOnTable(db: GeoPackageConnection, columns: SQLiteMasterColumn[], tableName: string): SQLiteMaster;
    /**
     * Count the sqlite_master views on the table
     * @param db connection
     * @param tableName table name
     * @return count
     */
    static countViewsOnTable(db: GeoPackageConnection, tableName: string): number;
    /**
     * Query for the table constraints
     * @param db  connection
     * @param tableName able name
     * @return SQL constraints
     */
    static queryForConstraints(db: GeoPackageConnection, tableName: string): TableConstraints;
}
