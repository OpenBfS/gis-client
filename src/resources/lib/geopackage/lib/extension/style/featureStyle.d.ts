import { StyleRow } from './styleRow';
import { IconRow } from './iconRow';
/**
 * FeatureStyle constructor
 * @param {module:extension/style.StyleRow} styleRow
 * @param {module:extension/style.IconRow} iconRow
 * @constructor
 */
export declare class FeatureStyle {
    styleRow: StyleRow;
    iconRow: IconRow;
    constructor(styleRow: StyleRow, iconRow: IconRow);
    /**
     * Set style
     * @param {module:extension/style.StyleRow} styleRow
     */
    set style(styleRow: StyleRow);
    /**
     * Get style
     * @returns {module:extension/style.StyleRow}
     */
    get style(): StyleRow;
    /**
     * Returns true if has style
     * @returns {Boolean}
     */
    hasStyle(): boolean;
    /**
     * Set icon
     * @param {module:extension/style.IconRow} iconRow
     */
    set icon(iconRow: IconRow);
    /**
     * Get icon
     * @returns {module:extension/style.IconRow}
     */
    get icon(): IconRow;
    /**
     * Returns true if has icon
     * @returns {Boolean}
     */
    hasIcon(): boolean;
    /**
     * Determine if an icon exists and should be used. Returns false when an
     * icon does not exist or when both a table level icon and row level style
     * exist.
     * @return true if the icon exists and should be used over a style
     */
    useIcon(): boolean;
}
