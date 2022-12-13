import proj4 from 'proj4';
import { TileMatrix } from '../matrix/tileMatrix';
import { TileMatrixSet } from '../matrixset/tileMatrixSet';
import { SpatialReferenceSystem } from '../../core/srs/spatialReferenceSystem';
import { BoundingBox } from '../../boundingBox';
export declare class TileCreator {
    dispose: boolean;
    canvas: any;
    ctx: any;
    image: any;
    tileCanvas: any;
    tileContext: any;
    imageData: any;
    pixelsAdded: boolean;
    width: number;
    height: number;
    tileMatrix: TileMatrix;
    projectionFrom: string;
    projectionFromDefinition: string;
    projectionTo: string;
    projectionToDefinition: string | proj4.ProjectionDefinition;
    tileBoundingBox: BoundingBox;
    tileMatrixSet: TileMatrixSet;
    chunks: any[];
    tileHeightUnitsPerPixel: number;
    tileWidthUnitsPerPixel: number;
    sameProjection: boolean;
    constructor(width: number, height: number, tileMatrix: TileMatrix, tileMatrixSet: TileMatrixSet, tileBoundingBox: BoundingBox, srs: SpatialReferenceSystem, projectionTo: string, projectionToDefinition: string | proj4.ProjectionDefinition, canvas: any);
    /**
     * Factory method to generate a TileCreator instance
     * @param width
     * @param height
     * @param tileMatrix
     * @param tileMatrixSet
     * @param tileBoundingBox
     * @param srs
     * @param projectionTo
     * @param projectionToDefinition
     * @param canvas
     */
    static create(width: number, height: number, tileMatrix: TileMatrix, tileMatrixSet: TileMatrixSet, tileBoundingBox: BoundingBox, srs: SpatialReferenceSystem, projectionTo: string, projectionToDefinition: string | proj4.ProjectionDefinition, canvas: any): Promise<TileCreator>;
    /**
     * Initialize the TileCreator
     */
    initialize(): Promise<TileCreator>;
    /**
     * Adds a single pixel from one image to another
     * @param targetX
     * @param targetY
     * @param sourceX
     * @param sourceY
     */
    addPixel(targetX: number, targetY: number, sourceX: number, sourceY: number): void;
    /**
     * Adds a tile and reprojects it if necessary before drawing it into the target canvas
     * @param tileData
     * @param gridColumn
     * @param gridRow
     */
    addTile(tileData: any, gridColumn: number, gridRow: number): Promise<void>;
    /**
     * Projects the tile into the target projection and renders into the target canvas
     * @param tileData
     * @param gridColumn
     * @param gridRow
     */
    projectTile(tileData: any, gridColumn: number, gridRow: number): Promise<any>;
    /**
     * Cuts and scales tile data to fit the specified bounding box
     * @param tileData
     * @param tilePieceBoundingBox
     */
    cutAndScale(tileData: any, tilePieceBoundingBox: BoundingBox): void;
    /**
     * Adds chunks to the chunk list.
     * @param chunk
     * @param position
     */
    addChunk(chunk: any, position: any): void;
    /**
     * Reprojection tile data into target
     * @param tileData
     * @param tilePieceBoundingBox
     */
    reproject(tileData: any, tilePieceBoundingBox: BoundingBox): Promise<void>;
    /**
     * Gets the complete tile as a base64 encoded data url
     * @param format
     */
    getCompleteTile(format?: string): Promise<any>;
    /**
     * Cleans up any canvases that may have been created
     */
    cleanup(): void;
}
