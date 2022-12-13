"use strict";
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
exports.IconCache = void 0;
var canvas_1 = require("../../canvas/canvas");
var imageUtils_1 = require("../../tiles/imageUtils");
/**
 * @memberOf module:extension/style
 * @class IconCache
 */
/**
 * Constructor, created with cache size of {@link #IconCache.DEFAULT_CACHE_SIZE}
 * @constructor
 */
var IconCache = /** @class */ (function () {
    function IconCache(cacheSize) {
        if (cacheSize === void 0) { cacheSize = IconCache.DEFAULT_CACHE_SIZE; }
        this.cacheSize = cacheSize;
        this.iconCache = {};
        this.accessHistory = [];
    }
    /**
     * Get the cached image for the icon row or null if not cached
     * @param {module:extension/style.IconRow} iconRow icon row
     * @return {Image} icon image or null
     */
    IconCache.prototype.getIconForIconRow = function (iconRow) {
        return this.get(iconRow.id);
    };
    /**
     * Get the cached image for the icon row id or null if not cached
     * @param {Number} iconRowId icon row id
     * @return {Image} icon image or null
     */
    IconCache.prototype.get = function (iconRowId) {
        var image = this.iconCache[iconRowId];
        if (image) {
            var index = this.accessHistory.indexOf(iconRowId);
            if (index > -1) {
                this.accessHistory.splice(index, 1);
            }
            this.accessHistory.push(iconRowId);
        }
        return image;
    };
    /**
     * Cache the icon image for the icon row
     * @param {module:extension/style.IconRow} iconRow icon row
     * @param {Image} image icon image
     * @return {Image} previous cached icon image or null
     */
    IconCache.prototype.putIconForIconRow = function (iconRow, image) {
        return this.put(iconRow.id, image);
    };
    /**
     * Cache the icon image for the icon row id
     * @param {Number} iconRowId icon row id
     * @param {Image} image icon image
     * @return {Image} previous cached icon image or null
     */
    IconCache.prototype.put = function (iconRowId, image) {
        var previous = this.iconCache[iconRowId];
        this.iconCache[iconRowId] = image;
        if (previous) {
            var index = this.accessHistory.indexOf(iconRowId);
            if (index > -1) {
                this.accessHistory.splice(index, 1);
            }
        }
        this.accessHistory.push(iconRowId);
        if (Object.keys(this.iconCache).length > this.cacheSize) {
            var iconId = this.accessHistory.shift();
            if (iconId) {
                var iconToDelete = this.iconCache[iconId];
                if (iconToDelete) {
                    canvas_1.Canvas.disposeImage(iconToDelete);
                }
                delete this.iconCache[iconId];
            }
        }
        return previous;
    };
    /**
     * Remove the cached image for the icon row, if using CanvasKitCanvasAdapter, dispose of returned image to free up memory using Canvas.dispose(icon.image)
     * @param {module:extension/style.IconRow} iconRow icon row
     * @return {Image} removed icon image or null
     */
    IconCache.prototype.removeIconForIconRow = function (iconRow) {
        return this.remove(iconRow.id);
    };
    /**
     * Remove the cached image for the icon row id
     * @param {Number} iconRowId icon row id
     * @return {Image} removed icon image or null
     */
    IconCache.prototype.remove = function (iconRowId) {
        var removed = this.iconCache[iconRowId];
        delete this.iconCache[iconRowId];
        if (removed) {
            var index = this.accessHistory.indexOf(iconRowId);
            if (index > -1) {
                this.accessHistory.splice(index, 1);
            }
        }
        return removed;
    };
    /**
     * Clear the cache
     */
    IconCache.prototype.clear = function () {
        var _this = this;
        Object.keys(this.iconCache).forEach(function (key) {
            var icon = _this.iconCache[key];
            canvas_1.Canvas.disposeImage(icon);
        });
        this.iconCache = {};
        this.accessHistory = [];
    };
    /**
     * Resize the cache
     * @param {Number} maxSize max size
     */
    IconCache.prototype.resize = function (maxSize) {
        this.cacheSize = maxSize;
        var keys = Object.keys(this.iconCache);
        if (keys.length > maxSize) {
            var numberToRemove = keys.length - maxSize;
            for (var i = 0; i < numberToRemove; i++) {
                var indexToRemove = this.accessHistory.shift();
                var icon = this.iconCache[indexToRemove];
                canvas_1.Canvas.disposeImage(icon);
                delete this.iconCache[indexToRemove];
            }
        }
    };
    /**
     * Create or retrieve from cache an icon image for the icon row
     * @param {module:extension/style.IconRow} icon icon row
     * @return {Promise<Image>} icon image
     */
    IconCache.prototype.createIcon = function (icon) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createAndCacheIcon(icon, this)];
            });
        });
    };
    /**
     * Create or retrieve from cache an icon image for the icon row
     * @param {module:extension/style.IconRow} icon icon row
     * @param {Number} scale scale factor
     * @return {Promise<Image>} icon image
     */
    IconCache.prototype.createScaledIcon = function (icon, scale) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createAndCacheScaledIcon(icon, scale, this)];
            });
        });
    };
    /**
     * Create an icon image for the icon row without caching
     * @param {module:extension/style.IconRow} icon icon row
     * @return {Promise<Image>} icon image
     */
    IconCache.prototype.createIconNoCache = function (icon) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createScaledIconNoCache(icon, 1.0)];
            });
        });
    };
    /**
     * Create an icon image for the icon row without caching
     * @param icon icon row
     * @param scale scale factor
     * @return {Promise<Image>} icon image
     */
    IconCache.prototype.createScaledIconNoCache = function (icon, scale) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createAndCacheScaledIcon(icon, scale, null)];
            });
        });
    };
    /**
     * Create or retrieve from cache an icon image for the icon row
     * @param {module:extension/style.IconRow} icon icon row
     * @param {module:extension/style.IconCache} iconCache icon cache
     * @return {Promise<Image>} icon image
     */
    IconCache.prototype.createAndCacheIcon = function (icon, iconCache) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createAndCacheScaledIcon(icon, 1.0, iconCache)];
            });
        });
    };
    /**
     * Create or retrieve from cache an icon image for the icon row
     * @param {module:extension/style.IconRow} icon icon row
     * @param {Number} scale scale factor
     * @param {module:extension/style.IconCache} iconCache icon cache
     * @return {Promise<Image>} icon image
     */
    IconCache.prototype.createAndCacheScaledIcon = function (icon, scale, iconCache) {
        return __awaiter(this, void 0, void 0, function () {
            var iconImage, iconId, e_1, dataWidth, dataHeight, iconWidth, iconHeight, scaleImage, scaledWidth, scaledHeight;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        iconImage = null;
                        if (!(icon != null)) return [3 /*break*/, 7];
                        iconId = icon.id;
                        if (iconCache != null) {
                            iconImage = iconCache.get(iconId);
                        }
                        if (!(iconImage == null)) return [3 /*break*/, 7];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, imageUtils_1.ImageUtils.getImage(icon.data)];
                    case 2:
                        iconImage = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        throw new Error('Failed to get the Icon Row image. Id: ' + iconId + ', Name: ' + icon.name);
                    case 4:
                        dataWidth = iconImage.width;
                        dataHeight = iconImage.height;
                        iconWidth = icon.width;
                        iconHeight = icon.height;
                        scaleImage = iconWidth != null || iconHeight != null;
                        if (!scaleImage && scale != 1.0) {
                            iconWidth = dataWidth;
                            iconHeight = dataHeight;
                            scaleImage = true;
                        }
                        if (!scaleImage) return [3 /*break*/, 6];
                        if (iconWidth == null) {
                            iconWidth = dataWidth * (iconHeight / dataHeight);
                        }
                        else if (iconHeight == null) {
                            iconHeight = dataHeight * (iconWidth / dataWidth);
                        }
                        scaledWidth = Math.round(scale * iconWidth);
                        scaledHeight = Math.round(scale * iconHeight);
                        if (!(scaledWidth != dataWidth || scaledHeight != dataHeight)) return [3 /*break*/, 6];
                        return [4 /*yield*/, imageUtils_1.ImageUtils.scaleImage(iconImage, scaledWidth, scaledHeight)];
                    case 5:
                        iconImage = _a.sent();
                        _a.label = 6;
                    case 6:
                        if (iconCache != null) {
                            iconCache.putIconForIconRow(icon, iconImage);
                        }
                        _a.label = 7;
                    case 7: return [2 /*return*/, iconImage];
                }
            });
        });
    };
    IconCache.DEFAULT_CACHE_SIZE = 100;
    return IconCache;
}());
exports.IconCache = IconCache;
//# sourceMappingURL=iconCache.js.map