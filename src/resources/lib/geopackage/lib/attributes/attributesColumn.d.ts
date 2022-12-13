/**
 * @module user/custom
 */
import { UserColumn } from '../user/userColumn';
import { GeoPackageDataType } from '../db/geoPackageDataType';
import { DBValue } from '../db/dbAdapter';
/**
 * Attribute Column
 */
export declare class AttributesColumn extends UserColumn {
    constructor(index: number, name: string, dataType: GeoPackageDataType, max?: number, notNull?: boolean, defaultValue?: DBValue, primaryKey?: boolean, autoincrement?: boolean);
    /**
     * Create a new column
     * @param index
     * @param name
     * @param type
     * @param notNull
     * @param defaultValue
     * @param max
     * @param autoincrement
     */
    static createColumn(index: number, name: string, type: GeoPackageDataType, notNull?: boolean, defaultValue?: DBValue, max?: number, autoincrement?: boolean): AttributesColumn;
    /**
     * Create a new primary key column
     * @param index
     * @param name
     * @param autoincrement
     */
    static createPrimaryKeyColumn(index: number, name: string, autoincrement?: boolean): AttributesColumn;
    copy(): AttributesColumn;
}
