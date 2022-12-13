/**
 * featureTable module.
 * @module features/user/featureTable
 */
import { UserTable } from '../../user/userTable';
import { FeatureColumn } from './featureColumn';
import { FeatureColumns } from './featureColumns';
import { Contents } from '../../core/contents/contents';
/**
 * Represents a user feature table
 * @param  {string} tableName table name
 * @param  {array} columns   feature columns
 */
export declare class FeatureTable extends UserTable<FeatureColumn> {
    constructor(tableName: string, geometryColumn: string, columns: FeatureColumn[]);
    copy(): FeatureTable;
    /**
     * Get the geometry column index
     * @return geometry column index
     */
    getGeometryColumnIndex(): number;
    /**
     * {@inheritDoc}
     */
    getUserColumns(): FeatureColumns;
    /**
     * Get the geometry feature column
     * @return geometry feature column
     */
    getGeometryColumn(): FeatureColumn;
    /**
     * Get the geometry column name
     * @return geometry column name
     */
    getGeometryColumnName(): string;
    /**
     * Get the Id and Geometry Column names
     * @return column names
     */
    getIdAndGeometryColumnNames(): string[];
    /**
     * {@inheritDoc}
     */
    validateContents(contents: Contents): void;
}
