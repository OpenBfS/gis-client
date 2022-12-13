"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeometryType = void 0;
var GeometryType;
(function (GeometryType) {
    GeometryType[GeometryType["GEOMETRY"] = 0] = "GEOMETRY";
    GeometryType[GeometryType["POINT"] = 1] = "POINT";
    GeometryType[GeometryType["LINESTRING"] = 2] = "LINESTRING";
    GeometryType[GeometryType["POLYGON"] = 3] = "POLYGON";
    GeometryType[GeometryType["MULTIPOINT"] = 4] = "MULTIPOINT";
    GeometryType[GeometryType["MULTILINESTRING"] = 5] = "MULTILINESTRING";
    GeometryType[GeometryType["MULTIPOLYGON"] = 6] = "MULTIPOLYGON";
    GeometryType[GeometryType["GEOMETRYCOLLECTION"] = 7] = "GEOMETRYCOLLECTION";
    GeometryType[GeometryType["CIRCULARSTRING"] = 8] = "CIRCULARSTRING";
    GeometryType[GeometryType["COMPOUNDCURVE"] = 9] = "COMPOUNDCURVE";
    GeometryType[GeometryType["CURVEPOLYGON"] = 10] = "CURVEPOLYGON";
    GeometryType[GeometryType["MULTICURVE"] = 11] = "MULTICURVE";
    GeometryType[GeometryType["MULTISURFACE"] = 12] = "MULTISURFACE";
    GeometryType[GeometryType["CURVE"] = 13] = "CURVE";
    GeometryType[GeometryType["SURFACE"] = 14] = "SURFACE";
    GeometryType[GeometryType["POLYHEDRALSURFACE"] = 15] = "POLYHEDRALSURFACE";
    GeometryType[GeometryType["TIN"] = 16] = "TIN";
    GeometryType[GeometryType["TRIANGLE"] = 17] = "TRIANGLE";
})(GeometryType = exports.GeometryType || (exports.GeometryType = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (GeometryType) {
    function nameFromType(type) {
        var name = null;
        if (type !== null && type !== undefined) {
            name = GeometryType[type];
        }
        return name;
    }
    GeometryType.nameFromType = nameFromType;
    function fromName(type) {
        return GeometryType[type];
    }
    GeometryType.fromName = fromName;
})(GeometryType = exports.GeometryType || (exports.GeometryType = {}));
//# sourceMappingURL=geometryType.js.map