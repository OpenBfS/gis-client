/**
 * Table Info queries (table_info)
 */
import { TableColumn } from './tableColumn';
import { GeoPackageConnection } from '../geoPackageConnection';
import { GeoPackageDataType } from '../geoPackageDataType';
export declare class TableInfo {
    /**
     * Index column
     */
    static CID: string;
    /**
     * Name column
     */
    static NAME: string;
    /**
     * Type column
     */
    static TYPE: string;
    /**
     * Not null column
     */
    static NOT_NULL: string;
    /**
     * Default value column
     */
    static DFLT_VALUE: string;
    /**
     * Primary key column
     */
    static PK: string;
    /**
     * Default of NULL value
     */
    static DEFAULT_NULL: string;
    /**
     * Table name
     */
    tableName: string;
    /**
     * Table columns
     */
    columns: TableColumn[];
    /**
     * Column name to column mapping
     */
    namesToColumns: Map<string, TableColumn>;
    /**
     * Primary key column names
     */
    primaryKeys: TableColumn[];
    /**
     * Constructor
     * @param tableName table name
     * @param columns table columns
     */
    constructor(tableName: string, columns: TableColumn[]);
    /**
     * Get the table name
     * @return table name
     */
    getTableName(): string;
    /**
     * Number of columns
     *
     * @return column count
     */
    numColumns(): number;
    /**
     * Get the columns
     * @return columns
     */
    getColumns(): TableColumn[];
    /**
     * Get the column at the index
     * @param index column index
     * @return column
     */
    getColumnAtIndex(index: number): TableColumn;
    /**
     * Check if the table has the column
     * @param name column name
     * @return true if has column
     */
    hasColumn(name: string): boolean;
    /**
     * Get the column with the name
     * @param name column name
     * @return column or null if does not exist
     */
    getColumn(name: string): TableColumn;
    /**
     * Check if the table has one or more primary keys
     * @return true if has at least one primary key
     */
    hasPrimaryKey(): boolean;
    /**
     * Get the primary key columns
     * @return primary key columns
     */
    getPrimaryKeys(): TableColumn[];
    /**
     * Get the single or first primary key if one exists
     * @return single or first primary key, null if no primary key
     */
    getPrimaryKey(): TableColumn;
    /**
     * Query for the table_info of the table name
     * @param db connection
     * @param tableName table name
     * @return table info or null if no table
     */
    static info(db: GeoPackageConnection, tableName: string): TableInfo;
    /**
     * Get the data type from the type value
     * @param type type value
     * @return data type or null
     */
    static getDataType(type: string): GeoPackageDataType;
}
