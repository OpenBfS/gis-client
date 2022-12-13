/**
 * @memberOf module:extension/style
 * @class StyleRow
 */
import { AttributesRow } from '../../attributes/attributesRow';
import { StyleTable } from './styleTable';
import { UserColumn } from '../../user/userColumn';
import { DBValue } from '../../db/dbAdapter';
import { GeoPackageDataType } from '../../db/geoPackageDataType';
/**
 * Style Row
 * @extends AttributesRow
 * @param  {module:extension/style.StyleTable} styleTable  style table
 * @param  {module:db/geoPackageDataType[]} columnTypes  column types
 * @param  {module:dao/columnValues~ColumnValues[]} values      values
 * @constructor
 */
export declare class StyleRow extends AttributesRow {
    /**
     * Color hex pattern
     */
    private static readonly colorPattern;
    styleTable: StyleTable;
    tableStyle: boolean;
    constructor(styleTable: StyleTable, columnTypes?: {
        [key: string]: GeoPackageDataType;
    }, values?: Record<string, DBValue>);
    /**
     * Get the name column
     * @return {module:user/userColumn~UserColumn}
     */
    getNameColumn(): UserColumn;
    /**
     * Gets the name
     * @return {String}
     */
    getName(): string;
    /**
     * Sets the name for the row
     * @param {String} name name
     */
    setName(name: string): void;
    /**
     * Get the description column
     * @return {module:user/userColumn~UserColumn}
     */
    getDescriptionColumn(): UserColumn;
    /**
     * Gets the description
     * @return {String}
     */
    getDescription(): string;
    /**
     * Sets the description for the row
     * @param {String} description description
     */
    setDescription(description: string): void;
    /**
     * Get the color column
     * @return {module:user/userColumn~UserColumn}
     */
    getColorColumn(): UserColumn;
    /**
     * Get the style color
     * @return {String} color
     */
    getColor(): string;
    /**
     * Check if the style has a color
     * @return true if has a color
     */
    hasColor(): boolean;
    /**
     * Get the color
     * @return {String} color
     */
    getHexColor(): string;
    /**
     * Set the color
     * @param {String} color color
     * @param {Number} opacity opacity
     */
    setColor(color: string, opacity: number): void;
    /**
     * Sets the color for the row
     * @param {String} color color
     */
    setHexColor(color: string): void;
    /**
     * Get the opacity column
     * @return {module:user/userColumn~UserColumn}
     */
    getOpacityColumn(): UserColumn;
    /**
     * Gets the opacity
     * @return {Number}
     */
    getOpacity(): number;
    /**
     * Get the opacity or default value
     * @return {Number} opacity
     */
    getOpacityOrDefault(): number;
    /**
     * Sets the opacity for the row
     * @param {Number} opacity opacity
     */
    setOpacity(opacity: number): void;
    /**
     * Get the width column
     * @return {module:user/userColumn~UserColumn}
     */
    getWidthColumn(): UserColumn;
    /**
     * Gets the width
     * @return {number}
     */
    getWidth(): number;
    /**
     * Sets the width for the row
     * @param {Number} width width
     */
    setWidth(width: number): void;
    /**
     * Get the width value or default width
     * @return width
     */
    getWidthOrDefault(): number;
    /**
     * Get the fill color column
     * @return {module:user/userColumn~UserColumn}
     */
    getFillColorColumn(): UserColumn;
    /**
     * Get the style fill color
     * @return {String} color
     */
    getFillColor(): string;
    /**
     * Check if the style has a fill color
     * @return true if has a color
     */
    hasFillColor(): boolean;
    /**
     * Get the fill color
     * @return {String} color
     */
    getFillHexColor(): string;
    /**
     * Set the fill color
     * @param {String} color color
     * @param {Number} opacity opacity
     */
    setFillColor(color: string, opacity: number): void;
    /**
     * Sets the fill color for the row
     * @param {String} color color
     */
    setFillHexColor(color: string): void;
    /**
     * Get the fill opacity column
     * @return {module:user/userColumn~UserColumn}
     */
    getFillOpacityColumn(): UserColumn;
    /**
     * Gets the fill opacity
     * @return {Number}
     */
    getFillOpacity(): number;
    /**
     * Sets the fill opacity for the row
     * @param {Number} fillOpacity fillOpacity
     */
    setFillOpacity(fillOpacity: number): void;
    /**
     * Get the fill opacity or default value
     * @return {Number} fill opacity
     */
    getFillOpacityOrDefault(): number;
    /**
     * Validate and adjust the color value
     * @param {String} color color
     */
    validateColor(color: string): string;
    /**
     * Validate the opacity value
     * @param {Number} opacity opacity
     */
    validateOpacity(opacity: number): boolean;
    /**
     * Create a color from the hex color and opacity
     * @param {String} hexColor hex color
     * @param {Number} opacity opacity
     * @return {String} rgba color
     */
    createColor(hexColor: string, opacity: number): string;
    /**
     * Determine if a color exists from the hex color and opacity
     * @param {String} hexColor hex color
     * @param {Number} opacity opacity
     * @return true if has a color
     */
    _hasColor(hexColor: string, opacity: number): boolean;
    /**
     * Is a table style
     * @return table style flag
     */
    isTableStyle(): boolean;
    /**
     * Set table style flag
     * @param tableStyle table style flag
     */
    setTableStyle(tableStyle: boolean): void;
}
