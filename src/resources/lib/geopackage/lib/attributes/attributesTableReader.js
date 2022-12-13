"use strict";
/**
 * attributeTableReader module.
 * @module attributes/attributesTableReader
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
exports.AttributesTableReader = void 0;
var userTableReader_1 = require("../user/userTableReader");
var attributesTable_1 = require("./attributesTable");
var attributesColumn_1 = require("./attributesColumn");
/**
 * Reads the metadata from an existing attribute table
 * @class AttributesTableReader
 * @extends UserTableReader
 * @classdesc Reads the metadata from an existing attributes table
 */
var AttributesTableReader = /** @class */ (function (_super) {
    __extends(AttributesTableReader, _super);
    function AttributesTableReader(table_name) {
        return _super.call(this, table_name) || this;
    }
    /**
     * Read the attribute table
     * @param geoPackage
     */
    AttributesTableReader.prototype.readAttributeTable = function (geoPackage) {
        return this.readTable(geoPackage.database);
    };
    /**
     * @inheritDoc
     */
    AttributesTableReader.prototype.createTable = function (tableName, columns) {
        return new attributesTable_1.AttributesTable(tableName, columns);
    };
    /**
     * @inheritDoc
     */
    AttributesTableReader.prototype.createColumn = function (tableColumn) {
        return new attributesColumn_1.AttributesColumn(tableColumn.index, tableColumn.name, tableColumn.dataType, tableColumn.max, tableColumn.notNull, tableColumn.defaultValue, tableColumn.primaryKey, tableColumn.autoincrement);
    };
    return AttributesTableReader;
}(userTableReader_1.UserTableReader));
exports.AttributesTableReader = AttributesTableReader;
//# sourceMappingURL=attributesTableReader.js.map