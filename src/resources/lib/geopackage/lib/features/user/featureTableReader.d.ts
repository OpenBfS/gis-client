import { FeatureTable } from './featureTable';
import { UserTableReader } from '../../user/userTableReader';
import { FeatureColumn } from './featureColumn';
import { GeometryColumns } from '../columns/geometryColumns';
import { GeoPackage } from '../../geoPackage';
import { TableColumn } from '../../db/table/tableColumn';
/**
 * Reads the metadata from an existing feature table
 * @class FeatureTableReader
 */
export declare class FeatureTableReader extends UserTableReader<FeatureColumn, FeatureTable> {
    columnName: string;
    constructor(tableNameOrGeometryColumns: string | GeometryColumns);
    readFeatureTable(geoPackage: GeoPackage): FeatureTable;
    /**
     * @inheritDoc
     */
    createTable(tableName: string, columns: FeatureColumn[]): FeatureTable;
    /**
     * @inheritDoc
     */
    createColumn(tableColumn: TableColumn): FeatureColumn;
}
