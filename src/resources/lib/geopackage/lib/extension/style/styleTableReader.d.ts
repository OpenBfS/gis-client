/**
 * @memberOf module:extension/style
 * @class StyleTableReader
 */
import { AttributesTableReader } from '../../attributes/attributesTableReader';
import { StyleTable } from './styleTable';
import { UserColumn } from '../../user/userColumn';
/**
 * Reads the metadata from an existing attribute table
 * @extends {AttributesTableReader}
 * @constructor
 */
export declare class StyleTableReader extends AttributesTableReader {
    /**
     *
     * @param {String} tableName
     * @param columns
     * @returns {module:extension/style.StyleTable}
     */
    createTable(tableName: string, columns: UserColumn[]): StyleTable;
}
