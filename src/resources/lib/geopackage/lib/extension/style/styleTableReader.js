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
exports.StyleTableReader = void 0;
/**
 * @memberOf module:extension/style
 * @class StyleTableReader
 */
var attributesTableReader_1 = require("../../attributes/attributesTableReader");
var styleTable_1 = require("./styleTable");
/**
 * Reads the metadata from an existing attribute table
 * @extends {AttributesTableReader}
 * @constructor
 */
var StyleTableReader = /** @class */ (function (_super) {
    __extends(StyleTableReader, _super);
    function StyleTableReader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     *
     * @param {String} tableName
     * @param columns
     * @returns {module:extension/style.StyleTable}
     */
    StyleTableReader.prototype.createTable = function (tableName, columns) {
        return new styleTable_1.StyleTable(tableName, columns);
    };
    return StyleTableReader;
}(attributesTableReader_1.AttributesTableReader));
exports.StyleTableReader = StyleTableReader;
//# sourceMappingURL=styleTableReader.js.map