"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundingBox = void 0;
var projection_1 = require("./projection/projection");
var projectionConstants_1 = require("./projection/projectionConstants");
/**
 * Create a new bounding box
 * @class BoundingBox
 */
var BoundingBox = /** @class */ (function () {
    /**
     * @param  {BoundingBox | Number} minLongitudeOrBoundingBox minimum longitude or bounding box to copy (west)
     * @param  {Number} [maxLongitude]              maximum longitude (east)
     * @param  {Number} [minLatitude]               Minimum latitude (south)
     * @param  {Number} [maxLatitude]               Maximum latitude (north)
     */
    function BoundingBox(minLongitudeOrBoundingBox, maxLongitude, minLatitude, maxLatitude) {
        // if there is a second argument the first argument is the minLongitude
        if (minLongitudeOrBoundingBox instanceof BoundingBox) {
            this.minLongitude = minLongitudeOrBoundingBox.minLongitude;
            this.maxLongitude = minLongitudeOrBoundingBox.maxLongitude;
            this.minLatitude = minLongitudeOrBoundingBox.minLatitude;
            this.maxLatitude = minLongitudeOrBoundingBox.maxLatitude;
        }
        else {
            this.minLongitude = minLongitudeOrBoundingBox;
            this.maxLongitude = maxLongitude;
            this.minLatitude = minLatitude;
            this.maxLatitude = maxLatitude;
        }
    }
    Object.defineProperty(BoundingBox.prototype, "minLongitude", {
        get: function () {
            return this._minLongitude;
        },
        set: function (longitude) {
            this._minLongitude = longitude;
            this.width = this.maxLongitude - this.minLongitude;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoundingBox.prototype, "maxLongitude", {
        get: function () {
            return this._maxLongitude;
        },
        set: function (longitude) {
            this._maxLongitude = longitude;
            this.width = this.maxLongitude - this.minLongitude;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoundingBox.prototype, "minLatitude", {
        get: function () {
            return this._minLatitude;
        },
        set: function (latitude) {
            this._minLatitude = latitude;
            this.height = this.maxLatitude - this.minLatitude;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoundingBox.prototype, "maxLatitude", {
        get: function () {
            return this._maxLatitude;
        },
        set: function (latitude) {
            this._maxLatitude = latitude;
            this.height = this.maxLatitude - this.minLatitude;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoundingBox.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (width) {
            this._width = width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoundingBox.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (height) {
            this._height = height;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Build a Geometry Envelope from the bounding box
     *
     * @return geometry envelope
     */
    BoundingBox.prototype.buildEnvelope = function () {
        return {
            minY: this.minLatitude,
            minX: this.minLongitude,
            maxY: this.maxLatitude,
            maxX: this.maxLongitude,
        };
    };
    BoundingBox.prototype.toGeoJSON = function () {
        return {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [this.minLongitude, this.minLatitude],
                        [this.maxLongitude, this.minLatitude],
                        [this.maxLongitude, this.maxLatitude],
                        [this.minLongitude, this.maxLatitude],
                        [this.minLongitude, this.minLatitude],
                    ],
                ],
            },
        };
    };
    /**
     * Determine if equal to the provided bounding box
     * @param  {BoundingBox} boundingBox bounding boundingBox
     * @return {Boolean}             true if equal, false if not
     */
    BoundingBox.prototype.equals = function (boundingBox) {
        if (!boundingBox) {
            return false;
        }
        if (this === boundingBox) {
            return true;
        }
        return (this.maxLatitude === boundingBox.maxLatitude &&
            this.minLatitude === boundingBox.minLatitude &&
            this.maxLongitude === boundingBox.maxLongitude &&
            this.maxLatitude === boundingBox.maxLatitude);
    };
    /**
     * Project the bounding box into a new projection
     *
     * @param {string} from
     * @param {string} to
     * @return {BoundingBox}
     */
    BoundingBox.prototype.projectBoundingBox = function (from, to) {
        var minLatitude = this.minLatitude;
        var maxLatitude = this.maxLatitude;
        var minLongitude = this.minLongitude;
        var maxLongitude = this.maxLongitude;
        if (from && from !== 'undefined' && to && to !== 'undefined') {
            // if we are going from 4326 to 3857, we first need to trim to the maximum for 3857
            if (projection_1.Projection.isWebMercator(to) && projection_1.Projection.isWGS84(from)) {
                maxLatitude = Math.min(maxLatitude, projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MAX_LAT_RANGE);
                minLatitude = Math.max(minLatitude, projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MIN_LAT_RANGE);
                maxLongitude = Math.min(maxLongitude, projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MAX_LON_RANGE);
                minLongitude = Math.max(minLongitude, projectionConstants_1.ProjectionConstants.WEB_MERCATOR_MIN_LON_RANGE);
            }
            var toConverter = void 0;
            if (projection_1.Projection.isConverter(to)) {
                toConverter = to;
            }
            else {
                toConverter = projection_1.Projection.getConverter(to);
            }
            var fromConverter = void 0;
            if (projection_1.Projection.isConverter(from)) {
                fromConverter = from;
            }
            else {
                fromConverter = projection_1.Projection.getConverter(from);
            }
            // no need to convert if converters are the same
            if (projection_1.Projection.convertersMatch(toConverter, fromConverter)) {
                return new BoundingBox(minLongitude, maxLongitude, minLatitude, maxLatitude);
            }
            else {
                var sw = toConverter.forward(fromConverter.inverse([minLongitude, minLatitude]));
                var ne = toConverter.forward(fromConverter.inverse([maxLongitude, maxLatitude]));
                var se = toConverter.forward(fromConverter.inverse([maxLongitude, minLatitude]));
                var nw = toConverter.forward(fromConverter.inverse([minLongitude, maxLatitude]));
                return new BoundingBox(Math.min(sw[0], nw[0]), Math.max(ne[0], se[0]), Math.min(sw[1], se[1]), Math.max(ne[1], se[1]));
            }
        }
        return this;
    };
    return BoundingBox;
}());
exports.BoundingBox = BoundingBox;
//# sourceMappingURL=boundingBox.js.map