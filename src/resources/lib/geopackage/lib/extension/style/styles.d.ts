import { StyleRow } from './styleRow';
import { GeometryType } from '../../features/user/geometryType';
/**
 * Styles constructor
 * @constructor
 */
export declare class Styles {
    defaultStyle: StyleRow;
    styles: Map<GeometryType, StyleRow>;
    tableStyles: boolean;
    constructor(tableStyles?: boolean);
    setDefault(styleRow: StyleRow): void;
    getDefault(): StyleRow;
    setStyle(styleRow: StyleRow, geometryType?: GeometryType): void;
    getStyle(geometryType?: GeometryType): StyleRow;
    isEmpty(): boolean;
    getGeometryTypes(): GeometryType[];
}
