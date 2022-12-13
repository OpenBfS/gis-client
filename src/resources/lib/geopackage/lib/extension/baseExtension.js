"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseExtension = void 0;
var extension_1 = require("./extension");
/**
 * Base Extension
 */
/**
 * Abstract base GeoPackage extension
 */
var BaseExtension = /** @class */ (function () {
    /**
     *
     * @param geoPackage GeoPackage object
     */
    function BaseExtension(geoPackage) {
        this.geoPackage = geoPackage;
        this.connection = geoPackage.connection;
        this.extensionsDao = geoPackage.extensionDao;
    }
    /**
     * Get the extension or create as needed
     * @param  {String}   extensionName extension name
     * @param  {String}   tableName     table name
     * @param  {String}   columnName    column name
     * @param  {String}   definition    extension definition
     * @param  {String}   scopeType     extension scope type
     * @return {Extension}
     */
    BaseExtension.prototype.getOrCreate = function (extensionName, tableName, columnName, definition, scopeType) {
        var extension = this.getExtension(extensionName, tableName, columnName);
        if (extension.length) {
            return extension[0];
        }
        this.extensionsDao.createTable();
        this.createExtension(extensionName, tableName, columnName, definition, scopeType);
        return this.getExtension(extensionName, tableName, columnName)[0];
    };
    /**
     * Get the extension for the name, table name and column name
     * @param  {String}   extensionName extension name
     * @param  {String}   tableName     table name
     * @param  {String}   columnName    column name
     * @return {Extension[]}
     */
    BaseExtension.prototype.getExtension = function (extensionName, tableName, columnName) {
        if (!this.extensionsDao.isTableExists()) {
            return [];
        }
        return this.extensionsDao.queryByExtensionAndTableNameAndColumnName(extensionName, tableName, columnName);
    };
    /**
     * Determine if the GeoPackage has the extension
     * @param  {String}   extensionName extension name
     * @param  {String}   tableName     table name
     * @param  {String}   columnName    column name
     * @returns {Boolean} if the extension exists
     */
    BaseExtension.prototype.hasExtension = function (extensionName, tableName, columnName) {
        return !!this.getExtension(extensionName, tableName, columnName).length;
    };
    BaseExtension.prototype.hasExtensions = function (extensionName) {
        return this.extensionsDao.queryAllByExtension(extensionName).length !== 0;
    };
    /**
     * Create the extension
     * @param {string} extensionName
     * @param {string} tableName
     * @param {string} columnName
     * @param {string} definition
     * @param {string} scopeType
     */
    BaseExtension.prototype.createExtension = function (extensionName, tableName, columnName, definition, scopeType) {
        var extension = new extension_1.Extension();
        extension.table_name = tableName;
        extension.column_name = columnName;
        extension.extension_name = extensionName;
        extension.definition = definition;
        extension.scope = scopeType;
        return this.extensionsDao.create(extension);
    };
    return BaseExtension;
}());
exports.BaseExtension = BaseExtension;
//# sourceMappingURL=baseExtension.js.map