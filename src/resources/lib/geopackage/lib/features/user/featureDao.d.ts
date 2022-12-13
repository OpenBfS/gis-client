/**
 * featureDao module.
 * @module features/user/featureDao
 */
import proj4 from 'proj4';
import { FeatureTableIndex } from '../../extension/index/featureTableIndex';
import { UserDao } from '../../user/userDao';
import { DataColumnsDao } from '../../dataColumns/dataColumnsDao';
import { FeatureRow } from './featureRow';
import { GeoPackageDataType } from '../../db/geoPackageDataType';
import { BoundingBox } from '../../boundingBox';
import { Feature, GeoJsonObject } from 'geojson';
import { GeometryColumns } from '../columns/geometryColumns';
import { MetadataDao } from '../../metadata/metadataDao';
import { GeoPackage } from '../../geoPackage';
import { FeatureTable } from './featureTable';
import { Contents } from '../../core/contents/contents';
import { SpatialReferenceSystem } from '../../core/srs/spatialReferenceSystem';
import { DBValue } from '../../db/dbAdapter';
/**
 * Feature DAO for reading feature user data tables
 * @class FeatureDao
 * @extends UserDao
 * @param  {any} db              database connection
 * @param  {FeatureTable} table           feature table
 * @param  {GeometryColumns} geometryColumns geometry columns
 * @param  {MetadataDao} metadataDao      metadata dao
 */
export declare class FeatureDao<T extends FeatureRow> extends UserDao<FeatureRow> {
    geometryColumns: GeometryColumns;
    metadataDao: MetadataDao;
    dataColumnsDao: DataColumnsDao;
    featureTableIndex: FeatureTableIndex;
    projection: proj4.Converter;
    protected _table: FeatureTable;
    constructor(geoPackage: GeoPackage, table: FeatureTable, geometryColumns: GeometryColumns, metadataDao: MetadataDao);
    createObject(results: Record<string, DBValue>): FeatureRow;
    getRow(results: Record<string, DBValue>): FeatureRow;
    getContents(): Contents;
    /**
     * Get the feature table
     * @return {FeatureTable} the feature table
     */
    getFeatureTable(): FeatureTable;
    get table(): FeatureTable;
    /**
     * Create a new feature row with the column types and values
     * @param  {Array} columnTypes column types
     * @param  {Array} values      values
     * @return {FeatureRow}             feature row
     */
    newRow(columnTypes?: {
        [key: string]: GeoPackageDataType;
    }, values?: Record<string, DBValue>): FeatureRow;
    /**
     * Get the geometry column name
     * @return {string} the geometry column name
     */
    getGeometryColumnName(): string;
    /**
     * Get the geometry types
     * @return {Number} well known binary geometry type
     */
    get geometryType(): string;
    get srs(): SpatialReferenceSystem;
    /**
     * Determine if the feature table is indexed
     * @returns {Boolean} indexed status of the table
     */
    isIndexed(): boolean;
    index(progress?: Function): Promise<boolean>;
    /**
     * Query for count in bounding box
     * @param boundingBox
     * @returns {Number}
     */
    countWebMercatorBoundingBox(boundingBox: BoundingBox): number;
    /**
     * Query for count in bounding box
     * @param boundingBox
     * @param projection
     * @returns {Number}}
     */
    countInBoundingBox(boundingBox: BoundingBox, projection?: string): number;
    /**
     * Fast query web mercator bounding box
     * @param {BoundingBox} boundingBox bounding box to query for
     * @returns {any}
     */
    fastQueryWebMercatorBoundingBox(boundingBox: BoundingBox): IterableIterator<FeatureRow>;
    queryIndexedFeaturesWithWebMercatorBoundingBox(boundingBox: BoundingBox): IterableIterator<FeatureRow>;
    fastQueryBoundingBox(boundingBox: BoundingBox, projection?: string): IterableIterator<FeatureRow>;
    queryIndexedFeaturesWithBoundingBox(boundingBox: BoundingBox): IterableIterator<FeatureRow>;
    /**
     * Calls geoJSONFeatureCallback with the geoJSON of each matched feature (always in 4326 projection)
     * @param  {BoundingBox} boundingBox        4326 bounding box to query
     * @param {Boolean} [skipVerification] do not verify if the feature actually exists in the box
     * @returns {any}
     */
    queryForGeoJSONIndexedFeaturesWithBoundingBox(boundingBox: BoundingBox, skipVerification?: boolean): IterableIterator<Feature> & {
        srs: SpatialReferenceSystem;
        featureDao: FeatureDao<FeatureRow>;
    };
    getBoundingBox(): BoundingBox;
    static reprojectFeature(featureRow: FeatureRow, srs: SpatialReferenceSystem, projection: proj4.Converter | string): GeoJsonObject;
    static verifyFeature(geometry: any, boundingBox: BoundingBox): Feature;
    static verifyMultiPoint(geometry: any, boundingBox: BoundingBox): Feature;
    static verifyLineString(geometry: any, boundingBox: BoundingBox): Feature;
    static verifyPolygon(geometry: any, boundingBox: BoundingBox): Feature;
    static multiPointIntersects(geometry: any, boundsGeometry: any): Boolean;
    /**
     * Iterate over geometries in GeometryCollection looking for any geometry that intersects the bounding box provided
     * @param geometry
     * @param boundsGeometry
     */
    static geometryCollectionIntersects(geometry: any, boundsGeometry: any): Boolean;
    static verifyGeometryCollection(geometry: any, boundingBox: BoundingBox): Feature;
    static readTable(geoPackage: GeoPackage, tableName: string): FeatureDao<FeatureRow>;
}
