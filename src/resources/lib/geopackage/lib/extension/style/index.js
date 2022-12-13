"use strict";
/**
 * @module extension/style
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureStyleExtension = void 0;
var baseExtension_1 = require("../baseExtension");
var extension_1 = require("../extension");
var contentsIdDao_1 = require("../contents/contentsIdDao");
var iconTable_1 = require("./iconTable");
var iconDao_1 = require("./iconDao");
var styleTable_1 = require("./styleTable");
var styleDao_1 = require("./styleDao");
var styleMappingTable_1 = require("./styleMappingTable");
var styleMappingDao_1 = require("./styleMappingDao");
var styleTableReader_1 = require("./styleTableReader");
var featureTable_1 = require("../../features/user/featureTable");
var featureStyles_1 = require("./featureStyles");
var featureStyle_1 = require("./featureStyle");
var styles_1 = require("./styles");
var icons_1 = require("./icons");
var userCustomTableReader_1 = require("../../user/custom/userCustomTableReader");
var geometryType_1 = require("../../features/user/geometryType");
/**
 * Style extension
 * @param  {module:geoPackage~GeoPackage} geoPackage GeoPackage object
 * @extends BaseExtension
 * @constructor
 */
var FeatureStyleExtension = /** @class */ (function (_super) {
    __extends(FeatureStyleExtension, _super);
    function FeatureStyleExtension(geoPackage) {
        var _this = _super.call(this, geoPackage) || this;
        _this.relatedTablesExtension = geoPackage.relatedTablesExtension;
        _this.contentsIdExtension = geoPackage.contentsIdExtension;
        return _this;
    }
    /**
     * Get or create the metadata extension
     *  @param {module:features/user/featureTable|String} featureTable, defaults to null
     * @return {Promise}
     */
    FeatureStyleExtension.prototype.getOrCreateExtension = function (featureTable) {
        return this.getOrCreate(FeatureStyleExtension.EXTENSION_NAME, this.getFeatureTableName(featureTable), null, FeatureStyleExtension.EXTENSION_DEFINITION, extension_1.Extension.READ_WRITE);
    };
    /**
     * Determine if the GeoPackage has the extension or has the extension for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @returns {Boolean}
     */
    FeatureStyleExtension.prototype.has = function (featureTable) {
        return this.hasExtension(FeatureStyleExtension.EXTENSION_NAME, this.getFeatureTableName(featureTable), null);
    };
    /**
     * Gets featureTables
     * @returns {String[]}
     */
    FeatureStyleExtension.prototype.getTables = function () {
        var tables = [];
        if (this.extensionsDao.isTableExists()) {
            var extensions = this.extensionsDao.queryAllByExtension(FeatureStyleExtension.EXTENSION_NAME);
            for (var i = 0; i < extensions.length; i++) {
                tables.push(extensions[i].table_name);
            }
        }
        return tables;
    };
    /**
     * Get the related tables extension
     * @returns {module:extension/relatedTables~RelatedTablesExtension}
     */
    FeatureStyleExtension.prototype.getRelatedTables = function () {
        return this.relatedTablesExtension;
    };
    /**
     * Get the contentsId extension
     * @returns {module:extension/contents~ContentsIdExtension}
     */
    FeatureStyleExtension.prototype.getContentsId = function () {
        return this.contentsIdExtension;
    };
    /**
     * Create style, icon, table style, and table icon relationships for the
     * feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {any}
     */
    FeatureStyleExtension.prototype.createRelationships = function (featureTable) {
        return {
            styleRelationship: this.createStyleRelationship(featureTable),
            tableStyleRelationship: this.createTableStyleRelationship(featureTable),
            iconRelationship: this.createIconRelationship(featureTable),
            tableIconRelationship: this.createTableIconRelationship(featureTable),
        };
    };
    /**
     * Check if feature table has a style, icon, table style, or table icon
     * relationships
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @returns {boolean}
     */
    FeatureStyleExtension.prototype.hasRelationship = function (featureTable) {
        return (this.hasStyleRelationship(featureTable) ||
            this.hasTableStyleRelationship(featureTable) ||
            this.hasIconRelationship(featureTable) ||
            this.hasTableIconRelationship(featureTable));
    };
    /**
     * Create a style relationship for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {any}
     */
    FeatureStyleExtension.prototype.createStyleRelationship = function (featureTable) {
        return this._createStyleRelationship(this.getMappingTableName(FeatureStyleExtension.TABLE_MAPPING_STYLE, featureTable), this.getFeatureTableName(featureTable), this.getFeatureTableName(featureTable), styleTable_1.StyleTable.TABLE_NAME);
    };
    /**
     * Determine if a style relationship exists for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @returns {boolean}
     */
    FeatureStyleExtension.prototype.hasStyleRelationship = function (featureTable) {
        return this._hasStyleRelationship(this.getMappingTableName(FeatureStyleExtension.TABLE_MAPPING_STYLE, featureTable), this.getFeatureTableName(featureTable), styleTable_1.StyleTable.TABLE_NAME);
    };
    /**
     * Create a feature table style relationship
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {ExtendedRelation}
     */
    FeatureStyleExtension.prototype.createTableStyleRelationship = function (featureTable) {
        return this._createStyleRelationship(this.getMappingTableName(FeatureStyleExtension.TABLE_MAPPING_TABLE_STYLE, featureTable), this.getFeatureTableName(featureTable), contentsIdDao_1.ContentsIdDao.TABLE_NAME, styleTable_1.StyleTable.TABLE_NAME);
    };
    /**
     * Determine if a feature table style relationship exists
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @returns {boolean} true if relationship exists
     */
    FeatureStyleExtension.prototype.hasTableStyleRelationship = function (featureTable) {
        return this._hasStyleRelationship(this.getMappingTableName(FeatureStyleExtension.TABLE_MAPPING_TABLE_STYLE, featureTable), contentsIdDao_1.ContentsIdDao.TABLE_NAME, styleTable_1.StyleTable.TABLE_NAME);
    };
    /**
     * Create an icon relationship for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {ExtendedRelation}
     */
    FeatureStyleExtension.prototype.createIconRelationship = function (featureTable) {
        return this._createStyleRelationship(this.getMappingTableName(FeatureStyleExtension.TABLE_MAPPING_ICON, featureTable), this.getFeatureTableName(featureTable), this.getFeatureTableName(featureTable), iconTable_1.IconTable.TABLE_NAME);
    };
    /**
     * Determine if an icon relationship exists for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @returns {boolean} true if relationship exists
     */
    FeatureStyleExtension.prototype.hasIconRelationship = function (featureTable) {
        return this._hasStyleRelationship(this.getMappingTableName(FeatureStyleExtension.TABLE_MAPPING_ICON, featureTable), this.getFeatureTableName(featureTable), iconTable_1.IconTable.TABLE_NAME);
    };
    /**
     * Create a feature table icon relationship
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {ExtendedRelation}
     */
    FeatureStyleExtension.prototype.createTableIconRelationship = function (featureTable) {
        return this._createStyleRelationship(this.getMappingTableName(FeatureStyleExtension.TABLE_MAPPING_TABLE_ICON, featureTable), this.getFeatureTableName(featureTable), contentsIdDao_1.ContentsIdDao.TABLE_NAME, iconTable_1.IconTable.TABLE_NAME);
    };
    /**
     * Determine if a feature table icon relationship exists
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @returns {Boolean} true if relationship exists
     */
    FeatureStyleExtension.prototype.hasTableIconRelationship = function (featureTable) {
        return this._hasStyleRelationship(this.getMappingTableName(FeatureStyleExtension.TABLE_MAPPING_TABLE_ICON, featureTable), contentsIdDao_1.ContentsIdDao.TABLE_NAME, iconTable_1.IconTable.TABLE_NAME);
    };
    /**
     * Get the mapping table name
     * @param tablePrefix table name prefix
     * @param {module:features/user/featureTable|String} featureTable feature table name
     * @returns {String} mapping table name
     */
    FeatureStyleExtension.prototype.getMappingTableName = function (tablePrefix, featureTable) {
        return tablePrefix + this.getFeatureTableName(featureTable);
    };
    /**
     * Check if the style extension relationship between a feature table and
     * style extension table exists
     * @param {String} mappingTableName mapping table name
     * @param {String} baseTable base table name
     * @param {String} relatedTable related table name
     * @returns {boolean} true if relationship exists
     */
    FeatureStyleExtension.prototype._hasStyleRelationship = function (mappingTableName, baseTable, relatedTable) {
        return this.relatedTablesExtension.hasRelations(baseTable, relatedTable, mappingTableName);
    };
    /**
     * Create a style extension relationship between a feature table and style
     * extension table
     * @param {String} mappingTableName mapping table name
     * @param {String} featureTable feature table
     * @param {String} baseTable base table name
     * @param {String} relatedTable related table name
     * @return {ExtendedRelation}
     * @private
     */
    FeatureStyleExtension.prototype._createStyleRelationship = function (mappingTableName, featureTable, baseTable, relatedTable) {
        if (!this._hasStyleRelationship(mappingTableName, baseTable, relatedTable)) {
            // Create the extension
            this.getOrCreateExtension(featureTable);
            if (baseTable === contentsIdDao_1.ContentsIdDao.TABLE_NAME && !this.contentsIdExtension.has()) {
                this.contentsIdExtension.getOrCreateExtension();
            }
            return this._handleCreateStyleRelationship(mappingTableName, baseTable, relatedTable);
        }
        else {
            var relationships = this.geoPackage.extendedRelationDao.getRelations(baseTable, relatedTable, mappingTableName);
            // TODO this isn't quite right
            return relationships[0];
        }
    };
    /**
     * Private function to aid in creation of the a style extension relationship between a feature table and style extension table
     * @param {String} mappingTableName
     * @param {String} baseTable
     * @param {String} relatedTable
     * @return {ExtendedRelation}
     * @private
     */
    FeatureStyleExtension.prototype._handleCreateStyleRelationship = function (mappingTableName, baseTable, relatedTable) {
        if (relatedTable === styleTable_1.StyleTable.TABLE_NAME) {
            return this.relatedTablesExtension.addAttributesRelationship(this.geoPackage.relatedTablesExtension
                .getRelationshipBuilder()
                .setBaseTableName(baseTable)
                .setUserMappingTable(styleMappingTable_1.StyleMappingTable.create(mappingTableName))
                .setRelatedTable(styleTable_1.StyleTable.create()));
        }
        else {
            return this.relatedTablesExtension.addMediaRelationship(this.geoPackage.relatedTablesExtension
                .getRelationshipBuilder()
                .setBaseTableName(baseTable)
                .setUserMappingTable(styleMappingTable_1.StyleMappingTable.create(mappingTableName))
                .setRelatedTable(iconTable_1.IconTable.create()));
        }
    };
    /**
     * Delete the style and icon table and row relationships for all feature
     * tables
     */
    FeatureStyleExtension.prototype.deleteAllRelationships = function () {
        var removed = {
            styleRelationships: 0,
            tableStyleRelationships: 0,
            iconRelationship: 0,
            tableIconRelationship: 0,
        };
        var tables = this.getTables();
        for (var i = 0; i < tables.length; i++) {
            var _a = this.deleteRelationships(tables[i]), styleRelationships = _a.styleRelationships, tableStyleRelationships = _a.tableStyleRelationships, iconRelationship = _a.iconRelationship, tableIconRelationship = _a.tableIconRelationship;
            removed.styleRelationships += styleRelationships;
            removed.tableStyleRelationships += tableStyleRelationships;
            removed.iconRelationship += iconRelationship;
            removed.tableIconRelationship += tableIconRelationship;
        }
        return removed;
    };
    /**
     * Delete the style and icon table and row relationships for the feature
     * table
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteRelationships = function (featureTable) {
        return {
            styleRelationships: this.deleteStyleRelationship(featureTable),
            tableStyleRelationships: this.deleteTableStyleRelationship(featureTable),
            iconRelationship: this.deleteIconRelationship(featureTable),
            tableIconRelationship: this.deleteTableIconRelationship(featureTable),
        };
    };
    /**
     * Delete a style relationship for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteStyleRelationship = function (featureTable) {
        return this._deleteStyleRelationship(this.getMappingTableName(FeatureStyleExtension.TABLE_MAPPING_STYLE, featureTable), featureTable);
    };
    /**
     * Delete a table style relationship for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteTableStyleRelationship = function (featureTable) {
        return this._deleteStyleRelationship(this.getMappingTableName(FeatureStyleExtension.TABLE_MAPPING_TABLE_STYLE, featureTable), featureTable);
    };
    /**
     * Delete a icon relationship for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteIconRelationship = function (featureTable) {
        return this._deleteStyleRelationship(this.getMappingTableName(FeatureStyleExtension.TABLE_MAPPING_ICON, featureTable), featureTable);
    };
    /**
     * Delete a table icon relationship for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteTableIconRelationship = function (featureTable) {
        return this._deleteStyleRelationship(this.getMappingTableName(FeatureStyleExtension.TABLE_MAPPING_TABLE_ICON, featureTable), featureTable);
    };
    /**
     * Delete a style extension feature table relationship and the mapping table
     * @param {String} mappingTableName
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @private
     */
    FeatureStyleExtension.prototype._deleteStyleRelationship = function (mappingTableName, featureTable) {
        var removed = 0;
        this.relatedTablesExtension.removeRelationshipsWithMappingTable(mappingTableName);
        if (!this.hasRelationship(featureTable)) {
            if (this.extensionsDao.isTableExists()) {
                this.extensionsDao.deleteByExtensionAndTableName(FeatureStyleExtension.EXTENSION_NAME, this.getFeatureTableName(featureTable));
            }
        }
        return removed;
    };
    /**
     * Get a Style Mapping DAO
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.StyleMappingDao} style mapping DAO
     */
    FeatureStyleExtension.prototype.getStyleMappingDao = function (featureTable) {
        return this._getMappingDao(FeatureStyleExtension.TABLE_MAPPING_STYLE, featureTable);
    };
    /**
     * Get a Table Style Mapping DAO
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.StyleMappingDao} table style mapping DAO
     */
    FeatureStyleExtension.prototype.getTableStyleMappingDao = function (featureTable) {
        return this._getMappingDao(FeatureStyleExtension.TABLE_MAPPING_TABLE_STYLE, featureTable);
    };
    /**
     * Get a Icon Mapping DAO
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.StyleMappingDao} icon mapping DAO
     */
    FeatureStyleExtension.prototype.getIconMappingDao = function (featureTable) {
        return this._getMappingDao(FeatureStyleExtension.TABLE_MAPPING_ICON, featureTable);
    };
    /**
     * Get a Table Icon Mapping DAO
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.StyleMappingDao} table icon mapping DAO
     */
    FeatureStyleExtension.prototype.getTableIconMappingDao = function (featureTable) {
        return this._getMappingDao(FeatureStyleExtension.TABLE_MAPPING_TABLE_ICON, featureTable);
    };
    /**
     * Get a Style Mapping DAO from a table name
     * @param {String} tablePrefix table name prefix
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.StyleMappingDao} style mapping dao
     * @private
     */
    FeatureStyleExtension.prototype._getMappingDao = function (tablePrefix, featureTable) {
        var featureTableName = this.getFeatureTableName(featureTable);
        var tableName = tablePrefix + featureTableName;
        var dao = null;
        if (this.geoPackage.isTable(tableName)) {
            dao = new styleMappingDao_1.StyleMappingDao(this.relatedTablesExtension.getUserDao(tableName), this.geoPackage);
        }
        return dao;
    };
    /**
     * Get a style DAO
     * @return {module:extension/style.StyleDao} style DAO
     */
    FeatureStyleExtension.prototype.getStyleDao = function () {
        var styleDao = null;
        if (this.geoPackage.isTable(styleTable_1.StyleTable.TABLE_NAME)) {
            var contents = this.geoPackage.contentsDao.queryForId(styleTable_1.StyleTable.TABLE_NAME);
            if (contents) {
                var reader = new styleTableReader_1.StyleTableReader(contents.table_name);
                var table = reader.readTable(this.geoPackage.connection);
                table.setContents(contents);
                styleDao = new styleDao_1.StyleDao(this.geoPackage, table);
            }
        }
        return styleDao;
    };
    /**
     * Get a icon DAO
     * @return {module:extension/style.IconDao}
     */
    FeatureStyleExtension.prototype.getIconDao = function () {
        var iconDao = null;
        if (this.geoPackage.isTable(iconTable_1.IconTable.TABLE_NAME)) {
            var reader = new userCustomTableReader_1.UserCustomTableReader(iconTable_1.IconTable.TABLE_NAME);
            var userTable = reader.readTable(this.geoPackage.database);
            var table = new iconTable_1.IconTable(userTable.getTableName(), userTable.getUserColumns().getColumns(), iconTable_1.IconTable.requiredColumns());
            table.setContents(this.geoPackage.contentsDao.queryForId(iconTable_1.IconTable.TABLE_NAME));
            iconDao = new iconDao_1.IconDao(this.geoPackage, table);
        }
        return iconDao;
    };
    /**
     * Get the feature table default feature styles
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.FeatureStyles} table feature styles or null
     */
    FeatureStyleExtension.prototype.getTableFeatureStyles = function (featureTable) {
        var featureStyles = null;
        var id = this.contentsIdExtension.getIdByTableName(this.getFeatureTableName(featureTable));
        if (id !== null) {
            var styles = this.getTableStyles(featureTable);
            var icons = this.getTableIcons(featureTable);
            if (styles !== null || icons !== null) {
                featureStyles = new featureStyles_1.FeatureStyles(styles, icons);
            }
        }
        return featureStyles;
    };
    /**
     * Get the default style of the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.StyleRow} style row
     */
    FeatureStyleExtension.prototype.getTableStyleDefault = function (featureTable) {
        return this.getTableStyle(featureTable, null);
    };
    /**
     * Get the style of the feature table and geometry type
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {GeometryType} geometryType geometry type
     * @return {module:extension/style.StyleRow} style row
     */
    FeatureStyleExtension.prototype.getTableStyle = function (featureTable, geometryType) {
        var style = null;
        var styles = this.getTableStyles(featureTable);
        if (styles !== null) {
            if (geometryType === null) {
                style = styles.getDefault();
            }
            else {
                style = styles.getStyle(geometryType);
            }
        }
        return style;
    };
    /**
     * Get the feature table default styles
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.Styles} table styles or null
     */
    FeatureStyleExtension.prototype.getTableStyles = function (featureTable) {
        var styles = null;
        var id = this.contentsIdExtension.getIdByTableName(this.getFeatureTableName(featureTable));
        if (id !== null) {
            styles = this.getStyles(id, this.getTableStyleMappingDao(featureTable), true);
        }
        return styles;
    };
    /**
     * Get the default icon of the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.IconRow} icon row
     */
    FeatureStyleExtension.prototype.getTableIconDefault = function (featureTable) {
        return this.getTableIcon(featureTable, null);
    };
    /**
     * Get the icon of the feature table and geometry type
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {GeometryType} geometryType geometry type
     * @return {module:extension/style.IconRow} icon row
     */
    FeatureStyleExtension.prototype.getTableIcon = function (featureTable, geometryType) {
        var icon = null;
        var icons = this.getTableIcons(featureTable);
        if (icons !== null) {
            if (geometryType === null) {
                icon = icons.getDefault();
            }
            else {
                icon = icons.getIcon(geometryType);
            }
        }
        return icon;
    };
    /**
     * Get the feature table default icons
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.Icons} table icons or null
     */
    FeatureStyleExtension.prototype.getTableIcons = function (featureTable) {
        var icons = null;
        var id = this.contentsIdExtension.getIdByTableName(this.getFeatureTableName(featureTable));
        if (id !== null) {
            icons = this.getIcons(id, this.getTableIconMappingDao(featureTable), true);
        }
        return icons;
    };
    /**
     * Gets Icons for featureId and mappingDao
     * @param {Number} featureId
     * @param mappingDao
     * @param {boolean} tableIcons
     * @returns {module:extension/style.Icons}
     * @private
     */
    FeatureStyleExtension.prototype.getIcons = function (featureId, mappingDao, tableIcons) {
        if (tableIcons === void 0) { tableIcons = false; }
        var icons = new icons_1.Icons(tableIcons);
        if (mappingDao !== null) {
            var iconDao = this.getIconDao();
            var styleMappingRows = mappingDao.queryByBaseId(featureId);
            for (var i = 0; i < styleMappingRows.length; i++) {
                var styleMappingRow = mappingDao.createObject(styleMappingRows[i]);
                var iconRow = iconDao.queryForId(styleMappingRow.relatedId);
                if (styleMappingRow.getGeometryTypeName() === null) {
                    icons.setDefault(iconRow);
                }
                else {
                    icons.setIcon(iconRow, geometryType_1.GeometryType.fromName(styleMappingRow.getGeometryTypeName().toUpperCase()));
                }
            }
        }
        if (icons.isEmpty()) {
            icons = null;
        }
        return icons;
    };
    /**
     * Gets Styles for featureId and mappingDao
     * @param {Number} featureId
     * @param {module:extension/style.StyleMappingDao} mappingDao
     * @param {boolean} tableStyles
     * @returns {module:extension/style.Styles}
     */
    FeatureStyleExtension.prototype.getStyles = function (featureId, mappingDao, tableStyles) {
        if (tableStyles === void 0) { tableStyles = false; }
        var styles = new styles_1.Styles(tableStyles);
        if (mappingDao !== null) {
            var styleDao = this.getStyleDao();
            var styleMappingRows = mappingDao.queryByBaseId(featureId);
            for (var i = 0; i < styleMappingRows.length; i++) {
                var styleMappingRow = mappingDao.createObject(styleMappingRows[i]);
                var styleRow = styleDao.queryForId(styleMappingRow.relatedId);
                if (styleMappingRow.getGeometryTypeName() === null) {
                    styles.setDefault(styleRow);
                }
                else {
                    styles.setStyle(styleRow, geometryType_1.GeometryType.fromName(styleMappingRow.getGeometryTypeName().toUpperCase()));
                }
            }
        }
        if (styles.isEmpty()) {
            styles = null;
        }
        return styles;
    };
    /**
     * Get the feature styles for the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @return {module:extension/style.FeatureStyles} feature styles or null
     */
    FeatureStyleExtension.prototype.getFeatureStylesForFeatureRow = function (featureRow) {
        return this.getFeatureStyles(featureRow.featureTable, featureRow.id);
    };
    /**
     * Get the feature styles for the feature row
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @return {module:extension/style.FeatureStyles} feature styles or null
     */
    FeatureStyleExtension.prototype.getFeatureStyles = function (featureTable, featureId) {
        var styles = this.getStyles(featureId, this.getStyleMappingDao(featureTable));
        var icons = this.getIcons(featureId, this.getIconMappingDao(featureTable));
        var featureStyles = null;
        if (styles !== null || icons !== null) {
            featureStyles = new featureStyles_1.FeatureStyles(styles, icons);
        }
        return featureStyles;
    };
    /**
     * Get the styles for the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @return {module:extension/style.Styles} styles or null
     */
    FeatureStyleExtension.prototype.getStylesForFeatureRow = function (featureRow) {
        return this.getStyles(featureRow.id, this.getStyleMappingDao(featureRow.featureTable.getTableName()));
    };
    /**
     * Get the styles for the feature id
     * @param {String} tableName table name
     * @param {Number} featureId feature id
     * @return {module:extension/style.Styles} styles or null
     */
    FeatureStyleExtension.prototype.getStylesForFeatureId = function (tableName, featureId) {
        return this.getStyles(featureId, this.getStyleMappingDao(tableName));
    };
    /**
     * Get the icons for the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @return {module:extension/style.Icons} icons or null
     */
    FeatureStyleExtension.prototype.getIconsForFeatureRow = function (featureRow) {
        return this.getIcons(featureRow.id, this.getIconMappingDao(featureRow.featureTable.getTableName()));
    };
    /**
     * Get the icons for the feature id
     * @param {String} tableName table name
     * @param {Number} featureId feature id
     * @return {module:extension/style.Icons} icons or null
     */
    FeatureStyleExtension.prototype.getIconsForFeatureId = function (tableName, featureId) {
        return this.getIcons(featureId, this.getIconMappingDao(tableName));
    };
    /**
     * Get the feature style (style and icon) of the feature row, searching in
     * order: feature geometry type style or icon, feature default style or
     * icon, table geometry type style or icon, table default style or icon
     * @param {module:features/user/featureRow} featureRow feature row
     * @return {module:extension/style.FeatureStyle} feature style
     */
    FeatureStyleExtension.prototype.getFeatureStyleForFeatureRow = function (featureRow) {
        return new featureStyle_1.FeatureStyle(this.getStyle(featureRow.featureTable.getTableName(), featureRow.id, geometryType_1.GeometryType.fromName(featureRow.geometryType.toUpperCase()), true), this.getIcon(featureRow.featureTable.getTableName(), featureRow.id, geometryType_1.GeometryType.fromName(featureRow.geometryType.toUpperCase()), true));
    };
    /**
     * Get the feature style (style and icon) of the feature, searching in
     * order: feature geometry type style or icon, feature default style or
     * icon, table geometry type style or icon, table default style or icon
     * @param {module:features/user/featureRow} featureRow feature row
     * @return {module:extension/style.FeatureStyle} feature style
     */
    FeatureStyleExtension.prototype.getFeatureStyleDefault = function (featureRow) {
        return new featureStyle_1.FeatureStyle(this.getStyle(featureRow.featureTable.getTableName(), featureRow.id, null, true), this.getIcon(featureRow.featureTable.getTableName(), featureRow.id, null, true));
    };
    /**
     * Get the icon of the feature, searching in order: feature geometry type
     * icon, feature default icon, when tableIcon enabled continue searching:
     * table geometry type icon, table default icon
     * @param {module:features/user/featureTable|String} featureTable
     * @param {Number} featureId
     * @param {GeometryType} geometryType
     * @param {Boolean} tableIcon
     * @returns {module:extension/style.IconRow}
     * @private
     */
    FeatureStyleExtension.prototype.getIcon = function (featureTable, featureId, geometryType, tableIcon) {
        var iconRow = null;
        var icons = this.getIcons(featureId, this.getIconMappingDao(featureTable));
        if (icons !== null) {
            iconRow = icons.getIcon(geometryType);
        }
        if (iconRow === null && tableIcon) {
            iconRow = this.getTableIcon(featureTable, geometryType);
        }
        return iconRow;
    };
    /**
     * Get the style of the feature, searching in order: feature geometry type
     * style, feature default style, when tableStyle enabled continue searching:
     * table geometry type style, table default style
     * @param {module:features/user/featureTable|String} featureTable
     * @param {Number} featureId
     * @param {GeometryType} geometryType
     * @param {Boolean} tableStyle
     * @returns {module:extension/style.StyleRow}
     * @private
     */
    FeatureStyleExtension.prototype.getStyle = function (featureTable, featureId, geometryType, tableStyle) {
        var styleRow = null;
        var styles = this.getStyles(featureId, this.getStyleMappingDao(featureTable));
        if (styles !== null) {
            styleRow = styles.getStyle(geometryType);
        }
        if (styleRow === null && tableStyle) {
            styleRow = this.getTableStyle(featureTable, geometryType);
        }
        return styleRow;
    };
    /**
     * Set the feature table default feature styles
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {module:extension/style.FeatureStyles} featureStyles feature styles
     * @return {any}
     */
    FeatureStyleExtension.prototype.setTableFeatureStyles = function (featureTable, featureStyles) {
        if (featureStyles !== null) {
            var tableStyles = this.setTableStyles(featureTable, featureStyles.styles);
            var tableIcons = this.setTableIcons(featureTable, featureStyles.icons);
            return {
                tableStyles: tableStyles,
                tableIcons: tableIcons,
            };
        }
        else {
            return {
                deleted: this.deleteTableFeatureStyles(featureTable),
                tableStyles: undefined,
                tableIcons: undefined,
            };
        }
    };
    /**
     * Set the feature table default styles
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {module:extension/style.Styles} styles default styles
     * @return {any}
     */
    FeatureStyleExtension.prototype.setTableStyles = function (featureTable, styles) {
        var deleted = this.deleteTableStyles(featureTable);
        if (styles !== null) {
            var styleIdList = [];
            var styleDefault = undefined;
            if (styles.getDefault() !== null) {
                styleDefault = this.setTableStyleDefault(featureTable, styles.getDefault());
            }
            var keys = styles.getGeometryTypes();
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = styles.getStyle(key);
                styleIdList.push(this.setTableStyle(featureTable, key, value));
            }
            return {
                styleDefault: styleDefault,
                styles: styleIdList,
                deleted: deleted,
            };
        }
    };
    /**
     * Set the feature table style default
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {module:extension/style.StyleRow} style style row
     * @return {number}
     */
    FeatureStyleExtension.prototype.setTableStyleDefault = function (featureTable, style) {
        return this.setTableStyle(featureTable, null, style);
    };
    /**
     * Set the feature table style for the geometry type
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.StyleRow} style style row
     * @return {number}
     */
    FeatureStyleExtension.prototype.setTableStyle = function (featureTable, geometryType, style) {
        this.deleteTableStyle(featureTable, geometryType);
        if (style !== null) {
            this.createTableStyleRelationship(featureTable);
            var featureContentsId = this.contentsIdExtension.getOrCreateIdByTableName(this.getFeatureTableName(featureTable));
            var styleId = this.getOrInsertStyle(style);
            var mappingDao = this.getTableStyleMappingDao(featureTable);
            return this.insertStyleMapping(mappingDao, featureContentsId.id, styleId, geometryType);
        }
    };
    /**
     * Set the feature table default icons
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {module:extension/style.Icons} icons default icons
     * @return {any}
     */
    FeatureStyleExtension.prototype.setTableIcons = function (featureTable, icons) {
        var deleted = this.deleteTableIcons(featureTable);
        if (icons !== null) {
            var iconDefault = undefined;
            var iconIdList = [];
            if (icons.getDefault() !== null) {
                iconDefault = this.setTableIconDefault(featureTable, icons.getDefault());
            }
            var keys = icons.getGeometryTypes();
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = icons.getIcon(key);
                iconIdList.push(this.setTableIcon(featureTable, key, value));
            }
            return {
                iconDefault: iconDefault,
                icons: iconIdList,
                deleted: deleted,
            };
        }
    };
    /**
     * Set the feature table icon default
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {module:extension/style.IconRow} icon icon row
     * @return {number}
     */
    FeatureStyleExtension.prototype.setTableIconDefault = function (featureTable, icon) {
        return this.setTableIcon(featureTable, null, icon);
    };
    /**
     * Set the feature table icon for the geometry type
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.IconRow} icon icon row
     * @return {number}
     */
    FeatureStyleExtension.prototype.setTableIcon = function (featureTable, geometryType, icon) {
        this.deleteTableIcon(featureTable, geometryType);
        if (icon !== null) {
            this.createTableIconRelationship(featureTable);
            var featureContentsId = this.contentsIdExtension.getOrCreateIdByTableName(this.getFeatureTableName(featureTable));
            var iconId = this.getOrInsertIcon(icon);
            var mappingDao = this.getTableIconMappingDao(featureTable);
            return this.insertStyleMapping(mappingDao, featureContentsId.id, iconId, geometryType);
        }
    };
    /**
     * Set the feature styles for the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.FeatureStyles} featureStyles feature styles
     * @return {any}
     */
    FeatureStyleExtension.prototype.setFeatureStylesForFeatureRow = function (featureRow, featureStyles) {
        return this.setFeatureStyles(featureRow.featureTable.getTableName(), featureRow.id, featureStyles);
    };
    /**
     * Set the feature styles for the feature table and feature id
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {module:extension/style.FeatureStyles} featureStyles feature styles
     * @return {any}
     */
    FeatureStyleExtension.prototype.setFeatureStyles = function (featureTable, featureId, featureStyles) {
        if (featureStyles !== null) {
            var styles = this.setStyles(featureTable, featureId, featureStyles.styles);
            var icons = this.setIcons(featureTable, featureId, featureStyles.icons);
            return {
                styles: styles,
                icons: icons,
            };
        }
        else {
            var deletedStyles = this.deleteStyles(featureTable); //, featureId);
            var deletedIcons = this.deleteIcons(featureTable); //, featureId);
            return {
                styles: undefined,
                icons: undefined,
                deleted: {
                    deletedStyles: deletedStyles,
                    deletedIcons: deletedIcons,
                },
            };
        }
    };
    /**
     * Set the feature style (style and icon) of the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.FeatureStyle} featureStyle feature style
     * @return {any}
     */
    FeatureStyleExtension.prototype.setFeatureStyleForFeatureRow = function (featureRow, featureStyle) {
        return this.setFeatureStyleForFeatureRowAndGeometryType(featureRow, geometryType_1.GeometryType.fromName(featureRow.geometryType.toUpperCase()), featureStyle);
    };
    /**
     * Set the feature style (style and icon) of the feature row for the
     * specified geometry type
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.FeatureStyle} featureStyle feature style
     * @return {any}
     */
    FeatureStyleExtension.prototype.setFeatureStyleForFeatureRowAndGeometryType = function (featureRow, geometryType, featureStyle) {
        return this.setFeatureStyle(featureRow.featureTable.getTableName(), featureRow.id, geometryType, featureStyle);
    };
    /**
     * Set the feature style default (style and icon) of the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.FeatureStyle} featureStyle feature style
     * @return {any}
     */
    FeatureStyleExtension.prototype.setFeatureStyleDefaultForFeatureRow = function (featureRow, featureStyle) {
        return this.setFeatureStyle(featureRow.featureTable.getTableName(), featureRow.id, null, featureStyle);
    };
    /**
     * Set the feature style (style and icon) of the feature
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.FeatureStyle} featureStyle feature style
     * @return {any}
     */
    FeatureStyleExtension.prototype.setFeatureStyle = function (featureTable, featureId, geometryType, featureStyle) {
        if (featureStyle !== null) {
            return {
                style: this.setStyle(featureTable, featureId, geometryType, featureStyle.style),
                icon: this.setIcon(featureTable, featureId, geometryType, featureStyle.icon),
            };
        }
        else {
            return {
                style: undefined,
                icon: undefined,
                deleted: {
                    style: this.deleteStyle(featureTable, featureId, geometryType),
                    icon: this.deleteIcon(featureTable, featureId, geometryType),
                },
            };
        }
    };
    /**
     * Set the feature style (style and icon) of the feature
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {module:extension/style.FeatureStyle} featureStyle feature style
     * @return {object}
     */
    FeatureStyleExtension.prototype.setFeatureStyleDefault = function (featureTable, featureId, featureStyle) {
        return this.setFeatureStyle(featureTable, featureId, null, featureStyle);
    };
    /**
     * Set the styles for the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.Styles} styles styles
     * @return {Promise}
     */
    FeatureStyleExtension.prototype.setStylesForFeatureRow = function (featureRow, styles) {
        return this.setStyles(featureRow.featureTable.getTableName(), featureRow.id, styles);
    };
    /**
     * Set the styles for the feature table and feature id
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {module:extension/style.Styles} styles styles
     * @return {Promise}
     */
    FeatureStyleExtension.prototype.setStyles = function (featureTable, featureId, styles) {
        var deleted = this.deleteStylesForFeatureId(featureTable, featureId);
        if (styles !== null) {
            var styleIds = [];
            var styleDefault = undefined;
            if (styles.getDefault() !== null) {
                styleDefault = this.setStyleDefault(featureTable, featureId, styles.getDefault());
            }
            var keys = styles.getGeometryTypes();
            for (var i = 0; i < keys.length; i++) {
                styleIds.push(this.setStyle(featureTable, featureId, keys[i], styles.getStyle(keys[i])));
            }
            return {
                styleDefault: styleDefault,
                styles: styleIds,
                deleted: deleted,
            };
        }
        else {
            return {
                styleDefault: undefined,
                styles: undefined,
                deleted: deleted,
            };
        }
    };
    /**
     * Set the style of the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.StyleRow} style style row
     * @return {Promise}
     */
    FeatureStyleExtension.prototype.setStyleForFeatureRow = function (featureRow, style) {
        return this.setStyleForFeatureRowAndGeometryType(featureRow, geometryType_1.GeometryType.fromName(featureRow.geometryType.toUpperCase()), style);
    };
    /**
     * Set the style of the feature row for the specified geometry type
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.StyleRow} style style row
     * @return {Promise}
     */
    FeatureStyleExtension.prototype.setStyleForFeatureRowAndGeometryType = function (featureRow, geometryType, style) {
        return this.setStyle(featureRow.featureTable.getTableName(), featureRow.id, geometryType, style);
    };
    /**
     * Set the default style of the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.StyleRow} style style row
     * @return {Promise}
     */
    FeatureStyleExtension.prototype.setStyleDefaultForFeatureRow = function (featureRow, style) {
        return this.setStyle(featureRow.featureTable.getTableName(), featureRow.id, null, style);
    };
    /**
     * Set the style of the feature
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.StyleRow} style style row
     * @return {number}
     */
    FeatureStyleExtension.prototype.setStyle = function (featureTable, featureId, geometryType, style) {
        this.deleteStyle(featureTable, featureId, geometryType);
        if (style !== null) {
            this.createStyleRelationship(featureTable);
            var styleId = this.getOrInsertStyle(style);
            var mappingDao = this.getStyleMappingDao(featureTable);
            return this.insertStyleMapping(mappingDao, featureId, styleId, geometryType);
        }
    };
    /**
     * Set the default style of the feature
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {module:extension/style.StyleRow} style style row
     * @return {number}
     */
    FeatureStyleExtension.prototype.setStyleDefault = function (featureTable, featureId, style) {
        return this.setStyle(featureTable, featureId, null, style);
    };
    /**
     * Set the icons for the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.Icons} icons icons
     * @return {Promise}
     */
    FeatureStyleExtension.prototype.setIconsForFeatureRow = function (featureRow, icons) {
        return this.setIcons(featureRow.featureTable.getTableName(), featureRow.id, icons);
    };
    /**
     * Set the icons for the feature table and feature id
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {module:extension/style.Icons} icons icons
     * @return {Promise}
     */
    FeatureStyleExtension.prototype.setIcons = function (featureTable, featureId, icons) {
        var deleted = this.deleteIconsForFeatureId(featureTable, featureId);
        if (icons !== null) {
            if (icons.getDefault() !== null) {
                this.setIconDefault(featureTable, featureId, icons.getDefault());
            }
            var keys = icons.getGeometryTypes();
            for (var i = 0; i < keys.length; i++) {
                this.setIcon(featureTable, featureId, keys[i], icons.getIcon(keys[i]));
            }
            return {
                iconDefault: undefined,
                icons: undefined,
                deleted: deleted,
            };
        }
        else {
            return {
                iconDefault: undefined,
                icons: undefined,
                deleted: deleted,
            };
        }
    };
    /**
     * Set the icon of the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.IconRow} icon icon row
     * @return {number}
     */
    FeatureStyleExtension.prototype.setIconForFeatureRow = function (featureRow, icon) {
        return this.setIconForFeatureRowAndGeometryType(featureRow, geometryType_1.GeometryType.fromName(featureRow.geometryType.toUpperCase()), icon);
    };
    /**
     * Set the icon of the feature row for the specified geometry type
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.IconRow} icon icon row
     * @return {number}
     */
    FeatureStyleExtension.prototype.setIconForFeatureRowAndGeometryType = function (featureRow, geometryType, icon) {
        return this.setIcon(featureRow.featureTable.getTableName(), featureRow.id, geometryType, icon);
    };
    /**
     * Set the default icon of the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.IconRow} icon icon row
     * @return {number}
     */
    FeatureStyleExtension.prototype.setIconDefaultForFeatureRow = function (featureRow, icon) {
        return this.setIcon(featureRow.featureTable.getTableName(), featureRow.id, null, icon);
    };
    /**
     * Get the icon of the feature, searching in order: feature geometry type
     * icon, feature default icon, table geometry type icon, table default icon
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.IconRow} icon icon row
     * @return {number}
     */
    FeatureStyleExtension.prototype.setIcon = function (featureTable, featureId, geometryType, icon) {
        this.deleteIcon(featureTable, featureId, geometryType);
        if (icon !== null) {
            this.createIconRelationship(featureTable);
            var iconId = this.getOrInsertIcon(icon);
            var mappingDao = this.getIconMappingDao(featureTable);
            return this.insertStyleMapping(mappingDao, featureId, iconId, geometryType);
        }
    };
    /**
     * Set the default icon of the feature
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {module:extension/style.IconRow} icon icon row
     * @return {number}
     */
    FeatureStyleExtension.prototype.setIconDefault = function (featureTable, featureId, icon) {
        return this.setIcon(featureTable, featureId, null, icon);
    };
    /**
     * Get the style id, either from the existing style or by inserting a new one
     * @param {module:extension/style.StyleRow} style style row
     * @return {Number} style id
     */
    FeatureStyleExtension.prototype.getOrInsertStyle = function (style) {
        var styleId;
        if (style.hasId()) {
            styleId = style.id;
        }
        else {
            var styleDao = this.getStyleDao();
            if (styleDao !== null) {
                styleId = styleDao.create(style);
                style.id = styleId;
            }
        }
        return styleId;
    };
    /**
     * Get the icon id, either from the existing icon or by inserting a new one
     * @param {module:extension/style.IconRow} icon icon row
     * @return {Number} icon id
     */
    FeatureStyleExtension.prototype.getOrInsertIcon = function (icon) {
        var iconId;
        if (icon.hasId()) {
            iconId = icon.id;
        }
        else {
            var iconDao = this.getIconDao();
            if (iconDao != null) {
                iconId = iconDao.create(icon);
                icon.id = iconId;
            }
        }
        return iconId;
    };
    /**
     * Insert a style mapping row
     * @param {module:extension/style.StyleMappingDao} mappingDao mapping dao
     * @param {Number} baseId base id, either contents id or feature id
     * @param {Number} relatedId related id, either style or icon id
     * @param {GeometryType} geometryType geometry type or null
     */
    FeatureStyleExtension.prototype.insertStyleMapping = function (mappingDao, baseId, relatedId, geometryType) {
        if (geometryType === void 0) { geometryType = null; }
        var row = mappingDao.newRow();
        row.baseId = baseId;
        row.relatedId = relatedId;
        row.setGeometryTypeName(geometryType_1.GeometryType.nameFromType(geometryType));
        return mappingDao.create(row);
    };
    /**
     * Delete all feature styles including table styles, table icons, style, and icons
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteAllFeatureStyles = function (featureTable) {
        return {
            tableStyles: this.deleteTableFeatureStyles(featureTable),
            styles: this.deleteFeatureStyles(featureTable),
        };
    };
    /**
     * Delete all styles including table styles and feature row style
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteAllStyles = function (featureTable) {
        return {
            tableStyles: this.deleteTableStyles(featureTable),
            styles: this.deleteStyles(featureTable),
        };
    };
    /**
     * Delete all icons including table icons and feature row icons
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteAllIcons = function (featureTable) {
        return {
            tableIcons: this.deleteTableIcons(featureTable),
            icons: this.deleteIcons(featureTable),
        };
    };
    /**
     * Delete the feature table feature styles
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteTableFeatureStyles = function (featureTable) {
        return {
            styles: this.deleteTableStyles(featureTable),
            icons: this.deleteTableIcons(featureTable),
        };
    };
    /**
     * Delete the feature table styles
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteTableStyles = function (featureTable) {
        return this.deleteTableMappings(this.getTableStyleMappingDao(featureTable), featureTable);
    };
    /**
     * Delete the feature table default style
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteTableStyleDefault = function (featureTable) {
        return this.deleteTableStyle(featureTable, null);
    };
    /**
     * Delete the feature table style for the geometry type
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {GeometryType} geometryType geometry type
     */
    FeatureStyleExtension.prototype.deleteTableStyle = function (featureTable, geometryType) {
        return this.deleteTableMapping(this.getTableStyleMappingDao(featureTable), featureTable, geometryType);
    };
    /**
     * Delete the feature table icons
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteTableIcons = function (featureTable) {
        return this.deleteTableMappings(this.getTableIconMappingDao(featureTable), featureTable);
    };
    /**
     * Delete the feature table default icon
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteTableIconDefault = function (featureTable) {
        return this.deleteTableIcon(featureTable, null);
    };
    /**
     * Delete the feature table icon for the geometry type
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {GeometryType} geometryType geometry type
     */
    FeatureStyleExtension.prototype.deleteTableIcon = function (featureTable, geometryType) {
        return this.deleteTableMapping(this.getTableIconMappingDao(featureTable), featureTable, geometryType);
    };
    /**
     * Delete the table style mappings
     * @param {module:extension/style.StyleMappingDao} mappingDao  mapping dao
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteTableMappings = function (mappingDao, featureTable) {
        if (mappingDao !== null) {
            var featureContentsId = this.contentsIdExtension.getIdByTableName(this.getFeatureTableName(featureTable));
            if (featureContentsId !== null) {
                return mappingDao.deleteByBaseId(featureContentsId);
            }
        }
        return 0;
    };
    /**
     * Delete the table style mapping with the geometry type value
     * @param {module:extension/style.StyleMappingDao} mappingDao  mapping dao
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {GeometryType} geometryType geometry type
     */
    FeatureStyleExtension.prototype.deleteTableMapping = function (mappingDao, featureTable, geometryType) {
        if (mappingDao !== null) {
            var featureContentsId = this.contentsIdExtension.getIdByTableName(this.getFeatureTableName(featureTable));
            if (featureContentsId !== null) {
                return mappingDao.deleteByBaseIdAndGeometryType(featureContentsId, geometryType);
            }
        }
        return 0;
    };
    /**
     * Delete all feature styles
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteFeatureStyles = function (featureTable) {
        return {
            styles: this.deleteStyles(featureTable),
            icons: this.deleteIcons(featureTable),
        };
    };
    /**
     * Delete all styles
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteStyles = function (featureTable) {
        return this.deleteMappings(this.getStyleMappingDao(featureTable));
    };
    /**
     * Delete feature row styles
     * @param {module:features/user/featureRow} featureRow feature row
     */
    FeatureStyleExtension.prototype.deleteStylesForFeatureRow = function (featureRow) {
        return this.deleteStylesForFeatureId(featureRow.featureTable.getTableName(), featureRow.id);
    };
    /**
     * Delete feature row styles
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     */
    FeatureStyleExtension.prototype.deleteStylesForFeatureId = function (featureTable, featureId) {
        return this.deleteMappingsForFeatureId(this.getStyleMappingDao(featureTable), featureId);
    };
    /**
     * Delete the feature row default style
     * @param {module:features/user/featureRow} featureRow feature row
     */
    FeatureStyleExtension.prototype.deleteStyleDefaultForFeatureRow = function (featureRow) {
        return this.deleteStyleForFeatureRowAndGeometryType(featureRow, null);
    };
    /**
     * Delete the feature row default style
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     */
    FeatureStyleExtension.prototype.deleteStyleDefault = function (featureTable, featureId) {
        return this.deleteStyle(featureTable, featureId, null);
    };
    /**
     * Delete the feature row style for the feature row geometry type
     * @param {module:features/user/featureRow} featureRow feature row
     */
    FeatureStyleExtension.prototype.deleteStyleForFeatureRow = function (featureRow) {
        return this.deleteStyleForFeatureRowAndGeometryType(featureRow, geometryType_1.GeometryType.fromName(featureRow.geometryType.toUpperCase()));
    };
    /**
     * Delete the feature row style for the geometry type
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {GeometryType} geometryType geometry type
     */
    FeatureStyleExtension.prototype.deleteStyleForFeatureRowAndGeometryType = function (featureRow, geometryType) {
        return this.deleteStyle(featureRow.featureTable, featureRow.id, geometryType);
    };
    /**
     * Delete the feature row style for the geometry type
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {GeometryType} geometryType geometry type
     */
    FeatureStyleExtension.prototype.deleteStyle = function (featureTable, featureId, geometryType) {
        return this.deleteMapping(this.getStyleMappingDao(featureTable), featureId, geometryType);
    };
    /**
     * Delete the style row and associated mappings by style row
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {module:extension/style.StyleRow} styleRow style row
     */
    FeatureStyleExtension.prototype.deleteStyleAndMappingsByStyleRow = function (featureTable, styleRow) {
        return this.deleteStyleAndMappingsByStyleRowId(featureTable, styleRow.id);
    };
    /**
     * Delete the style row and associated mappings by style row id
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} styleRowId style row id
     */
    FeatureStyleExtension.prototype.deleteStyleAndMappingsByStyleRowId = function (featureTable, styleRowId) {
        var rowsDeleted = 0;
        var styleDao = this.getStyleDao();
        if (styleDao !== null && styleDao !== undefined) {
            rowsDeleted += styleDao.deleteById(styleRowId);
        }
        var styleMappingDao = this.getStyleMappingDao(featureTable);
        if (styleMappingDao !== null && styleMappingDao !== undefined) {
            rowsDeleted += styleMappingDao.deleteByRelatedId(styleRowId);
        }
        var tableStyleMappingDao = this.getTableStyleMappingDao(featureTable);
        if (tableStyleMappingDao !== null && tableStyleMappingDao !== undefined) {
            rowsDeleted += tableStyleMappingDao.deleteByRelatedId(styleRowId);
        }
        return rowsDeleted;
    };
    /**
     * Delete all icons
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    FeatureStyleExtension.prototype.deleteIcons = function (featureTable) {
        return this.deleteMappings(this.getIconMappingDao(featureTable));
    };
    /**
     * Delete feature row icons
     * @param {module:features/user/featureRow} featureRow feature row
     */
    FeatureStyleExtension.prototype.deleteIconsForFeatureRow = function (featureRow) {
        return this.deleteIconsForFeatureId(featureRow.featureTable.getTableName(), featureRow.id);
    };
    /**
     * Delete feature row icons
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     */
    FeatureStyleExtension.prototype.deleteIconsForFeatureId = function (featureTable, featureId) {
        return this.deleteMappingsForFeatureId(this.getIconMappingDao(featureTable), featureId);
    };
    /**
     * Delete the feature row default icon
     * @param {module:features/user/featureRow} featureRow feature row
     */
    FeatureStyleExtension.prototype.deleteIconDefaultForFeatureRow = function (featureRow) {
        return this.deleteIconDefault(featureRow.featureTable.getTableName(), featureRow.id);
    };
    /**
     * Delete the feature row default icon
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     */
    FeatureStyleExtension.prototype.deleteIconDefault = function (featureTable, featureId) {
        return this.deleteIcon(featureTable, featureId, null);
    };
    /**
     * Delete the feature row icon for the feature row geometry type
     * @param {module:features/user/featureRow} featureRow feature row
     */
    FeatureStyleExtension.prototype.deleteIconForFeatureRow = function (featureRow) {
        return this.deleteIconForFeatureRowAndGeometryType(featureRow, geometryType_1.GeometryType.fromName(featureRow.geometryType.toUpperCase()));
    };
    /**
     * Delete the feature row icon for the geometry type
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {GeometryType} geometryType geometry type
     */
    FeatureStyleExtension.prototype.deleteIconForFeatureRowAndGeometryType = function (featureRow, geometryType) {
        return this.deleteIcon(featureRow.featureTable, featureRow.id, geometryType);
    };
    /**
     * Delete the feature row icon for the geometry type
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {GeometryType} geometryType geometry type
     */
    FeatureStyleExtension.prototype.deleteIcon = function (featureTable, featureId, geometryType) {
        return this.deleteMapping(this.getIconMappingDao(featureTable), featureId, geometryType);
    };
    /**
     * Delete the icon row and associated mappings by icon row
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {module:extension/style.IconRow} iconRow icon row
     */
    FeatureStyleExtension.prototype.deleteIconAndMappingsByIconRow = function (featureTable, iconRow) {
        return this.deleteIconAndMappingsByIconRowId(featureTable, iconRow.id);
    };
    /**
     * Delete the icon row and associated mappings by icon row id
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} iconRowId icon row id
     */
    FeatureStyleExtension.prototype.deleteIconAndMappingsByIconRowId = function (featureTable, iconRowId) {
        var rowsDeleted = 0;
        var iconDao = this.getIconDao();
        if (iconDao !== null && iconDao !== undefined) {
            rowsDeleted += iconDao.deleteById(iconRowId);
        }
        var iconMappingDao = this.getIconMappingDao(featureTable);
        if (iconMappingDao !== null && iconMappingDao !== undefined) {
            rowsDeleted += iconMappingDao.deleteByRelatedId(iconRowId);
        }
        var tableIconMappingDao = this.getTableIconMappingDao(featureTable);
        if (tableIconMappingDao !== null && tableIconMappingDao !== undefined) {
            rowsDeleted += tableIconMappingDao.deleteByRelatedId(iconRowId);
        }
        return rowsDeleted;
    };
    /**
     * Delete all style mappings
     * @param {module:extension/style.StyleMappingDao} mappingDao  mapping dao
     */
    FeatureStyleExtension.prototype.deleteMappings = function (mappingDao) {
        if (mappingDao !== null) {
            return mappingDao.deleteAll();
        }
        return 0;
    };
    /**
     * Delete the style mappings
     * @param {module:extension/style.StyleMappingDao} mappingDao  mapping dao
     * @param {Number} featureId feature id
     */
    FeatureStyleExtension.prototype.deleteMappingsForFeatureId = function (mappingDao, featureId) {
        if (mappingDao !== null && featureId) {
            return mappingDao.deleteByBaseId(featureId);
        }
        return 0;
    };
    /**
     * Delete the style mapping with the geometry type value
     * @param {module:extension/style.StyleMappingDao} mappingDao  mapping dao
     * @param {Number} featureId feature id
     * @param {GeometryType} geometryType geometry type
     */
    FeatureStyleExtension.prototype.deleteMapping = function (mappingDao, featureId, geometryType) {
        if (mappingDao !== null) {
            return mappingDao.deleteByBaseIdAndGeometryType(featureId, geometryType);
        }
        return 0;
    };
    /**
     * Get all the unique style row ids the table maps to
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return style row ids
     */
    FeatureStyleExtension.prototype.getAllTableStyleIds = function (featureTable) {
        var styleIds = null;
        var mappingDao = this.getTableStyleMappingDao(featureTable);
        if (mappingDao !== null) {
            styleIds = mappingDao.uniqueRelatedIds().map(function (row) { return row['related_id']; });
        }
        return styleIds;
    };
    /**
     * Get all the unique icon row ids the table maps to
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return icon row ids
     */
    FeatureStyleExtension.prototype.getAllTableIconIds = function (featureTable) {
        var styleIds = null;
        var mappingDao = this.getTableIconMappingDao(featureTable);
        if (mappingDao !== null) {
            styleIds = mappingDao.uniqueRelatedIds().map(function (row) { return row['related_id']; });
        }
        return styleIds;
    };
    /**
     * Get all the unique style row ids the features map to
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {Number[]} style row ids
     */
    FeatureStyleExtension.prototype.getAllStyleIds = function (featureTable) {
        var styleIds = null;
        var mappingDao = this.getStyleMappingDao(featureTable);
        if (mappingDao !== null) {
            styleIds = mappingDao.uniqueRelatedIds().map(function (row) { return row['related_id']; });
        }
        return styleIds;
    };
    /**
     * Get all the unique icon row ids the features map to
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {Number[]} icon row ids
     */
    FeatureStyleExtension.prototype.getAllIconIds = function (featureTable) {
        var styleIds = null;
        var mappingDao = this.getIconMappingDao(featureTable);
        if (mappingDao !== null) {
            styleIds = mappingDao.uniqueRelatedIds().map(function (row) { return row['related_id']; });
        }
        return styleIds;
    };
    /**
     * Get name of feature table
     * @param featureTable
     * @returns {String}
     */
    FeatureStyleExtension.prototype.getFeatureTableName = function (featureTable) {
        return featureTable instanceof featureTable_1.FeatureTable ? featureTable.getTableName() : featureTable;
    };
    /**
     * Remove all traces of the extension
     */
    FeatureStyleExtension.prototype.removeExtension = function () {
        this.deleteAllRelationships();
        this.geoPackage.deleteTable(styleTable_1.StyleTable.TABLE_NAME);
        this.geoPackage.deleteTable(iconTable_1.IconTable.TABLE_NAME);
        if (this.extensionsDao.isTableExists()) {
            return this.extensionsDao.deleteByExtension(FeatureStyleExtension.EXTENSION_NAME);
        }
        return 0;
    };
    FeatureStyleExtension.EXTENSION_NAME = 'nga_feature_style';
    FeatureStyleExtension.EXTENSION_AUTHOR = 'nga';
    FeatureStyleExtension.EXTENSION_NAME_NO_AUTHOR = 'feature_style';
    FeatureStyleExtension.EXTENSION_DEFINITION = 'http://ngageoint.github.io/GeoPackage/docs/extensions/feature-style.html';
    FeatureStyleExtension.TABLE_MAPPING_STYLE = FeatureStyleExtension.EXTENSION_AUTHOR + '_style_';
    FeatureStyleExtension.TABLE_MAPPING_TABLE_STYLE = FeatureStyleExtension.EXTENSION_AUTHOR + '_style_default_';
    FeatureStyleExtension.TABLE_MAPPING_ICON = FeatureStyleExtension.EXTENSION_AUTHOR + '_icon_';
    FeatureStyleExtension.TABLE_MAPPING_TABLE_ICON = FeatureStyleExtension.EXTENSION_AUTHOR + '_icon_default_';
    return FeatureStyleExtension;
}(baseExtension_1.BaseExtension));
exports.FeatureStyleExtension = FeatureStyleExtension;
//# sourceMappingURL=index.js.map