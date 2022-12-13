import { UserDao } from '../../user/userDao';
import { TileRow } from './tileRow';
import { TileGrid } from '../tileGrid';
import { TileMatrix } from '../matrix/tileMatrix';
import { BoundingBox } from '../../boundingBox';
import { SpatialReferenceSystem } from '../../core/srs/spatialReferenceSystem';
import { TileMatrixSet } from '../matrixset/tileMatrixSet';
import { GeoPackage } from '../../geoPackage';
import { TileTable } from './tileTable';
import { GeoPackageDataType } from '../../db/geoPackageDataType';
import { DBValue } from '../../db/dbAdapter';
/**
 * `TileDao` is a {@link module:dao/dao~Dao} subclass for reading
 * [user tile tables]{@link module:tiles/user/tileTable~TileTable}.
 *
 * @class TileDao
 * @extends UserDao
 * @param  {GeoPackageConnection} connection
 * @param  {TileTable} table
 * @param  {TileMatrixSet} tileMatrixSet
 * @param  {TileMatrix[]} tileMatrices
 */
export declare class TileDao<T extends TileRow> extends UserDao<TileRow> {
    tileMatrixSet: TileMatrixSet;
    tileMatrices: TileMatrix[];
    zoomLevelToTileMatrix: TileMatrix[];
    widths: number[];
    heights: number[];
    minZoom: number;
    maxZoom: number;
    srs: SpatialReferenceSystem;
    projection: string;
    minWebMapZoom: number;
    maxWebMapZoom: number;
    webZoomToGeoPackageZooms: Record<number, number>;
    constructor(geoPackage: GeoPackage, table: TileTable, tileMatrixSet: TileMatrixSet, tileMatrices: TileMatrix[]);
    initialize(): void;
    webZoomToGeoPackageZoom(webZoom: number): number;
    setWebMapZoomLevels(): void;
    determineGeoPackageZoomLevel(webMercatorBoundingBox: BoundingBox, zoom: number): number;
    /**
     * Get the bounding box of tiles at the zoom level
     * @param  {Number} zoomLevel zoom level
     * @return {BoundingBox}           bounding box of the zoom level, or null if no tiles
     */
    getBoundingBoxWithZoomLevel(zoomLevel: number): BoundingBox;
    get boundingBox(): BoundingBox;
    queryForTileGridWithZoomLevel(zoomLevel: number): TileGrid;
    /**
     * Get the tile grid of the zoom level
     * @param  {Number} zoomLevel zoom level
     * @return {TileGrid}           tile grid at zoom level, null if no tile matrix at zoom level
     */
    getTileGridWithZoomLevel(zoomLevel: number): TileGrid;
    /**
     * get the tile table
     * @return {TileTable} tile table
     */
    get table(): TileTable;
    /**
     * Create a new tile row with the column types and values
     * @param  {Array} columnTypes column types
     * @param  {Array} values      values
     * @return {TileRow}             tile row
     */
    newRow(columnTypes?: {
        [key: string]: GeoPackageDataType;
    }, values?: Record<string, DBValue>): TileRow;
    /**
     * Adjust the tile matrix lengths if needed. Check if the tile matrix width
     * and height need to expand to account for pixel * number of pixels fitting
     * into the tile matrix lengths
     */
    adjustTileMatrixLengths(): void;
    /**
     * Get the tile matrix at the zoom level
     * @param  {Number} zoomLevel zoom level
     * @returns {TileMatrix}           tile matrix
     */
    getTileMatrixWithZoomLevel(zoomLevel: number): TileMatrix;
    /**
     * Get the zoom level for the provided width and height in the default units
     * @param length in default units
     * @return zoom level
     */
    getZoomLevelForLength(length: number): number;
    /**
     * Get the zoom level for the provided width and height in the default units
     * @param width in default units
     * @param height in default units
     * @return zoom level
     * @since 1.2.1
     */
    getZoomLevelForWidthAndHeight(width: number, height: number): number;
    /**
     * Get the closest zoom level for the provided width and height in the
     * default units
     * @param length in default units
     * @return zoom level
     * @since 1.2.1
     */
    getClosestZoomLevelForLength(length: number): number;
    /**
     * Get the closest zoom level for the provided width and height in the
     * default units
     * @param width in default units
     * @param height in default units
     * @return zoom level
     * @since 1.2.1
     */
    getClosestZoomLevelForWidthAndHeight(width: number, height: number): number;
    /**
     * Get the approximate zoom level for the provided length in the default
     * units. Tiles may or may not exist for the returned zoom level. The
     * approximate zoom level is determined using a factor of 2 from the zoom
     * levels with tiles.
     * @param length length in default units
     * @return approximate zoom level
     * @since 2.0.2
     */
    getApproximateZoomLevelForLength(length: number): number;
    /**
     * Get the approximate zoom level for the provided width and height in the
     * default units. Tiles may or may not exist for the returned zoom level.
     * The approximate zoom level is determined using a factor of 2 from the
     * zoom levels with tiles.
     * @param width width in default units
     * @param height height in default units
     * @return approximate zoom level
     * @since 2.0.2
     */
    getApproximateZoomLevelForWidthAndHeight(width: number, height: number): number;
    /**
     * Get the max length in default units that contains tiles
     * @return max distance length with tiles
     * @since 1.2.0
     */
    getMaxLength(): number;
    /**
     * Get the min length in default units that contains tiles
     * @return min distance length with tiles
     * @since 1.2.0
     */
    getMinLength(): number;
    /**
     * Query for a tile
     * @param  {Number} column    column
     * @param  {Number} row       row
     * @param  {Number} zoomLevel zoom level
     */
    queryForTile(column: number, row: number, zoomLevel: number): TileRow;
    queryForTilesWithZoomLevel(zoomLevel: number): IterableIterator<TileRow>;
    /**
     * Query for Tiles at a zoom level in descending row and column order
     * @param  {Number} zoomLevel    zoom level
     * @returns {IterableIterator<TileRow>}
     */
    queryForTilesDescending(zoomLevel: number): IterableIterator<TileRow>;
    /**
     * Query for tiles at a zoom level and column
     * @param  {Number} column       column
     * @param  {Number} zoomLevel    zoom level
     * @returns {IterableIterator<TileRow>}
     */
    queryForTilesInColumn(column: number, zoomLevel: number): IterableIterator<TileRow>;
    /**
     * Query for tiles at a zoom level and row
     * @param  {Number} row       row
     * @param  {Number} zoomLevel    zoom level
     */
    queryForTilesInRow(row: number, zoomLevel: number): IterableIterator<TileRow>;
    /**
     * Query by tile grid and zoom level
     * @param  {TileGrid} tileGrid  tile grid
     * @param  {Number} zoomLevel zoom level
     * @returns {IterableIterator<any>}
     */
    queryByTileGrid(tileGrid: TileGrid, zoomLevel: number): IterableIterator<TileRow>;
    /**
     * count by tile grid and zoom level
     * @param  {TileGrid} tileGrid  tile grid
     * @param  {Number} zoomLevel zoom level
     * @returns {Number} count of tiles
     */
    countByTileGrid(tileGrid: TileGrid, zoomLevel: number): number;
    deleteTile(column: number, row: number, zoomLevel: number): number;
    dropTable(): boolean;
    rename(newName: string): void;
    static readTable(geoPackage: GeoPackage, tableName: string): TileDao<TileRow>;
}
