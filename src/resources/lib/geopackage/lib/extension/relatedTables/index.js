"use strict";
/**
 * RelatedTablesExtension module.
 * @module extension/relatedTables
 * @see module:extension/BaseExtension
 */
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatedTablesExtension = void 0;
var baseExtension_1 = require("../baseExtension");
var extension_1 = require("../extension");
var mediaDao_1 = require("./mediaDao");
var mediaTable_1 = require("./mediaTable");
var simpleAttributesDao_1 = require("./simpleAttributesDao");
var simpleAttributesTable_1 = require("./simpleAttributesTable");
var userMappingTable_1 = require("./userMappingTable");
var userMappingDao_1 = require("./userMappingDao");
var userCustomDao_1 = require("../../user/custom/userCustomDao");
var extendedRelationDao_1 = require("./extendedRelationDao");
var relationType_1 = require("./relationType");
var contents_1 = require("../../core/contents/contents");
var columnValues_1 = require("../../dao/columnValues");
var extendedRelation_1 = require("./extendedRelation");
var optionBuilder_1 = require("../../optionBuilder");
var userCustomTableReader_1 = require("../../user/custom/userCustomTableReader");
var attributesDao_1 = require("../../attributes/attributesDao");
var featureDao_1 = require("../../features/user/featureDao");
var tileDao_1 = require("../../tiles/user/tileDao");
/**
 * Related Tables Extension
 * @param  {module:geoPackage~GeoPackage} geoPackage the GeoPackage object
 * @class
 * @extends BaseExtension
 */
