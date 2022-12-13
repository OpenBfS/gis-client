import { GeoPackage } from '../geoPackage';
import { RTreeIndex } from './rtree/rtreeIndex';
import { RelatedTablesExtension } from './relatedTables';
export declare class GeoPackageExtensions {
    /**
     * Delete all table extensions for the table within the GeoPackage
     *
     * @param geoPackage GeoPackage
     * @param table table name
     */
    static deleteTableExtensions(geoPackage: GeoPackage, table: string): void;
    /**
     * Delete all extensions
     * @param geoPackage GeoPackage
     */
    static deleteExtensions(geoPackage: GeoPackage): void;
    /**
     * Copy all table extensions for the table within the GeoPackage
     *
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    static copyTableExtensions(geoPackage: GeoPackage, table: string, newTable: string): void;
    /**
     * Delete the extensions for the table
     * @param geoPackage
     * @param table
     */
    static deleteExtensionForTable(geoPackage: GeoPackage, table: string): void;
    /**
     * Delete the extensions
     * @param geoPackage
     */
    static delete(geoPackage: GeoPackage): void;
    /**
     * Delete the RTree Spatial extension for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    static deleteRTreeSpatialIndex(geoPackage: GeoPackage, table: string): void;
    /**
     * Delete the RTree Spatial extension
     * @param geoPackage GeoPackage
     */
    static deleteRTreeSpatialIndexExtension(geoPackage: GeoPackage): void;
    /**
     * Copy the RTree Spatial extension for the table
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    static copyRTreeSpatialIndex(geoPackage: GeoPackage, table: string, newTable: string): void;
    /**
     * Get a RTree Index Extension used only for deletions
     * @param geoPackage GeoPackage
     * @return RTree index extension
     */
    static getRTreeIndexExtension(geoPackage: GeoPackage): RTreeIndex;
    /**
     * Delete the Related Tables extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    static deleteRelatedTables(geoPackage: GeoPackage, table: string): void;
    /**
     * Delete the Related Tables extension
     * @param geoPackage GeoPackage
     */
    static deleteRelatedTablesExtension(geoPackage: GeoPackage): void;
    /**
     * Copy the Related Tables extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    static copyRelatedTables(geoPackage: GeoPackage, table: string, newTable: string): void;
    /**
     * Get a Related Table Extension used only for deletions
     * @param geoPackage GeoPackage
     * @return Related Table Extension
     */
    static getRelatedTableExtension(geoPackage: GeoPackage): RelatedTablesExtension;
    /**
     * Delete the Schema extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    static deleteSchema(geoPackage: GeoPackage, table: string): void;
    /**
     * Delete the Schema extension
     * @param geoPackage GeoPackage
     */
    static deleteSchemaExtension(geoPackage: GeoPackage): void;
    /**
     * Copy the Schema extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    static copySchema(geoPackage: GeoPackage, table: string, newTable: string): void;
    /**
     * Delete the Metadata extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    static deleteMetadata(geoPackage: GeoPackage, table: string): void;
    /**
     * Delete the Metadata extension
     * @param geoPackage GeoPackage
     */
    static deleteMetadataExtension(geoPackage: GeoPackage): void;
    /**
     * Copy the Metadata extensions for the table
     * @param geoPackage  GeoPackage
     * @param table table name
     * @param newTable  new table name
     */
    static copyMetadata(geoPackage: GeoPackage, table: string, newTable: string): void;
    /**
     * Delete the WKT for Coordinate Reference Systems extension
     * @param geoPackage GeoPackage
     */
    static deleteCrsWktExtension(geoPackage: GeoPackage): void;
}
