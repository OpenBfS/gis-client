"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoPackageValidate = exports.GeoPackageValidationError = void 0;
var path_1 = __importDefault(require("path"));
var geoPackageConstants_1 = require("../geoPackageConstants");
var GeoPackageValidationError = /** @class */ (function () {
    function GeoPackageValidationError(error, fatal) {
        this.error = error;
        this.fatal = fatal;
    }
    return GeoPackageValidationError;
}());
exports.GeoPackageValidationError = GeoPackageValidationError;
var GeoPackageValidate = /** @class */ (function () {
    function GeoPackageValidate() {
    }
    /**
     * Check the file extension to see if it is a GeoPackage
     * @param  {string}   filePath Absolute path to the GeoPackage to create
     * @return {boolean} true if GeoPackage extension
     */
    GeoPackageValidate.hasGeoPackageExtension = function (filePath) {
        var extension = path_1.default.extname(filePath);
        return (extension &&
            extension !== '' &&
            (extension.toLowerCase() === '.' + geoPackageConstants_1.GeoPackageConstants.GEOPACKAGE_EXTENSION.toLowerCase() ||
                extension.toLowerCase() === '.' + geoPackageConstants_1.GeoPackageConstants.GEOPACKAGE_EXTENDED_EXTENSION.toLowerCase()));
    };
    /**
     * Validate the extension file as a GeoPackage
     * @param  {string}   filePath Absolute path to the GeoPackage to create
     * @return {GeoPackageValidationError}    error if the extension is not valid
     */
    GeoPackageValidate.validateGeoPackageExtension = function (filePath) {
        if (!GeoPackageValidate.hasGeoPackageExtension(filePath)) {
            return new GeoPackageValidationError("GeoPackage database file '" +
                filePath +
                "' does not have a valid extension of '" +
                geoPackageConstants_1.GeoPackageConstants.GEOPACKAGE_EXTENSION +
                "' or '" +
                geoPackageConstants_1.GeoPackageConstants.GEOPACKAGE_EXTENDED_EXTENSION +
                "'", true);
        }
    };
    GeoPackageValidate.validateMinimumTables = function (geoPackage) {
        var errors = [];
        var srsExists = geoPackage.spatialReferenceSystemDao.isTableExists();
        var contentsExists = geoPackage.contentsDao.isTableExists();
        if (!srsExists) {
            errors.push(new GeoPackageValidationError('gpkg_spatial_ref_sys table does not exist', true));
        }
        if (!contentsExists) {
            errors.push(new GeoPackageValidationError('gpkg_contents table does not exist', true));
        }
        return errors;
    };
    /**
     * Check the GeoPackage for the minimum required tables
     * @param  {Object}   geoPackage GeoPackage to check
     */
    GeoPackageValidate.hasMinimumTables = function (geoPackage) {
        return this.validateMinimumTables(geoPackage).length == 0;
    };
    return GeoPackageValidate;
}());
exports.GeoPackageValidate = GeoPackageValidate;
//# sourceMappingURL=geoPackageValidate.js.map