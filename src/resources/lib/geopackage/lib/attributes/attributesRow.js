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
exports.AttributesRow = void 0;
var userRow_1 = require("../user/userRow");
/**
 * Attribute Row containing the values from a single result set row
 * @class AttributesRow
 * @param  {module:attributes/attributesTable~AttributeTable} attributeTable attribute table
 * @param  {module:db/geoPackageDataType[]} columnTypes  column types
 * @param  {module:dao/columnValues~ColumnValues[]} values      values
 */
var AttributesRow = /** @class */ (function (_super) {
    __extends(AttributesRow, _super);
    function AttributesRow(attributeTable, columnTypes, values) {
        return _super.call(this, attributeTable, columnTypes, values) || this;
    }
    return AttributesRow;
}(userRow_1.UserRow));
exports.AttributesRow = AttributesRow;
//# sourceMappingURL=attributesRow.js.map