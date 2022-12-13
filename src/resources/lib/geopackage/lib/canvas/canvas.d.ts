import { CanvasAdapter } from './canvasAdapter';
export declare class Canvas {
    private static adapter;
    static registerCanvasAdapter(adapter: new () => CanvasAdapter): void;
    static adapterInitialized(): boolean;
    static initializeAdapter(): Promise<void>;
    static checkCanvasAdapter(): void;
    static create(width: any, height: any): any;
    static createImage(data: any, contentType?: string): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    static createImageData(width: any, height: any): any;
    static disposeCanvas(canvas: any): void;
    static measureText(context: CanvasRenderingContext2D, fontFace: string, fontSize: number, text: string): number;
    static drawText(context: CanvasRenderingContext2D, text: string, location: number[], fontFace: string, fontSize: number, fontColor: string): void;
    static scaleImage(image: {
        image: any;
        width: number;
        height: number;
    }, scale: number): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    static scaleImageToDimensions(image: {
        image: any;
        width: number;
        height: number;
    }, scaledWidth: number, scaledHeight: number): Promise<{
        image: any;
        width: number;
        height: number;
    }>;
    static toDataURL(canvas: any, format?: string): Promise<string>;
    static disposeImage(image: {
        image: any;
        width: number;
        height: number;
    }): void;
}
