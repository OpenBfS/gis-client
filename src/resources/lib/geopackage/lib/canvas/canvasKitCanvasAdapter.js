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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasKitCanvasAdapter = void 0;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var http_1 = __importDefault(require("http"));
var canvaskit_js_1 = __importDefault(require("../../canvaskit/canvaskit.js"));
var canvasUtils_1 = require("./canvasUtils");
/**
 * Node based canvas creation
 */
var CanvasKitCanvasAdapter = /** @class */ (function () {
    function CanvasKitCanvasAdapter() {
    }
    // allow user to set the locate file function, if they place it somewhere else
    CanvasKitCanvasAdapter.setCanvasKitWasmLocateFile = function (locateFile) {
        CanvasKitCanvasAdapter.canvasKitWasmLocateFile = locateFile;
    };
    // Let user set CanvasKit from outside of this module. i.e. they load it into their context and then pass the CanvasKit object to this adapter.
    CanvasKitCanvasAdapter.setCanvasKit = function (CanvasKit) {
        CanvasKitCanvasAdapter.CanvasKit = CanvasKit;
        CanvasKitCanvasAdapter.initialized = true;
    };
    CanvasKitCanvasAdapter.prototype.initialize = function () {
        return new Promise(function (resolve, reject) {
            try {
                (0, canvaskit_js_1.default)({
                    locateFile: CanvasKitCanvasAdapter.canvasKitWasmLocateFile
                }).then(function (CanvasKit) {
                    CanvasKitCanvasAdapter.CanvasKit = CanvasKit;
                    CanvasKitCanvasAdapter.initialized = true;
                    resolve();
                }).catch(function () {
                    reject('Failed to load the CanvasKit WebAssembly file at ' + CanvasKitCanvasAdapter.canvasKitWasmLocateFile('canvaskit.wasm') + '.\nUpdate file locator function using NodeCanvasAdapter.setCanvasKitWasmLocateFile.');
                });
            }
            catch (e) {
                reject('Failed to load the CanvasKit WebAssembly file at ' + CanvasKitCanvasAdapter.canvasKitWasmLocateFile('canvaskit.wasm') + '.\nUpdate file locator function using NodeCanvasAdapter.setCanvasKitWasmLocateFile.');
            }
        });
    };
    CanvasKitCanvasAdapter.prototype.isInitialized = function () {
        return CanvasKitCanvasAdapter.initialized;
    };
    CanvasKitCanvasAdapter.prototype.create = function (width, height) {
        return CanvasKitCanvasAdapter.CanvasKit.MakeCanvas(width, height);
    };
    /**
     * Supports creating an image from file, base64 encoded image, image data buffer or url
     * @param imageData
     * @param contentType
     */
    CanvasKitCanvasAdapter.prototype.createImage = function (imageData, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            var src, image, width, height, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        src = imageData;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        if (!(typeof imageData === 'string')) return [3 /*break*/, 6];
                        if (!/^\s*data:/.test(imageData)) return [3 /*break*/, 2];
                        src = canvasUtils_1.CanvasUtils.base64toUInt8Array(imageData.split(',')[1]);
                        return [3 /*break*/, 6];
                    case 2:
                        if (!/^\s*https?:\/\//.test(imageData)) return [3 /*break*/, 4];
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                http_1.default.get(imageData, function (res) {
                                    var data = [];
                                    if (res.statusCode === 200) {
                                        res.on('data', function (chunk) {
                                            data.push(chunk);
                                        }).on('end', function () {
                                            resolve(Buffer.concat(data).buffer);
                                        }).on('error', function (e) {
                                            reject(e);
                                        });
                                    }
                                    else {
                                        reject('Code: ' + res.statusCode);
                                    }
                                });
                            })];
                    case 3:
                        src = _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, new Promise(function (resolve, reject) {
                            fs_1.default.readFile(imageData, function (e, data) {
                                if (e) {
                                    reject(e);
                                }
                                else {
                                    resolve(data);
                                }
                            });
                        })];
                    case 5:
                        // imageData is a file path
                        src = _a.sent();
                        _a.label = 6;
                    case 6:
                        image = CanvasKitCanvasAdapter.CanvasKit.MakeImageFromEncoded(src);
                        if (image != null) {
                            width = image.width();
                            height = image.height();
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        e_1 = _a.sent();
                        throw new Error('Failed to create image.');
                    case 8:
                        if (image == null) {
                            throw new Error('Failed to create image.');
                        }
                        return [2 /*return*/, { image: image, width: width, height: height }];
                }
            });
        });
    };
    CanvasKitCanvasAdapter.prototype.createImageData = function (width, height) {
        return new CanvasKitCanvasAdapter.CanvasKit.ImageData(width, height);
    };
    CanvasKitCanvasAdapter.prototype.disposeCanvas = function (canvas) {
        if (canvas != null) {
            canvas.dispose();
            canvas = null;
        }
    };
    CanvasKitCanvasAdapter.prototype.measureText = function (context, fontFace, fontSize, text) {
        var font = new CanvasKitCanvasAdapter.CanvasKit.Font(null, fontSize);
        var ids = font.getGlyphIDs(text);
        var paint = new CanvasKitCanvasAdapter.CanvasKit.Paint();
        paint.setStyle(CanvasKitCanvasAdapter.CanvasKit.PaintStyle.Fill);
        var size = font.getGlyphWidths(ids, paint).reduce(function (a, b) {
            return a + b;
        }, 0);
        paint.delete();
        return size;
    };
    CanvasKitCanvasAdapter.prototype.drawText = function (context, text, location, fontFace, fontSize, fontColor) {
        context.save();
        context.fillStyle = fontColor;
        context.font = fontSize + 'px \'' + fontFace + '\'';
        context.textBaseline = 'middle';
        var textWidth = this.measureText(context, fontFace, fontSize, text);
        context.fillText(text, location[0] - textWidth / 2, location[1] + fontSize / 4);
        context.restore();
    };
    CanvasKitCanvasAdapter.prototype.toDataURL = function (canvas, format) {
        if (format === void 0) { format = 'image/png'; }
        return Promise.resolve(canvas.toDataURL(format));
    };
    CanvasKitCanvasAdapter.prototype.scaleImage = function (image, scale) {
        return __awaiter(this, void 0, void 0, function () {
            var scaledWidth, scaledHeight;
            return __generator(this, function (_a) {
                scaledWidth = Math.round(scale * image.width);
                scaledHeight = Math.round(scale * image.height);
                return [2 /*return*/, this.scaleImageToDimensions(image, scaledWidth, scaledHeight)];
            });
        });
    };
    CanvasKitCanvasAdapter.prototype.scaleImageToDimensions = function (image, scaledWidth, scaledHeight) {
        return __awaiter(this, void 0, void 0, function () {
            var canvas, ctx, result, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        canvas = this.create(scaledWidth, scaledHeight);
                        ctx = canvas.getContext('2d');
                        ctx.drawImage(image.image, 0, 0, scaledWidth, scaledHeight);
                        _a = this.createImage;
                        return [4 /*yield*/, this.toDataURL(canvas, 'image/png')];
                    case 1: return [4 /*yield*/, _a.apply(this, [_b.sent(), 'image/png'])];
                    case 2:
                        result = _b.sent();
                        this.disposeCanvas(canvas);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    CanvasKitCanvasAdapter.prototype.disposeImage = function (image) {
        if (image != null && image.image && image.image.delete) {
            image.image.delete();
            image.image = null;
        }
    };
    CanvasKitCanvasAdapter.initialized = false;
    // default wasm locator
    CanvasKitCanvasAdapter.canvasKitWasmLocateFile = function (filename) {
        return path_1.default.join(__dirname, '..', '..', 'canvaskit', filename);
    };
    return CanvasKitCanvasAdapter;
}());
exports.CanvasKitCanvasAdapter = CanvasKitCanvasAdapter;
//# sourceMappingURL=canvasKitCanvasAdapter.js.map