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
exports.UserCustomColumns = void 0;
var userColumns_1 = require("../userColumns");
/**
 * UserCustomColumns
 */
var UserCustomColumns = /** @class */ (function (_super) {
    __extends(UserCustomColumns, _super);
    function UserCustomColumns(tableName, columns, requiredColumns, custom) {
        var _this = _super.call(this, tableName, columns, custom) || this;
        _this.requiredColumns = requiredColumns === null || requiredColumns === undefined ? [] : requiredColumns.slice();
        _this.updateColumns();
        return _this;
    }
    UserCustomColumns.prototype.copy = function () {
        return new UserCustomColumns(this.getTableName(), this.getColumns(), this.getRequiredColumns(), this.isCustom());
    };
    /**
     * Get the required columns
     * @return required columns
     */
    UserCustomColumns.prototype.getRequiredColumns = function () {
        return this.requiredColumns;
    };
    /**
     * Set the required columns
     * @param requiredColumns required columns
     */
    UserCustomColumns.prototype.setRequiredColumns = function (requiredColumns) {
        if (requiredColumns === void 0) { requiredColumns = []; }
        this.requiredColumns = requiredColumns.slice();
    };
    /**
     * {@inheritDoc}
     */
    UserCustomColumns.prototype.updateColumns = function () {
        var _this = this;
        _super.prototype.updateColumns.call(this);
        if (!this.isCustom() && this.requiredColumns !== null && this.requiredColumns.length !== 0) {
            var search_1 = new Set(this.requiredColumns);
            var found_1 = {};
            // Find the required columns
            this.getColumns().forEach(function (column) {
                var columnName = column.getName();
                var columnIndex = column.getIndex();
                if (search_1.has(columnName)) {
                    var previousIndex = found_1[columnName];
                    _this.duplicateCheck(columnIndex, previousIndex, columnName);
                    found_1[columnName] = columnIndex;
                }
            });
            // Verify the required columns were found
            search_1.forEach(function (requiredColumn) {
                _this.missingCheck(found_1[requiredColumn], requiredColumn);
            });
        }
    };
    return UserCustomColumns;
}(userColumns_1.UserColumns));
exports.UserCustomColumns = UserCustomColumns;
//# sourceMappingURL=userCustomColumns.js.map