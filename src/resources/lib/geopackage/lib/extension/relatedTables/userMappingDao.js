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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMappingDao = void 0;
/**
 * @module extension/relatedTables
 */
var userCustomDao_1 = require("../../user/custom/userCustomDao");
var userMappingTable_1 = require("./userMappingTable");
var userMappingRow_1 = require("./userMappingRow");
var columnValues_1 = require("../../dao/columnValues");
/**
 * User Mapping DAO for reading user mapping data tables
 * @class
 * @param  {string} table table name
 * @param  {module:geoPackage~GeoPackage} geoPackage      geopackage object
 * @param {UserMappingTable} [userMappingTable]
 */
var UserMappingDao = /** @class */ (function (_super) {
    __extends(UserMappingDao, _super);
    function UserMappingDao(userCustomDao, geoPackage, userMappingTable) {
        return _super.call(this, geoPackage, userMappingTable || UserMappingDao.createMappingTable(userCustomDao)) || this;
    }
    /**
     * Create a new {module:user/custom~UserCustomTable}
     * @param  {module:user/custom~UserCustomDao} userCustomDao
     * @return {module:user/custom~UserCustomTable} userCustomTable user custom table
     */
    UserMappingDao.createMappingTable = function (userCustomDao) {
        return new userMappingTable_1.UserMappingTable(userCustomDao.table.getTableName(), userCustomDao.table.getUserColumns().getColumns(), userMappingTable_1.UserMappingTable.requiredColumns());
    };
    Object.defineProperty(UserMappingDao.prototype, "table", {
        /**
         * Gets the {module:extension/relatedTables~UserMappingTable}
         * @return {module:extension/relatedTables~UserMappingTable}
         */
        get: function () {
            return this._table;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Create a user mapping row
     * @param  {module:db/geoPackageDataType[]} columnTypes  column types
     * @param  {module:dao/columnValues~ColumnValues[]} values      values
     * @return {module:extension/relatedTables~UserMappingRow}             user mapping row
     */
    UserMappingDao.prototype.newRow = function (columnTypes, values) {
        return new userMappingRow_1.UserMappingRow(this.table, columnTypes, values);
    };
    /**
     * Gets the user mapping row from the result
     * @param  {Object} result db result
     * @return {module:extension/relatedTables~UserMappingRow}             user mapping row
     */
    UserMappingDao.prototype.getUserMappingRow = function (result) {
        return this.getRow(result);
    };
    /**
     * Query by base id
     * @param  {(UserMappingRow | Number)} baseId base id
     * @return {Object[]}
     */
    UserMappingDao.prototype.queryByBaseId = function (baseId) {
        return this.queryForAllEq(userMappingTable_1.UserMappingTable.COLUMN_BASE_ID, baseId instanceof userMappingRow_1.UserMappingRow ? baseId.baseId : baseId);
    };
    /**
     * Query by related id
     * @param  {(Number & UserMappingRow)} relatedId related id
     * @return {Object[]}
     */
    UserMappingDao.prototype.queryByRelatedId = function (relatedId) {
        return this.queryForAllEq(userMappingTable_1.UserMappingTable.COLUMN_RELATED_ID, relatedId instanceof userMappingRow_1.UserMappingRow ? relatedId.relatedId : relatedId);
    };
    /**
     * Query by base id and related id
     * @param  {(UserMappingRow | Number)} baseId base id
     * @param  {(UserMappingRow | Number)} [relatedId] related id
     * @return {Iterable<any>}
     */
    UserMappingDao.prototype.queryByIds = function (baseId, relatedId) {
        var values = new columnValues_1.ColumnValues();
        values.addColumn(userMappingTable_1.UserMappingTable.COLUMN_BASE_ID, baseId instanceof userMappingRow_1.UserMappingRow ? baseId.baseId : baseId);
        if (relatedId !== undefined) {
            values.addColumn(userMappingTable_1.UserMappingTable.COLUMN_RELATED_ID, relatedId instanceof userMappingRow_1.UserMappingRow ? relatedId.relatedId : relatedId);
        }
        return this.queryForFieldValues(values);
    };
    /**
     * The unique related ids
     * @return {Number[]}
     */
    UserMappingDao.prototype.uniqueRelatedIds = function () {
        var query = 'SELECT DISTINCT ';
        query += userMappingTable_1.UserMappingTable.COLUMN_RELATED_ID;
        query += ' FROM ';
        query += '\'' + this.gpkgTableName + '\'';
        return this.connection.all(query);
    };
    /**
     * Count user mapping rows by base id and related id
     * @param  {(UserMappingRow | Number)} baseId    base id
     * @param  {(UserMappingRow | Number)} [relatedId] related id
     * @return {Number}
     */
    UserMappingDao.prototype.countByIds = function (baseId, relatedId) {
        var values = new columnValues_1.ColumnValues();
        values.addColumn(userMappingTable_1.UserMappingTable.COLUMN_BASE_ID, baseId instanceof userMappingRow_1.UserMappingRow ? baseId.baseId : baseId);
        if (relatedId !== undefined) {
            values.addColumn(userMappingTable_1.UserMappingTable.COLUMN_RELATED_ID, relatedId instanceof userMappingRow_1.UserMappingRow ? relatedId.relatedId : relatedId);
        }
        return this.count(values);
    };
    /**
     * Delete by base id
     * @param  {(UserMappingRow | Number)} baseId base id
     * @return {Number} number of deleted rows
     */
    UserMappingDao.prototype.deleteByBaseId = function (baseId) {
        var where = '';
        where += this.buildWhereWithFieldAndValue(userMappingTable_1.UserMappingTable.COLUMN_BASE_ID, baseId instanceof userMappingRow_1.UserMappingRow ? baseId.baseId : baseId);
        var whereArgs = this.buildWhereArgs([baseId instanceof userMappingRow_1.UserMappingRow ? baseId.baseId : baseId]);
        return this.deleteWhere(where, whereArgs);
    };
    /**
     * Delete by related id
     * @param  {(UserMappingRow | Number)} relatedId related id
     * @return {Number} number of deleted rows
     */
    UserMappingDao.prototype.deleteByRelatedId = function (relatedId) {
        var where = '';
        where += this.buildWhereWithFieldAndValue(userMappingTable_1.UserMappingTable.COLUMN_RELATED_ID, relatedId instanceof userMappingRow_1.UserMappingRow ? relatedId.relatedId : relatedId);
        var whereArgs = this.buildWhereArgs([relatedId instanceof userMappingRow_1.UserMappingRow ? relatedId.relatedId : relatedId]);
        return this.deleteWhere(where, whereArgs);
    };
    /**
     * Delete by base id and related id
     * @param  {(UserMappingRow | Number)} baseId    base id
     * @param  {(UserMappingRow | Number)} [relatedId] related id
     * @return {Number} number of deleted rows
     */
    UserMappingDao.prototype.deleteByIds = function (baseId, relatedId) {
        var where = '';
        var whereParams = [baseId instanceof userMappingRow_1.UserMappingRow ? baseId.baseId : baseId];
        where += this.buildWhereWithFieldAndValue(userMappingTable_1.UserMappingTable.COLUMN_BASE_ID, baseId instanceof userMappingRow_1.UserMappingRow ? baseId.baseId : baseId);
        if (relatedId !== undefined) {
            where += ' and ';
            where += this.buildWhereWithFieldAndValue(userMappingTable_1.UserMappingTable.COLUMN_RELATED_ID, relatedId instanceof userMappingRow_1.UserMappingRow ? relatedId.relatedId : relatedId);
            whereParams.push(relatedId instanceof userMappingRow_1.UserMappingRow ? relatedId.relatedId : relatedId);
        }
        var whereArgs = this.buildWhereArgs(whereParams);
        return this.deleteWhere(where, whereArgs);
    };
    return UserMappingDao;
}(userCustomDao_1.UserCustomDao));
exports.UserMappingDao = UserMappingDao;
//# sourceMappingURL=userMappingDao.js.map