"use strict";
/**
 * @module attributes
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
exports.AttributesColumns = void 0;
var userColumns_1 = require("../user/userColumns");
/**
 * UserCustomColumns
 */
var AttributesColumns = /** @class */ (function (_super) {
    __extends(AttributesColumns, _super);
    function AttributesColumns(tableName, columns, custom) {
        var _this = _super.call(this, tableName, columns, custom) || this;
        _this.updateColumns();
        return _this;
    }
    AttributesColumns.prototype.copy = function () {
        return new AttributesColumns(this.getTableName(), this.getColumns(), this.isCustom());
    };
    return AttributesColumns;
}(userColumns_1.UserColumns));
exports.AttributesColumns = AttributesColumns;
//# sourceMappingURL=attributesColumns.js.map