/**
 * @module user/custom
 */
import { UserColumn } from '../userColumn';
import { GeoPackageDataType } from '../../db/geoPackageDataType';
import { DBValue } from '../../db/dbAdapter';
/**
 * Create a new user custom columnd
 *  @param {Number} index        column index
 *  @param {string} name         column name
 *  @param {module:db/geoPackageDataType~GPKGDataType} dataType  data type
 *  @param {Number} max max value
 *  @param {Boolean} notNull      not null
 *  @param {Object} defaultValue default value or nil
 *  @param {Boolean} primaryKey primary key
 *  @param {Boolean} autoincrement autoincrement
 */
export declare class UserCustomColumn extends UserColumn {
    constructor(index: number, name: string, dataType: GeoPackageDataType, max?: number, notNull?: boolean, defaultValue?: DBValue, primaryKey?: boolean, autoincrement?: boolean);
    /**
     *  Create a new column
     *
     *  @param {Number} index        column index
     *  @param {string} name         column name
     *  @param {GeoPackageDataType} type data type
     *  @param {Number} [max] max value
     *  @param {Boolean} [notNull]      not null
     *  @param {Object} [defaultValue] default value or nil
     *  @param {Object} [max] max value or nil
     *  @param {Boolean} [autoincrement] autoincrement or nil
     *
     *  @return {UserCustomColumn} created column
     */
    static createColumn(index: number, name: string, type: GeoPackageDataType, notNull?: boolean, defaultValue?: DBValue, max?: number, autoincrement?: boolean): UserCustomColumn;
    /**
     * Create a new primary key column
     * @param index
     * @param name
     * @param autoincrement
     */
    static createPrimaryKeyColumn(index: number, name: string, autoincrement?: boolean): UserCustomColumn;
}
