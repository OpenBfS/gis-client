/**
 * @module attributes
 */
import { UserColumns } from '../user/userColumns';
import { AttributesColumn } from './attributesColumn';
/**
 * UserCustomColumns
 */
export declare class AttributesColumns extends UserColumns<AttributesColumn> {
    constructor(tableName: string, columns: AttributesColumn[], custom: boolean);
    copy(): AttributesColumns;
}
