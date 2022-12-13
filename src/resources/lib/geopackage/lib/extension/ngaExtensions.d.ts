/**
 * NGA extension management class for deleting extensions for a table or in a
 * GeoPackage
 */
import { GeoPackage } from '../geoPackage';
import { FeatureStyleExtension } from './style';
export declare class NGAExtensions {
    /**
     * Delete all NGA table extensions for the table within the GeoPackage
     * @param geoPackage GeoPackage
     * @param table  table name
     */
    static deleteTableExtensions(geoPackage: GeoPackage, table: string): void;
    /**
     * Delete all NGA extensions including custom extension tables for the
     * GeoPackage
     * @param geoPackage GeoPackage
     */
    static deleteExtensions(geoPackage: GeoPackage): void;
    /**
     * Copy all NGA table extensions for the table within the GeoPackage
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    static copyTableExtensions(geoPackage: GeoPackage, table: string, newTable: string): void;
    /**
     * Delete the Geometry Index extension for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    static deleteGeometryIndex(geoPackage: GeoPackage, table: string): void;
    /**
     * Delete the Geometry Index extension including the extension entries and
     * custom tables
     * @param geoPackage GeoPackage
     */
    static deleteGeometryIndexExtension(geoPackage: GeoPackage): void;
    /**
     * Copy the Geometry Index extension for the table
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    static copyGeometryIndex(geoPackage: GeoPackage, table: string, newTable: string): void;
    /**
     * Delete the Tile Scaling extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    static deleteTileScaling(geoPackage: GeoPackage, table: string): void;
    /**
     * Delete the Tile Scaling extension including the extension entries and
     * custom tables
     * @param geoPackage GeoPackage
     */
    static deleteTileScalingExtension(geoPackage: GeoPackage): void;
    /**
     * Copy the Tile Scaling extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    static copyTileScaling(geoPackage: GeoPackage, table: string, newTable: string): void;
    /**
     * Delete the Feature Style extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    static deleteFeatureStyle(geoPackage: GeoPackage, table: string): void;
    /**
     * Delete the Feature Style extension including the extension entries and
     * custom tables
     * @param geoPackage GeoPackage
     */
    static deleteFeatureStyleExtension(geoPackage: GeoPackage): void;
    /**
     * Copy the Feature Style extensions for the table. Relies on
     * {@link GeoPackageExtensions#copyRelatedTables(GeoPackageCore, String, String)}
     * to be called first.
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    static copyFeatureStyle(geoPackage: GeoPackage, table: string, newTable: string): void;
    /**
     * Copy the feature table style
     * @param featureStyleExtension feature style extension
     * @param mappingTablePrefix mapping table prefix
     * @param table table name
     * @param newTable new table name
     * @param contentsId contents id
     * @param newContentsId new contents id
     */
    static copyFeatureTableStyle(featureStyleExtension: FeatureStyleExtension, mappingTablePrefix: string, table: string, newTable: string, contentsId: number, newContentsId: number): void;
    /**
     * Get a Feature Style Extension used only for deletions
     * @param geoPackage GeoPackage
     * @return Feature Style Extension
     */
    static getFeatureStyleExtension(geoPackage: GeoPackage): FeatureStyleExtension;
    /**
     * Delete the Contents Id extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    static deleteContentsId(geoPackage: GeoPackage, table: string): void;
    /**
     * Delete the Contents Id extension including the extension entries and
     * custom tables
     * @param geoPackage GeoPackage
     */
    static deleteContentsIdExtension(geoPackage: GeoPackage): void;
    /**
     * Copy the Contents Id extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    static copyContentsId(geoPackage: GeoPackage, table: string, newTable: string): void;
}
