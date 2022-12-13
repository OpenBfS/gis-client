/**
 * tileTableReader module.
 * @module tiles/user/tileTableReader
 */
import { UserTableReader } from '../../user/userTableReader';
import { TileTable } from './tileTable';
import { TileColumn } from './tileColumn';
import { TileMatrixSet } from '../matrixset/tileMatrixSet';
import { GeoPackage } from '../../geoPackage';
import { TableColumn } from '../../db/table/tableColumn';
/**
 * Reads the metadata from an existing tile table
 * @class TileTableReader
 */
export declare class TileTableReader extends UserTableReader<TileColumn, TileTable> {
    tileMatrixSet: TileMatrixSet;
    constructor(tileMatrixSet: TileMatrixSet);
    readTileTable(geoPackage: GeoPackage): TileTable;
    /**
     * @inheritDoc
     */
    createTable(tableName: string, columns: TileColumn[]): TileTable;
    /**
     * @inheritDoc
     */
    createColumn(tableColumn: TableColumn): TileColumn;
}
