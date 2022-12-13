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
exports.UserMappingTable = void 0;
/**
 * userMappingTable module.
 * @module extension/relatedTables
 */
var userColumn_1 = require("../../user/userColumn");
var geoPackageDataType_1 = require("../../db/geoPackageDataType");
var userCustomTable_1 = require("../../user/custom/userCustomTable");
/**
 * Contains user mapping table factory and utility methods
 * @class
 * @param  {string} tableName table name
 * @param  {module:user/userColumn~UserColumn[]} columns   user mapping columns
 */
var UserMappingTable = /** @class */ (function (_super) {
    __extends(UserMappingTable, _super);
    function UserMappingTable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(UserMappingTable.prototype, "tableType", {
        get: function () {
            return 'userMappingTable';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UserMappingTable.prototype, "baseIdColumn", {
        /**
         * Get the base id column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.getColumnWithColumnName(UserMappingTable.COLUMN_BASE_ID);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UserMappingTable.prototype, "relatedIdColumn", {
        /**
         * Get the related id column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.getColumnWithColumnName(UserMappingTable.COLUMN_RELATED_ID);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Creates a user mapping table with the minimum required columns followed by the additional columns
     * @param  {string} tableName name of the table
     * @param  {module:user/userColumn~UserColumn[]} [columns] additional columns
     * @return {module:extension/relatedTables~UserMappingTable}
     */
    UserMappingTable.create = function (tableName, columns) {
        var allColumns = UserMappingTable.createRequiredColumns(0);
        if (columns) {
            allColumns = allColumns.concat(columns);
        }
        return new UserMappingTable(tableName, allColumns, UserMappingTable.requiredColumns());
    };
    /**
     * Get the number of required columns
     * @return {Number}
     */
    UserMappingTable.numRequiredColumns = function () {
        return UserMappingTable.createRequiredColumns(0).length;
    };
    /**
     * Create the required columns
     * @param  {Number} [startingIndex=0] starting index of the required columns
     * @return {module:user/userColumn~UserColumn[]}
     */
    UserMappingTable.createRequiredColumns = function (startingIndex) {
        if (startingIndex === void 0) { startingIndex = 0; }
        return [
            UserMappingTable.createBaseIdColumn(startingIndex++),
            UserMappingTable.createRelatedIdColumn(startingIndex),
        ];
    };
    /**
     * Create the base id column
     * @param  {Number} index        index of the column
     * @return {module:user/userColumn~UserColumn}
     */
    UserMappingTable.createBaseIdColumn = function (index) {
        return userColumn_1.UserColumn.createColumn(index, UserMappingTable.COLUMN_BASE_ID, geoPackageDataType_1.GeoPackageDataType.INTEGER, true);
    };
    /**
     * Create the related id column
     * @param  {Number} index        index of the column
     * @return {module:user/userColumn~UserColumn}
     */
    UserMappingTable.createRelatedIdColumn = function (index) {
        return userColumn_1.UserColumn.createColumn(index, UserMappingTable.COLUMN_RELATED_ID, geoPackageDataType_1.GeoPackageDataType.INTEGER, true);
    };
    /**
     * Get the required columns
     * @return {string[]}
     */
    UserMappingTable.requiredColumns = function () {
        return [UserMappingTable.COLUMN_BASE_ID, UserMappingTable.COLUMN_RELATED_ID];
    };
    UserMappingTable.COLUMN_BASE_ID = 'base_id';
    UserMappingTable.COLUMN_RELATED_ID = 'related_id';
    return UserMappingTable;
}(userCustomTable_1.UserCustomTable));
exports.UserMappingTable = UserMappingTable;
//# sourceMappingURL=userMappingTable.js.map