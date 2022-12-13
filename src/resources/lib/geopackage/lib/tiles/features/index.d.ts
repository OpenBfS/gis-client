import proj4 from 'proj4';
import { Geometry } from 'geojson';
import { FeatureDao } from '../../features/user/featureDao';
import { BoundingBox } from '../../boundingBox';
import { IconCache } from '../../extension/style/iconCache';
import { GeometryCache } from './geometryCache';
import { FeatureDrawType } from './featureDrawType';
import { FeaturePaintCache } from './featurePaintCache';
import { Paint } from './paint';
import { FeatureTableStyles } from '../../extension/style/featureTableStyles';
import { GeoPackage } from '../../geoPackage';
import { FeatureRow } from '../../features/user/featureRow';
import { StyleRow } from '../../extension/style/styleRow';
import { FeatureTilePointIcon } from './featureTilePointIcon';
import { CustomFeaturesTile } from './custom/customFeaturesTile';
import { FeatureStyle } from '../../extension/style/featureStyle';
/**
 * FeatureTiles module.
 * @module tiles/features
 */
/**
 *  Tiles drawn from or linked to features. Used to query features and optionally draw tiles
 *  from those features.
 */
export declare class FeatureTiles {
    featureDao: FeatureDao<FeatureRow>;
    tileWidth: number;
    tileHeight: number;
    projection: proj4.Converter;
    webMercatorProjection: proj4.Converter;
    simplifyGeometries: boolean;
    simplifyToleranceInPixels: number;
    compressFormat: string;
    pointRadius: number;
    pointPaint: Paint;
    pointIcon: FeatureTilePointIcon;
    linePaint: Paint;
    private _lineStrokeWidth;
    polygonPaint: Paint;
    private _polygonStrokeWidth;
    fillPolygon: boolean;
    polygonFillPaint: Paint;
    featurePaintCache: FeaturePaintCache;
    geometryCache: GeometryCache;
    cacheGeometries: boolean;
    iconCache: IconCache;
    private _scale;
    geoPackage: GeoPackage;
    featureTableStyles: FeatureTableStyles;
    maxFeaturesPerTile: number;
    maxFeaturesTileDraw: CustomFeaturesTile;
    widthOverlap: number;
    heightOverlap: number;
    constructor(featureDao: FeatureDao<FeatureRow>, tileWidth?: number, tileHeight?: number);
    /**
     * Will handle disposing any saved icons
     */
    cleanup(): void;
    /**
     * Manually set the width and height draw overlap
     * @param {Number} pixels pixels
     */
    set drawOverlap(pixels: number);
    /**
     * Get the simplify tolerance in pixels
     * @return {Number} width draw overlap
     */
    get simplifyTolerance(): number;
    /**
     * Set the tolerance in pixels used for simplifying rendered geometries
     * @param {Number} pixels pixels
     */
    set simplifyTolerance(pixels: number);
    /**
     * Get the width draw overlap
     * @return {Number} width draw overlap
     */
    get widthDrawOverlap(): number;
    /**
     * Manually set the width draw overlap
     * @param {Number} pixels pixels
     */
    set widthDrawOverlap(pixels: number);
    /**
     * Get the height draw overlap
     * @return {Number} height draw overlap
     */
    get heightDrawOverlap(): number;
    /**
     * Manually set the height draw overlap
     * @param {Number} pixels pixels
     */
    set heightDrawOverlap(pixels: number);
    /**
     * Ignore the feature table styles within the GeoPackage
     */
    ignoreFeatureTableStyles(): void;
    /**
     * Clear all caches
     */
    clearCache(): void;
    /**
     * Clear the style paint cache
     */
    clearStylePaintCache(): void;
    /**
     * Set / resize the style paint cache size
     *
     * @param {Number} size
     * @since 3.3.0
     */
    set stylePaintCacheSize(size: number);
    /**
     * Clear the icon cache
     */
    clearIconCache(): void;
    /**
     * Set / resize the icon cache size
     * @param {Number} size new size
     */
    set iconCacheSize(size: number);
    /**
     * Set the scale
     *
     * @param {Number} scale scale factor
     */
    set scale(scale: number);
    get scale(): number;
    /**
     * Set geometry cache's max size
     * @param {Number} maxSize
     */
    set geometryCacheMaxSize(maxSize: number);
    calculateDrawOverlap(): void;
    set drawOverlapsWithPixels(pixels: number);
    getFeatureStyle(featureRow: FeatureRow): FeatureStyle;
    /**
     * Get the point paint for the feature style, or return the default paint
     * @param featureStyle feature style
     * @return paint
     */
    getPointPaint(featureStyle: FeatureStyle): Paint;
    /**
     * Get the line paint for the feature style, or return the default paint
     * @param featureStyle feature style
     * @return paint
     */
    getLinePaint(featureStyle: FeatureStyle): Paint;
    /**
     * Get the polygon paint for the feature style, or return the default paint
     * @param featureStyle feature style
     * @return paint
     */
    getPolygonPaint(featureStyle: FeatureStyle): Paint;
    /**
     * Get the polygon fill paint for the feature style, or return the default
     * paint
     * @param featureStyle feature style
     * @return paint
     */
    getPolygonFillPaint(featureStyle: FeatureStyle): Paint;
    /**
     * Get the feature style paint from cache, or create and cache it
     * @param featureStyle feature style
     * @param drawType draw type
     * @return feature style paint
     */
    getFeatureStylePaint(featureStyle: FeatureStyle, drawType: FeatureDrawType): Paint;
    /**
     * Get the style paint from cache, or create and cache it
     * @param style style row
     * @param drawType draw type
     * @return {Paint} paint
     */
    getStylePaint(style: StyleRow, drawType: FeatureDrawType): Paint;
    /**
     * Get point color
     * @return {String} color
     */
    get pointColor(): string;
    /**
     * Set point color
     * @param {String} pointColor point color
     */
    set pointColor(pointColor: string);
    /**
     * Get line stroke width
     * @return {Number} width
     */
    get lineStrokeWidth(): number;
    /**
     * Set line stroke width
     * @param {Number} lineStrokeWidth line stroke width
     */
    set lineStrokeWidth(lineStrokeWidth: number);
    /**
     * Get line color
     * @return {String} color
     */
    get lineColor(): string;
    /**
     * Set line color
     * @param {String} lineColor line color
     */
    set lineColor(lineColor: string);
    /**
     * Get polygon stroke width
     * @return {Number} width
     */
    get polygonStrokeWidth(): number;
    /**
     * Set polygon stroke width
     * @param {Number} polygonStrokeWidth polygon stroke width
     */
    set polygonStrokeWidth(polygonStrokeWidth: number);
    /**
     * Get polygon color
     * @return {String} color
     */
    get polygonColor(): string;
    /**
     * Set polygon color
     * @param {String} polygonColor polygon color
     */
    set polygonColor(polygonColor: string);
    /**
     * Get polygon fill color
     * @return {String} color
     */
    get polygonFillColor(): string;
    /**
     * Set polygon fill color
     * @param {String} polygonFillColor polygon fill color
     */
    set polygonFillColor(polygonFillColor: string);
    getFeatureCountXYZ(x: number, y: number, z: number): number;
    /**
     * Renders the web mercator (EPSG:3857) xyz tile
     * @param x
     * @param y
     * @param z
     * @param canvas
     */
    drawTile(x: number, y: number, z: number, canvas?: any): Promise<any>;
    /**
     * Renders the web mercator (EPSG:3857) xyz tile
     * @param x
     * @param y
     * @param z
     * @param canvas
     */
    draw3857Tile(x: number, y: number, z: number, canvas?: any): Promise<any>;
    /**
     * Renders the wgs84 (EPSG:4326) xyz tile
     * @param x
     * @param y
     * @param z
     * @param canvas
     */
    draw4326Tile(x: number, y: number, z: number, canvas?: any): Promise<any>;
    drawTileQueryAll(x: number, y: number, zoom: number, tileProjection: string, canvas?: any): Promise<any>;
    /**
     * Handles the generation of a function for transforming coordinates from the source projection into the target tile's
     * projection. These coordinates are then converted into pixel coordinates.
     * @param targetProjection
     */
    getTransformFunction(targetProjection: any): Function;
    drawTileQueryIndex(x: number, y: number, z: number, tileProjection: any, tileCanvas?: any): Promise<any>;
    drawTileWithBoundingBox(boundingBox: BoundingBox, zoom: number, tileProjection: string, tileCanvas?: any): Promise<any>;
    /**
     * Draw a point in the context
     * @param geoJson
     * @param context
     * @param boundingBox
     * @param featureStyle
     * @param transform
     */
    drawPoint(geoJson: any, context: any, boundingBox: BoundingBox, featureStyle: FeatureStyle, transform: Function): Promise<void>;
    /**
     * Simplify x,y tile coordinates by 1 pixel
     * @param coordinatesArray GeoJSON with coordinates in pixels
     * @param isPolygon determines if the first and last point need to stay connected
     * @return simplified GeoJSON
     * @since 2.0.0
     */
    simplifyPoints(coordinatesArray: any, isPolygon?: boolean): any | null;
    /**
     * Get the path of the line string
     * @param lineString
     * @param context
     * @param boundingBox
     * @param isPolygon if this was a polygon
     * @param transform
     */
    getPath(lineString: any, context: any, boundingBox: BoundingBox, isPolygon: boolean, transform: Function): void;
    /**
     * Draw a line in the context
     * @param geoJson
     * @param context
     * @param featureStyle
     * @param boundingBox
     * @param transform
     */
    drawLine(geoJson: any, context: any, featureStyle: FeatureStyle, boundingBox: BoundingBox, transform: Function): void;
    /**
     * Draw a polygon in the context
     * @param externalRing
     * @param internalRings
     * @param context
     * @param featureStyle
     * @param boundingBox
     * @param transform
     * @param fill
     */
    drawPolygon(externalRing: any, internalRings: any[], context: any, featureStyle: FeatureStyle, boundingBox: BoundingBox, transform: Function, fill?: boolean): void;
    /**
     * Add a feature to the batch
     * @param geoJson
     * @param context
     * @param boundingBox
     * @param featureStyle
     * @param transform
     */
    drawGeometry(geoJson: Geometry, context: any, boundingBox: BoundingBox, featureStyle: FeatureStyle, transform: Function): Promise<void>;
    /**
     * Create an expanded bounding box to handle features outside the tile that overlap
     * @param boundingBox bounding box
     * @param tileProjection projection - only EPSG:3857 and EPSG:4326 are supported
     * @return {BoundingBox} bounding box
     */
    expandBoundingBox(boundingBox: BoundingBox, tileProjection: string): BoundingBox;
}
