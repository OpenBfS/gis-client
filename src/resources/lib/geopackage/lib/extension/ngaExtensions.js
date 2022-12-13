"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NGAExtensions = void 0;
var featureTableIndex_1 = require("./index/featureTableIndex");
var geometryIndexDao_1 = require("./index/geometryIndexDao");
var tableIndexDao_1 = require("./index/tableIndexDao");
var coreSQLUtils_1 = require("../db/coreSQLUtils");
var tileScalingDao_1 = require("./scale/tileScalingDao");
var scale_1 = require("./scale");
var style_1 = require("./style");
var relatedTables_1 = require("./relatedTables");
var contents_1 = require("./contents");
var userCustomTableReader_1 = require("../user/custom/userCustomTableReader");
var alterTable_1 = require("../db/alterTable");
var tableMapping_1 = require("../db/tableMapping");
var userMappingTable_1 = require("./relatedTables/userMappingTable");
var extendedRelationDao_1 = require("./relatedTables/extendedRelationDao");
var tableInfo_1 = require("../db/table/tableInfo");
var contentsIdDao_1 = require("./contents/contentsIdDao");
var NGAExtensions = /** @class */ (function () {
    function NGAExtensions() {
    }
    /**
     * Delete all NGA table extensions for the table within the GeoPackage
     * @param geoPackage GeoPackage
     * @param table  table name
     */
    NGAExtensions.deleteTableExtensions = function (geoPackage, table) {
        NGAExtensions.deleteGeometryIndex(geoPackage, table);
        NGAExtensions.deleteTileScaling(geoPackage, table);
        NGAExtensions.deleteFeatureStyle(geoPackage, table);
        NGAExtensions.deleteContentsId(geoPackage, table);
        // Delete future extensions for the table here
    };
    /**
     * Delete all NGA extensions including custom extension tables for the
     * GeoPackage
     * @param geoPackage GeoPackage
     */
    NGAExtensions.deleteExtensions = function (geoPackage) {
        NGAExtensions.deleteGeometryIndexExtension(geoPackage);
        NGAExtensions.deleteTileScalingExtension(geoPackage);
        NGAExtensions.deleteFeatureStyleExtension(geoPackage);
        NGAExtensions.deleteContentsIdExtension(geoPackage);
        // Delete future extension tables here
    };
    /**
     * Copy all NGA table extensions for the table within the GeoPackage
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    NGAExtensions.copyTableExtensions = function (geoPackage, table, newTable) {
        try {
            NGAExtensions.copyContentsId(geoPackage, table, newTable);
            NGAExtensions.copyFeatureStyle(geoPackage, table, newTable);
            NGAExtensions.copyTileScaling(geoPackage, table, newTable);
            NGAExtensions.copyGeometryIndex(geoPackage, table, newTable);
            // Copy future extensions for the table here
        }
        catch (e) {
            console.warn('Failed to copy extensions for table: ' + newTable + ', copied from table: ' + table, e);
        }
    };
    /**
     * Delete the Geometry Index extension for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    NGAExtensions.deleteGeometryIndex = function (geoPackage, table) {
        var geometryIndexDao = geoPackage.getGeometryIndexDao(null);
        var tableIndexDao = geoPackage.tableIndexDao;
        var extensionsDao = geoPackage.extensionDao;
        try {
            if (geometryIndexDao.isTableExists()) {
                geometryIndexDao.deleteWhere(geometryIndexDao.buildWhereWithFieldAndValue(geometryIndexDao_1.GeometryIndexDao.COLUMN_TABLE_NAME_FIELD, table), geometryIndexDao.buildWhereArgs(table));
            }
            if (tableIndexDao.isTableExists()) {
                tableIndexDao.deleteWhere(tableIndexDao.buildWhereWithFieldAndValue(tableIndexDao_1.TableIndexDao.COLUMN_TABLE_NAME, table), tableIndexDao.buildWhereArgs(table));
            }
            if (extensionsDao.isTableExists()) {
                extensionsDao.deleteByExtensionAndTableName(featureTableIndex_1.FeatureTableIndex.EXTENSION_NAME, table);
            }
        }
        catch (e) {
            throw new Error('Failed to delete Table Index. GeoPackage: ' + geoPackage.name + ', Table: ' + table);
        }
    };
    /**
     * Delete the Geometry Index extension including the extension entries and
     * custom tables
     * @param geoPackage GeoPackage
     */
    NGAExtensions.deleteGeometryIndexExtension = function (geoPackage) {
        var geometryIndexDao = geoPackage.getGeometryIndexDao(null);
        var tableIndexDao = geoPackage.tableIndexDao;
        var extensionsDao = geoPackage.extensionDao;
        try {
            if (geometryIndexDao.isTableExists()) {
                geoPackage.dropTable(geometryIndexDao_1.GeometryIndexDao.TABLE_NAME);
            }
            if (tableIndexDao.isTableExists()) {
                geoPackage.dropTable(tableIndexDao_1.TableIndexDao.TABLE_NAME);
            }
            if (extensionsDao.isTableExists()) {
                extensionsDao.deleteByExtension(featureTableIndex_1.FeatureTableIndex.EXTENSION_NAME);
            }
        }
        catch (e) {
            throw new Error('Failed to delete Table Index extension and tables. GeoPackage: ' + geoPackage.name);
        }
    };
    /**
     * Copy the Geometry Index extension for the table
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    NGAExtensions.copyGeometryIndex = function (geoPackage, table, newTable) {
        try {
            var extensionsDao = geoPackage.extensionDao;
            if (extensionsDao.isTableExists()) {
                var extensions = extensionsDao.queryByExtensionAndTableName(featureTableIndex_1.FeatureTableIndex.EXTENSION_NAME, table);
                if (extensions.length > 0) {
                    var extension = extensions[0];
                    extension.table_name = newTable;
                    extensionsDao.create(extension);
                    var tableIndexDao = geoPackage.tableIndexDao;
                    if (tableIndexDao.isTableExists()) {
                        var tableIndex = tableIndexDao.queryForId(table);
                        if (tableIndex !== null && tableIndex !== undefined) {
                            tableIndex.table_name = newTable;
                            tableIndexDao.create(tableIndex);
                            if (geoPackage.isTable(geometryIndexDao_1.GeometryIndexDao.TABLE_NAME)) {
                                coreSQLUtils_1.CoreSQLUtils.transferTableContent(geoPackage.connection, geometryIndexDao_1.GeometryIndexDao.TABLE_NAME, geometryIndexDao_1.GeometryIndexDao.COLUMN_TABLE_NAME_FIELD, newTable, table);
                            }
                        }
                    }
                }
            }
        }
        catch (e) {
            console.warn('Failed to create Geometry Index for table: ' + newTable
                + ', copied from table: ' + table, e);
        }
    };
    /**
     * Delete the Tile Scaling extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    NGAExtensions.deleteTileScaling = function (geoPackage, table) {
        var tileScalingDao = geoPackage.tileScalingDao;
        var extensionsDao = geoPackage.extensionDao;
        try {
            if (tileScalingDao.isTableExists()) {
                tileScalingDao.deleteByTableName(table);
            }
            if (extensionsDao.isTableExists()) {
                extensionsDao.deleteByExtensionAndTableName(scale_1.TileScalingExtension.EXTENSION_NAME, table);
            }
        }
        catch (e) {
            throw new Error('Failed to delete Tile Scaling. GeoPackage: ' + geoPackage.name + ', Table: ' + table);
        }
    };
    /**
     * Delete the Tile Scaling extension including the extension entries and
     * custom tables
     * @param geoPackage GeoPackage
     */
    NGAExtensions.deleteTileScalingExtension = function (geoPackage) {
        var tileScalingDao = geoPackage.tileScalingDao;
        var extensionsDao = geoPackage.extensionDao;
        try {
            if (tileScalingDao.isTableExists()) {
                geoPackage.dropTable(tileScalingDao.gpkgTableName);
            }
            if (extensionsDao.isTableExists()) {
                extensionsDao.deleteByExtension(scale_1.TileScalingExtension.EXTENSION_NAME);
            }
        }
        catch (e) {
            throw new Error('Failed to delete Tile Scaling extension and table. GeoPackage: '
                + geoPackage.name);
        }
    };
    /**
     * Copy the Tile Scaling extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    NGAExtensions.copyTileScaling = function (geoPackage, table, newTable) {
        try {
            var tileTableScaling = new scale_1.TileScalingExtension(geoPackage, table);
            if (tileTableScaling.has()) {
                var extension = tileTableScaling.getOrCreateExtension();
                if (extension !== null && extension !== undefined) {
                    extension.setTableName(newTable);
                    tileTableScaling.extensionsDao.create(extension);
                    if (geoPackage.isTable(tileScalingDao_1.TileScalingDao.TABLE_NAME)) {
                        coreSQLUtils_1.CoreSQLUtils.transferTableContent(geoPackage.connection, tileScalingDao_1.TileScalingDao.TABLE_NAME, tileScalingDao_1.TileScalingDao.COLUMN_TABLE_NAME, newTable, table);
                    }
                }
            }
        }
        catch (e) {
            console.warn('Failed to create Tile Scaling for table: ' + newTable + ', copied from table: ' + table, e);
        }
    };
    /**
     * Delete the Feature Style extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    NGAExtensions.deleteFeatureStyle = function (geoPackage, table) {
        var featureStyleExtension = NGAExtensions.getFeatureStyleExtension(geoPackage);
        if (featureStyleExtension.has(table)) {
            featureStyleExtension.deleteRelationships(table);
        }
    };
    /**
     * Delete the Feature Style extension including the extension entries and
     * custom tables
     * @param geoPackage GeoPackage
     */
    NGAExtensions.deleteFeatureStyleExtension = function (geoPackage) {
        var featureStyleExtension = NGAExtensions.getFeatureStyleExtension(geoPackage);
        if (featureStyleExtension.has(null)) {
            featureStyleExtension.removeExtension();
        }
    };
    /**
     * Copy the Feature Style extensions for the table. Relies on
     * {@link GeoPackageExtensions#copyRelatedTables(GeoPackageCore, String, String)}
     * to be called first.
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    NGAExtensions.copyFeatureStyle = function (geoPackage, table, newTable) {
        try {
            var featureStyleExtension = NGAExtensions.getFeatureStyleExtension(geoPackage);
            if (featureStyleExtension.hasRelationship(table)) {
                var extension = featureStyleExtension.getOrCreateExtension(table);
                if (extension != null) {
                    extension.setTableName(newTable);
                    featureStyleExtension.extensionsDao.create(extension);
                    var contentsIdExtension = featureStyleExtension.getContentsId();
                    var contentsId = contentsIdExtension.getIdByTableName(table);
                    var newContentsId = contentsIdExtension.getIdByTableName(newTable);
                    if (contentsId !== null && contentsId !== undefined && newContentsId !== null && newContentsId !== undefined) {
                        if (featureStyleExtension.hasTableStyleRelationship(table)) {
                            NGAExtensions.copyFeatureTableStyle(featureStyleExtension, style_1.FeatureStyleExtension.TABLE_MAPPING_TABLE_STYLE, table, newTable, contentsId, newContentsId);
                        }
                        if (featureStyleExtension.hasTableIconRelationship(table)) {
                            NGAExtensions.copyFeatureTableStyle(featureStyleExtension, style_1.FeatureStyleExtension.TABLE_MAPPING_TABLE_ICON, table, newTable, contentsId, newContentsId);
                        }
                    }
                }
            }
        }
        catch (e) {
            console.warn('Failed to create Feature Style for table: ' + newTable
                + ', copied from table: ' + table, e);
        }
    };
    /**
     * Copy the feature table style
     * @param featureStyleExtension feature style extension
     * @param mappingTablePrefix mapping table prefix
     * @param table table name
     * @param newTable new table name
     * @param contentsId contents id
     * @param newContentsId new contents id
     */
    NGAExtensions.copyFeatureTableStyle = function (featureStyleExtension, mappingTablePrefix, table, newTable, contentsId, newContentsId) {
        var geoPackage = featureStyleExtension.geoPackage;
        var mappingTableName = featureStyleExtension.getMappingTableName(mappingTablePrefix, table);
        var extensionsDao = geoPackage.extensionDao;
        var extensions = extensionsDao.queryByExtensionAndTableName(relatedTables_1.RelatedTablesExtension.EXTENSION_NAME, mappingTableName)
            .concat(extensionsDao.queryByExtensionAndTableName(relatedTables_1.RelatedTablesExtension.EXTENSION_RELATED_TABLES_NAME_NO_AUTHOR, mappingTableName));
        if (extensions.length > 0) {
            var newMappingTableName = featureStyleExtension.getMappingTableName(mappingTablePrefix, newTable);
            var userTable = new userCustomTableReader_1.UserCustomTableReader(mappingTableName).readTable(geoPackage.connection);
            alterTable_1.AlterTable.copyTable(geoPackage.connection, userTable, newMappingTableName, false);
            var mappingTableTableMapping = new tableMapping_1.TableMapping(userTable.getTableName(), newMappingTableName, userTable.getUserColumns().getColumns());
            var baseIdColumn = mappingTableTableMapping.getColumn(userMappingTable_1.UserMappingTable.COLUMN_BASE_ID);
            baseIdColumn.constantValue = newContentsId;
            baseIdColumn.whereValue = contentsId;
            coreSQLUtils_1.CoreSQLUtils.transferTableContentForTableMapping(geoPackage.connection, mappingTableTableMapping);
            var extension = extensions[0];
            extension.setTableName(newMappingTableName);
            extensionsDao.create(extension);
            var extendedRelationTableMapping = tableMapping_1.TableMapping.fromTableInfo(tableInfo_1.TableInfo.info(geoPackage.connection, extendedRelationDao_1.ExtendedRelationDao.TABLE_NAME));
            extendedRelationTableMapping.removeColumn(extendedRelationDao_1.ExtendedRelationDao.ID);
            var baseTableNameColumn = extendedRelationTableMapping.getColumn(extendedRelationDao_1.ExtendedRelationDao.BASE_TABLE_NAME);
            baseTableNameColumn.whereValue = contentsIdDao_1.ContentsIdDao.TABLE_NAME;
            var mappingTableNameColumn = extendedRelationTableMapping.getColumn(extendedRelationDao_1.ExtendedRelationDao.MAPPING_TABLE_NAME);
            mappingTableNameColumn.constantValue = newMappingTableName;
            mappingTableNameColumn.whereValue = mappingTableName;
            coreSQLUtils_1.CoreSQLUtils.transferTableContentForTableMapping(geoPackage.connection, extendedRelationTableMapping);
        }
    };
    /**
     * Get a Feature Style Extension used only for deletions
     * @param geoPackage GeoPackage
     * @return Feature Style Extension
     */
    NGAExtensions.getFeatureStyleExtension = function (geoPackage) {
        return new style_1.FeatureStyleExtension(geoPackage);
    };
    /**
     * Delete the Contents Id extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    NGAExtensions.deleteContentsId = function (geoPackage, table) {
        var contentsIdExtension = new contents_1.ContentsIdExtension(geoPackage);
        if (contentsIdExtension.has()) {
            contentsIdExtension.deleteIdByTableName(table);
        }
    };
    /**
     * Delete the Contents Id extension including the extension entries and
     * custom tables
     * @param geoPackage GeoPackage
     */
    NGAExtensions.deleteContentsIdExtension = function (geoPackage) {
        var contentsIdExtension = new contents_1.ContentsIdExtension(geoPackage);
        if (contentsIdExtension.has()) {
            contentsIdExtension.removeExtension();
        }
    };
    /**
     * Copy the Contents Id extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    NGAExtensions.copyContentsId = function (geoPackage, table, newTable) {
        try {
            var contentsIdExtension = new contents_1.ContentsIdExtension(geoPackage);
            if (contentsIdExtension.has()) {
                var contentsId = contentsIdExtension.getByTableName(table);
                if (contentsId !== null && contentsId !== undefined) {
                    contentsIdExtension.createWithTableName(newTable);
                }
            }
        }
        catch (e) {
            console.warn('Failed to create Contents Id for table: '
                + newTable + ', copied from table: ' + table, e);
        }
    };
    return NGAExtensions;
}());
exports.NGAExtensions = NGAExtensions;
//# sourceMappingURL=ngaExtensions.js.map