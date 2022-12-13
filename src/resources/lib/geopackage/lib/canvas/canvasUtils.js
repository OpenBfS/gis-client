"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasUtils = void 0;
var CanvasUtils = /** @class */ (function () {
    function CanvasUtils() {
    }
    CanvasUtils.base64toUInt8Array = function (data) {
        var bytes = Buffer.from(data, 'base64').toString('binary');
        var length = bytes.length;
        var out = new Uint8Array(length);
        // Loop and convert.
        while (length--) {
            out[length] = bytes.charCodeAt(length);
        }
        return out;
    };
    ;
    return CanvasUtils;
}());
exports.CanvasUtils = CanvasUtils;
//# sourceMappingURL=canvasUtils.js.map