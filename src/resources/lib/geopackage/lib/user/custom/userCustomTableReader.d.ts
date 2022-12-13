/**
 * @module user/custom
 */
import { UserCustomTable } from './userCustomTable';
import { UserTableReader } from '../userTableReader';
import { UserCustomColumn } from './userCustomColumn';
import { GeoPackage } from '../../geoPackage';
import { TableColumn } from '../../db/table/tableColumn';
/**
 * User custom table reader
 * @class
 * @param  {string} tableName       table name
 * @param  {string[]} requiredColumns required columns
 */
export declare class UserCustomTableReader extends UserTableReader<UserCustomColumn, UserCustomTable> {
    constructor(table_name: string);
    readUserCustomTable(geoPackage: GeoPackage): UserCustomTable;
    /**
     * @inheritDoc
     */
    createTable(tableName: string, columns: UserCustomColumn[]): UserCustomTable;
    /**
     * @inheritDoc
     */
    createColumn(tableColumn: TableColumn): UserCustomColumn;
}
