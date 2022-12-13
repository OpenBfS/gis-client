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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShadedFeaturesTile = void 0;
var canvas_1 = require("../../../canvas/canvas");
var customFeaturesTile_1 = require("./customFeaturesTile");
/**
 * Draws a tile which is shaded to indicate too many features. By default a
 * tile border is drawn and the tile is filled with 6.25% transparent black. The
 * paint objects for each draw type can be modified to or set to null (except
 * for the text paint object).
 */
var ShadedFeaturesTile = /** @class */ (function (_super) {
    __extends(ShadedFeaturesTile, _super);
    function ShadedFeaturesTile() {
        return _super.call(this) || this;
    }
    /**
     * Get the tile border stroke width
     * @return {Number} tile border stroke width
     */
    ShadedFeaturesTile.prototype.getTileBorderStrokeWidth = function () {
        return this.tileBorderStrokeWidth;
    };
    /**
     * Set the tile border stroke width
     *
     * @param {Number} tileBorderStrokeWidth tile border stroke width
     */
    ShadedFeaturesTile.prototype.setTileBorderStrokeWidth = function (tileBorderStrokeWidth) {
        this.tileBorderStrokeWidth = tileBorderStrokeWidth;
    };
    /**
     * Get the tile border color
     * @return {String} tile border color
     */
    ShadedFeaturesTile.prototype.getTileBorderColor = function () {
        return this.tileBorderColor;
    };
    /**
     * Set the tile border color
     * @param {String} tileBorderColor tile border color
     */
    ShadedFeaturesTile.prototype.setTileBorderColor = function (tileBorderColor) {
        this.tileBorderColor = tileBorderColor;
    };
    /**
     * Get the tile fill color
     * @return {String} tile fill color
     */
    ShadedFeaturesTile.prototype.getTileFillColor = function () {
        return this.tileFillColor;
    };
    /**
     * Set the tile fill color
     * @param {String} tileFillColor tile fill color
     */
    ShadedFeaturesTile.prototype.setTileFillColor = function (tileFillColor) {
        this.tileFillColor = tileFillColor;
    };
    /**
     * Is the draw unindexed tiles option enabled
     * @return {Boolean} true if drawing unindexed tiles
     */
    ShadedFeaturesTile.prototype.isDrawUnindexedTiles = function () {
        return this.drawUnindexedTiles;
    };
    /**
     * Set the draw unindexed tiles option
     * @param {Boolean} drawUnindexedTiles draw unindexed tiles flag
     */
    ShadedFeaturesTile.prototype.setDrawUnindexedTiles = function (drawUnindexedTiles) {
        this.drawUnindexedTiles = drawUnindexedTiles;
    };
    /**
     * Get the compression format
     * @return {String} the compression format (either png or jpeg)
     */
    ShadedFeaturesTile.prototype.getCompressFormat = function () {
        return this.compressFormat;
    };
    /**
     * Set the compression format
     * @param {String} compressFormat either 'png' or 'jpeg'
     */
    ShadedFeaturesTile.prototype.setCompressFormat = function (compressFormat) {
        this.compressFormat = compressFormat;
    };
    /**
     * Draw unindexed tile
     * @param tileWidth
     * @param tileHeight
     * @param canvas
     * @returns {Promise<String|Buffer>}
     */
    ShadedFeaturesTile.prototype.drawUnindexedTile = function (tileWidth, tileHeight, canvas) {
        if (canvas === void 0) { canvas = null; }
        return __awaiter(this, void 0, void 0, function () {
            var image;
            return __generator(this, function (_a) {
                image = null;
                if (this.drawUnindexedTiles) {
                    // Draw a tile indicating we have no idea if there are features
                    // inside.
                    // The table is not indexed and more features exist than the max
                    // feature count set.
                    image = this.drawTile(tileWidth, tileHeight, '?', canvas);
                }
                return [2 /*return*/, image];
            });
        });
    };
    /**
     * Draw a tile with the provided text label in the middle
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {String} text
     * @param tileCanvas
     * @return {Promise<String|Buffer>}
     */
    ShadedFeaturesTile.prototype.drawTile = function (tileWidth, tileHeight, text, tileCanvas) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, canvas_1.Canvas.initializeAdapter()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, new Promise(function (resolve) {
                                var canvas;
                                var dispose = false;
                                if (tileCanvas !== undefined && tileCanvas !== null) {
                                    canvas = tileCanvas;
                                }
                                else {
                                    canvas = canvas_1.Canvas.create(tileWidth, tileHeight);
                                    dispose = true;
                                }
                                var context = canvas.getContext('2d');
                                context.clearRect(0, 0, tileWidth, tileHeight);
                                // Draw the tile border
                                if (_this.tileFillColor !== null) {
                                    context.fillStyle = _this.tileFillColor;
                                    context.fillRect(0, 0, tileWidth, tileHeight);
                                }
                                // Draw the tile border
                                if (_this.tileBorderColor !== null) {
                                    context.strokeStyle = _this.tileBorderColor;
                                    context.lineWidth = _this.tileBorderStrokeWidth;
                                    context.strokeRect(0, 0, tileWidth, tileHeight);
                                }
                                canvas_1.Canvas.toDataURL(canvas, 'image/' + _this.compressFormat).then(function (result) {
                                    if (dispose) {
                                        canvas_1.Canvas.disposeCanvas(canvas);
                                    }
                                    resolve(result);
                                });
                            })];
                }
            });
        });
    };
    return ShadedFeaturesTile;
}(customFeaturesTile_1.CustomFeaturesTile));
exports.ShadedFeaturesTile = ShadedFeaturesTile;
//# sourceMappingURL=shadedFeaturesTile.js.map