var RelatedTablesExtension = /** @class */ (function (_super) {
    __extends(RelatedTablesExtension, _super);
    function RelatedTablesExtension(geoPackage) {
        var _this = _super.call(this, geoPackage) || this;
        _this.extendedRelationDao = geoPackage.extendedRelationDao;
        return _this;
    }
    /**
     * Get or create the extension
     * @return {Promise}
     */
    RelatedTablesExtension.prototype.getOrCreateExtension = function () {
        var extension = this.getOrCreate(RelatedTablesExtension.EXTENSION_NAME, 'gpkgext_relations', undefined, RelatedTablesExtension.EXTENSION_RELATED_TABLES_DEFINITION, extension_1.Extension.READ_WRITE);
        this.extendedRelationDao.createTable();
        return extension;
    };
    /**
     * Get or create the extension for the mapping table
     * @param  {string} mappingTableName user mapping table
     * @return {Promise}
     */
    RelatedTablesExtension.prototype.getOrCreateMappingTable = function (mappingTableName) {
        this.getOrCreateExtension();
        return this.getOrCreate(RelatedTablesExtension.EXTENSION_NAME, mappingTableName, undefined, RelatedTablesExtension.EXTENSION_RELATED_TABLES_DEFINITION, extension_1.Extension.READ_WRITE);
    };
    /**
     * Set the contents in the UserRelatedTable
     * @param  {module:extension/relatedTables~UserRelatedTable} userRelatedTable user related table
     */
    RelatedTablesExtension.prototype.setContents = function (userRelatedTable) {
        var contents = this.geoPackage.contentsDao.queryForId(userRelatedTable.getTableName());
        return userRelatedTable.setContents(contents);
    };
    /**
     * Reads the user table and creates a UserCustomDao
     * @param  {string} tableName       table name to reader
     * @param  {string[]} requiredColumns required columns
     * @return {module:user/custom~UserCustomDao}
     */
    RelatedTablesExtension.prototype.getUserDao = function (tableName) {
        return userCustomDao_1.UserCustomDao.readTable(this.geoPackage, tableName);
    };
    /**
     * Gets the UserMappingDao from the mapping table name
     * @param  {string | ExtendedRelation} tableName user mapping table name or ExtendedRelation object
     * @return {module:extension/relatedTables~UserMappingDao}
     */
    RelatedTablesExtension.prototype.getMappingDao = function (tableName) {
        var mappingTableName;
        if (tableName instanceof extendedRelation_1.ExtendedRelation) {
            mappingTableName = tableName.mapping_table_name;
        }
        else {
            mappingTableName = tableName;
        }
        return new userMappingDao_1.UserMappingDao(this.getUserDao(mappingTableName), this.geoPackage);
    };
    /**
     * Gets all relationships in the GeoPackage with an optional base table name and an optional base id
     * @param {String} [baseTableName] base table name
     * @return {module:extension/relatedTables~ExtendedRelation[]}
     */
    RelatedTablesExtension.prototype.getRelationships = function (baseTableName) {
        if (this.extendedRelationDao.isTableExists()) {
            if (baseTableName) {
                return this.geoPackage.extendedRelationDao.getBaseTableRelations(baseTableName);
            }
            return this.extendedRelationDao.queryForAll();
        }
        return [];
    };
    /**
     * Gets all relationships in the GeoPackage with an optional base table name and an optional base id
     * @param {String} [baseTableName] base table name
     * @param {String} [relatedTableName] related table name
     * @param {String} [mappingTableName] mapping table name
     * @return {Boolean}
     */
    RelatedTablesExtension.prototype.hasRelations = function (baseTableName, relatedTableName, mappingTableName) {
        var relations = [];
        if (this.extendedRelationDao.isTableExists()) {
            relations = this.extendedRelationDao.getRelations(baseTableName, relatedTableName, mappingTableName);
        }
        return !!relations.length;
    };
    RelatedTablesExtension.prototype.getRelatedRows = function (baseTableName, baseId) {
        var relationships = this.getRelationships(baseTableName);
        for (var i = 0; i < relationships.length; i++) {
            var relation = relationships[i];
            var mappingRows = this.getMappingRowsForBase(relation.mapping_table_name, baseId);
            relation.mappingRows = mappingRows;
            var userDao = void 0;
            switch (relation.relation_name) {
                case relationType_1.RelationType.MEDIA.name:
                    userDao = mediaDao_1.MediaDao.readTable(this.geoPackage, relation.related_table_name);
                    break;
                case relationType_1.RelationType.ATTRIBUTES.name:
                    userDao = attributesDao_1.AttributesDao.readTable(this.geoPackage, relation.related_table_name);
                    break;
                case relationType_1.RelationType.FEATURES.name:
                    userDao = featureDao_1.FeatureDao.readTable(this.geoPackage, relation.related_table_name);
                    break;
                case relationType_1.RelationType.TILES.name:
                    userDao = tileDao_1.TileDao.readTable(this.geoPackage, relation.related_table_name);
                    break;
                case relationType_1.RelationType.SIMPLE_ATTRIBUTES.name:
                    userDao = simpleAttributesDao_1.SimpleAttributesDao.readTable(this.geoPackage, relation.related_table_name);
                    break;
                default:
                    throw new Error('Relationship Unknown');
            }
            for (var m = 0; m < mappingRows.length; m++) {
                var mappingRow = mappingRows[m];
                mappingRow.row = userDao.queryForId(mappingRow.relatedId);
            }
        }
        return relationships;
    };
    /**
     * Convience object to build a Relationship object for querying and adding
     * @typedef {Object} module:extension/relatedTables~Relationship
     * @property  {module:extension/relatedTables~RelationType} relationType type of relationship
     * @property  {string} baseTableName base table name
     * @property  {string} relatedTableName related table name
     * @property  {string} relationAuthor relationship author
     * @property  {string} mappingTableName mapping table name
     * @property  {module:extension/relatedTables~UserMappingTable} userMappingTable UserMappingTable
     * @property  {module:extension/relatedTables~UserRelatedTable} relatedTable UserRelatedTable
     */
    RelatedTablesExtension.prototype.getRelationshipBuilder = function () {
        return RelatedTablesExtension.RelationshipBuilder();
    };
    /**
     * Adds a relationship to the GeoPackage
     * @param  {module:extension/relatedTables~Relationship|module:extension/relatedTables~ExtendedRelation} relationship relationship to add
     * @return {Promise<ExtendedRelation | undefined>}
     */
    RelatedTablesExtension.prototype.addRelationship = function (relationship) {
        var extendedRelation = this.extendedRelationDao.createObject();
        var userMappingTable;
        if (relationship instanceof extendedRelation_1.ExtendedRelation) {
            extendedRelation = relationship;
            userMappingTable = userMappingTable_1.UserMappingTable.create(extendedRelation.mapping_table_name);
        }
        else {
            userMappingTable = relationship.userMappingTable;
            if (relationship.relationType) {
                relationship.relationName = relationship.relationType.name;
            }
            if (relationship.relationAuthor) {
                relationship.relationName = this.buildRelationName(relationship.relationAuthor, relationship.relationName);
            }
            if (relationship.mappingTableName) {
                userMappingTable = userMappingTable_1.UserMappingTable.create(relationship.mappingTableName);
            }
            if (relationship.relatedTable) {
                this.createRelatedTable(relationship.relatedTable);
                relationship.relatedTableName = relationship.relatedTable.getTableName();
                relationship.relationName = relationship.relatedTable.relation_name;
            }
            extendedRelation.base_table_name = relationship.baseTableName;
            extendedRelation.base_primary_column = this.getPrimaryKeyColumnName(relationship.baseTableName);
            extendedRelation.related_table_name = relationship.relatedTableName;
            extendedRelation.related_primary_column = this.getPrimaryKeyColumnName(relationship.relatedTableName);
            extendedRelation.mapping_table_name = userMappingTable.getTableName();
            extendedRelation.relation_name = relationship.relationName;
        }
        if (!this.validateRelationship(extendedRelation.base_table_name, extendedRelation.related_table_name, extendedRelation.relation_name)) {
            return;
        }
        this.createUserMappingTable(userMappingTable);
        var mappingTableRelations = this.extendedRelationDao.queryByMappingTableName(extendedRelation.mapping_table_name);
        if (mappingTableRelations.length) {
            return mappingTableRelations[0];
        }
        this.extendedRelationDao.create(extendedRelation);
        return extendedRelation;
    };
    /**
     * Get the primary key column name from the specified table
     * @param  {string} tableName table name
     * @return {string}
     */
    RelatedTablesExtension.prototype.getPrimaryKeyColumnName = function (tableName) {
        var reader = new userCustomTableReader_1.UserCustomTableReader(tableName);
        var table = reader.readTable(this.geoPackage.database);
        return table.getPkColumn().getName();
    };
    /**
     * Adds a features relationship between the base feature and related feature
     * table. Creates a default user mapping table if needed.
     * @param  {module:extension/relatedTables~Relationship|module:extension/relatedTables~ExtendedRelation} relationship relationship to add
     * @return {Promise<ExtendedRelation>}
     */
    RelatedTablesExtension.prototype.addFeaturesRelationship = function (relationship) {
        if (relationship instanceof extendedRelation_1.ExtendedRelation) {
            relationship.relation_name = relationship.relation_name || relationType_1.RelationType.FEATURES.name;
        }
        else {
            relationship.relationType = relationType_1.RelationType.FEATURES;
        }
        return this.addRelationship(relationship);
    };
    /**
     * Adds a tiles relationship between the base table and related tile
     * table. Creates a default user mapping table if needed.
     * @param  {module:extension/relatedTables~Relationship|module:extension/relatedTables~ExtendedRelation} relationship relationship to add
     * @return {Promise<ExtendedRelation>}
     */
    RelatedTablesExtension.prototype.addTilesRelationship = function (relationship) {
        if (relationship instanceof extendedRelation_1.ExtendedRelation) {
            relationship.relation_name = relationship.relation_name || relationType_1.RelationType.TILES.name;
        }
        else {
            relationship.relationType = relationType_1.RelationType.TILES;
        }
        return this.addRelationship(relationship);
    };
    /**
     * Adds an attributes relationship between the base table and related attribute
     * table. Creates a default user mapping table if needed.
     * @param  {module:extension/relatedTables~Relationship|module:extension/relatedTables~ExtendedRelation} relationship relationship to add
     * @return {Promise<ExtendedRelation>}
     */
    RelatedTablesExtension.prototype.addAttributesRelationship = function (relationship) {
        if (relationship instanceof extendedRelation_1.ExtendedRelation) {
            relationship.relation_name = relationship.relation_name || relationType_1.RelationType.ATTRIBUTES.name;
        }
        else {
            relationship.relationType = relationType_1.RelationType.ATTRIBUTES;
        }
        return this.addRelationship(relationship);
    };
    /**
     * Adds a simple attributes relationship between the base table and user
     * simple attributes related table. Creates a default user mapping table and
     * the simple attributes table if needed.
     * @param  {module:extension/relatedTables~Relationship|module:extension/relatedTables~ExtendedRelation} relationship relationship to add
     * @return {Promise<ExtendedRelation>}
     */
    RelatedTablesExtension.prototype.addSimpleAttributesRelationship = function (relationship) {
        if (relationship instanceof extendedRelation_1.ExtendedRelation) {
            relationship.relation_name = relationship.relation_name || relationType_1.RelationType.SIMPLE_ATTRIBUTES.name;
        }
        else {
            relationship.relationType = relationType_1.RelationType.SIMPLE_ATTRIBUTES;
        }
        return this.addRelationship(relationship);
    };
    /**
     * Adds a media relationship between the base table and user media related
     * table. Creates a default user mapping table and the media table if
     * needed.
     * @param  {module:extension/relatedTables~Relationship|module:extension/relatedTables~ExtendedRelation} relationship relationship to add
     * @return {Promise<ExtendedRelation>}
     */
    RelatedTablesExtension.prototype.addMediaRelationship = function (relationship) {
        if (relationship instanceof extendedRelation_1.ExtendedRelation) {
            relationship.relation_name = relationship.relation_name || relationType_1.RelationType.MEDIA.name;
        }
        else {
            relationship.relationType = relationType_1.RelationType.MEDIA;
        }
        return this.addRelationship(relationship);
    };
    /**
     * Remove a specific relationship from the GeoPackage
     * @param  {module:extension/relatedTables~Relationship|module:extension/relatedTables~ExtendedRelation} relationship relationship to remove
     * @return {Number} number of relationships removed
     */
    RelatedTablesExtension.prototype.removeRelationship = function (relationship) {
        var e_1, _a, e_2, _b;
        var _this = this;
        var relationName;
        var relatedTableName;
        var baseTableName;
        var userMappingTable;
        if (relationship instanceof extendedRelation_1.ExtendedRelation) {
            relationName = relationship.relation_name;
            relatedTableName = relationship.related_table_name;
            baseTableName = relationship.base_table_name;
            userMappingTable = relationship.mapping_table_name;
        }
        else {
            relationName = relationship.relationName;
            relatedTableName = relationship.relatedTableName;
            baseTableName = relationship.baseTableName;
            userMappingTable = relationship.userMappingTable;
            if (relationship.relationType) {
                relationName = relationship.relationType.name;
            }
            if (relationship.relationAuthor) {
                relationName = this.buildRelationName(relationship.relationAuthor, relationName);
            }
        }
        if (this.extendedRelationDao.isTableExists()) {
            var values = new columnValues_1.ColumnValues();
            values.addColumn(extendedRelationDao_1.ExtendedRelationDao.COLUMN_BASE_TABLE_NAME, baseTableName);
            values.addColumn(extendedRelationDao_1.ExtendedRelationDao.COLUMN_RELATED_TABLE_NAME, relatedTableName);
            values.addColumn(extendedRelationDao_1.ExtendedRelationDao.COLUMN_RELATION_NAME, relationName);
            values.addColumn(extendedRelationDao_1.ExtendedRelationDao.COLUMN_MAPPING_TABLE_NAME, userMappingTable);
            var iterator = this.extendedRelationDao.queryForFieldValues(values);
            var tablesToDelete = [];
            var relationsToDelete = [];
            try {
                for (var iterator_1 = __values(iterator), iterator_1_1 = iterator_1.next(); !iterator_1_1.done; iterator_1_1 = iterator_1.next()) {
                    var extendedRelation = iterator_1_1.value;
                    tablesToDelete.push(extendedRelation.mapping_table_name);
                    relationsToDelete.push(extendedRelation);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (iterator_1_1 && !iterator_1_1.done && (_a = iterator_1.return)) _a.call(iterator_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            tablesToDelete.forEach(function (table) {
                _this.geoPackage.deleteTable(table);
            });
            this.extensionsDao.deleteByExtensionAndTableName(RelatedTablesExtension.EXTENSION_NAME, userMappingTable);
            try {
                for (var relationsToDelete_1 = __values(relationsToDelete), relationsToDelete_1_1 = relationsToDelete_1.next(); !relationsToDelete_1_1.done; relationsToDelete_1_1 = relationsToDelete_1.next()) {
                    var extendedRelation = relationsToDelete_1_1.value;
                    this.extendedRelationDao.delete(extendedRelation);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (relationsToDelete_1_1 && !relationsToDelete_1_1.done && (_b = relationsToDelete_1.return)) _b.call(relationsToDelete_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return tablesToDelete.length;
        }
        return 0;
    };
    /**
     * Create a default user mapping table and extension row if either does not
     * exist. When not created, there is no guarantee that an existing table has
     * the same schema as the provided tabled.
     * @param  {string | UserMappingTable} userMappingTableOrName user mapping table or name
     * @return {Promise<Boolean>}
     */
    RelatedTablesExtension.prototype.createUserMappingTable = function (userMappingTableOrName) {
        var umt;
        if (userMappingTableOrName instanceof userMappingTable_1.UserMappingTable) {
            umt = userMappingTableOrName;
        }
        else {
            umt = userMappingTable_1.UserMappingTable.create(userMappingTableOrName);
        }
        this.getOrCreateMappingTable(umt.getTableName());
        if (!this.geoPackage.isTable(umt.getTableName())) {
            return !!this.geoPackage.tableCreator.createUserTable(umt);
        }
        return true;
    };
    /**
     * Create a user related table if it does not exist. When not created, there
     * is no guarantee that an existing table has the same schema as the
     * provided tabled.
     * @param  {module:extension/relatedTables~UserRelatedTable} relatedTable user related table
     * @return {Boolean} true if the table now exists
     */
    RelatedTablesExtension.prototype.createRelatedTable = function (relatedTable) {
        if (!this.geoPackage.isTable(relatedTable.getTableName())) {
            this.geoPackage.tableCreator.createUserTable(relatedTable);
            var contents = new contents_1.Contents();
            contents.table_name = relatedTable.getTableName();
            contents.data_type = relatedTable.data_type;
            contents.identifier = relatedTable.getTableName();
            this.geoPackage.contentsDao.create(contents);
            var refreshed = this.geoPackage.contentsDao.refresh(contents);
            relatedTable.setContents(refreshed);
        }
        return true;
    };
    /**
     * Validate that the relation name is valid between the base and related tables
     * @param  {string} baseTableName    base table name
     * @param  {string} relatedTableName related table name
     * @param  {string} relationName     relation name
     * @return {Boolean}
     */
    RelatedTablesExtension.prototype.validateRelationship = function (baseTableName, relatedTableName, relationName) {
        // Verify the base and related tables exist
        if (!this.geoPackage.isTable(baseTableName)) {
            console.log('Base relationship table does not exist: ' + baseTableName + ', Relation: ' + relationName);
            return false;
        }
        if (!this.geoPackage.isTable(relatedTableName)) {
            console.log('Related relationship table does not exist: ' + relatedTableName + ', Relation: ' + relationName);
            return false;
        }
        // Verify spec defined relation types
        var relationType = relationType_1.RelationType.fromName(relationName);
        if (relationType) {
            if (!this.geoPackage.isTableType(relationType.dataType, relatedTableName)) {
                console.log('The related table must be a ' +
                    relationType.dataType +
                    ' table.  Related Table: ' +
                    relatedTableName +
                    ', Type: ' +
                    this.geoPackage.getTableType(relatedTableName));
                return false;
            }
            return true;
        }
        return true;
    };
    /**
     * Get the related id mappings for the base id
     * @param  {string} mappingTableName mapping table name
     * @param  {Number} baseId           base id
     * @return {Number[]} ids of related items
     */
    RelatedTablesExtension.prototype.getMappingsForBase = function (mappingTableName, baseId) {
        var mappingDao = this.getMappingDao(mappingTableName);
        var results = mappingDao.queryByBaseId(baseId);
        var relatedIds = [];
        for (var i = 0; i < results.length; i++) {
            var row = mappingDao.getUserMappingRow(results[i]);
            relatedIds.push(row.relatedId);
        }
        return relatedIds;
    };
    /**
     * Get the related id mapping rows for the base id
     * @param  {string} mappingTableName mapping table name
     * @param  {Number} baseId           base id
     * @return {module:extension/relatedTables~UserMappingRow[]} user mapping rows
     */
    RelatedTablesExtension.prototype.getMappingRowsForBase = function (mappingTableName, baseId) {
        var mappingDao = this.getMappingDao(mappingTableName);
        var mappingRows = [];
        var rows = mappingDao.queryByBaseId(baseId);
        rows.forEach(function (row) {
            mappingRows.push(mappingDao.getUserMappingRow(row));
        });
        return mappingRows;
    };
    /**
     * Get the base id mappings for the base id
     * @param  {string} mappingTableName mapping table name
     * @param  {Number} relatedId           related id
     * @return {Number[]} ids of base items
     */
    RelatedTablesExtension.prototype.getMappingsForRelated = function (mappingTableName, relatedId) {
        var mappingDao = this.getMappingDao(mappingTableName);
        var results = mappingDao.queryByRelatedId(relatedId);
        var baseIds = [];
        for (var i = 0; i < results.length; i++) {
            var row = mappingDao.getUserMappingRow(results[i]);
            baseIds.push(row.baseId);
        }
        return baseIds;
    };
    /**
     * Returns a {module:extension/relatedTables~MediaDao} from the table specified
     * @param  {string|MediaTable|ExtendedRelation} tableName either a table name or a MediaTable
     * @return {module:extension/relatedTables~MediaDao}
     */
    RelatedTablesExtension.prototype.getMediaDao = function (tableName) {
        var table;
        if (tableName instanceof mediaTable_1.MediaTable) {
            table = tableName.getTableName();
        }
        else if (tableName instanceof extendedRelation_1.ExtendedRelation) {
            table = tableName.related_table_name;
        }
        else if (typeof tableName === 'string') {
            table = tableName;
        }
        var reader = new userCustomTableReader_1.UserCustomTableReader(table);
        var userTable = reader.readTable(this.geoPackage.database);
        table = new mediaTable_1.MediaTable(userTable.getTableName(), userTable.getUserColumns().getColumns(), mediaTable_1.MediaTable.requiredColumns());
        table.setContents(this.geoPackage.contentsDao.queryForId(userTable.getTableName()));
        return new mediaDao_1.MediaDao(this.geoPackage, table);
    };
    /**
     * Returns a {module:extension/relatedTables~SimpleAttributesDao} from the table specified
     * @param  {string|SimpleAttributesTable|ExtendedRelation} tableName either a table name or a SimpleAttributesDao
     * @return {module:extension/relatedTables~SimpleAttributesDao}
     */
    RelatedTablesExtension.prototype.getSimpleAttributesDao = function (tableName) {
        var table;
        if (tableName instanceof simpleAttributesTable_1.SimpleAttributesTable && tableName.TABLE_TYPE === 'simple_attributes') {
            table = tableName;
        }
        else {
            if (tableName instanceof extendedRelation_1.ExtendedRelation) {
                table = tableName.related_table_name;
            }
            var reader = new userCustomTableReader_1.UserCustomTableReader(table);
            var userTable = reader.readTable(this.geoPackage.database);
            table = new simpleAttributesTable_1.SimpleAttributesTable(userTable.getTableName(), userTable.getUserColumns().getColumns(), simpleAttributesTable_1.SimpleAttributesTable.requiredColumns());
            table.setContents(this.geoPackage.contentsDao.queryForId(table.getTableName()));
        }
        return new simpleAttributesDao_1.SimpleAttributesDao(this.geoPackage, table);
    };
    /**
     * Builds the custom relation name with the author
     * @param  {string} author author
     * @param  {string} name   name
     * @return {string}
     */
    RelatedTablesExtension.prototype.buildRelationName = function (author, name) {
        return 'x-' + author + '_' + name;
    };
    /**
     * Remove all traces of the extension
     */
    RelatedTablesExtension.prototype.removeExtension = function () {
        if (this.extendedRelationDao.isTableExists()) {
            var extendedRelations = this.extendedRelationDao.queryForAll();
            extendedRelations.forEach(function (relation) {
                return this.geoPackage.deleteTable(relation.mapping_table_name);
            }.bind(this));
            this.geoPackage.deleteTable(extendedRelationDao_1.ExtendedRelationDao.TABLE_NAME);
        }
        if (this.extensionsDao.isTableExists()) {
            this.extensionsDao.deleteByExtension(RelatedTablesExtension.EXTENSION_NAME);
        }
    };
    /**
     * Determine if the GeoPackage has the extension
     * @param  {String} [mappingTableName] mapping table name to check, if not specified, this checks for any mapping table name
     * @return {Boolean}
     */
    RelatedTablesExtension.prototype.has = function (mappingTableName) {
        if (mappingTableName) {
            return (this.hasExtension(RelatedTablesExtension.EXTENSION_NAME, extendedRelationDao_1.ExtendedRelationDao.TABLE_NAME, null) &&
                this.hasExtension(RelatedTablesExtension.EXTENSION_NAME, mappingTableName, null)) || (this.hasExtension(RelatedTablesExtension.EXTENSION_RELATED_TABLES_NAME_NO_AUTHOR, extendedRelationDao_1.ExtendedRelationDao.TABLE_NAME, null) &&
                this.hasExtension(RelatedTablesExtension.EXTENSION_RELATED_TABLES_NAME_NO_AUTHOR, mappingTableName, null));
        }
        return this.hasExtension(RelatedTablesExtension.EXTENSION_NAME, extendedRelationDao_1.ExtendedRelationDao.TABLE_NAME, null) ||
            this.hasExtension(RelatedTablesExtension.EXTENSION_RELATED_TABLES_NAME_NO_AUTHOR, extendedRelationDao_1.ExtendedRelationDao.TABLE_NAME, null);
    };
    RelatedTablesExtension.RelationshipBuilder = function () {
        return optionBuilder_1.OptionBuilder.build([
            'baseTableName',
            'relatedTableName',
            'userMappingTable',
            'mappingTableName',
            'relationName',
            'relationAuthor',
            'relationType',
            'relatedTable',
        ]);
    };
    RelatedTablesExtension.prototype.removeRelationships = function (table) {
        var _this = this;
        try {
            if (this.extendedRelationDao.isTableExists()) {
                var extendedRelations = this.extendedRelationDao.getTableRelations(table);
                extendedRelations.forEach(function (extendedRelation) {
                    _this.removeRelationship(extendedRelation);
                });
            }
        }
        catch (e) {
            throw new Error("Failed to remove relationships for table: " + table);
        }
    };
    /**
     * Remove all relationships with the mapping table
     * @param mappingTable mapping table
     */
    RelatedTablesExtension.prototype.removeRelationshipsWithMappingTable = function (mappingTable) {
        var _this = this;
        try {
            if (this.extendedRelationDao.isTableExists()) {
                var extendedRelations = this.extendedRelationDao.queryByMappingTableName(mappingTable);
                extendedRelations.forEach(function (extendedRelation) {
                    _this.removeRelationship(extendedRelation);
                });
            }
        }
        catch (e) {
            throw new Error("Failed to remove relationships for mapping table: " + mappingTable);
        }
    };
    RelatedTablesExtension.EXTENSION_NAME = 'gpkg_related_tables';
    RelatedTablesExtension.EXTENSION_RELATED_TABLES_AUTHOR = 'gpkg';
    RelatedTablesExtension.EXTENSION_RELATED_TABLES_NAME_NO_AUTHOR = 'related_tables';
    RelatedTablesExtension.EXTENSION_RELATED_TABLES_DEFINITION = 'TBD';
    return RelatedTablesExtension;
}(baseExtension_1.BaseExtension));
exports.RelatedTablesExtension = RelatedTablesExtension;
//# sourceMappingURL=index.js.map