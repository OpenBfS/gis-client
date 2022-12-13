/**
 * @module tiles/user/tileTable
 */
import { UserTable } from '../../user/userTable';
import { TileColumn } from './tileColumn';
import { TileColumns } from './tileColumns';
import { Contents } from '../../core/contents/contents';
/**
 * `TileTable` models [tile pyramid user tables](https://www.geopackage.org/spec121/index.html#tiles_user_tables).
 *
 * @class
 * @param {string} tableName
 * @param {module:tiles/user/tileColumn~TileColumn[]} columns
 */
export declare class TileTable extends UserTable<TileColumn> {
    /**
     * Id column name, Requirement 52
     */
    static COLUMN_ID: string;
    /**
     * Zoom level column name, Requirement 53
     */
    static COLUMN_ZOOM_LEVEL: string;
    /**
     * Tile column column name, Requirement 54
     */
    static COLUMN_TILE_COLUMN: string;
    /**
     * Tile row column name, Requirement 55
     */
    static COLUMN_TILE_ROW: string;
    /**
     * Tile ID column name, implied requirement
     */
    static COLUMN_TILE_DATA: string;
    /**
     * Constructor
     * @param tableName  table name
     * @param columns columns
     */
    constructor(tableName: string, columns: TileColumn[]);
    /**
     * {@inheritDoc}
     */
    copy(): TileTable;
    /**
     * {@inheritDoc}
     */
    getDataType(): string;
    /**
     * {@inheritDoc}
     */
    getUserColumns(): TileColumns;
    /**
     * {@inheritDoc}
     */
    createUserColumns(columns: TileColumn[]): TileColumns;
    /**
     * Get the zoom level column index
     * @return zoom level index
     */
    getZoomLevelColumnIndex(): number;
    /**
     * Get the zoom level column
     * @return tile column
     */
    getZoomLevelColumn(): TileColumn;
    /**
     * Get the tile column column index
     * @return tile column index
     */
    getTileColumnColumnIndex(): number;
    /**
     * Get the tile column column
     * @return tile column
     */
    getTileColumnColumn(): TileColumn;
    /**
     * Get the tile row column index
     * @return tile row index
     */
    getTileRowColumnIndex(): number;
    /**
     * Get the tile row column
     * @return tile column
     */
    getTileRowColumn(): TileColumn;
    /**
     * Get the tile data column index
     * @return tile data index
     */
    getTileDataColumnIndex(): number;
    /**
     * Get the tile data column
     * @return tile column
     */
    getTileDataColumn(): TileColumn;
    /**
     * Create the required table columns, starting at the provided index
     * @param startingIndex starting index
     * @return tile columns
     */
    static createRequiredColumns(startingIndex?: number): TileColumn[];
    /**
     * {@inheritDoc}
     */
    validateContents(contents: Contents): void;
}
