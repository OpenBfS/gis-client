/**
 * Paint module.
 * @module tiles/features
 */
export declare class Paint {
    _color: string;
    _strokeWidth: number;
    /**
     * Get the color
     * @returns {String} color String color in the format #RRGGBB or #RRGGBBAA
     */
    get color(): string;
    /**
     * Set the color
     * @param {String} color String color in the format #RRGGBB or #RRGGBBAA
     */
    set color(color: string);
    /**
     * Get the color
     * @returns {String} color
     */
    get colorRGBA(): string;
    /**
     * Get the stroke width
     * @returns {Number} strokeWidth width in pixels
     */
    get strokeWidth(): number;
    /**
     * Set the stroke width
     * @param {Number} strokeWidth width in pixels
     */
    set strokeWidth(strokeWidth: number);
}
