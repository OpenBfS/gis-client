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
exports.IconRow = void 0;
var mediaRow_1 = require("../relatedTables/mediaRow");
var imageUtils_1 = require("../../tiles/imageUtils");
/**
 * @memberOf module:extension/style
 * @class IconRow
 */
/**
 * Icon Row
 * @extends MediaRow
 * @param  {module:extension/style.IconTable} iconTable  icon table
 * @param  {module:db/geoPackageDataType[]} columnTypes  column types
 * @param  {module:dao/columnValues~ColumnValues[]} values      values
 * @constructor
 */
var IconRow = /** @class */ (function (_super) {
    __extends(IconRow, _super);
    function IconRow(iconTable, columnTypes, values) {
        var _this = _super.call(this, iconTable, columnTypes, values) || this;
        _this.tableIcon = false;
        _this.iconTable = iconTable;
        return _this;
    }
    Object.defineProperty(IconRow.prototype, "nameColumn", {
        /**
         * Get the name column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.iconTable.getNameColumn();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "name", {
        /**
         * Gets the name
         * @return {String}
         */
        get: function () {
            return this.getValueWithColumnName(this.nameColumn.name);
        },
        /**
         * Sets the name for the row
         * @param {String} name name
         */
        set: function (name) {
            this.setValueWithColumnName(this.nameColumn.name, name);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "descriptionColumn", {
        /**
         * Get the description column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.iconTable.getDescriptionColumn();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "description", {
        /**
         * Gets the description
         * @return {String}
         */
        get: function () {
            return this.getValueWithColumnName(this.descriptionColumn.name);
        },
        /**
         * Sets the description for the row
         * @param {string} description description
         */
        set: function (description) {
            this.setValueWithColumnName(this.descriptionColumn.name, description);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "widthColumn", {
        /**
         * Get the width column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.iconTable.getWidthColumn();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "width", {
        /**
         * Gets the width
         * @return {Number}
         */
        get: function () {
            return this.getValueWithColumnName(this.widthColumn.name);
        },
        /**
         * Sets the width for the row
         * @param {Number} width width
         */
        set: function (width) {
            this.setValueWithColumnName(this.widthColumn.name, width);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "derivedWidth", {
        /**
         * Get the width or derived width from the icon data and scaled as needed
         * for the height
         *
         * @return {Number}  derived width
         */
        get: function () {
            var width = this.width;
            if (width === undefined || width === null) {
                width = this.derivedDimensions[0];
            }
            return width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "heightColumn", {
        /**
         * Get the height column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.iconTable.getHeightColumn();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "height", {
        /**
         * Gets the height
         * @return {Number}
         */
        get: function () {
            return this.getValueWithColumnName(this.heightColumn.name);
        },
        /**
         * Sets the height for the row
         * @param {Number} height height
         */
        set: function (height) {
            this.setValueWithColumnName(this.heightColumn.name, height);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "derivedHeight", {
        /**
         * Get the height or derived height from the icon data and scaled as needed
         * for the width
         *
         * @return {Number} derived height
         */
        get: function () {
            var height = this.height;
            if (height === undefined || height === null) {
                height = this.derivedDimensions[1];
            }
            return height;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "derivedDimensions", {
        /**
         * Get the derived width and height from the values and icon data, scaled as needed
         * @return {Number[]} derived dimensions array with two values, width at index 0, height at index 1
         */
        get: function () {
            var width = this.width;
            var height = this.height;
            if (width === undefined || width === null || height === undefined || height === null) {
                var imageSize = imageUtils_1.ImageUtils.getImageSize(this.data);
                var dataWidth = imageSize.width;
                var dataHeight = imageSize.height;
                if (width === undefined || width === null) {
                    width = dataWidth;
                    if (height !== undefined && height !== null) {
                        width *= height / dataHeight;
                    }
                }
                if (height === undefined || height === null) {
                    height = dataHeight;
                    if (width !== undefined && width !== null) {
                        height *= width / dataWidth;
                    }
                }
            }
            return [width, height];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "anchorUColumn", {
        /**
         * Get the anchor_u column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.iconTable.getAnchorUColumn();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "anchorU", {
        /**
         * Gets the anchor_u
         * @return {Number}
         */
        get: function () {
            return this.getValueWithColumnName(this.anchorUColumn.name);
        },
        /**
         * Sets the anchor_u for the row
         * @param {Number} anchor_u anchor_u
         */
        set: function (anchorU) {
            this.validateAnchor(anchorU);
            this.setValueWithColumnName(this.anchorUColumn.name, anchorU);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "anchorUOrDefault", {
        /**
         * Get the anchor u value or the default value of 0.5
         * @return {Number} anchor u value
         */
        get: function () {
            var anchorU = this.anchorU;
            if (anchorU == null) {
                anchorU = 0.5;
            }
            return anchorU;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "anchorVColumn", {
        /**
         * Get the anchor_v column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.iconTable.getAnchorVColumn();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "anchorV", {
        /**
         * Gets the anchor_v
         * @return {Number}
         */
        get: function () {
            return this.getValueWithColumnName(this.anchorVColumn.name);
        },
        /**
         * Sets the anchor_v for the row
         * @param {Number} anchor_v anchor_v
         */
        set: function (anchorV) {
            this.validateAnchor(anchorV);
            this.setValueWithColumnName(this.anchorVColumn.name, anchorV);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IconRow.prototype, "anchorVOrDefault", {
        /**
         * Get the anchor v value or the default value of 1.0
         * @return {Number} anchor v value
         */
        get: function () {
            var anchorV = this.anchorV;
            if (anchorV == null) {
                anchorV = 1.0;
            }
            return anchorV;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Validate the anchor value
     * @param {Number} anchor anchor
     */
    IconRow.prototype.validateAnchor = function (anchor) {
        if (anchor != null && (anchor < 0.0 || anchor > 1.0)) {
            throw new Error('Anchor must be set inclusively between 0.0 and 1.0, invalid value: ' + anchor);
        }
        return true;
    };
    /**
     * Is a table icon
     * @return table icon flag
     */
    IconRow.prototype.isTableIcon = function () {
        return this.tableIcon;
    };
    /**
     * Set table icon flag
     * @param tableIcon table icon flag
     */
    IconRow.prototype.setTableIcon = function (tableIcon) {
        this.tableIcon = tableIcon;
    };
    return IconRow;
}(mediaRow_1.MediaRow));
exports.IconRow = IconRow;
//# sourceMappingURL=iconRow.js.map