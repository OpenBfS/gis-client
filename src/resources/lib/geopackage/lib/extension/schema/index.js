"use strict";
/**
 * SchemaExtension module.
 * @module SchemaExtension
 * @see module:extension/BaseExtension
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
exports.SchemaExtension = void 0;
var baseExtension_1 = require("../baseExtension");
var extension_1 = require("../extension");
var dataColumnsDao_1 = require("../../dataColumns/dataColumnsDao");
var dataColumnConstraintsDao_1 = require("../../dataColumnConstraints/dataColumnConstraintsDao");
var SchemaExtension = /** @class */ (function (_super) {
    __extends(SchemaExtension, _super);
    function SchemaExtension(geoPackage) {
        return _super.call(this, geoPackage) || this;
    }
    SchemaExtension.prototype.getOrCreateExtension = function () {
        var extensions = [];
        extensions.push(this.getOrCreate(SchemaExtension.EXTENSION_NAME, dataColumnsDao_1.DataColumnsDao.TABLE_NAME, null, SchemaExtension.EXTENSION_SCHEMA_DEFINITION, extension_1.Extension.READ_WRITE));
        extensions.push(this.getOrCreate(SchemaExtension.EXTENSION_NAME, dataColumnConstraintsDao_1.DataColumnConstraintsDao.TABLE_NAME, null, SchemaExtension.EXTENSION_SCHEMA_DEFINITION, extension_1.Extension.READ_WRITE));
        return extensions;
    };
    SchemaExtension.prototype.has = function () {
        return this.hasExtensions(SchemaExtension.EXTENSION_NAME);
    };
    SchemaExtension.prototype.removeExtension = function () {
        if (this.geoPackage.isTable(dataColumnsDao_1.DataColumnsDao.TABLE_NAME)) {
            this.geoPackage.dropTable(dataColumnsDao_1.DataColumnsDao.TABLE_NAME);
        }
        if (this.geoPackage.isTable(dataColumnConstraintsDao_1.DataColumnConstraintsDao.TABLE_NAME)) {
            this.geoPackage.dropTable(dataColumnConstraintsDao_1.DataColumnConstraintsDao.TABLE_NAME);
        }
        if (this.extensionsDao.isTableExists()) {
            this.extensionsDao.deleteByExtension(SchemaExtension.EXTENSION_NAME);
        }
    };
    SchemaExtension.EXTENSION_SCHEMA_AUTHOR = 'gpkg';
    SchemaExtension.EXTENSION_SCHEMA_NAME_NO_AUTHOR = 'schema';
    SchemaExtension.EXTENSION_NAME = SchemaExtension.EXTENSION_SCHEMA_AUTHOR + '_' + SchemaExtension.EXTENSION_SCHEMA_NAME_NO_AUTHOR;
    SchemaExtension.EXTENSION_SCHEMA_DEFINITION = 'http://www.geopackage.org/spec/#extension_schema';
    return SchemaExtension;
}(baseExtension_1.BaseExtension));
exports.SchemaExtension = SchemaExtension;
//# sourceMappingURL=index.js.map