import { CanvasAdapter } from './canvasAdapter';
/**
 * OffscreenCanvas canvas adapter. This can only run inside a web worker.
 */
export declare class OffscreenCanvasAdapter implements CanvasAdapter {
    private static initialized;
    initialize(): Promise<void>;
    isInitialized(): boolean;
    create(width: number, height: number): any;
    createImage(data: any, contentType?: string): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    createImageData(width: any, height: any): ImageData;
    disposeCanvas(canvas: any): void;
    measureText(context: any, fontFace: string, fontSize: number, text: string): number;
    drawText(context: any, text: string, location: number[], fontFace: string, fontSize: number, fontColor: string): void;
    scaleImage(image: {
        image: any;
        width: number;
        height: number;
    }, scale: number): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    scaleImageToDimensions(image: {
        image: any;
        width: number;
        height: number;
    }, scaledWidth: number, scaledHeight: number): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    toDataURL(canvas: any, format?: string): Promise<string>;
    disposeImage(image: {
        image: any;
        width: number;
        height: number;
    }): void;
}
