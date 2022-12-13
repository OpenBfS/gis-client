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
exports.UserCustomTable = void 0;
/**
 * @module user/custom
 */
var userTable_1 = require("../userTable");
var userCustomColumns_1 = require("./userCustomColumns");
/**
 * Create a new user custom table
 * @class
 * @param  {string} tableName       table name
 * @param  {module:user/userColumn~UserColumn[]} columns         user columns
 * @param  {string[]} requiredColumns required columns
 */
var UserCustomTable = /** @class */ (function (_super) {
    __extends(UserCustomTable, _super);
    function UserCustomTable(tableName, columns, requiredColumns) {
        if (requiredColumns === void 0) { requiredColumns = []; }
        return _super.call(this, new userCustomColumns_1.UserCustomColumns(tableName, columns, requiredColumns, true)) || this;
    }
    /**
     * {@inheritDoc}
     */
    UserCustomTable.prototype.copy = function () {
        return new UserCustomTable(this.getTableName(), this.getUserColumns().getColumns(), this.getUserColumns().getRequiredColumns());
    };
    /**
     * {@inheritDoc}
     */
    UserCustomTable.prototype.getDataType = function () {
        return null;
    };
    /**
     * {@inheritDoc}
     */
    UserCustomTable.prototype.getUserColumns = function () {
        return _super.prototype.getUserColumns.call(this);
    };
    /**
     * Get the required columns
     *
     * @return required columns
     */
    UserCustomTable.prototype.getRequiredColumns = function () {
        return this.getUserColumns().getRequiredColumns();
    };
    return UserCustomTable;
}(userTable_1.UserTable));
exports.UserCustomTable = UserCustomTable;
//# sourceMappingURL=userCustomTable.js.map