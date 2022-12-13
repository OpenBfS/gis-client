import proj4 from 'proj4';
import { Envelope } from './geom/envelope';
import { Feature, Polygon } from 'geojson';
/**
 * Create a new bounding box
 * @class BoundingBox
 */
export declare class BoundingBox {
    _minLongitude: number;
    _maxLongitude: number;
    _minLatitude: number;
    _maxLatitude: number;
    _width: number;
    _height: number;
    /**
     * @param  {BoundingBox | Number} minLongitudeOrBoundingBox minimum longitude or bounding box to copy (west)
     * @param  {Number} [maxLongitude]              maximum longitude (east)
     * @param  {Number} [minLatitude]               Minimum latitude (south)
     * @param  {Number} [maxLatitude]               Maximum latitude (north)
     */
    constructor(minLongitudeOrBoundingBox: BoundingBox | number, maxLongitude?: number, minLatitude?: number, maxLatitude?: number);
    get minLongitude(): number;
    set minLongitude(longitude: number);
    get maxLongitude(): number;
    set maxLongitude(longitude: number);
    get minLatitude(): number;
    set minLatitude(latitude: number);
    get maxLatitude(): number;
    set maxLatitude(latitude: number);
    get width(): number;
    set width(width: number);
    get height(): number;
    set height(height: number);
    /**
     * Build a Geometry Envelope from the bounding box
     *
     * @return geometry envelope
     */
    buildEnvelope(): Envelope;
    toGeoJSON(): Feature<Polygon>;
    /**
     * Determine if equal to the provided bounding box
     * @param  {BoundingBox} boundingBox bounding boundingBox
     * @return {Boolean}             true if equal, false if not
     */
    equals(boundingBox: BoundingBox): boolean;
    /**
     * Project the bounding box into a new projection
     *
     * @param {string} from
     * @param {string} to
     * @return {BoundingBox}
     */
    projectBoundingBox(from?: string | proj4.Converter, to?: string | proj4.Converter): BoundingBox;
}
