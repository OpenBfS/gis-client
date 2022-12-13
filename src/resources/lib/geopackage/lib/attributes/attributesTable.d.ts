/**
 * @module attributes/attributesTable
 */
import { UserTable } from '../user/userTable';
import { Contents } from '../core/contents/contents';
import { AttributesColumn } from './attributesColumn';
/**
 * Represents a user attribute table
 * @class AttributesTable
 * @extends UserTable
 * @constructor
 * @param  {string} tableName table name
 * @param  {module:user/userColumn~UserColumn[]} columns   attribute columns
 */
export declare class AttributesTable extends UserTable<AttributesColumn> {
    contents: Contents;
    constructor(tableName: string, columns: AttributesColumn[]);
    /**
     * Set the contents
     * @param  {module:core/contents~Contents} contents the contents
     */
    setContents(contents: Contents): boolean;
}
