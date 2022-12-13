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
exports.TileScalingExtension = void 0;
/**
 * @module extension/scale
 */
var baseExtension_1 = require("../baseExtension");
var extension_1 = require("../extension");
var tileScalingDao_1 = require("./tileScalingDao");
/**
 * Tile Scaling extension
 */
var TileScalingExtension = /** @class */ (function (_super) {
    __extends(TileScalingExtension, _super);
    function TileScalingExtension(geoPackage, tableName) {
        var _this = _super.call(this, geoPackage) || this;
        _this.tableName = tableName;
        _this.tileScalingDao = geoPackage.tileScalingDao;
        return _this;
    }
    /**
     * Get or create the tileScaling id extension
     * @return {Extension}
     */
    TileScalingExtension.prototype.getOrCreateExtension = function () {
        var extension = this.getOrCreate(TileScalingExtension.EXTENSION_NAME, this.tableName, null, TileScalingExtension.EXTENSION_DEFINITION, extension_1.Extension.READ_WRITE);
        this.tileScalingDao.createTable();
        return extension;
    };
    /**
     * Creates or updates a tile scaling row for this table extension.
     * @param tileScaling
     */
    TileScalingExtension.prototype.createOrUpdate = function (tileScaling) {
        tileScaling.table_name = this.tableName;
        return this.tileScalingDao.createOrUpdate(tileScaling);
    };
    Object.defineProperty(TileScalingExtension.prototype, "dao", {
        /**
         * Get the TileScalingDao
         * @returns {module:extension/scale.TileScalingDao}
         */
        get: function () {
            return this.tileScalingDao;
        },
        enumerable: false,
        configurable: true
    });
    TileScalingExtension.prototype.has = function () {
        return this.hasExtension(TileScalingExtension.EXTENSION_NAME, this.tableName, null) && this.tileScalingDao.isTableExists();
    };
    /**
     * Remove tileScaling id extension
     */
    TileScalingExtension.prototype.removeExtension = function () {
        if (this.tileScalingDao.isTableExists()) {
            this.geoPackage.deleteTable(tileScalingDao_1.TileScalingDao.TABLE_NAME);
        }
        if (this.extensionsDao.isTableExists()) {
            this.extensionsDao.deleteByExtension(TileScalingExtension.EXTENSION_NAME);
        }
    };
    TileScalingExtension.EXTENSION_NAME = 'nga_tile_scaling';
    TileScalingExtension.EXTENSION_AUTHOR = 'nga';
    TileScalingExtension.EXTENSION_NAME_NO_AUTHOR = 'tile_scaling';
    TileScalingExtension.EXTENSION_DEFINITION = 'http://ngageoint.github.io/GeoPackage/docs/extensions/tile-scaling.html';
    return TileScalingExtension;
}(baseExtension_1.BaseExtension));
exports.TileScalingExtension = TileScalingExtension;
//# sourceMappingURL=index.js.map