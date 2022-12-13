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
exports.AttributesTable = void 0;
/**
 * @module attributes/attributesTable
 */
var userTable_1 = require("../user/userTable");
var attributesColumns_1 = require("./attributesColumns");
var contentsDataType_1 = require("../core/contents/contentsDataType");
/**
 * Represents a user attribute table
 * @class AttributesTable
 * @extends UserTable
 * @constructor
 * @param  {string} tableName table name
 * @param  {module:user/userColumn~UserColumn[]} columns   attribute columns
 */
var AttributesTable = /** @class */ (function (_super) {
    __extends(AttributesTable, _super);
    function AttributesTable(tableName, columns) {
        return _super.call(this, new attributesColumns_1.AttributesColumns(tableName, columns, false)) || this;
    }
    /**
     * Set the contents
     * @param  {module:core/contents~Contents} contents the contents
     */
    AttributesTable.prototype.setContents = function (contents) {
        this.contents = contents;
        if (contents.data_type !== contentsDataType_1.ContentsDataType.ATTRIBUTES) {
            throw new Error("The Contents of an Attributes Table must have a data type of ".concat(contentsDataType_1.ContentsDataType.ATTRIBUTES));
        }
        return true;
    };
    return AttributesTable;
}(userTable_1.UserTable));
exports.AttributesTable = AttributesTable;
//# sourceMappingURL=attributesTable.js.map