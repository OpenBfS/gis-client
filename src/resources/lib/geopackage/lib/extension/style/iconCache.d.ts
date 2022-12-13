import { IconRow } from './iconRow';
/**
 * @memberOf module:extension/style
 * @class IconCache
 */
/**
 * Constructor, created with cache size of {@link #IconCache.DEFAULT_CACHE_SIZE}
 * @constructor
 */
export declare class IconCache {
    cacheSize: number;
    static DEFAULT_CACHE_SIZE: number;
    iconCache: {
        [key: number]: {
            image: any;
            width: number;
            height: number;
        };
    };
    accessHistory: number[];
    constructor(cacheSize?: number);
    /**
     * Get the cached image for the icon row or null if not cached
     * @param {module:extension/style.IconRow} iconRow icon row
     * @return {Image} icon image or null
     */
    getIconForIconRow(iconRow: IconRow): {
        image: any;
        width: number;
        height: number;
    };
    /**
     * Get the cached image for the icon row id or null if not cached
     * @param {Number} iconRowId icon row id
     * @return {Image} icon image or null
     */
    get(iconRowId: number): {
        image: any;
        width: number;
        height: number;
    };
    /**
     * Cache the icon image for the icon row
     * @param {module:extension/style.IconRow} iconRow icon row
     * @param {Image} image icon image
     * @return {Image} previous cached icon image or null
     */
    putIconForIconRow(iconRow: IconRow, image: {
        image: any;
        width: number;
        height: number;
    }): {
        image: any;
        width: number;
        height: number;
    };
    /**
     * Cache the icon image for the icon row id
     * @param {Number} iconRowId icon row id
     * @param {Image} image icon image
     * @return {Image} previous cached icon image or null
     */
    put(iconRowId: number, image: {
        image: any;
        width: number;
        height: number;
    }): {
        image: any;
        width: number;
        height: number;
    };
    /**
     * Remove the cached image for the icon row, if using CanvasKitCanvasAdapter, dispose of returned image to free up memory using Canvas.dispose(icon.image)
     * @param {module:extension/style.IconRow} iconRow icon row
     * @return {Image} removed icon image or null
     */
    removeIconForIconRow(iconRow: IconRow): {
        image: any;
        width: number;
        height: number;
    };
    /**
     * Remove the cached image for the icon row id
     * @param {Number} iconRowId icon row id
     * @return {Image} removed icon image or null
     */
    remove(iconRowId: number): {
        image: any;
        width: number;
        height: number;
    };
    /**
     * Clear the cache
     */
    clear(): void;
    /**
     * Resize the cache
     * @param {Number} maxSize max size
     */
    resize(maxSize: number): void;
    /**
     * Create or retrieve from cache an icon image for the icon row
     * @param {module:extension/style.IconRow} icon icon row
     * @return {Promise<Image>} icon image
     */
    createIcon(icon: IconRow): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    /**
     * Create or retrieve from cache an icon image for the icon row
     * @param {module:extension/style.IconRow} icon icon row
     * @param {Number} scale scale factor
     * @return {Promise<Image>} icon image
     */
    createScaledIcon(icon: IconRow, scale: number): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    /**
     * Create an icon image for the icon row without caching
     * @param {module:extension/style.IconRow} icon icon row
     * @return {Promise<Image>} icon image
     */
    createIconNoCache(icon: IconRow): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    /**
     * Create an icon image for the icon row without caching
     * @param icon icon row
     * @param scale scale factor
     * @return {Promise<Image>} icon image
     */
    createScaledIconNoCache(icon: IconRow, scale: number): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    /**
     * Create or retrieve from cache an icon image for the icon row
     * @param {module:extension/style.IconRow} icon icon row
     * @param {module:extension/style.IconCache} iconCache icon cache
     * @return {Promise<Image>} icon image
     */
    createAndCacheIcon(icon: IconRow, iconCache: IconCache): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    /**
     * Create or retrieve from cache an icon image for the icon row
     * @param {module:extension/style.IconRow} icon icon row
     * @param {Number} scale scale factor
     * @param {module:extension/style.IconCache} iconCache icon cache
     * @return {Promise<Image>} icon image
     */
    createAndCacheScaledIcon(icon: IconRow, scale: number, iconCache: IconCache): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
}
