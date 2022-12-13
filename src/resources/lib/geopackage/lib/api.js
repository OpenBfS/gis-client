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
exports.GeoPackageAPI = void 0;
var geoPackage_1 = require("./geoPackage");
var geoPackageConnection_1 = require("./db/geoPackageConnection");
var geoPackageValidate_1 = require("./validate/geoPackageValidate");
var canvas_1 = require("./canvas/canvas");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
/**
 * This module is the entry point to the GeoPackage API, providing static
 * methods for opening and building GeoPackage files.
 */
var GeoPackageAPI = /** @class */ (function () {
    function GeoPackageAPI() {
    }
    /**
     * In Node, open a GeoPackage file at the given path, or in a browser, load an
     * in-memory GeoPackage from the given byte array.
     * @param  {string|Uint8Array|Buffer} gppathOrByteArray path to the GeoPackage file or `Uint8Array` of GeoPackage bytes
     * @return {Promise<GeoPackage>} promise that resolves with the open {@link module:geoPackage~GeoPackage} object or rejects with an `Error`
     */
    GeoPackageAPI.open = function (gppathOrByteArray) {
        return __awaiter(this, void 0, void 0, function () {
            var geoPackage, valid, e_1, connection, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = typeof gppathOrByteArray !== 'string' ||
                            (typeof gppathOrByteArray === 'string' &&
                                (gppathOrByteArray.indexOf('http') === 0 ||
                                    !geoPackageValidate_1.GeoPackageValidate.validateGeoPackageExtension(gppathOrByteArray)));
                        if (!valid) {
                            throw new Error('Invalid GeoPackage - Invalid GeoPackage Extension');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, canvas_1.Canvas.initializeAdapter()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        throw new Error('Unable to initialize canvas.');
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, geoPackageConnection_1.GeoPackageConnection.connect(gppathOrByteArray)];
                    case 5:
                        connection = _a.sent();
                        if (gppathOrByteArray && typeof gppathOrByteArray === 'string') {
                            geoPackage = new geoPackage_1.GeoPackage(path_1.default.basename(gppathOrByteArray), gppathOrByteArray, connection);
                        }
                        else {
                            geoPackage = new geoPackage_1.GeoPackage('geopackage', undefined, connection);
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        e_2 = _a.sent();
                        throw new Error('Unable to open GeoPackage.');
                    case 7: return [2 /*return*/, geoPackage];
                }
            });
        });
    };
    /**
     * In Node, create a GeoPackage file at the given file path, or in a browser,
     * create an in-memory GeoPackage.
     * @param  {string} gppath path of the created GeoPackage file; ignored in the browser
     * @return {Promise<typeof GeoPackage>} promise that resolves with the open {@link module:geoPackage~GeoPackage} object or rejects with an  `Error`
     */
    GeoPackageAPI.create = function (gppath) {
        return __awaiter(this, void 0, void 0, function () {
            var geoPackage, valid, e_3, connection, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = typeof gppath !== 'string' ||
                            (typeof gppath === 'string' && !geoPackageValidate_1.GeoPackageValidate.validateGeoPackageExtension(gppath));
                        if (!valid) {
                            throw new Error('Invalid GeoPackage');
                        }
                        if (typeof process !== 'undefined' && process.version && gppath) {
                            try {
                                fs_1.default.mkdirSync(path_1.default.dirname(gppath));
                            }
                            catch (e) {
                                // it's fine if we can't create the directory
                            }
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, canvas_1.Canvas.initializeAdapter()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        throw new Error('Unable to initialize canvas.');
                    case 4:
                        _a.trys.push([4, 7, , 8]);
                        return [4 /*yield*/, geoPackageConnection_1.GeoPackageConnection.connect(gppath)];
                    case 5:
                        connection = _a.sent();
                        connection.setApplicationId();
                        if (gppath) {
                            geoPackage = new geoPackage_1.GeoPackage(path_1.default.basename(gppath), gppath, connection);
                        }
                        else {
                            geoPackage = new geoPackage_1.GeoPackage('geopackage', undefined, connection);
                        }
                        return [4 /*yield*/, geoPackage.createRequiredTables()];
                    case 6:
                        _a.sent();
                        geoPackage.createSupportedExtensions();
                        return [3 /*break*/, 8];
                    case 7:
                        e_4 = _a.sent();
                        throw new Error('Unable to create GeoPackage.');
                    case 8: return [2 /*return*/, geoPackage];
                }
            });
        });
    };
    GeoPackageAPI.version = '3.0.0';
    return GeoPackageAPI;
}());
exports.GeoPackageAPI = GeoPackageAPI;
//# sourceMappingURL=api.js.map