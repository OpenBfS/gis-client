// @ts-nocheck
var proj4 = require('proj4');
proj4 = 'default' in proj4 ? proj4['default'] : proj4;
module.exports = function (job) {
    var tilePieceBoundingBox = JSON.parse(job.tilePieceBoundingBox);
    var tileBoundingBox = JSON.parse(job.tileBoundingBox);
    var height = job.height;
    var width = job.width;
    var imageData = new Uint8ClampedArray(width * height * 4);
    var sourceImageData = new Uint8ClampedArray(job.sourceImageData);
    var conversion;
    try {
        if (proj4.defs(job.projectionTo) == null) {
            proj4.defs(job.projectionTo, job.projectionToDefinition);
        }
        if (proj4.defs(job.projectionFrom) == null) {
            proj4.defs(job.projectionFrom, job.projectionFromDefinition);
        }
        conversion = proj4(job.projectionTo, job.projectionFrom);
    }
    catch (e) {
        throw new Error('Error creating projection conversion between ' + job.projectionTo + ' and ' + job.projectionFrom + '.');
    }
    var latitude;
    for (var row = 0; row < height; row++) {
        latitude = tileBoundingBox._maxLatitude - row * job.tileHeightUnitsPerPixel;
        for (var column = 0; column < width; column++) {
            // loop over all pixels in the target tile
            // determine the position of the current pixel in the target tile
            var longitude = tileBoundingBox._minLongitude + column * job.tileWidthUnitsPerPixel;
            // project that lat/lng to the source coordinate system
            var projected = conversion.forward([longitude, latitude]);
            var projectedLongitude = projected[0];
            var projectedLatitude = projected[1];
            // now find the source pixel
            var xPixel = job.tile_width - Math.round((tilePieceBoundingBox._maxLongitude - projectedLongitude) / job.pixel_x_size);
            var yPixel = Math.round((tilePieceBoundingBox._maxLatitude - projectedLatitude) / job.pixel_y_size);
            if (xPixel >= 0 && xPixel < job.tile_width && yPixel >= 0 && yPixel < job.tile_height) {
                var sliceStart = yPixel * job.tile_width * 4 + xPixel * 4;
                var color = sourceImageData.slice(sliceStart, sliceStart + 4);
                imageData.set(color, row * width * 4 + column * 4);
            }
        }
    }
    return imageData.buffer;
};
//# sourceMappingURL=projectTile.js.map