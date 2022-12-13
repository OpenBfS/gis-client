import { TileMatrix } from '../matrix/tileMatrix';
import { TileMatrixSet } from '../matrixset/tileMatrixSet';
export declare class TileDaoUtils {
    /**
     * Adjust the tile matrix lengths if needed. Check if the tile matrix width
     * and height need to expand to account for pixel * number of pixels fitting
     * into the tile matrix lengths
     * @param tileMatrixSet tile matrix set
     * @param tileMatrices tile matrices
     */
    static adjustTileMatrixLengths(tileMatrixSet: TileMatrixSet, tileMatrices: TileMatrix[]): void;
    /**
     * Get the zoom level for the provided width and height in the default units
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param length in default units
     * @return tile matrix zoom level
     */
    static getZoomLevelForLength(widths: number[], heights: number[], tileMatrices: TileMatrix[], length: number): number;
    /**
     * Get the zoom level for the provided width and height in the default units
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param width in default units
     * @param height in default units
     * @return tile matrix zoom level
     * @since 1.2.1
     */
    static getZoomLevelForWidthAndHeight(widths: number[], heights: number[], tileMatrices: TileMatrix[], width: number, height: number): number;
    /**
     * Get the closest zoom level for the provided width and height in the
     * default units
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param length in default units
     * @return tile matrix zoom level
     * @since 1.2.1
     */
    static getClosestZoomLevelForLength(widths: number[], heights: number[], tileMatrices: TileMatrix[], length: number): number;
    /**
     * Get the closest zoom level for the provided width and height in the
     * default units
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param width in default units
     * @param height in default units
     * @return tile matrix zoom level
     * @since 1.2.1
     */
    static getClosestZoomLevelForWidthAndHeight(widths: number[], heights: number[], tileMatrices: TileMatrix[], width: number, height: number): number;
    /**
     * Get the zoom level for the provided width and height in the default units
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param length in default units
     * @param lengthChecks perform length checks for values too far away from the zoom level
     * @return tile matrix zoom level
     */
    private static _getZoomLevelForLength;
    /**
     * Get the zoom level for the provided width and height in the default units
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param width width in default units
     * @param height height in default units
     * @param lengthChecks perform length checks for values too far away from the zoom level
     * @return tile matrix zoom level
     * @since 1.2.1
     */
    private static _getZoomLevelForWidthAndHeight;
    /**
     * Determine if the length at the index is closer by a factor of two to the
     * next zoomed in level / lower index
     * @param lengths sorted lengths
     * @param length current length
     * @param lengthIndex length index
     * @return true if closer to zoomed in length
     */
    private static closerToZoomIn;
    /**
     * Get the tile matrix represented by the current length index
     * @param tileMatrices tile matrices
     * @param index index location in sorted lengths
     * @return tile matrix
     */
    static getTileMatrixAtLengthIndex(tileMatrices: TileMatrix[], index: number): TileMatrix;
    /**
     * Get the approximate zoom level for the provided length in the default
     * units. Tiles may or may not exist for the returned zoom level. The
     * approximate zoom level is determined using a factor of 2 from the zoom
     * levels with tiles.
     *
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param length length in default units
     * @return actual or approximate tile matrix zoom level
     * @since 2.0.2
     */
    static getApproximateZoomLevelForLength(widths: number[], heights: number[], tileMatrices: TileMatrix[], length: number): number;
    /**
     * Get the approximate zoom level for the provided width and height in the
     * default units. Tiles may or may not exist for the returned zoom level.
     * The approximate zoom level is determined using a factor of 2 from the
     * zoom levels with tiles.
     *
     * @param widths sorted widths
     * @param heights sorted heights
     * @param tileMatrices tile matrices
     * @param width width in default units
     * @param height height in default units
     * @return actual or approximate tile matrix zoom level
     * @since 2.0.2
     */
    static getApproximateZoomLevelForWidthAndHeight(widths: number[], heights: number[], tileMatrices: TileMatrix[], width: number, height: number): number;
    /**
     * Get the approximate zoom level for length using the factor of 2 rule
     * between zoom levels
     * @param lengths sorted lengths
     * @param tileMatrices tile matrices
     * @param length length in default units
     * @return approximate zoom level
     */
    static getApproximateZoomLevel(lengths: number[], tileMatrices: TileMatrix[], length: number): number;
    /**
     * Get the max distance length that matches the tile widths and heights
     * @param widths sorted tile matrix widths
     * @param heights sorted tile matrix heights
     * @return max length
     * @since 1.2.0
     */
    static getMaxLengthForTileWidthsAndHeights(widths: number[], heights: number[]): number;
    /**
     * Get the min distance length that matches the tile widths and heights
     * @param widths sorted tile matrix widths
     * @param heights sorted tile matrix heights
     * @return min length
     * @since 1.2.0
     */
    static getMinLengthForTileWidthsAndHeights(widths: number[], heights: number[]): number;
    /**
     * Get the max length distance value from the sorted array of lengths
     * @param lengths sorted tile matrix lengths
     * @return max length
     */
    static getMaxLength(lengths: number[]): number;
    /**
     * Get the min length distance value from the sorted array of lengths
     * @param lengths sorted tile matrix lengths
     * @return min length
     */
    static getMinLength(lengths: number[]): number;
}
