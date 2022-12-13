"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentsDataType = void 0;
var ContentsDataType;
(function (ContentsDataType) {
    ContentsDataType["FEATURES"] = "features";
    ContentsDataType["TILES"] = "tiles";
    ContentsDataType["ATTRIBUTES"] = "attributes";
})(ContentsDataType = exports.ContentsDataType || (exports.ContentsDataType = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (ContentsDataType) {
    function nameFromType(type) {
        return ContentsDataType[type];
    }
    ContentsDataType.nameFromType = nameFromType;
    function fromName(type) {
        var dataType = null;
        if (type !== null && type !== undefined) {
            switch (type.toLowerCase()) {
                case ContentsDataType.FEATURES:
                    dataType = ContentsDataType.FEATURES;
                    break;
                case ContentsDataType.TILES:
                    dataType = ContentsDataType.TILES;
                    break;
                case ContentsDataType.ATTRIBUTES:
                    dataType = ContentsDataType.ATTRIBUTES;
                    break;
                default:
                    break;
            }
        }
        return dataType;
    }
    ContentsDataType.fromName = fromName;
})(ContentsDataType = exports.ContentsDataType || (exports.ContentsDataType = {}));
//# sourceMappingURL=contentsDataType.js.map