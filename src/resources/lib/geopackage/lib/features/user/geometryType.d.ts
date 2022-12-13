export declare enum GeometryType {
    GEOMETRY = 0,
    POINT = 1,
    LINESTRING = 2,
    POLYGON = 3,
    MULTIPOINT = 4,
    MULTILINESTRING = 5,
    MULTIPOLYGON = 6,
    GEOMETRYCOLLECTION = 7,
    CIRCULARSTRING = 8,
    COMPOUNDCURVE = 9,
    CURVEPOLYGON = 10,
    MULTICURVE = 11,
    MULTISURFACE = 12,
    CURVE = 13,
    SURFACE = 14,
    POLYHEDRALSURFACE = 15,
    TIN = 16,
    TRIANGLE = 17
}
export declare namespace GeometryType {
    function nameFromType(type: GeometryType): string;
    function fromName(type: string): GeometryType;
}
