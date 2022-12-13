import { GeoPackage } from '../geoPackage';
export declare class GeoPackageValidationError {
    error: string;
    fatal?: boolean;
    constructor(error: string, fatal?: boolean);
}
export declare class GeoPackageValidate {
    /**
     * Check the file extension to see if it is a GeoPackage
     * @param  {string}   filePath Absolute path to the GeoPackage to create
     * @return {boolean} true if GeoPackage extension
     */
    static hasGeoPackageExtension(filePath: string): boolean;
    /**
     * Validate the extension file as a GeoPackage
     * @param  {string}   filePath Absolute path to the GeoPackage to create
     * @return {GeoPackageValidationError}    error if the extension is not valid
     */
    static validateGeoPackageExtension(filePath: string): GeoPackageValidationError;
    static validateMinimumTables(geoPackage: GeoPackage): GeoPackageValidationError[];
    /**
     * Check the GeoPackage for the minimum required tables
     * @param  {Object}   geoPackage GeoPackage to check
     */
    static hasMinimumTables(geoPackage: GeoPackage): boolean;
}
