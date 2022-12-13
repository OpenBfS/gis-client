import { FeatureTable } from './featureTable';
import { UserRow } from '../../user/userRow';
import { FeatureColumn } from './featureColumn';
import { GeoPackageDataType } from '../../db/geoPackageDataType';
import { GeometryData } from '../../geom/geometryData';
import { DBValue } from '../../db/dbAdapter';
/**
 * featureRow module.
 * @module features/user/featureRow
 */
/**
 * Feature Row containing the values from a single result set row
 * @param  {FeatureTable} featureTable feature table
 * @param  {Array} columnTypes  column types
 * @param  {Array} values       values
 */
export declare class FeatureRow extends UserRow {
    featureTable: FeatureTable;
    constructor(featureTable: FeatureTable, columnTypes?: {
        [key: string]: GeoPackageDataType;
    }, values?: Record<string, DBValue>);
    /**
     * Get the geometry column index
     * @return {Number} geometry column index
     */
    get geometryColumnIndex(): number;
    /**
     * Get the geometry column
     * @return {FeatureColumn} geometry column
     */
    get geometryColumn(): FeatureColumn;
    /**
     * Get the geometry
     * @return {Buffer} geometry data
     */
    get geometry(): GeometryData;
    /**
     * set the geometry
     * @param {Buffer} geometryData geometry data
     */
    set geometry(geometryData: GeometryData);
    /**
     * Get the geometry's type
     * @return {String} geometry data
     */
    get geometryType(): string;
    toObjectValue(index: number, value: DBValue): object | GeometryData;
    getValueWithColumnName(columnName: string): any;
}
