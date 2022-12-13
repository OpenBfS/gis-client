/// <reference types="node" />
import { GeoPackage } from './geoPackage';
/**
 * This module is the entry point to the GeoPackage API, providing static
 * methods for opening and building GeoPackage files.
 */
export declare class GeoPackageAPI {
    static readonly version: string;
    /**
     * In Node, open a GeoPackage file at the given path, or in a browser, load an
     * in-memory GeoPackage from the given byte array.
     * @param  {string|Uint8Array|Buffer} gppathOrByteArray path to the GeoPackage file or `Uint8Array` of GeoPackage bytes
     * @return {Promise<GeoPackage>} promise that resolves with the open {@link module:geoPackage~GeoPackage} object or rejects with an `Error`
     */
    static open(gppathOrByteArray: string | Uint8Array | Buffer): Promise<GeoPackage>;
    /**
     * In Node, create a GeoPackage file at the given file path, or in a browser,
     * create an in-memory GeoPackage.
     * @param  {string} gppath path of the created GeoPackage file; ignored in the browser
     * @return {Promise<typeof GeoPackage>} promise that resolves with the open {@link module:geoPackage~GeoPackage} object or rejects with an  `Error`
     */
    static create(gppath?: string): Promise<GeoPackage>;
}
