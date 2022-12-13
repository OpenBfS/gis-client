/// <reference types="node" />
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
export declare class ImageUtils {
    /**
     * Get image for data
     * @param {Buffer|String} data file data or file path
     * @returns {Object}
     */
    static getImageSize(data: Buffer | string): ISizeCalculationResult;
    /**
     * Get image for data
     * @param {Buffer|String} data file data or file path
     * @param {String} contentType
     * @returns {Promise<any>}
     */
    static getImage(data: Buffer | string, contentType?: string): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    /**
     * Get a scaled image
     * @param {Buffer} data
     * @param {Number} scale
     * @returns {Promise<any>}
     */
    static getScaledImage(data: Buffer | string, scale: number): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    /**
     * Get a scaled image
     * @param {any} image
     * @param {Number} scaledWidth
     * @param {Number} scaledHeight
     * @returns {Promise<any>}
     */
    static scaleImage(image: any, scaledWidth: number, scaledHeight: number): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
}
