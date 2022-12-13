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
exports.UserDao = void 0;
var dao_1 = require("../dao/dao");
var mediaTable_1 = require("../extension/relatedTables/mediaTable");
var simpleAttributesTable_1 = require("../extension/relatedTables/simpleAttributesTable");
var userRow_1 = require("./userRow");
var relationType_1 = require("../extension/relatedTables/relationType");
var alterTable_1 = require("../db/alterTable");
var coreSQLUtils_1 = require("../db/coreSQLUtils");
/**
 * Abstract User DAO for reading user tables
 * @class UserDao
 * @extends Dao
 * @param  {module:db/geoPackageConnection~GeoPackageConnection} geoPackage        connection
 * @param  {string} table table name
 */
var UserDao = /** @class */ (function (_super) {
    __extends(UserDao, _super);
    function UserDao(geoPackage, table) {
        var _this = _super.call(this, geoPackage) || this;
        _this._table = table;
        _this.table_name = table.getTableName();
        _this.gpkgTableName = table.getTableName();
        if (table.getPkColumn()) {
            _this.idColumns = [table.getPkColumn().getName()];
        }
        else {
            _this.idColumns = [];
        }
        _this.columns = table.getUserColumns().getColumnNames();
        return _this;
    }
    /**
     * Creates a UserRow
     * @param  {Object} [results] results to create the row from if not specified, an empty row is created
     * @return {module:user/userRow~UserRow}
     */
    UserDao.prototype.createObject = function (results) {
        if (results) {
            return this.getRow(results);
        }
        return this.newRow();
    };
    /**
     * Sets the value in the row
     * @param  {module:user/userRow~UserRow} object      user row
     * @param  {Number} columnIndex index
     * @param  {Object} value       value
     */
    UserDao.prototype.setValueInObject = function (object, columnIndex, value) {
        object.setValueNoValidationWithIndex(columnIndex, value);
    };
    /**
     * Get a user row from the current results
     * @param  {Object} results result to create the row from
     * @return {module:user/userRow~UserRow}         the user row
     */
    UserDao.prototype.getRow = function (results) {
        if (results instanceof userRow_1.UserRow) {
            return results;
        }
        if (!this.table)
            return undefined;
        var columns = this.table.getColumnCount();
        var columnTypes = {};
        for (var i = 0; i < columns; i++) {
            var column = this.table.getColumnWithIndex(i);
            columnTypes[column.name] = column.dataType;
        }
        return this.newRow(columnTypes, results);
    };
    Object.defineProperty(UserDao.prototype, "table", {
        /**
         * Get the table for this dao
         * @return {module:user/userTable~UserTable}
         */
        get: function () {
            return this._table;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Create a user row
     * @param  {module:db/geoPackageDataType[]} columnTypes  column types
     * @param  {module:dao/columnValues~ColumnValues[]} values      values
     * @return {module:user/userRow~UserRow}             user row
     */
    UserDao.prototype.newRow = function (columnTypes, values) {
        return new userRow_1.UserRow(this.table, columnTypes, values);
    };
    /**
     * Links related rows together
     * @param  {module:user/userRow~UserRow} userRow             user row
     * @param  {module:user/userRow~UserRow} relatedRow          related row
     * @param  {string} relationType        relation type
     * @param  {string|UserMappingTable} [mappingTable]        mapping table
     * @param  {module:dao/columnValues~ColumnValues} [mappingColumnValues] column values
     * @return {number}
     */
    UserDao.prototype.linkRelatedRow = function (userRow, relatedRow, relationType, mappingTable, mappingColumnValues) {
        var rte = this.geoPackage.relatedTablesExtension;
        var baseTableName = userRow.table.getTableName();
        var relatedTableName = relatedRow.table.getTableName();
        var relationship = rte
            .getRelationshipBuilder()
            .setBaseTableName(baseTableName)
            .setRelatedTableName(relatedTableName)
            .setRelationType(relationType);
        var mappingTableName;
        if (!mappingTable || typeof mappingTable === 'string') {
            mappingTable = mappingTable || baseTableName + '_' + relatedTableName;
            relationship.setMappingTableName(mappingTable);
            mappingTableName = mappingTable;
        }
        else {
            relationship.setUserMappingTable(mappingTable);
            mappingTableName = mappingTable.getTableName();
        }
        rte.addRelationship(relationship);
        var userMappingDao = rte.getMappingDao(mappingTableName);
        var userMappingRow = userMappingDao.newRow();
        userMappingRow.baseId = userRow.id;
        userMappingRow.relatedId = relatedRow.id;
        for (var column in mappingColumnValues) {
            userMappingRow.setValueWithColumnName(column, mappingColumnValues[column]);
        }
        return userMappingDao.create(userMappingRow);
    };
    /**
     * Links a user row to a feature row
     * @param  {module:user/userRow~UserRow} userRow             user row
     * @param  {module:features/user/featureRow~FeatureRow} featureRow          feature row
     * @param  {string|UserMappingTable} [mappingTable]        mapping table
     * @param  {module:dao/columnValues~ColumnValues} [mappingColumnValues] column values
     * @return {number}
     */
    UserDao.prototype.linkFeatureRow = function (userRow, featureRow, mappingTable, mappingColumnValues) {
        return this.linkRelatedRow(userRow, featureRow, relationType_1.RelationType.FEATURES, mappingTable, mappingColumnValues);
    };
    /**
     * Links a user row to a media row
     * @param  {module:user/userRow~UserRow} userRow             user row
     * @param  {module:extension/relatedTables~MediaRow} mediaRow          media row
     * @param  {string|UserMappingTable} [mappingTable]        mapping table
     * @param  {module:dao/columnValues~ColumnValues} [mappingColumnValues] column values
     * @return {number}
     */
    UserDao.prototype.linkMediaRow = function (userRow, mediaRow, mappingTable, mappingColumnValues) {
        return this.linkRelatedRow(userRow, mediaRow, relationType_1.RelationType.MEDIA, mappingTable, mappingColumnValues);
    };
    /**
     * Links a user row to a simpleAttributes row
     * @param  {module:user/userRow~UserRow} userRow             user row
     * @param  {module:extension/relatedTables~SimpleAttributesRow} simpleAttributesRow          simple attributes row
     * @param  {string|UserMappingTable} [mappingTable]        mapping table
     * @param  {module:dao/columnValues~ColumnValues} [mappingColumnValues] column values
     * @return {number}
     */
    UserDao.prototype.linkSimpleAttributesRow = function (userRow, simpleAttributesRow, mappingTable, mappingColumnValues) {
        return this.linkRelatedRow(userRow, simpleAttributesRow, relationType_1.RelationType.SIMPLE_ATTRIBUTES, mappingTable, mappingColumnValues);
    };
    /**
     * Get all media rows that are linked to this user row
     * @param  {module:user/userRow~UserRow} userRow user row
     * @return {module:extension/relatedTables~MediaRow[]}
     */
    UserDao.prototype.getLinkedMedia = function (userRow) {
        var mediaRelations = this.mediaRelations;
        var rte = this.geoPackage.relatedTablesExtension;
        var linkedMedia = [];
        for (var i = 0; i < mediaRelations.length; i++) {
            var mediaRelation = mediaRelations[i];
            var mediaDao = rte.getMediaDao(mediaRelation);
            var userMappingDao = rte.getMappingDao(mediaRelation.mapping_table_name);
            var mappings = userMappingDao.queryByBaseId(userRow.id);
            for (var m = 0; m < mappings.length; m++) {
                var relatedId = mappings[m].related_id;
                linkedMedia.push(mediaDao.queryForId(relatedId));
            }
        }
        return linkedMedia;
    };
    /**
     * Get all simple attribute rows that are linked to this user row
     * @param  {module:user/userRow~UserRow} userRow user row
     * @return {module:extension/relatedTables~SimpleAttributeRow[]}
     */
    UserDao.prototype.getLinkedSimpleAttributes = function (userRow) {
        var simpleRelations = this.simpleAttributesRelations;
        var rte = this.geoPackage.relatedTablesExtension;
        var linkedSimpleAttributes = [];
        for (var i = 0; i < simpleRelations.length; i++) {
            var simpleRelation = simpleRelations[i];
            var simpleDao = rte.getSimpleAttributesDao(simpleRelation);
            var userMappingDao = rte.getMappingDao(simpleRelation.mapping_table_name);
            var mappings = userMappingDao.queryByBaseId(userRow.id);
            for (var m = 0; m < mappings.length; m++) {
                var relatedId = mappings[m].related_id;
                linkedSimpleAttributes.push(simpleDao.queryForId(relatedId));
            }
        }
        return linkedSimpleAttributes;
    };
    /**
     * Get all feature rows that are linked to this user row
     * @param  {module:user/userRow~UserRow} userRow user row
     * @return {module:features/user/featureRow~FeatureRow[]}
     */
    UserDao.prototype.getLinkedFeatures = function (userRow) {
        var featureRelations = this.featureRelations;
        var rte = this.geoPackage.relatedTablesExtension;
        var linkedFeatures = [];
        for (var i = 0; i < featureRelations.length; i++) {
            var featureRelation = featureRelations[i];
            var featureDao = this.geoPackage.getFeatureDao(featureRelation.base_table_name);
            var userMappingDao = rte.getMappingDao(featureRelation.mapping_table_name);
            var mappings = userMappingDao.queryByBaseId(userRow.id);
            for (var m = 0; m < mappings.length; m++) {
                var relatedId = mappings[m].related_id;
                linkedFeatures.push(featureDao.queryForId(relatedId));
            }
        }
        return linkedFeatures;
    };
    Object.defineProperty(UserDao.prototype, "simpleAttributesRelations", {
        /**
         * Get all simple attribute relations to this table
         * @return {Object[]}
         */
        get: function () {
            return this.getRelationsWithName(simpleAttributesTable_1.SimpleAttributesTable.RELATION_TYPE.name);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UserDao.prototype, "featureRelations", {
        /**
         * Get all feature relations to this table
         * @return {Object[]}
         */
        get: function () {
            return this.getRelationsWithName(relationType_1.RelationType.FEATURES.name);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UserDao.prototype, "mediaRelations", {
        /**
         * Get all media relations to this table
         * @return {Object[]}
         */
        get: function () {
            return this.getRelationsWithName(mediaTable_1.MediaTable.RELATION_TYPE.name);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get all relations to this table with the specified name
     * @param {string} name
     * @return {Object[]}
     */
    UserDao.prototype.getRelationsWithName = function (name) {
        return this.geoPackage.extendedRelationDao.getBaseTableRelationsWithName(this.table_name, name);
    };
    Object.defineProperty(UserDao.prototype, "relations", {
        /**
         * Get all relations to this table
         * @return {Object[]}
         */
        get: function () {
            return this.geoPackage.extendedRelationDao.getBaseTableRelations(this.table_name);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the rows in this table by id
     * @param  {Number[]} ids ids to query for
     * @return {Object[]}
     */
    UserDao.prototype.getRows = function (ids) {
        var rows = [];
        for (var i = 0; i < ids.length; i++) {
            var row = this.queryForId(ids[i]);
            if (row) {
                rows.push(row);
            }
        }
        return rows;
    };
    /**
     * Get count of all rows in this table
     * @return {Number}
     */
    UserDao.prototype.getCount = function () {
        return this.connection.count(this.table_name);
    };
    UserDao.prototype.getTableName = function () {
        return this.table_name;
    };
    /**
     * Rename column
     * @param columnName column name
     * @param newColumnName  new column name
     */
    UserDao.prototype.renameColumn = function (columnName, newColumnName) {
        alterTable_1.AlterTable.renameColumn(this.connection, this.table_name, columnName, newColumnName);
        this._table.renameColumnWithName(columnName, newColumnName);
    };
    /**
     * Add a new column
     * @param column new column
     */
    UserDao.prototype.addColumn = function (column) {
        alterTable_1.AlterTable.addColumn(this.connection, this.table_name, column.getName(), coreSQLUtils_1.CoreSQLUtils.columnDefinition(column));
        this._table.addColumn(column);
    };
    /**
     * Drop a colum
     * @param index column index
     */
    UserDao.prototype.dropColumnWithIndex = function (index) {
        this.dropColumn(this._table.getColumnNameWithIndex(index));
    };
    /**
     * Drop a column
     * @param columnName column name
     */
    UserDao.prototype.dropColumn = function (columnName) {
        alterTable_1.AlterTable.dropColumnForUserTable(this.connection, this.table, columnName);
    };
    /**
     * Drop columns
     * @param columns columns
     */
    UserDao.prototype.dropColumns = function (columns) {
        var columnNames = [];
        columns.forEach(function (column) {
            columnNames.push(column.getName());
        });
        this.dropColumnNames(columnNames);
    };
    /**
     * Drop columns
     * @param indices column indexes
     */
    UserDao.prototype.dropColumnIndexes = function (indices) {
        var _this = this;
        var columnNames = [];
        indices.forEach(function (idx) {
            columnNames.push(_this._table.getColumnNameWithIndex(idx));
        });
        this.dropColumnNames(columnNames);
    };
    /**
     * Drop columns
     * @param columnNames column names
     */
    UserDao.prototype.dropColumnNames = function (columnNames) {
        alterTable_1.AlterTable.dropColumnsForUserTable(this.connection, this.table, columnNames);
    };
    /**
     * Alter a column
     * @param column column
     */
    UserDao.prototype.alterColumn = function (column) {
        alterTable_1.AlterTable.alterColumnForTable(this.connection, this.table, column);
    };
    /**
     * Alter columns
     * @param columns columns
     */
    UserDao.prototype.alterColumns = function (columns) {
        alterTable_1.AlterTable.alterColumnsForTable(this.connection, this.table, columns);
    };
    return UserDao;
}(dao_1.Dao));
exports.UserDao = UserDao;
//# sourceMappingURL=userDao.js.map