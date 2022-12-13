"use strict";
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionDao = void 0;
var extension_1 = require("./extension");
var dao_1 = require("../dao/dao");
var columnValues_1 = require("../dao/columnValues");
var tableCreator_1 = require("../db/tableCreator");
/**
 * Extension Data Access Object
 * @class
 * @extends Dao
 */
var ExtensionDao = /** @class */ (function (_super) {
    __extends(ExtensionDao, _super);
    function ExtensionDao() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gpkgTableName = ExtensionDao.TABLE_NAME;
        _this.idColumns = [
            ExtensionDao.COLUMN_TABLE_NAME,
            ExtensionDao.COLUMN_COLUMN_NAME,
            ExtensionDao.COLUMN_EXTENSION_NAME,
        ];
        return _this;
    }
    /**
     * Creates an Extension object from the raw database row
     * @param {object} row raw database row
     * @returns {Extension}
     */
    ExtensionDao.prototype.createObject = function (row) {
        var e = new extension_1.Extension();
        e.table_name = row['table_name'];
        e.column_name = row['column_name'];
        e.extension_name = row['extension_name'];
        e.definition = row['definition'];
        e.scope = row['scope'];
        return e;
    };
    /**
     * Query by extension name and return the first result
     * @param {String} extensionName extension name
     * @returns {Extension}
     */
    ExtensionDao.prototype.queryByExtension = function (extensionName) {
        var results = this.queryForAllEq(ExtensionDao.COLUMN_EXTENSION_NAME, extensionName);
        if (!results[0])
            return;
        var e = this.createObject(results[0]);
        return e;
    };
    /**
     * Query by extension name and return all results
     * @param {String} extensionName extension name
     * @returns {Extension[]}
     */
    ExtensionDao.prototype.queryAllByExtension = function (extensionName) {
        var e_1, _a;
        var extensions = [];
        try {
            for (var _b = __values(this.queryForAllEq(ExtensionDao.COLUMN_EXTENSION_NAME, extensionName)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var row = _c.value;
                var e = this.createObject(row);
                extensions.push(e);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return extensions;
    };
    /**
     * Query by extension name and table name and return all results
     * @param {String} extensionName extension name
     * @param {String} tableName table name
     * @returns {Extension[]}
     */
    ExtensionDao.prototype.queryByExtensionAndTableName = function (extensionName, tableName) {
        var e_2, _a;
        var values = new columnValues_1.ColumnValues();
        values.addColumn(ExtensionDao.COLUMN_EXTENSION_NAME, extensionName);
        values.addColumn(ExtensionDao.COLUMN_TABLE_NAME, tableName);
        var extensions = [];
        try {
            for (var _b = __values(this.queryForFieldValues(values)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var row = _c.value;
                extensions.push(this.createObject(row));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return extensions;
    };
    /**
     * Query by extension name and table name and return all results
     * @param {String} extensionName extension name
     * @param {String} tableName table name
     * @param {String} columnName column name
     * @returns {Extension[]}
     */
    ExtensionDao.prototype.queryByExtensionAndTableNameAndColumnName = function (extensionName, tableName, columnName) {
        var e_3, _a;
        var values = new columnValues_1.ColumnValues();
        values.addColumn(ExtensionDao.COLUMN_EXTENSION_NAME, extensionName);
        if (tableName !== null && tableName !== undefined) {
            values.addColumn(ExtensionDao.COLUMN_TABLE_NAME, tableName);
        }
        if (columnName !== null && columnName !== undefined) {
            values.addColumn(ExtensionDao.COLUMN_COLUMN_NAME, columnName);
        }
        var extensions = [];
        try {
            for (var _b = __values(this.queryForFieldValues(values)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var row = _c.value;
                var e = this.createObject(row);
                extensions.push(e);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return extensions;
    };
    /**
     * Creates the extensions table
     */
    ExtensionDao.prototype.createTable = function () {
        var tc = new tableCreator_1.TableCreator(this.geoPackage);
        return tc.createExtensions();
    };
    /**
     * Deletes all extension entries with this name
     * @param {String} extensionName extension name to delete
     * @returns {Number} Number of extensions deleted
     */
    ExtensionDao.prototype.deleteByExtension = function (extensionName) {
        var values = new columnValues_1.ColumnValues();
        values.addColumn(ExtensionDao.COLUMN_EXTENSION_NAME, extensionName);
        return this.deleteWhere(this.buildWhere(values, '='), this.buildWhereArgs(values));
    };
    /**
     * Deletes all extension entries with this name and table name
     * @param {String} extensionName extension name to delete
     * @param {String} tableName table name to delete
     * @returns {Number} Number of extensions deleted
     */
    ExtensionDao.prototype.deleteByExtensionAndTableName = function (extensionName, tableName) {
        var values = new columnValues_1.ColumnValues();
        values.addColumn(ExtensionDao.COLUMN_EXTENSION_NAME, extensionName);
        values.addColumn(ExtensionDao.COLUMN_TABLE_NAME, tableName);
        return this.deleteWhere(this.buildWhere(values, 'and'), this.buildWhereArgs(values));
    };
    /**
     * Deletes all extension entries with this name and table name
     * @param {String} extensionName extension name to delete
     * @param {String} tableName table name to delete
     * @returns {Number} Number of extensions deleted
     */
    ExtensionDao.prototype.deleteByExtensionAndTableNameAndColumnName = function (extensionName, tableName, columnName) {
        var values = new columnValues_1.ColumnValues();
        values.addColumn(ExtensionDao.COLUMN_EXTENSION_NAME, extensionName);
        values.addColumn(ExtensionDao.COLUMN_TABLE_NAME, tableName);
        values.addColumn(ExtensionDao.COLUMN_COLUMN_NAME, columnName);
        return this.deleteWhere(this.buildWhere(values, 'and'), this.buildWhereArgs(values));
    };
    ExtensionDao.TABLE_NAME = 'gpkg_extensions';
    ExtensionDao.COLUMN_TABLE_NAME = 'table_name';
    ExtensionDao.COLUMN_COLUMN_NAME = 'column_name';
    ExtensionDao.COLUMN_EXTENSION_NAME = 'extension_name';
    ExtensionDao.COLUMN_DEFINITION = 'definition';
    ExtensionDao.COLUMN_SCOPE = 'scope';
    return ExtensionDao;
}(dao_1.Dao));
exports.ExtensionDao = ExtensionDao;
//# sourceMappingURL=extensionDao.js.map