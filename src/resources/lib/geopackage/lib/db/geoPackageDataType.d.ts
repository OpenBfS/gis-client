export declare enum GeoPackageDataType {
    BOOLEAN = 0,
    TINYINT = 1,
    SMALLINT = 2,
    MEDIUMINT = 3,
    INT = 4,
    INTEGER = 5,
    FLOAT = 6,
    DOUBLE = 7,
    REAL = 8,
    TEXT = 9,
    BLOB = 10,
    DATE = 11,
    DATETIME = 12
}
export declare namespace GeoPackageDataType {
    function nameFromType(type: GeoPackageDataType): string;
    function fromName(type: string): GeoPackageDataType;
    /**
     * Get the column default value as a string
     * @param defaultValue default value
     * @param dataType data type
     * @return default value
     */
    function columnDefaultValue(defaultValue: any, dataType: GeoPackageDataType): string;
}
