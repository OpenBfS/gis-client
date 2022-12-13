import { CanvasAdapter } from './canvasAdapter';
/**
 * Node based canvas creation
 */
export declare class CanvasKitCanvasAdapter implements CanvasAdapter {
    private static CanvasKit;
    private static initialized;
    static canvasKitWasmLocateFile: (filename: string) => string;
    static setCanvasKitWasmLocateFile(locateFile: (filename: string) => string): void;
    static setCanvasKit(CanvasKit: any): void;
    initialize(): Promise<void>;
    isInitialized(): boolean;
    create(width: number, height: number): any;
    /**
     * Supports creating an image from file, base64 encoded image, image data buffer or url
     * @param imageData
     * @param contentType
     */
    createImage(imageData: any, contentType: string): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    createImageData(width: any, height: any): any;
    disposeCanvas(canvas: any): void;
    measureText(context: any, fontFace: string, fontSize: number, text: string): number;
    drawText(context: any, text: string, location: number[], fontFace: string, fontSize: number, fontColor: string): void;
    toDataURL(canvas: any, format?: string): Promise<string>;
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
    disposeImage(image: {
        image: any;
        width: number;
        height: number;
    }): void;
}
