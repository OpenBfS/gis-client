"use strict";
/**
 * SimpleAttributesRow module.
 * @module extension/relatedTables
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
exports.SimpleAttributesRow = void 0;
var userRow_1 = require("../../user/userRow");
/**
 * User Simple Attributes Row containing the values from a single result set row
 * @class
 * @extends UserRow
 * @param  {module:extension/relatedTables~SimpleAttributesTable} simpleAttributesTable simple attributes table
 * @param  {module:db/geoPackageDataType[]} columnTypes  column types
 * @param  {module:dao/columnValues~ColumnValues[]} values      values
 */
var SimpleAttributesRow = /** @class */ (function (_super) {
    __extends(SimpleAttributesRow, _super);
    function SimpleAttributesRow(simpleAttributesTable, columnTypes, values) {
        var _this = _super.call(this, simpleAttributesTable, columnTypes, values) || this;
        _this.simpleAttributesTable = simpleAttributesTable;
        return _this;
    }
    return SimpleAttributesRow;
}(userRow_1.UserRow));
exports.SimpleAttributesRow = SimpleAttributesRow;
//# sourceMappingURL=simpleAttributesRow.js.map