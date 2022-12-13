/**
 * @module features/user/featureColumn
 */
import { UserColumn } from '../../user/userColumn';
import { GeoPackageDataType } from '../../db/geoPackageDataType';
import { DBValue } from '../../db/dbAdapter';
import { GeometryType } from './geometryType';
import { TableColumn } from '../../db/table/tableColumn';
/**
 * Represents a user feature column
 * @class
 * @extends UserColumn
 */
export declare class FeatureColumn extends UserColumn {
    geometryType: GeometryType;
    constructor(index: number, name: string, dataType: GeoPackageDataType, max?: number, notNull?: boolean, defaultValue?: any, primaryKey?: boolean, geometryType?: GeometryType, autoincrement?: boolean);
    /**
     *  Create a new primary key column
     *
     *  @param {Number} index column index
     *  @param {string} name  column name
     *  @param {boolean} autoincrement  column name
     *
     *  @return feature column
     */
    static createPrimaryKeyColumn(index: number, name: string, autoincrement?: boolean): FeatureColumn;
    /**
     *  Create a new geometry column
     *
     *  @param {Number} index        column index
     *  @param {string} name         column name
     *  @param {GeometryType} type
     *  @param {Boolean} notNull      not null
     *  @param {Object} defaultValue default value or nil
     *
     *  @return feature column
     */
    static createGeometryColumn(index: number, name: string, type: GeometryType, notNull: boolean, defaultValue?: DBValue): FeatureColumn;
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
    static createColumn(index: number, name: string, type: GeoPackageDataType, notNull?: boolean, defaultValue?: DBValue, max?: number, autoincrement?: boolean): FeatureColumn;
    /**
     * Get the type name from the data and geometry type
     * @param name column name
     * @param dataType data type
     * @param geometryType  geometry type
     * @return type name
     */
    getTypeName(name: string, dataType: GeoPackageDataType, geometryType?: GeometryType): string;
    /**
     * Attempt to get the geometry type of the table column
     * @param tableColumn table column
     * @return geometry type
     */
    static getGeometryTypeFromTableColumn(tableColumn: TableColumn): GeometryType;
    /**
     * Copy the column
     * @return copied column
     */
    copy(): FeatureColumn;
    /**
     * Determine if this column is a geometry
     *
     * @return true if a geometry column
     */
    isGeometry(): boolean;
    /**
     * When a geometry column, gets the geometry type
     * @return geometry type
     */
    getGeometryType(): GeometryType;
}
