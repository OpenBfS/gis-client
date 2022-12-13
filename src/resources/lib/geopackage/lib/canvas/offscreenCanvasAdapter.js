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
exports.OffscreenCanvasAdapter = void 0;
var canvasUtils_1 = require("./canvasUtils");
/**
 * OffscreenCanvas canvas adapter. This can only run inside a web worker.
 */
var OffscreenCanvasAdapter = /** @class */ (function () {
    function OffscreenCanvasAdapter() {
    }
    OffscreenCanvasAdapter.prototype.initialize = function () {
        return new Promise(function (resolve) {
            OffscreenCanvasAdapter.initialized = true;
            resolve();
        });
    };
    OffscreenCanvasAdapter.prototype.isInitialized = function () {
        return OffscreenCanvasAdapter.initialized;
    };
    OffscreenCanvasAdapter.prototype.create = function (width, height) {
        return new OffscreenCanvas(width, height);
    };
    OffscreenCanvasAdapter.prototype.createImage = function (data, contentType) {
        if (contentType === void 0) { contentType = 'image/png'; }
        return new Promise(function (resolve, reject) {
            var blob = data;
            if (data instanceof Buffer || Object.prototype.toString.call(data) === '[object Uint8Array]') {
                blob = new Blob([data], { type: contentType });
            }
            else if (typeof data === 'string') {
                blob = new Blob([canvasUtils_1.CanvasUtils.base64toUInt8Array(data.split(',')[1])], { type: contentType });
            }
            createImageBitmap(blob).then(function (image) {
                resolve({
                    image: image,
                    width: image.width,
                    height: image.height,
                });
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    OffscreenCanvasAdapter.prototype.createImageData = function (width, height) {
        return new ImageData(width, height);
    };
    OffscreenCanvasAdapter.prototype.disposeCanvas = function (canvas) {
        canvas = null;
    };
    OffscreenCanvasAdapter.prototype.measureText = function (context, fontFace, fontSize, text) {
        context.save();
        context.font = fontSize + 'px' + (fontFace != null ? (' \'' + fontFace + '\'') : '');
        context.textBaseline = 'middle';
        context.textAlign = 'center';
        var width = context.measureText(text).width;
        context.restore();
        return width;
    };
    OffscreenCanvasAdapter.prototype.drawText = function (context, text, location, fontFace, fontSize, fontColor) {
        context.save();
        context.font = fontSize + 'px' + (fontFace != null ? (' \'' + fontFace + '\'') : '');
        context.fillStyle = fontColor;
        context.textBaseline = 'middle';
        context.textAlign = 'center';
        context.fillText(text, location[0], location[1]);
        context.restore();
    };
    OffscreenCanvasAdapter.prototype.scaleImage = function (image, scale) {
        return __awaiter(this, void 0, void 0, function () {
            var scaledWidth, scaledHeight;
            return __generator(this, function (_a) {
                if (scale === 1.0) {
                    return [2 /*return*/, image];
                }
                scaledWidth = Math.round(scale * image.width);
                scaledHeight = Math.round(scale * image.height);
                return [2 /*return*/, this.scaleImageToDimensions(image, scaledWidth, scaledHeight)];
            });
        });
    };
    OffscreenCanvasAdapter.prototype.scaleImageToDimensions = function (image, scaledWidth, scaledHeight) {
        return __awaiter(this, void 0, void 0, function () {
            var canvas, ctx, result;
            return __generator(this, function (_a) {
                canvas = this.create(scaledWidth, scaledHeight);
                ctx = canvas.getContext('2d');
                ctx.drawImage(image.image, 0, 0, scaledWidth, scaledHeight);
                result = {
                    image: canvas.transferToImageBitmap(),
                    width: scaledWidth,
                    height: scaledHeight
                };
                this.disposeCanvas(canvas);
                return [2 /*return*/, result];
            });
        });
    };
    OffscreenCanvasAdapter.prototype.toDataURL = function (canvas, format) {
        if (format === void 0) { format = 'image/png'; }
        // @ts-ignore
        return new Promise(function (resolve) {
            canvas.convertToBlob({ type: format }).then(function (blob) {
                var reader = new FileReader();
                reader.addEventListener('load', function () {
                    var result = reader.result;
                    resolve(result);
                });
                reader.readAsDataURL(blob);
            });
        });
    };
    OffscreenCanvasAdapter.prototype.disposeImage = function (image) {
    };
    OffscreenCanvasAdapter.initialized = false;
    return OffscreenCanvasAdapter;
}());
exports.OffscreenCanvasAdapter = OffscreenCanvasAdapter;
//# sourceMappingURL=offscreenCanvasAdapter.js.map