import { IconRow } from './iconRow';
import { GeometryType } from '../../features/user/geometryType';
/**
 * @memberOf module:extension/style
 * @class Icons
 */
/**
 * Icons constructor
 * @constructor
 */
export declare class Icons {
    defaultIcon: IconRow;
    icons: Map<GeometryType, IconRow>;
    tableIcons: boolean;
    constructor(tableIcons?: boolean);
    setDefault(iconRow: IconRow): void;
    getDefault(): IconRow;
    setIcon(iconRow: IconRow, geometryType?: GeometryType): void;
    getIcon(geometryType?: GeometryType): IconRow;
    isEmpty(): boolean;
    getGeometryTypes(): GeometryType[];
}
