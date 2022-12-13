import { TileDao } from '../user/tileDao';
import { TileMatrix } from '../matrix/tileMatrix';
import { BoundingBox } from '../../boundingBox';
import { TileRow } from '../user/tileRow';
import { TileScaling } from '../../extension/scale/tileScaling';
export declare class GeoPackageTileRetriever {
    tileDao: TileDao<TileRow>;
    width: number;
    height: number;
    setWebMercatorBoundingBox: BoundingBox;
    setProjectionBoundingBox: BoundingBox;
    scaling: TileScaling;
    constructor(tileDao: TileDao<TileRow>, width: number, height: number);
    setScaling(scaling: TileScaling): void;
    getWebMercatorBoundingBox(): BoundingBox;
    /**
     * Determine the web mercator bounding box from xyz and see if there is a tile for the bounding box.
     * @param x
     * @param y
     * @param zoom
     */
    hasTile(x: number, y: number, zoom: number): boolean;
    hasTileForBoundingBox(tilesBoundingBox: BoundingBox, targetProjection: string): boolean;
    getTile(x: number, y: number, zoom: number): Promise<any>;
    getWebMercatorTile(x: number, y: number, zoom: number): Promise<any>;
    drawTileIn(x: number, y: number, zoom: number, canvas?: any): Promise<any>;
    getTileWithWgs84Bounds(wgs84BoundingBox: BoundingBox, canvas?: any): Promise<any>;
    getTileWithWgs84BoundsInProjection(wgs84BoundingBox: BoundingBox, zoom: number, targetProjection: string, canvas?: any): Promise<any>;
    getTileWithBounds(targetBoundingBox: BoundingBox, targetProjection: string, canvas?: any): Promise<any>;
    retrieveTileResults(tileMatrixProjectionBoundingBox: BoundingBox, tileMatrix?: TileMatrix): IterableIterator<TileRow>;
    /**
     * Get the tile matrices that may contain the tiles for the bounding box,
     * matches against the bounding box and zoom level options
     * @param projectedRequestBoundingBox bounding box projected to the tiles
     * @return tile matrices
     */
    getTileMatrices(projectedRequestBoundingBox: BoundingBox): TileMatrix[];
}
