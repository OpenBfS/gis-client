/**
 * @module user/custom
 */
import { UserTable } from '../userTable';
import { UserColumn } from '../userColumn';
import { UserCustomColumn } from './userCustomColumn';
import { UserCustomColumns } from './userCustomColumns';
/**
 * Create a new user custom table
 * @class
 * @param  {string} tableName       table name
 * @param  {module:user/userColumn~UserColumn[]} columns         user columns
 * @param  {string[]} requiredColumns required columns
 */
export declare class UserCustomTable extends UserTable<UserCustomColumn> {
    constructor(tableName: string, columns: UserColumn[], requiredColumns?: string[]);
    /**
     * {@inheritDoc}
     */
    copy(): UserCustomTable;
    /**
     * {@inheritDoc}
     */
    getDataType(): string;
    /**
     * {@inheritDoc}
     */
    getUserColumns(): UserCustomColumns;
    /**
     * Get the required columns
     *
     * @return required columns
     */
    getRequiredColumns(): string[];
}
