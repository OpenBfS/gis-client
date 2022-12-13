import { IconTable } from './iconTable';
import { MediaRow } from '../relatedTables/mediaRow';
import { UserColumn } from '../../user/userColumn';
import { DBValue } from '../../db/dbAdapter';
import { GeoPackageDataType } from '../../db/geoPackageDataType';
/**
 * @memberOf module:extension/style
 * @class IconRow
 */
/**
 * Icon Row
 * @extends MediaRow
 * @param  {module:extension/style.IconTable} iconTable  icon table
 * @param  {module:db/geoPackageDataType[]} columnTypes  column types
 * @param  {module:dao/columnValues~ColumnValues[]} values      values
 * @constructor
 */
export declare class IconRow extends MediaRow {
    iconTable: IconTable;
    tableIcon: boolean;
    constructor(iconTable: IconTable, columnTypes?: {
        [key: string]: GeoPackageDataType;
    }, values?: Record<string, DBValue>);
    /**
     * Get the name column
     * @return {module:user/userColumn~UserColumn}
     */
    get nameColumn(): UserColumn;
    /**
     * Gets the name
     * @return {String}
     */
    get name(): string;
    /**
     * Sets the name for the row
     * @param {String} name name
     */
    set name(name: string);
    /**
     * Get the description column
     * @return {module:user/userColumn~UserColumn}
     */
    get descriptionColumn(): UserColumn;
    /**
     * Gets the description
     * @return {String}
     */
    get description(): string;
    /**
     * Sets the description for the row
     * @param {string} description description
     */
    set description(description: string);
    /**
     * Get the width column
     * @return {module:user/userColumn~UserColumn}
     */
    get widthColumn(): UserColumn;
    /**
     * Gets the width
     * @return {Number}
     */
    get width(): number;
    /**
     * Sets the width for the row
     * @param {Number} width width
     */
    set width(width: number);
    /**
     * Get the width or derived width from the icon data and scaled as needed
     * for the height
     *
     * @return {Number}  derived width
     */
    get derivedWidth(): number;
    /**
     * Get the height column
     * @return {module:user/userColumn~UserColumn}
     */
    get heightColumn(): UserColumn;
    /**
     * Gets the height
     * @return {Number}
     */
    get height(): number;
    /**
     * Sets the height for the row
     * @param {Number} height height
     */
    set height(height: number);
    /**
     * Get the height or derived height from the icon data and scaled as needed
     * for the width
     *
     * @return {Number} derived height
     */
    get derivedHeight(): number;
    /**
     * Get the derived width and height from the values and icon data, scaled as needed
     * @return {Number[]} derived dimensions array with two values, width at index 0, height at index 1
     */
    get derivedDimensions(): number[];
    /**
     * Get the anchor_u column
     * @return {module:user/userColumn~UserColumn}
     */
    get anchorUColumn(): UserColumn;
    /**
     * Gets the anchor_u
     * @return {Number}
     */
    get anchorU(): number;
    /**
     * Sets the anchor_u for the row
     * @param {Number} anchor_u anchor_u
     */
    set anchorU(anchorU: number);
    /**
     * Get the anchor u value or the default value of 0.5
     * @return {Number} anchor u value
     */
    get anchorUOrDefault(): number;
    /**
     * Get the anchor_v column
     * @return {module:user/userColumn~UserColumn}
     */
    get anchorVColumn(): UserColumn;
    /**
     * Gets the anchor_v
     * @return {Number}
     */
    get anchorV(): number;
    /**
     * Sets the anchor_v for the row
     * @param {Number} anchor_v anchor_v
     */
    set anchorV(anchorV: number);
    /**
     * Get the anchor v value or the default value of 1.0
     * @return {Number} anchor v value
     */
    get anchorVOrDefault(): number;
    /**
     * Validate the anchor value
     * @param {Number} anchor anchor
     */
    validateAnchor(anchor: number): boolean;
    /**
     * Is a table icon
     * @return table icon flag
     */
    isTableIcon(): boolean;
    /**
     * Set table icon flag
     * @param tableIcon table icon flag
     */
    setTableIcon(tableIcon: boolean): void;
}
