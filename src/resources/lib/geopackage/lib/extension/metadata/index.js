"use strict";
/**
 * MetadataExtension module.
 * @module extension/metadata
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataExtension = void 0;
var baseExtension_1 = require("../baseExtension");
var extension_1 = require("../extension");
var metadataReferenceDao_1 = require("../../metadata/reference/metadataReferenceDao");
var metadataDao_1 = require("../../metadata/metadataDao");
/**
 * Metadata extension
 * @param  {module:geoPackage~GeoPackage} geoPackage GeoPackage object
 * @class
 * @extends BaseExtension
 */
var MetadataExtension = /** @class */ (function (_super) {
    __extends(MetadataExtension, _super);
    function MetadataExtension(geoPackage) {
        var _this = _super.call(this, geoPackage) || this;
        _this.extensionName = MetadataExtension.EXTENSION_NAME;
        _this.extensionDefinition = MetadataExtension.EXTENSION_Metadata_DEFINITION;
        return _this;
    }
    /**
     * Get or create the metadata extension
     */
    MetadataExtension.prototype.getOrCreateExtension = function () {
        return this.getOrCreate(this.extensionName, null, null, this.extensionDefinition, extension_1.Extension.READ_WRITE);
    };
    MetadataExtension.prototype.has = function () {
        return this.hasExtension(MetadataExtension.EXTENSION_NAME, null, null);
    };
    MetadataExtension.prototype.removeExtension = function () {
        if (this.geoPackage.isTable(metadataReferenceDao_1.MetadataReferenceDao.TABLE_NAME)) {
            this.geoPackage.dropTable(metadataReferenceDao_1.MetadataReferenceDao.TABLE_NAME);
        }
        if (this.geoPackage.isTable(metadataDao_1.MetadataDao.TABLE_NAME)) {
            this.geoPackage.dropTable(metadataDao_1.MetadataDao.TABLE_NAME);
        }
        try {
            if (this.extensionsDao.isTableExists()) {
                this.extensionsDao.deleteByExtension(MetadataExtension.EXTENSION_NAME);
            }
        }
        catch (e) {
            throw new Error("Failed to delete Schema extension. GeoPackage: " + this.geoPackage.name);
        }
    };
    MetadataExtension.EXTENSION_NAME = 'gpkg_metadata';
    MetadataExtension.EXTENSION_Metadata_AUTHOR = 'gpkg';
    MetadataExtension.EXTENSION_Metadata_NAME_NO_AUTHOR = 'metadata';
    MetadataExtension.EXTENSION_Metadata_DEFINITION = 'http://www.geopackage.org/spec/#extension_metadata';
    return MetadataExtension;
}(baseExtension_1.BaseExtension));
exports.MetadataExtension = MetadataExtension;
//# sourceMappingURL=index.js.map