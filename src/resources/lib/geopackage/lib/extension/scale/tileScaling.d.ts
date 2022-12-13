/**
 * Tile Scaling object, for scaling tiles from nearby zoom levels for missing
 * @constructor
 */
export declare class TileScaling {
    /**
     * Table name column
     * @member {String}
     */
    table_name: string;
    /**
     * scalingType field name
     * @member {String}
     */
    scaling_type: string;
    /**
     * zoomIn field name
     * @member {Number}
     */
    zoom_in: number;
    /**
     * zoomOut field name
     * @member {Number}
     */
    zoom_out: number;
    isZoomIn(): boolean;
    isZoomOut(): boolean;
}
