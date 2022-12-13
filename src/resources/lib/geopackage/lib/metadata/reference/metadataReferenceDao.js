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
exports.MetadataReferenceDao = void 0;
var dao_1 = require("../../dao/dao");
var columnValues_1 = require("../../dao/columnValues");
var metadataReference_1 = require("./metadataReference");
/**
 * Metadata Reference Data Access Object
 * @class
 * @extends Dao
 */
var MetadataReferenceDao = /** @class */ (function (_super) {
    __extends(MetadataReferenceDao, _super);
    function MetadataReferenceDao() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gpkgTableName = MetadataReferenceDao.TABLE_NAME;
        _this.idColumns = [MetadataReferenceDao.COLUMN_MD_FILE_ID, MetadataReferenceDao.COLUMN_MD_PARENT_ID];
        return _this;
    }
    MetadataReferenceDao.prototype.createObject = function (results) {
        var mr = new metadataReference_1.MetadataReference();
        if (results) {
            mr.reference_scope = results.reference_scope;
            mr.table_name = results.table_name;
            mr.column_name = results.column_name;
            mr.row_id_value = results.row_id_value;
            mr.timestamp = new Date(results.timestamp);
            mr.md_file_id = results.md_file_id;
            mr.md_parent_id = results.md_parent_id;
        }
        return mr;
    };
    /**
     * @param {Number} parentId
     * @return {Number} number of rows updated
     */
    MetadataReferenceDao.prototype.removeMetadataParent = function (parentId) {
        var values = {};
        values[MetadataReferenceDao.COLUMN_MD_PARENT_ID] = null;
        var where = this.buildWhereWithFieldAndValue(MetadataReferenceDao.COLUMN_MD_PARENT_ID, parentId);
        var whereArgs = this.buildWhereArgs(parentId);
        return this.updateWithValues(values, where, whereArgs).changes;
    };
    /**
     * @param {Number} fileId
     * @param {Number} parentId
     * @return {Iterable.<Object>}
     */
    MetadataReferenceDao.prototype.queryByMetadataAndParent = function (fileId, parentId) {
        var columnValues = new columnValues_1.ColumnValues();
        columnValues.addColumn(MetadataReferenceDao.COLUMN_MD_FILE_ID, fileId);
        columnValues.addColumn(MetadataReferenceDao.COLUMN_MD_PARENT_ID, parentId);
        return this.queryForFieldValues(columnValues);
    };
    /**
     * @param {Number} fileId
     * @return {Iterable.<Object>}
     */
    MetadataReferenceDao.prototype.queryByMetadata = function (fileId) {
        var columnValues = new columnValues_1.ColumnValues();
        columnValues.addColumn(MetadataReferenceDao.COLUMN_MD_FILE_ID, fileId);
        return this.queryForFieldValues(columnValues);
    };
    /**
     * @param {Number} parentId
     * @return {Iterable.<Object>}
     */
    MetadataReferenceDao.prototype.queryByMetadataParent = function (parentId) {
        var columnValues = new columnValues_1.ColumnValues();
        columnValues.addColumn(MetadataReferenceDao.COLUMN_MD_PARENT_ID, parentId);
        return this.queryForFieldValues(columnValues);
    };
    MetadataReferenceDao.prototype.deleteByTableName = function (table) {
        var where = '';
        where += this.buildWhereWithFieldAndValue(MetadataReferenceDao.COLUMN_TABLE_NAME, table);
        var whereArgs = this.buildWhereArgs(table);
        return this.deleteWhere(where, whereArgs);
    };
    MetadataReferenceDao.TABLE_NAME = 'gpkg_metadata_reference';
    MetadataReferenceDao.COLUMN_REFERENCE_SCOPE = 'reference_scope';
    MetadataReferenceDao.COLUMN_TABLE_NAME = 'table_name';
    MetadataReferenceDao.COLUMN_COLUMN_NAME = 'column_name';
    MetadataReferenceDao.COLUMN_ROW_ID = 'row_id_value';
    MetadataReferenceDao.COLUMN_TIMESTAMP = 'timestamp';
    MetadataReferenceDao.COLUMN_MD_FILE_ID = 'md_file_id';
    MetadataReferenceDao.COLUMN_MD_PARENT_ID = 'md_parent_id';
    return MetadataReferenceDao;
}(dao_1.Dao));
exports.MetadataReferenceDao = MetadataReferenceDao;
//# sourceMappingURL=metadataReferenceDao.js.map