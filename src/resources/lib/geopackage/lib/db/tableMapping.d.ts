import { MappedColumn } from './mappedColumn';
import { UserColumn } from '../user/userColumn';
import { TableInfo } from './table/tableInfo';
/**
 * Mapping between column names being mapped to and the mapped column
 * information
 *
 * @author osbornb
 * @since 3.3.0
 */
export declare class TableMapping {
    /**
     * From table name
     */
    _fromTable: string;
    /**
     * To table name
     */
    _toTable: string;
    /**
     * Transfer row content to new table
     */
    _transferContent: boolean;
    /**
     * Mapping between column names and mapped columns
     */
    _columns: {};
    /**
     * Dropped columns from the previous table version
     */
    _droppedColumns: Set<string>;
    /**
     * Custom where clause (in addition to column where mappings)
     */
    _where: string;
    /**
     * Constructor
     * @param fromTableName table name
     * @param toTableName table name
     * @param columns user columns
     */
    constructor(fromTableName: string, toTableName: string, columns: UserColumn[]);
    static fromTableInfo(tableInfo: TableInfo): TableMapping;
    /**
     * Get the from table name
     * @return from table name
     */
    get fromTable(): string;
    /**
     * Set the from table name
     * @param fromTable from table name
     */
    set fromTable(fromTable: string);
    /**
     * Get the to table name
     * @return to table name
     */
    get toTable(): string;
    /**
     * Set the to table name
     * @param toTable to table name
     */
    set toTable(toTable: string);
    /**
     * Check if the table mapping is to a new table
     * @return true if a new table
     */
    isNewTable(): boolean;
    /**
     * Is the transfer content flag enabled
     * @return true if data should be transfered to the new table
     */
    isTransferContent(): boolean;
    /**
     * Set the transfer content flag
     * @param transferContent true if data should be transfered to the new table
     */
    set transferContent(transferContent: boolean);
    /**
     * Add a column
     * @param column mapped column
     */
    addMappedColumn(column: MappedColumn): void;
    /**
     * Add a column
     * @param columnName column name
     */
    addColumnWithName(columnName: string): void;
    /**
     * Remove a column
     *
     * @param columnName
     *            column name
     * @return removed mapped column or null
     */
    removeColumn(columnName: string): UserColumn;
    /**
     * Get the column names
     * @return column names
     */
    getColumnNames(): string[];
    /**
     * Get the columns as an entry set
     * @return columns
     */
    getColumns(): any;
    /**
     * Get the mapped column values
     * @return columns
     */
    getMappedColumns(): MappedColumn[];
    /**
     * Get the mapped column for the column name
     * @param columnName column name
     * @return mapped column
     */
    getColumn(columnName: string): MappedColumn;
    /**
     * Add a dropped column
     * @param columnName column name
     */
    addDroppedColumn(columnName: string): void;
    /**
     * Remove a dropped column
     * @param columnName column name
     * @return true if removed
     */
    removeDroppedColumn(columnName: string): boolean;
    /**
     * Get a set of dropped columns
     * @return dropped columns
     */
    get droppedColumns(): Set<string>;
    /**
     * Check if the column name is a dropped column
     * @param columnName column name
     * @return true if a dropped column
     */
    isDroppedColumn(columnName: string): boolean;
    /**
     * Check if there is a custom where clause
     * @return true if where clause
     */
    hasWhere(): boolean;
    /**
     * Get the where clause
     * @return where clause
     */
    get where(): string;
    /**
     * Set the where clause
     * @param where where clause
     */
    set where(where: string);
}
