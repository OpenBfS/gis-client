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
exports.TileTableReader = void 0;
/**
 * tileTableReader module.
 * @module tiles/user/tileTableReader
 */
var userTableReader_1 = require("../../user/userTableReader");
var tileTable_1 = require("./tileTable");
var tileColumn_1 = require("./tileColumn");
/**
 * Reads the metadata from an existing tile table
 * @class TileTableReader
 */
var TileTableReader = /** @class */ (function (_super) {
    __extends(TileTableReader, _super);
    function TileTableReader(tileMatrixSet) {
        var _this = _super.call(this, tileMatrixSet.table_name) || this;
        _this.tileMatrixSet = tileMatrixSet;
        return _this;
    }
    TileTableReader.prototype.readTileTable = function (geoPackage) {
        return this.readTable(geoPackage.database);
    };
    /**
     * @inheritDoc
     */
    TileTableReader.prototype.createTable = function (tableName, columns) {
        return new tileTable_1.TileTable(tableName, columns);
    };
    /**
     * @inheritDoc
     */
    TileTableReader.prototype.createColumn = function (tableColumn) {
        return new tileColumn_1.TileColumn(tableColumn.index, tableColumn.name, tableColumn.dataType, tableColumn.max, tableColumn.notNull, tableColumn.defaultValue, tableColumn.primaryKey, tableColumn.autoincrement);
    };
    return TileTableReader;
}(userTableReader_1.UserTableReader));
exports.TileTableReader = TileTableReader;
//# sourceMappingURL=tileTableReader.js.map