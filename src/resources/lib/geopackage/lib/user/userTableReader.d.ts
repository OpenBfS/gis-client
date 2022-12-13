/**
 * userTableReader module.
 * @module user/userTableReader
 */
import { UserTable } from './userTable';
import { UserColumn } from './userColumn';
import { GeoPackageConnection } from '../db/geoPackageConnection';
import { TableColumn } from '../db/table/tableColumn';
/**
 * @class
 */
export declare abstract class UserTableReader<TColumn extends UserColumn, TTable extends UserTable<TColumn>> {
    table_name: string;
    /**
     * @param table_name name of the table
     */
    protected constructor(table_name: string);
    /**
     * Read the table
     * @param db connection
     * @return table
     */
    readTable(db: GeoPackageConnection): TTable;
    /**
     * Creates a user column
     */
    createColumn(tableColumn: TableColumn): TColumn;
    /**
     * Creates a user column
     */
    abstract createTable(tableName: string, columnList: TColumn[]): TTable;
}
