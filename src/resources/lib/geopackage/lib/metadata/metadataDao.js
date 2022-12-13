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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataDao = void 0;
/**
 * Metadata module.
 * @module metadata
 * @see module:dao/dao
 */
var dao_1 = require("../dao/dao");
var metadata_1 = require("./metadata");
/**
 * Metadata Data Access Object
 * @class
 * @extends Dao
 */
var MetadataDao = /** @class */ (function (_super) {
    __extends(MetadataDao, _super);
    function MetadataDao() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gpkgTableName = MetadataDao.TABLE_NAME;
        _this.idColumns = [MetadataDao.COLUMN_ID];
        return _this;
    }
    MetadataDao.prototype.createObject = function (results) {
        var m = new metadata_1.Metadata();
        if (results) {
            m.id = results.id;
            m.md_scope = results.md_scope;
            m.md_standard_uri = results.md_standard_uri;
            m.mime_type = results.mime_type;
            m.metadata = results.metadata;
        }
        return m;
    };
    MetadataDao.TABLE_NAME = 'gpkg_metadata';
    MetadataDao.COLUMN_ID = 'id';
    MetadataDao.COLUMN_MD_SCOPE = 'md_scope';
    MetadataDao.COLUMN_MD_STANDARD_URI = 'md_standard_uri';
    MetadataDao.COLUMN_MIME_TYPE = 'mime_type';
    MetadataDao.COLUMN_METADATA = 'metadata';
    return MetadataDao;
}(dao_1.Dao));
exports.MetadataDao = MetadataDao;
//# sourceMappingURL=metadataDao.js.map