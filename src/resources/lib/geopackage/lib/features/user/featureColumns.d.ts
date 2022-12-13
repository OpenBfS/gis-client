/**
 * @module user/custom
 */
import { FeatureColumn } from './featureColumn';
import { UserColumns } from '../../user/userColumns';
/**
 * UserCustomColumns
 */
export declare class FeatureColumns extends UserColumns<FeatureColumn> {
    /**
     * Geometry column
     */
    geometryColumn: string;
    /**
     * Geometry column index
     */
    geometryIndex: number;
    constructor(tableName: string, geometryColumn: string, columns: FeatureColumn[], custom: boolean);
    copy(): FeatureColumns;
    /**
     * {@inheritDoc}
     */
    updateColumns(): void;
    /**
     * Get the geometry column name
     * @return geometry column name
     */
    getGeometryColumnName(): string;
    /**
     * Set the geometry column name
     * @param geometryColumn geometry column name
     */
    setGeometryColumnName(geometryColumn: string): void;
    /**
     * Get the geometry index
     * @return geometry index
     */
    getGeometryIndex(): number;
    /**
     * Set the geometry index
     * @param geometryIndex  geometry index
     */
    setGeometryIndex(geometryIndex: number): void;
    /**
     * Check if the table has a geometry column
     * @return true if has a geometry column
     */
    hasGeometryColumn(): boolean;
    /**
     * Get the geometry column
     * @return geometry column
     */
    getGeometryColumn(): FeatureColumn;
}
