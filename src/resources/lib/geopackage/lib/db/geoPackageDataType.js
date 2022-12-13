"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoPackageDataType = void 0;
var GeoPackageDataType;
(function (GeoPackageDataType) {
    GeoPackageDataType[GeoPackageDataType["BOOLEAN"] = 0] = "BOOLEAN";
    GeoPackageDataType[GeoPackageDataType["TINYINT"] = 1] = "TINYINT";
    GeoPackageDataType[GeoPackageDataType["SMALLINT"] = 2] = "SMALLINT";
    GeoPackageDataType[GeoPackageDataType["MEDIUMINT"] = 3] = "MEDIUMINT";
    GeoPackageDataType[GeoPackageDataType["INT"] = 4] = "INT";
    GeoPackageDataType[GeoPackageDataType["INTEGER"] = 5] = "INTEGER";
    GeoPackageDataType[GeoPackageDataType["FLOAT"] = 6] = "FLOAT";
    GeoPackageDataType[GeoPackageDataType["DOUBLE"] = 7] = "DOUBLE";
    GeoPackageDataType[GeoPackageDataType["REAL"] = 8] = "REAL";
    GeoPackageDataType[GeoPackageDataType["TEXT"] = 9] = "TEXT";
    GeoPackageDataType[GeoPackageDataType["BLOB"] = 10] = "BLOB";
    GeoPackageDataType[GeoPackageDataType["DATE"] = 11] = "DATE";
    GeoPackageDataType[GeoPackageDataType["DATETIME"] = 12] = "DATETIME";
})(GeoPackageDataType = exports.GeoPackageDataType || (exports.GeoPackageDataType = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (GeoPackageDataType) {
    function nameFromType(type) {
        return GeoPackageDataType[type];
    }
    GeoPackageDataType.nameFromType = nameFromType;
    function fromName(type) {
        return GeoPackageDataType[type];
    }
    GeoPackageDataType.fromName = fromName;
    /**
     * Get the column default value as a string
     * @param defaultValue default value
     * @param dataType data type
     * @return default value
     */
    function columnDefaultValue(defaultValue, dataType) {
        var value = null;
        if (defaultValue !== null && defaultValue !== undefined) {
            if (dataType !== null && dataType !== undefined) {
                switch (dataType) {
                    case GeoPackageDataType.BOOLEAN:
                        var booleanValue = null;
                        if (typeof defaultValue === 'boolean') {
                            booleanValue = defaultValue;
                        }
                        else if (typeof defaultValue === 'string') {
                            ;
                            switch (defaultValue) {
                                case '0':
                                    booleanValue = false;
                                    break;
                                case '1':
                                    booleanValue = true;
                                    break;
                                case 'true':
                                    booleanValue = true;
                                    break;
                                case 'false':
                                    booleanValue = false;
                                    break;
                                default:
                                    break;
                            }
                        }
                        if (booleanValue !== null && booleanValue !== undefined) {
                            if (booleanValue) {
                                value = '1';
                            }
                            else {
                                value = '0';
                            }
                        }
                        break;
                    case GeoPackageDataType.TEXT:
                        value = defaultValue.toString();
                        if (!value.startsWith('\'') || !value.endsWith('\'')) {
                            value = '\'' + value + '\'';
                        }
                        break;
                    default:
                }
            }
            if (value === null || value === undefined) {
                value = defaultValue.toString();
            }
        }
        return value;
    }
    GeoPackageDataType.columnDefaultValue = columnDefaultValue;
})(GeoPackageDataType = exports.GeoPackageDataType || (exports.GeoPackageDataType = {}));
//# sourceMappingURL=geoPackageDataType.js.map