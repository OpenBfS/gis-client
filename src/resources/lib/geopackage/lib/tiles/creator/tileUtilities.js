"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileUtilities = void 0;
var projectionConstants_1 = require("../../projection/projectionConstants");
var projection_1 = require("../../projection/projection");
var TileUtilities = /** @class */ (function () {
    function TileUtilities() {
    }
    TileUtilities.getPiecePosition = function (tilePieceBoundingBox, tileBoundingBox, height, width, projectionTo, projectionToDefinition, projectionFrom, projectionFromDefinition, tileHeightUnitsPerPixel, tileWidthUnitsPerPixel, pixelXSize, pixelYSize) {
        var conversion;
        try {
            if (projection_1.Projection.hasProjection(projectionTo) == null) {
                projection_1.Projection.loadProjection(projectionTo, projectionToDefinition);
            }
            if (projection_1.Projection.hasProjection(projectionFrom) == null) {
                projection_1.Projection.loadProjection(projectionFrom, projectionFromDefinition);
            }
            conversion = projection_1.Projection.getConverter(projectionTo, projectionFrom);
        }
        catch (e) {
            throw new Error('Error creating projection conversion between ' + projectionTo + ' and ' + projectionFrom + '.');
        }
        var maxLatitude = tilePieceBoundingBox.maxLatitude;
        var minLatitude = tilePieceBoundingBox.minLatitude;
        var minLongitude = tilePieceBoundingBox.minLongitude - pixelXSize;
        var maxLongitude = tilePieceBoundingBox.maxLongitude + pixelXSize;
        if (projectionTo.toUpperCase() === projectionConstants_1.ProjectionConstants.EPSG_3857 && projectionFrom.toUpperCase() === projectionConstants_1.ProjectionConstants.EPSG_4326) {
            maxLatitude = maxLatitude > projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MAX_LAT_RANGE ? projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MAX_LAT_RANGE : maxLatitude;
            minLatitude = minLatitude < projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MIN_LAT_RANGE ? projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MIN_LAT_RANGE : minLatitude;
            minLongitude = minLongitude < projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MIN_LON_RANGE ? projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MIN_LON_RANGE : minLongitude;
            maxLongitude = maxLongitude > projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MAX_LON_RANGE ? projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MAX_LON_RANGE : maxLongitude;
        }
        // ensure the projected longitude wont wrap around the world
        var negative180 = projection_1.Projection.convertCoordinates(projectionConstants_1.ProjectionConstants.EPSG_4326, projectionTo, [-180, 0]);
        var positive180 = projection_1.Projection.convertCoordinates(projectionConstants_1.ProjectionConstants.EPSG_4326, projectionTo, [180, 0]);
        minLongitude = minLongitude < negative180[0] ? negative180[0] : minLongitude;
        maxLongitude = maxLongitude > positive180[0] ? positive180[0] : maxLongitude;
        var pieceBoundingBoxInTileProjectionSW = conversion.inverse([minLongitude, minLatitude]);
        var pieceBoundingBoxInTileProjectionNE = conversion.inverse([maxLongitude, maxLatitude]);
        var pieceBBProjected = {
            minLatitude: isNaN(pieceBoundingBoxInTileProjectionSW[1])
                ? tileBoundingBox.minLatitude
                : pieceBoundingBoxInTileProjectionSW[1],
            maxLatitude: isNaN(pieceBoundingBoxInTileProjectionNE[1])
                ? tileBoundingBox.maxLatitude
                : pieceBoundingBoxInTileProjectionNE[1],
            minLongitude: pieceBoundingBoxInTileProjectionSW[0],
            maxLongitude: pieceBoundingBoxInTileProjectionNE[0],
        };
        var startY = Math.max(0, Math.floor((tileBoundingBox.maxLatitude - pieceBBProjected.maxLatitude) / tileHeightUnitsPerPixel));
        var startX = Math.max(0, Math.floor((pieceBBProjected.minLongitude - tileBoundingBox.minLongitude) / tileWidthUnitsPerPixel));
        var endY = Math.min(height, height - Math.floor((pieceBBProjected.minLatitude - tileBoundingBox.minLatitude) / tileHeightUnitsPerPixel));
        var endX = Math.min(width, width - Math.floor((tileBoundingBox.maxLongitude - pieceBBProjected.maxLongitude) / tileWidthUnitsPerPixel));
        return {
            startY: startY,
            startX: startX,
            endY: endY,
            endX: endX,
        };
    };
    return TileUtilities;
}());
exports.TileUtilities = TileUtilities;
//# sourceMappingURL=tileUtilities.js.map