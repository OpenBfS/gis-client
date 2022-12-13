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
exports.MediaRow = void 0;
var userRow_1 = require("../../user/userRow");
var imageUtils_1 = require("../../tiles/imageUtils");
/**
 * MediaRow module.
 * @module extension/relatedTables
 */
/**
 * User Media Row containing the values from a single result set row
 * @class
 * @extends UserRow
 * @param  {module:extension/relatedTables~MediaTable} mediaTable  media table
 * @param  {module:db/geoPackageDataType[]} columnTypes  column types
 * @param  {module:dao/columnValues~ColumnValues[]} values      values
 */
var MediaRow = /** @class */ (function (_super) {
    __extends(MediaRow, _super);
    function MediaRow(mediaTable, columnTypes, values) {
        var _this = _super.call(this, mediaTable, columnTypes, values) || this;
        _this.mediaTable = mediaTable;
        return _this;
    }
    Object.defineProperty(MediaRow.prototype, "dataColumn", {
        /**
         * Get the data column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.mediaTable.dataColumn;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MediaRow.prototype, "data", {
        /**
         * Gets the data
         * @return {Buffer}
         */
        get: function () {
            return this.getValueWithColumnName(this.dataColumn.name);
        },
        /**
         * Sets the data for the row
         * @param  {Buffer} data data
         */
        set: function (data) {
            this.setValueWithColumnName(this.dataColumn.name, data);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MediaRow.prototype, "dataImage", {
        /**
         * Get the data image
         *
         * @return {Promise<Image>}
         */
        get: function () {
            return imageUtils_1.ImageUtils.getImage(this.data, this.contentType);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the scaled data image
     * @param {Number} scale
     * @return {Promise<Image>}
     */
    MediaRow.prototype.getScaledDataImage = function (scale) {
        return imageUtils_1.ImageUtils.getScaledImage(this.data, scale);
    };
    Object.defineProperty(MediaRow.prototype, "contentTypeColumn", {
        /**
         * Get the content type column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.mediaTable.contentTypeColumn;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MediaRow.prototype, "contentType", {
        /**
         * Gets the content type
         * @return {string}
         */
        get: function () {
            return this.getValueWithColumnName(this.contentTypeColumn.name);
        },
        /**
         * Sets the content type for the row
         * @param  {string} contentType contentType
         */
        set: function (contentType) {
            this.setValueWithColumnName(this.contentTypeColumn.name, contentType);
        },
        enumerable: false,
        configurable: true
    });
    return MediaRow;
}(userRow_1.UserRow));
exports.MediaRow = MediaRow;
//# sourceMappingURL=mediaRow.js.map