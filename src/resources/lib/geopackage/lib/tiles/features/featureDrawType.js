"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureDrawType = void 0;
var FeatureDrawType;
(function (FeatureDrawType) {
    /**
     * Circle for a point
     */
    FeatureDrawType["CIRCLE"] = "CIRCLE";
    /**
     * Stroke for a line of polygon
     */
    FeatureDrawType["STROKE"] = "STROKE";
    /**
     * Fill for a polygon
     */
    FeatureDrawType["FILL"] = "FILL";
})(FeatureDrawType = exports.FeatureDrawType || (exports.FeatureDrawType = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (FeatureDrawType) {
    function nameFromType(type) {
        return FeatureDrawType[type];
    }
    FeatureDrawType.nameFromType = nameFromType;
    function fromName(type) {
        switch (type) {
            case 'CIRCLE':
                return FeatureDrawType.CIRCLE;
            case 'STROKE':
                return FeatureDrawType.STROKE;
            case 'FILL':
                return FeatureDrawType.FILL;
        }
    }
    FeatureDrawType.fromName = fromName;
})(FeatureDrawType = exports.FeatureDrawType || (exports.FeatureDrawType = {}));
//# sourceMappingURL=featureDrawType.js.map