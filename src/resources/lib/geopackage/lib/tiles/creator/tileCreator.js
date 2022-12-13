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
exports.TileCreator = void 0;
var file_type_1 = __importDefault(require("file-type"));
var proj4_1 = __importDefault(require("proj4"));
var projectTile_1 = __importDefault(require("./projectTile"));
var tileBoundingBoxUtils_1 = require("../tileBoundingBoxUtils");
var canvas_1 = require("../../canvas/canvas");
var imageUtils_1 = require("../imageUtils");
var tileUtilities_1 = require("./tileUtilities");
var projection_1 = require("../../projection/projection");
var projectionConstants_1 = require("../../projection/projectionConstants");
var TileCreator = /** @class */ (function () {
    function TileCreator(width, height, tileMatrix, tileMatrixSet, tileBoundingBox, srs, projectionTo, projectionToDefinition, canvas) {
        this.dispose = false;
        this.canvas = null;
        this.pixelsAdded = false;
        this.width = width;
        this.height = height;
        this.tileMatrix = tileMatrix;
        this.projectionFrom = srs.organization.toUpperCase() + ':' + srs.organization_coordsys_id;
        this.projectionFromDefinition = srs.definition;
        this.projectionTo = projectionTo.toUpperCase();
        this.projectionToDefinition = projectionToDefinition;
        this.tileBoundingBox = tileBoundingBox;
        this.tileMatrixSet = tileMatrixSet;
        this.chunks = [];
        this.tileHeightUnitsPerPixel = (tileBoundingBox.height) / height;
        this.tileWidthUnitsPerPixel = (tileBoundingBox.width) / width;
        // use this as a quick check if the projections are equal.  If they are we can shortcut some math
        // special cases 'EPSG:900913' =='EPSG:3857' == 'EPSG:102113'
        this.sameProjection =
            this.projectionFrom === this.projectionTo ||
                (this.projectionTo === projectionConstants_1.ProjectionConstants.EPSG_3857 &&
                    (this.projectionFrom === projectionConstants_1.ProjectionConstants.EPSG_900913 || this.projectionFrom === projectionConstants_1.ProjectionConstants.EPSG_102113));
        this.canvas = canvas;
    }
    /**
     * Factory method to generate a TileCreator instance
     * @param width
     * @param height
     * @param tileMatrix
     * @param tileMatrixSet
     * @param tileBoundingBox
     * @param srs
     * @param projectionTo
     * @param projectionToDefinition
     * @param canvas
     */
    TileCreator.create = function (width, height, tileMatrix, tileMatrixSet, tileBoundingBox, srs, projectionTo, projectionToDefinition, canvas) {
        return __awaiter(this, void 0, void 0, function () {
            var creator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        creator = new TileCreator(width, height, tileMatrix, tileMatrixSet, tileBoundingBox, srs, projectionTo, projectionToDefinition, canvas);
                        return [4 /*yield*/, creator.initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, creator];
                }
            });
        });
    };
    /**
     * Initialize the TileCreator
     */
    TileCreator.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, canvas_1.Canvas.initializeAdapter()];
                    case 1:
                        _a.sent();
                        if (this.canvas == null) {
                            this.canvas = canvas_1.Canvas.create(this.width, this.height);
                            this.dispose = true;
                        }
                        this.ctx = this.canvas.getContext('2d');
                        this.tileCanvas = canvas_1.Canvas.create(this.tileMatrix.tile_width, this.tileMatrix.tile_height);
                        this.tileContext = this.tileCanvas.getContext('2d');
                        this.imageData = canvas_1.Canvas.createImageData(this.width, this.height);
                        return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * Adds a single pixel from one image to another
     * @param targetX
     * @param targetY
     * @param sourceX
     * @param sourceY
     */
    TileCreator.prototype.addPixel = function (targetX, targetY, sourceX, sourceY) {
        var color = this.tileContext.getImageData(sourceX, sourceY, 1, 1);
        this.imageData.data.set(color.data, targetY * this.width * 4 + targetX * 4);
        this.pixelsAdded = true;
    };
    /**
     * Adds a tile and reprojects it if necessary before drawing it into the target canvas
     * @param tileData
     * @param gridColumn
     * @param gridRow
     */
    TileCreator.prototype.addTile = function (tileData, gridColumn, gridRow) {
        return __awaiter(this, void 0, void 0, function () {
            var type, tile, i, p;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        type = (0, file_type_1.default)(tileData);
                        return [4 /*yield*/, imageUtils_1.ImageUtils.getImage(tileData, type.mime)];
                    case 1:
                        tile = _a.sent();
                        this.tileContext.clearRect(0, 0, this.tileMatrix.tile_width, this.tileMatrix.tile_height);
                        this.tileContext.drawImage(tile.image, 0, 0);
                        this.chunks = [];
                        return [4 /*yield*/, this.projectTile(tileData, gridColumn, gridRow)];
                    case 2:
                        _a.sent();
                        if (this.pixelsAdded) {
                            this.ctx.putImageData(this.imageData, 0, 0);
                        }
                        if (this.chunks && this.chunks.length) {
                            for (i = 0; i < this.chunks.length; i++) {
                                p = this.chunks[i].position;
                                this.ctx.drawImage(tile.image, p.sx, p.sy, p.sWidth, p.sHeight, p.dx, p.dy, p.dWidth, p.dHeight);
                            }
                        }
                        canvas_1.Canvas.disposeImage(tile);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Projects the tile into the target projection and renders into the target canvas
     * @param tileData
     * @param gridColumn
     * @param gridRow
     */
    TileCreator.prototype.projectTile = function (tileData, gridColumn, gridRow) {
        return __awaiter(this, void 0, void 0, function () {
            var bb;
            return __generator(this, function (_a) {
                bb = tileBoundingBoxUtils_1.TileBoundingBoxUtils.getTileBoundingBox(this.tileMatrixSet.boundingBox, this.tileMatrix, gridColumn, gridRow);
                if (!this.sameProjection) {
                    return [2 /*return*/, this.reproject(tileData, bb)];
                }
                else {
                    return [2 /*return*/, this.cutAndScale(tileData, bb)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Cuts and scales tile data to fit the specified bounding box
     * @param tileData
     * @param tilePieceBoundingBox
     */
    TileCreator.prototype.cutAndScale = function (tileData, tilePieceBoundingBox) {
        var position = tileBoundingBoxUtils_1.TileBoundingBoxUtils.determinePositionAndScale(tilePieceBoundingBox, this.tileMatrix.tile_height, this.tileMatrix.tile_width, this.tileBoundingBox, this.height, this.width);
        if (position.xPositionInFinalTileStart >= this.width || position.yPositionInFinalTileStart >= this.height) {
            // this tile doesn't belong just skip it
        }
        else {
            this.addChunk(tileData, position);
        }
    };
    /**
     * Adds chunks to the chunk list.
     * @param chunk
     * @param position
     */
    TileCreator.prototype.addChunk = function (chunk, position) {
        this.chunks.push({
            chunk: chunk,
            position: position,
        });
    };
    /**
     * Reprojection tile data into target
     * @param tileData
     * @param tilePieceBoundingBox
     */
    TileCreator.prototype.reproject = function (tileData, tilePieceBoundingBox) {
        return __awaiter(this, void 0, void 0, function () {
            var job_1, height, width, tileHeight, tileWidth, conversion, latitude, row, column, longitude, projected, xPixel, yPixel;
            var _this = this;
            return __generator(this, function (_a) {
                // if web workers are available, execute the reprojection in a web worker
                if (typeof window !== 'undefined' && window.Worker) {
                    tileUtilities_1.TileUtilities.getPiecePosition(tilePieceBoundingBox, this.tileBoundingBox, this.height, this.width, this.projectionTo, this.projectionToDefinition, this.projectionFrom, this.projectionFromDefinition, this.tileHeightUnitsPerPixel, this.tileWidthUnitsPerPixel, this.tileMatrix.pixel_x_size, this.tileMatrix.pixel_y_size);
                    job_1 = {
                        sourceImageData: this.tileContext.getImageData(0, 0, this.tileMatrix.tile_width, this.tileMatrix.tile_height).data.buffer,
                        height: this.height,
                        width: this.width,
                        projectionTo: this.projectionTo,
                        projectionToDefinition: this.projectionToDefinition,
                        projectionFrom: this.projectionFrom,
                        projectionFromDefinition: this.projectionFromDefinition,
                        maxLatitude: this.tileBoundingBox.maxLatitude,
                        minLongitude: this.tileBoundingBox.minLongitude,
                        tileWidthUnitsPerPixel: this.tileWidthUnitsPerPixel,
                        tileHeightUnitsPerPixel: this.tileHeightUnitsPerPixel,
                        tilePieceBoundingBox: JSON.stringify(tilePieceBoundingBox),
                        tileBoundingBox: JSON.stringify(this.tileBoundingBox),
                        pixel_y_size: this.tileMatrix.pixel_y_size,
                        pixel_x_size: this.tileMatrix.pixel_x_size,
                        tile_width: this.tileMatrix.tile_width,
                        tile_height: this.tileMatrix.tile_height,
                    };
                    return [2 /*return*/, new Promise(function (resolve) {
                            try {
                                var work = require('webworkify');
                                var worker = work(require('./tileWorker.js'));
                                worker.onmessage = function (e) {
                                    _this.canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(e.data), _this.height, _this.width), 0, 0);
                                    resolve();
                                };
                                worker.postMessage(job_1, [
                                    _this.tileContext.getImageData(0, 0, _this.tileMatrix.tile_width, _this.tileMatrix.tile_height).data.buffer,
                                ]);
                            }
                            catch (e) {
                                var worker = projectTile_1.default;
                                var data = worker(job_1);
                                _this.canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(data), _this.height, _this.width), 0, 0);
                                resolve();
                            }
                        })];
                }
                else {
                    height = this.height;
                    width = this.width;
                    tileHeight = this.tileMatrix.tile_height;
                    tileWidth = this.tileMatrix.tile_width;
                    conversion = void 0;
                    try {
                        if (projection_1.Projection.hasProjection(this.projectionTo) == null) {
                            projection_1.Projection.loadProjection(this.projectionTo, this.projectionToDefinition);
                        }
                        if (projection_1.Projection.hasProjection(this.projectionFrom) == null) {
                            projection_1.Projection.loadProjection(this.projectionFrom, this.projectionFromDefinition);
                        }
                        conversion = (0, proj4_1.default)(this.projectionTo, this.projectionFrom);
                    }
                    catch (e) { }
                    latitude = void 0;
                    for (row = 0; row < height; row++) {
                        latitude = this.tileBoundingBox.maxLatitude - row * this.tileHeightUnitsPerPixel;
                        for (column = 0; column < width; column++) {
                            longitude = this.tileBoundingBox.minLongitude + column * this.tileWidthUnitsPerPixel;
                            projected = conversion.forward([longitude, latitude]);
                            xPixel = tileWidth - Math.round((tilePieceBoundingBox.maxLongitude - projected[0]) / this.tileMatrix.pixel_x_size);
                            yPixel = Math.round((tilePieceBoundingBox.maxLatitude - projected[1]) / this.tileMatrix.pixel_y_size);
                            if (xPixel >= 0 && xPixel < tileWidth && yPixel >= 0 && yPixel < tileHeight) {
                                this.addPixel(column, row, xPixel, yPixel);
                            }
                        }
                    }
                    this.canvas.getContext('2d').putImageData(this.imageData, 0, 0);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Gets the complete tile as a base64 encoded data url
     * @param format
     */
    TileCreator.prototype.getCompleteTile = function (format) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, canvas_1.Canvas.toDataURL(this.canvas, format)];
            });
        });
    };
    /**
     * Cleans up any canvases that may have been created
     */
    TileCreator.prototype.cleanup = function () {
        if (this.dispose) {
            canvas_1.Canvas.disposeCanvas(this.canvas);
        }
        canvas_1.Canvas.disposeCanvas(this.tileCanvas);
    };
    return TileCreator;
}());
exports.TileCreator = TileCreator;
//# sourceMappingURL=tileCreator.js.map