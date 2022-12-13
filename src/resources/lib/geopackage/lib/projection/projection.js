"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projection = void 0;
var proj4_1 = __importDefault(require("proj4"));
var isEqual_1 = __importDefault(require("lodash/isEqual"));
var projectionConstants_1 = require("./projectionConstants");
var Projection = /** @class */ (function () {
    function Projection() {
    }
    Projection.loadProjection = function (name, definition) {
        if (!name || !definition) {
            throw new Error('Invalid projection name/definition');
        }
        if (proj4_1.default.defs(name) == null) {
            proj4_1.default.defs(name, definition);
        }
    };
    Projection.loadProjections = function (items) {
        if (!items)
            throw new Error('Invalid array of projections');
        for (var i = 0; i < items.length; i++) {
            if (!items[i] || !items[i].name || !items[i].definition) {
                throw new Error('Invalid projection in array. Valid projection {name: string, definition: string}.');
            }
            Projection.loadProjection(items[i].name, items[i].definition);
        }
    };
    Projection.isConverter = function (x) {
        return x.forward !== undefined;
    };
    Projection.hasProjection = function (name) {
        return proj4_1.default.defs(name);
    };
    /**
     * Get proj4.Converter
     * @param from - name of from projection
     * @param to - name of to projection
     * @return proj4.Converter
     */
    Projection.getConverter = function (from, to) {
        if (from != null && (0, proj4_1.default)(from) == null) {
            throw new Error('Projection ' + from + ' has not been defined.');
        }
        if (to != null && (0, proj4_1.default)(to) == null) {
            throw new Error('Projection ' + to + ' has not been defined.');
        }
        return (0, proj4_1.default)(from, to);
    };
    /**
     * Convert coordinates
     * @param from - name of from projection
     * @param to - name of to projection
     * @param coordinates - coordinates
     * @return proj4.Converter
     */
    Projection.convertCoordinates = function (from, to, coordinates) {
        if (from != null && (0, proj4_1.default)(from) == null) {
            throw new Error('Projection ' + from + ' has not been defined.');
        }
        if (to != null && (0, proj4_1.default)(to) == null) {
            throw new Error('Projection ' + to + ' has not been defined.');
        }
        return (0, proj4_1.default)(from, to, coordinates);
    };
    Projection.getEPSGConverter = function (epsgId) {
        return (0, proj4_1.default)(projectionConstants_1.ProjectionConstants.EPSG_PREFIX + epsgId);
    };
    Projection.getWebMercatorToWGS84Converter = function () {
        return (0, proj4_1.default)(projectionConstants_1.ProjectionConstants.EPSG_3857);
    };
    Projection.isWebMercator = function (proj) {
        if (typeof proj === 'string') {
            return proj.toUpperCase() === projectionConstants_1.ProjectionConstants.EPSG_3857;
        }
        else {
            return this.convertersMatch(this.getEPSGConverter(projectionConstants_1.ProjectionConstants.EPSG_CODE_3857), proj);
        }
    };
    Projection.isWGS84 = function (proj) {
        if (typeof proj === 'string') {
            return proj.toUpperCase() === projectionConstants_1.ProjectionConstants.EPSG_4326;
        }
        else {
            return this.convertersMatch(this.getEPSGConverter(projectionConstants_1.ProjectionConstants.EPSG_CODE_4326), proj);
        }
    };
    Projection.convertersMatch = function (converterA, converterB) {
        return (0, isEqual_1.default)(converterA.oProj, converterB.oProj);
    };
    Projection.getConverterFromConverters = function (from, to) {
        return (0, proj4_1.default)(from, to);
    };
    return Projection;
}());
exports.Projection = Projection;
//# sourceMappingURL=projection.js.map