/**
 * @module extension/scale
 */
import { BaseExtension } from '../baseExtension';
import { GeoPackage } from '../../geoPackage';
import { Extension } from '../extension';
import { TileScalingDao } from './tileScalingDao';
import { TileScaling } from './tileScaling';
/**
 * Tile Scaling extension
 */
export declare class TileScalingExtension extends BaseExtension {
    static readonly EXTENSION_NAME: string;
    static readonly EXTENSION_AUTHOR: string;
    static readonly EXTENSION_NAME_NO_AUTHOR: string;
    static readonly EXTENSION_DEFINITION: string;
    tileScalingDao: TileScalingDao;
    tableName: string;
    constructor(geoPackage: GeoPackage, tableName: string);
    /**
     * Get or create the tileScaling id extension
     * @return {Extension}
     */
    getOrCreateExtension(): Extension;
    /**
     * Creates or updates a tile scaling row for this table extension.
     * @param tileScaling
     */
    createOrUpdate(tileScaling: TileScaling): number;
    /**
     * Get the TileScalingDao
     * @returns {module:extension/scale.TileScalingDao}
     */
    get dao(): TileScalingDao;
    has(): boolean;
    /**
     * Remove tileScaling id extension
     */
    removeExtension(): void;
}
