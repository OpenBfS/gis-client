/**
 * @module tiles/user/tileColumn
 */
import { TileColumn } from './tileColumn';
import { UserColumns } from '../../user/userColumns';
/**
 * `TileColumn` models columns in [user tile pyramid tables]{@link module:tiles/user/tileTable~TileTable}.
 *
 * @class
 * @extends UserColumn
 */
export declare class TileColumns extends UserColumns<TileColumn> {
    /**
     * Id column name, Requirement 52
     */
    static ID: string;
    /**
     * Zoom level column name, Requirement 53
     */
    static ZOOM_LEVEL: string;
    /**
     * Tile column column name, Requirement 54
     */
    static TILE_COLUMN: string;
    /**
     * Tile row column name, Requirement 55
     */
    static TILE_ROW: string;
    /**
     * Tile ID column name, implied requirement
     */
    static TILE_DATA: string;
    /**
     * Zoom level column index
     */
    zoomLevelIndex: number;
    /**
     * Tile column column index
     */
    tileColumnIndex: number;
    /**
     * Tile row column index
     */
    tileRowIndex: number;
    /**
     * Tile data column index
     */
    tileDataIndex: number;
    /**
     * Constructor
     * @param tableName table name
     * @param columns columns
     * @param custom custom column specification
     */
    constructor(tableName: string, columns: TileColumn[], custom: boolean);
    /**
     * {@inheritDoc}
     */
    copy(): TileColumns;
    /**
     * {@inheritDoc}
     */
    updateColumns(): void;
    /**
     * Get the zoom level index
     * @return zoom level index
     */
    getZoomLevelIndex(): number;
    /**
     * Set the zoom level index
     * @param zoomLevelIndex zoom level index
     */
    setZoomLevelIndex(zoomLevelIndex: number): void;
    /**
     * Check if has a zoom level column
     * @return true if has a zoom level column
     */
    hasZoomLevelColumn(): boolean;
    /**
     * Get the zoom level column
     * @return zoom level column
     */
    getZoomLevelColumn(): TileColumn;
    /**
     * Get the tile column index
     * @return tile column index
     */
    getTileColumnIndex(): number;
    /**
     * Set the tile column index
     *
     * @param tileColumnIndex
     *            tile column index
     */
    setTileColumnIndex(tileColumnIndex: number): void;
    /**
     * Check if has a tile column column
     * @return true if has a tile column column
     */
    hasTileColumnColumn(): boolean;
    /**
     * Get the tile column column
     * @return tile column column
     */
    getTileColumnColumn(): TileColumn;
    /**
     * Get the tile row index
     * @return tile row index
     */
    getTileRowIndex(): number;
    /**
     * Set the tile row index
     * @param tileRowIndex tile row index
     */
    setTileRowIndex(tileRowIndex: number): void;
    /**
     * Check if has a tile row column
     * @return true if has a tile row column
     */
    hasTileRowColumn(): boolean;
    /**
     * Get the tile row column
     * @return tile row column
     */
    getTileRowColumn(): TileColumn;
    /**
     * Get the tile data index
     * @return tile data index
     */
    getTileDataIndex(): number;
    /**
     * Set the tile data index
     * @param tileDataIndex tile data index
     */
    setTileDataIndex(tileDataIndex: number): void;
    /**
     * Check if has a tile data column
     * @return true if has a tile data column
     */
    hasTileDataColumn(): boolean;
    /**
     * Get the tile data column
     *
     * @return tile data column
     */
    getTileDataColumn(): TileColumn;
}
