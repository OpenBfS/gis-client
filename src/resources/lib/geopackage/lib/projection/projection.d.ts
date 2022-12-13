import proj4 from 'proj4';
export declare class Projection {
    static loadProjection(name: string, definition: string | proj4.ProjectionDefinition): void;
    static loadProjections(items: {
        name: string;
        definition: string | proj4.ProjectionDefinition;
    }[]): void;
    static isConverter(x: proj4.Converter | string): x is proj4.Converter;
    static hasProjection(name: string): proj4.ProjectionDefinition;
    /**
     * Get proj4.Converter
     * @param from - name of from projection
     * @param to - name of to projection
     * @return proj4.Converter
     */
    static getConverter(from: string, to?: string): proj4.Converter;
    /**
     * Convert coordinates
     * @param from - name of from projection
     * @param to - name of to projection
     * @param coordinates - coordinates
     * @return proj4.Converter
     */
    static convertCoordinates(from: string, to: string, coordinates: any): proj4.Converter;
    static getEPSGConverter(epsgId: number): proj4.Converter;
    static getWebMercatorToWGS84Converter(): proj4.Converter;
    static isWebMercator(proj: string | proj4.Converter): boolean;
    static isWGS84(proj: string | proj4.Converter): boolean;
    static convertersMatch(converterA: any, converterB: any): boolean;
    static getConverterFromConverters(from: any, to?: any): proj4.Converter;
}
