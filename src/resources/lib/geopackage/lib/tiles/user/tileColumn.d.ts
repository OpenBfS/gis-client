/**
 * @module tiles/user/tileColumn
 */
import { UserColumn } from '../../user/userColumn';
import { GeoPackageDataType } from '../../db/geoPackageDataType';
import { DBValue } from '../../db/dbAdapter';
/**
 * `TileColumn` models columns in [user tile pyramid tables]{@link module:tiles/user/tileTable~TileTable}.
 *
 * @class
 * @extends UserColumn
 */
export declare class TileColumn extends UserColumn {
    static readonly COLUMN_ID: string;
    static readonly COLUMN_ZOOM_LEVEL: string;
    static readonly COLUMN_TILE_COLUMN: string;
    static readonly COLUMN_TILE_ROW: string;
    static readonly COLUMN_TILE_DATA: string;
    constructor(index: number, name: string, dataType: GeoPackageDataType, max?: number, notNull?: boolean, defaultValue?: DBValue, primaryKey?: boolean, autoincrement?: boolean);
    /**
     * Create an id column
     * @param  {number} index Index
     * @param  {boolean} autoincrement Autoincrement
     */
    static createIdColumn(index: number, autoincrement?: boolean): TileColumn;
    /**
     * Create a zoom level column
     * @param  {number} index Index
     */
    static createZoomLevelColumn(index: number): TileColumn;
    /**
     *  Create a tile column column
     *
     *  @param {number} index column index
     */
    static createTileColumnColumn(index: number): TileColumn;
    /**
     *  Create a tile row column
     *
     *  @param {number} index column index
     *
     */
    static createTileRowColumn(index: number): TileColumn;
    /**
     *  Create a tile data column
     *
     *  @param {number} index column index
     */
    static createTileDataColumn(index: number): TileColumn;
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
    static createColumn(index: number, name: string, type: GeoPackageDataType, notNull?: boolean, defaultValue?: DBValue, max?: number, autoincrement?: boolean): TileColumn;
}
