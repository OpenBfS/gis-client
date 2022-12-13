/**
 * Abstract collection of columns from a user table, representing a full set of
 * table columns or a subset from a query
 * @param <TColumn> column type
 */
import { UserColumn } from './userColumn';
import { GeoPackageDataType } from '../db/geoPackageDataType';
export declare class UserColumns<TColumn extends UserColumn> {
    /**
     * Table name, null when a pre-ordered subset of columns for a query
     */
    _tableName: string;
    /**
     * Array of column names
     */
    _columnNames: string[];
    /**
     * List of columns
     */
    _columns: TColumn[];
    /**
     * Custom column specification flag (subset of table columns or different
     * ordering)
     */
    _custom: boolean;
    /**
     * Mapping between (lower cased) column names and their index
     */
    _nameToIndex: Map<string, number>;
    /**
     * Primary key column index
     */
    _pkIndex: number;
    /**
     * Constructor
     * @param tableName table name
     * @param columns columns
     * @param custom custom column specification
     */
    protected constructor(tableName: string, columns: TColumn[], custom?: boolean);
    /**
     * Copy the user columns
     * @return copied user columns
     */
    copy(): UserColumns<TColumn>;
    /**
     * Update the table columns
     */
    updateColumns(): void;
    /**
     * Check for duplicate column names
     *
     * @param index index
     * @param previousIndex previous index
     * @param column column
     */
    duplicateCheck(index: number, previousIndex: number, column: string): void;
    /**
     * Check for the expected data type
     * @param expected expected data type
     * @param column user column
     */
    typeCheck(expected: GeoPackageDataType, column: TColumn): void;
    /**
     * Check for missing columns
     * @param index column index
     * @param column user column
     */
    missingCheck(index: number, column: string): void;
    /**
     * Get the column index of the column name
     * @param columnName column name
     * @return column index
     */
    getColumnIndexForColumnName(columnName: string): number;
    /**
     * Get the column index of the column name
     * @param columnName column name
     * @param required column existence is required
     * @return column index
     */
    getColumnIndex(columnName: string, required: boolean): number;
    /**
     * Get the array of column names
     * @return column names
     */
    getColumnNames(): string[];
    /**
     * Get the column name at the index
     * @param index column index
     * @return column name
     */
    getColumnName(index: number): string;
    /**
     * Get the list of columns
     * @return columns
     */
    getColumns(): TColumn[];
    /**
     * Get the column at the index
     * @param index column index
     * @return column
     */
    getColumnForIndex(index: number): TColumn;
    /**
     * Get the column of the column name
     * @param columnName column name
     * @return column
     */
    getColumn(columnName: string): TColumn;
    /**
     * Check if the table has the column
     * @param columnName column name
     * @return true if has the column
     */
    hasColumn(columnName: string): boolean;
    /**
     * Get the column count
     * @return column count
     */
    columnCount(): number;
    /**
     * Get the table name
     * @return table name
     */
    getTableName(): string;
    /**
     * Set the table name
     * @param tableName table name
     */
    setTableName(tableName: string): void;
    /**
     * Is custom column specification (partial and/or ordering)
     * @return custom flag
     */
    isCustom(): boolean;
    /**
     * Set the custom column specification flag
     * @param custom custom flag
     */
    setCustom(custom: boolean): void;
    /**
     * Check if the table has a primary key column
     * @return true if has a primary key
     */
    hasPkColumn(): boolean;
    /**
     * Get the primary key column index
     * @return primary key column index
     */
    getPkColumnIndex(): number;
    /**
     * Get the primary key column
     * @return primary key column
     */
    getPkColumn(): TColumn;
    /**
     * Get the primary key column name
     * @return primary key column name
     */
    getPkColumnName(): string;
    /**
     * Get the columns with the provided data type
     * @param type data type
     * @return columns
     */
    columnsOfType(type: GeoPackageDataType): TColumn[];
    /**
     * Add a new column
     * @param column new column
     */
    addColumn(column: TColumn): void;
    /**
     * Rename a column
     * @param column column
     * @param newColumnName new column name
     */
    renameColumn(column: TColumn, newColumnName: string): void;
    /**
     * Rename a column
     * @param columnName column name
     * @param newColumnName new column name
     */
    renameColumnWithName(columnName: string, newColumnName: string): void;
    /**
     * Rename a column
     * @param index column index
     * @param newColumnName new column name
     */
    renameColumnWithIndex(index: number, newColumnName: string): void;
    /**
     * Drop a column
     * @param column column to drop
     */
    dropColumn(column: TColumn): void;
    /**
     * Drop a column
     * @param columnName column name
     */
    dropColumnWithName(columnName: string): void;
    /**
     * Drop a column
     * @param index column index
     */
    dropColumnWithIndex(index: number): void;
    /**
     * Alter a column
     * @param column altered column
     */
    alterColumn(column: TColumn): void;
}
