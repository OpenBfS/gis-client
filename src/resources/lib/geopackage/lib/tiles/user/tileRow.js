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
exports.TileRow = void 0;
var userRow_1 = require("../../user/userRow");
/**
 * tileRow module.
 * @module tiles/user/tileRow
 */
/**
 * Tile Row containing the values from a single result set row
 * @class
 * @extends UserRow
 * @param  {TileTable} tileTable tile table
 * @param  {Array} columnTypes  column types
 * @param  {Array} values       values
 */
var TileRow = /** @class */ (function (_super) {
    __extends(TileRow, _super);
    function TileRow(tileTable, columnTypes, values) {
        var _this = _super.call(this, tileTable, columnTypes, values) || this;
        _this.tileTable = tileTable;
        return _this;
    }
    Object.defineProperty(TileRow.prototype, "zoomLevelColumnIndex", {
        /**
         * Get the zoom level column index
         * @return {Number} zoom level column index
         */
        get: function () {
            return this.tileTable.getZoomLevelColumnIndex();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TileRow.prototype, "zoomLevelColumn", {
        /**
         * Get the zoom level column
         * @return {TileColumn} zoom level column
         */
        get: function () {
            return this.tileTable.getZoomLevelColumn();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TileRow.prototype, "zoomLevel", {
        /**
         * Get the zoom level
         * @return {Number} zoom level
         */
        get: function () {
            return this.getValueWithColumnName(this.zoomLevelColumn.name);
        },
        /**
         * Set the zoom level
         * @param {Number} zoomLevel zoom level
         */
        set: function (zoomLevel) {
            this.setValueWithIndex(this.zoomLevelColumnIndex, zoomLevel);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TileRow.prototype, "tileColumnColumnIndex", {
        /**
         * Get the tile column column Index
         * @return {number} tile column column index
         */
        get: function () {
            return this.tileTable.getTileColumnColumnIndex();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TileRow.prototype, "tileColumnColumn", {
        /**
         * Get the tile column column
         * @return {TileColumn} tile column column
         */
        get: function () {
            return this.tileTable.getTileColumnColumn();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TileRow.prototype, "tileColumn", {
        /**
         * Get the tile column
         * @return {Number} tile column
         */
        get: function () {
            return this.getValueWithColumnName(this.tileColumnColumn.name);
        },
        /**
         * Set the tile column
         * @param {number} tileColumn tile column
         */
        set: function (tileColumn) {
            this.setValueWithColumnName(this.tileColumnColumn.name, tileColumn);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TileRow.prototype, "rowColumnIndex", {
        /**
         * Get the tile row column index
         * @return {Number} tile row column index
         */
        get: function () {
            return this.tileTable.getTileRowColumnIndex();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TileRow.prototype, "rowColumn", {
        /**
         * Get the tile row column
         * @return {TileColumn} tile row column
         */
        get: function () {
            return this.tileTable.getTileRowColumn();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TileRow.prototype, "row", {
        /**
         * Get the tile row
         * @return {Number} tile row
         */
        get: function () {
            return this.getValueWithColumnName(this.rowColumn.name);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TileRow.prototype, "tileRow", {
        /**
         * Set the tile row
         * @param {Number} tileRow tile row
         */
        set: function (tileRow) {
            this.setValueWithColumnName(this.rowColumn.name, tileRow);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TileRow.prototype, "tileDataColumnIndex", {
        /**
         * Get the tile data column index
         * @return {Number} tile data column index
         */
        get: function () {
            return this.tileTable.getTileDataColumnIndex();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TileRow.prototype, "tileDataColumn", {
        /**
         * Get the tile data column
         * @return {TileColumn} tile data column
         */
        get: function () {
            return this.tileTable.getTileDataColumn();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TileRow.prototype, "tileData", {
        /**
         * Get the tile data
         * @return {Buffer} tile data
         */
        get: function () {
            return this.getValueWithColumnName(this.tileDataColumn.name);
        },
        /**
         * Set the tile data
         * @param {Buffer} tileData tile data
         */
        set: function (tileData) {
            this.setValueWithColumnName(this.tileDataColumn.name, tileData);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TileRow.prototype, "tileDataImage", {
        /**
         * Get the tile data as an image
         * @return {*} tile image
         */
        get: function () {
            return null;
        },
        enumerable: false,
        configurable: true
    });
    return TileRow;
}(userRow_1.UserRow));
exports.TileRow = TileRow;
//# sourceMappingURL=tileRow.js.map