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
exports.UserMappingRow = void 0;
var userRow_1 = require("../../user/userRow");
/**
 * UserMappingRow module.
 * @module extension/relatedTables
 */
/**
 * User Mapping Row containing the values from a single result set row
 * @class
 * @extends UserRow
 * @param  {module:extension/relatedTables~UserMappingTable} table user mapping table
 * @param  {module:db/geoPackageDataType[]} columnTypes  column types
 * @param  {module:dao/columnValues~ColumnValues[]} values      values
 */
var UserMappingRow = /** @class */ (function (_super) {
    __extends(UserMappingRow, _super);
    function UserMappingRow(table, columnTypes, values) {
        var _this = _super.call(this, table, columnTypes, values) || this;
        _this.table = table;
        return _this;
    }
    Object.defineProperty(UserMappingRow.prototype, "baseIdColumn", {
        /**
         * Get the base id column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.table.baseIdColumn;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UserMappingRow.prototype, "baseId", {
        /**
         * Gets the base id
         * @return {Number}
         */
        get: function () {
            return this.getValueWithColumnName(this.baseIdColumn.name);
        },
        /**
         * Sets the base id
         * @param  {Number} baseId base id
         */
        set: function (baseId) {
            this.setValueWithColumnName(this.baseIdColumn.name, baseId);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UserMappingRow.prototype, "relatedIdColumn", {
        /**
         * Get the related id column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.table.relatedIdColumn;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UserMappingRow.prototype, "relatedId", {
        /**
         * Gets the related id
         * @return {Number}
         */
        get: function () {
            return this.getValueWithColumnName(this.relatedIdColumn.name);
        },
        /**
         * Sets the related id
         * @param  {Number} relatedId related id
         */
        set: function (relatedId) {
            this.setValueWithColumnName(this.relatedIdColumn.name, relatedId);
        },
        enumerable: false,
        configurable: true
    });
    return UserMappingRow;
}(userRow_1.UserRow));
exports.UserMappingRow = UserMappingRow;
//# sourceMappingURL=userMappingRow.js.map