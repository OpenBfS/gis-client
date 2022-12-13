"use strict";
/**
 * @module extension/relatedTables
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationType = void 0;
var contentsDataType_1 = require("../../core/contents/contentsDataType");
/**
 * Spec supported User-Defined Related Data Tables
 * @class
 */
var RelationType = /** @class */ (function () {
    function RelationType(name, dataType) {
        this.name = name;
        this.dataType = dataType;
    }
    /**
     * Get the relation type from the name
     * @param  {string} name name
     * @return {module:extension/relatedTables~RelationType}
     */
    RelationType.fromName = function (name) {
        return RelationType[name.toUpperCase()];
    };
    /**
     * Link features with other features
     * @type {Object}
     */
    RelationType.FEATURES = new RelationType('features', contentsDataType_1.ContentsDataType.FEATURES);
    /**
     * Relate sets of tabular text or numeric data
     * @type {Object}
     */
    RelationType.SIMPLE_ATTRIBUTES = new RelationType('simple_attributes', contentsDataType_1.ContentsDataType.ATTRIBUTES);
    /**
     * Relate features or attributes to multimedia files such as pictures and videos
     * @type {Object}
     */
    RelationType.MEDIA = new RelationType('media', contentsDataType_1.ContentsDataType.ATTRIBUTES);
    /**
     * Attribute type relation
     * @type {Object}
     */
    RelationType.ATTRIBUTES = new RelationType('attributes', contentsDataType_1.ContentsDataType.ATTRIBUTES);
    /**
     * Tile type relation
     * @type {Object}
     */
    RelationType.TILES = new RelationType('tiles', contentsDataType_1.ContentsDataType.TILES);
    return RelationType;
}());
exports.RelationType = RelationType;
//# sourceMappingURL=relationType.js.map