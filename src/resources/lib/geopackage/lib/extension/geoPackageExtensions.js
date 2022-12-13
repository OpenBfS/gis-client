"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoPackageExtensions = void 0;
/**
 * GeoPackage extension management class for deleting extensions for a table or
 * in a GeoPackage
 */
var ngaExtensions_1 = require("./ngaExtensions");
var rtreeIndex_1 = require("./rtree/rtreeIndex");
var relatedTables_1 = require("./relatedTables");
var tableInfo_1 = require("../db/table/tableInfo");
var coreSQLUtils_1 = require("../db/coreSQLUtils");
var userCustomTableReader_1 = require("../user/custom/userCustomTableReader");
var alterTable_1 = require("../db/alterTable");
var tableMapping_1 = require("../db/tableMapping");
var extendedRelationDao_1 = require("./relatedTables/extendedRelationDao");
var schema_1 = require("./schema");
var dataColumnsDao_1 = require("../dataColumns/dataColumnsDao");
var tableCreator_1 = require("../db/tableCreator");
var constraintParser_1 = require("../db/table/constraintParser");
var metadata_1 = require("./metadata");
var metadataReferenceDao_1 = require("../metadata/reference/metadataReferenceDao");
var crsWkt_1 = require("./crsWkt");
var GeoPackageExtensions = /** @class */ (function () {
    function GeoPackageExtensions() {
    }
    /**
     * Delete all table extensions for the table within the GeoPackage
     *
     * @param geoPackage GeoPackage
     * @param table table name
     */
    GeoPackageExtensions.deleteTableExtensions = function (geoPackage, table) {
        // Handle deleting any extensions with extra tables here
        ngaExtensions_1.NGAExtensions.deleteTableExtensions(geoPackage, table);
        GeoPackageExtensions.deleteRTreeSpatialIndex(geoPackage, table);
        GeoPackageExtensions.deleteRelatedTables(geoPackage, table);
        GeoPackageExtensions.deleteSchema(geoPackage, table);
        GeoPackageExtensions.deleteMetadata(geoPackage, table);
        GeoPackageExtensions.deleteExtensionForTable(geoPackage, table);
    };
    /**
     * Delete all extensions
     * @param geoPackage GeoPackage
     */
    GeoPackageExtensions.deleteExtensions = function (geoPackage) {
        // Handle deleting any extensions with extra tables here
        ngaExtensions_1.NGAExtensions.deleteExtensions(geoPackage);
        this.deleteRTreeSpatialIndexExtension(geoPackage);
        this.deleteRelatedTablesExtension(geoPackage);
        this.deleteSchemaExtension(geoPackage);
        this.deleteMetadataExtension(geoPackage);
        this.deleteCrsWktExtension(geoPackage);
        this.delete(geoPackage);
    };
    /**
     * Copy all table extensions for the table within the GeoPackage
     *
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    GeoPackageExtensions.copyTableExtensions = function (geoPackage, table, newTable) {
        try {
            GeoPackageExtensions.copyRTreeSpatialIndex(geoPackage, table, newTable);
            GeoPackageExtensions.copyRelatedTables(geoPackage, table, newTable);
            GeoPackageExtensions.copySchema(geoPackage, table, newTable);
            GeoPackageExtensions.copyMetadata(geoPackage, table, newTable);
            // Handle copying any extensions with extra tables here
            ngaExtensions_1.NGAExtensions.copyTableExtensions(geoPackage, table, newTable);
        }
        catch (e) {
            console.warn('Failed to copy extensions for table: '
                + newTable + ', copied from table: ' + table, e);
        }
    };
    /**
     * Delete the extensions for the table
     * @param geoPackage
     * @param table
     */
    GeoPackageExtensions.deleteExtensionForTable = function (geoPackage, table) {
        var extensionsDao = geoPackage.extensionDao;
        try {
            if (extensionsDao.isTableExists()) {
                extensionsDao.deleteByExtension(table);
            }
        }
        catch (SQLe) {
            throw new Error('Failed to delete Table extensions. GeoPackage: ' + geoPackage.name + ', Table: ' + table);
        }
    };
    /**
     * Delete the extensions
     * @param geoPackage
     */
    GeoPackageExtensions.delete = function (geoPackage) {
        var extensionsDao = geoPackage.extensionDao;
        try {
            if (extensionsDao.isTableExists()) {
                geoPackage.dropTable(extensionsDao.gpkgTableName);
            }
        }
        catch (SQLe) {
            throw new Error('Failed to delete all extensions. GeoPackage: ' + geoPackage.name);
        }
    };
    /**
     * Delete the RTree Spatial extension for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    GeoPackageExtensions.deleteRTreeSpatialIndex = function (geoPackage, table) {
        var rTreeIndexExtension = GeoPackageExtensions.getRTreeIndexExtension(geoPackage);
        if (rTreeIndexExtension.has(table)) {
            rTreeIndexExtension.deleteTable(table);
        }
    };
    /**
     * Delete the RTree Spatial extension
     * @param geoPackage GeoPackage
     */
    GeoPackageExtensions.deleteRTreeSpatialIndexExtension = function (geoPackage) {
        var rTreeIndexExtension = GeoPackageExtensions.getRTreeIndexExtension(geoPackage);
        if (rTreeIndexExtension.has()) {
            rTreeIndexExtension.deleteAll();
        }
    };
    /**
     * Copy the RTree Spatial extension for the table
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    GeoPackageExtensions.copyRTreeSpatialIndex = function (geoPackage, table, newTable) {
        try {
            var rTreeIndexExtension = GeoPackageExtensions.getRTreeIndexExtension(geoPackage);
            if (rTreeIndexExtension.has(table)) {
                var geometryColumnsDao = geoPackage.geometryColumnsDao;
                var geometryColumns = geometryColumnsDao.queryForTableName(newTable);
                if (geometryColumns !== null && geometryColumns !== undefined) {
                    var tableInfo = tableInfo_1.TableInfo.info(geoPackage.connection, newTable);
                    if (tableInfo !== null && tableInfo !== undefined) {
                        var pk = tableInfo.getPrimaryKey().getName();
                        rTreeIndexExtension.createWithParameters(newTable, geometryColumns.column_name, pk);
                    }
                }
            }
        }
        catch (e) {
            console.warn('Failed to create RTree for table: '
                + newTable + ', copied from table: ' + table, e);
        }
    };
    /**
     * Get a RTree Index Extension used only for deletions
     * @param geoPackage GeoPackage
     * @return RTree index extension
     */
    GeoPackageExtensions.getRTreeIndexExtension = function (geoPackage) {
        return new rtreeIndex_1.RTreeIndex(geoPackage, null);
    };
    /**
     * Delete the Related Tables extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    GeoPackageExtensions.deleteRelatedTables = function (geoPackage, table) {
        var relatedTablesExtension = GeoPackageExtensions.getRelatedTableExtension(geoPackage);
        if (relatedTablesExtension.has()) {
            relatedTablesExtension.removeRelationships(table);
        }
    };
    /**
     * Delete the Related Tables extension
     * @param geoPackage GeoPackage
     */
    GeoPackageExtensions.deleteRelatedTablesExtension = function (geoPackage) {
        var relatedTablesExtension = GeoPackageExtensions.getRelatedTableExtension(geoPackage);
        if (relatedTablesExtension.has()) {
            relatedTablesExtension.removeExtension();
        }
    };
    /**
     * Copy the Related Tables extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    GeoPackageExtensions.copyRelatedTables = function (geoPackage, table, newTable) {
        try {
            var relatedTablesExtension = GeoPackageExtensions.getRelatedTableExtension(geoPackage);
            if (relatedTablesExtension.has()) {
                var extendedRelationsDao = relatedTablesExtension.extendedRelationDao;
                var extensionsDao_1 = geoPackage.extensionDao;
                var extendedRelations = extendedRelationsDao.getBaseTableRelations(table);
                extendedRelations.forEach(function (extendedRelation) {
                    var mappingTableName = extendedRelation.mapping_table_name;
                    var extensions = extensionsDao_1.queryByExtensionAndTableName(relatedTables_1.RelatedTablesExtension.EXTENSION_NAME, mappingTableName)
                        .concat(extensionsDao_1.queryByExtensionAndTableName(relatedTables_1.RelatedTablesExtension.EXTENSION_RELATED_TABLES_NAME_NO_AUTHOR, mappingTableName));
                    if (extensions.length > 0) {
                        var newMappingTableName = coreSQLUtils_1.CoreSQLUtils.createName(geoPackage.connection, mappingTableName, table, newTable);
                        var userTable = new userCustomTableReader_1.UserCustomTableReader(mappingTableName).readTable(geoPackage.connection);
                        alterTable_1.AlterTable.copyTable(geoPackage.connection, userTable, newMappingTableName);
                        var extension = extensions[0];
                        extension.setTableName(newMappingTableName);
                        extensionsDao_1.create(extension);
                        var extendedRelationTableMapping = tableMapping_1.TableMapping.fromTableInfo(tableInfo_1.TableInfo.info(geoPackage.connection, extendedRelationDao_1.ExtendedRelationDao.TABLE_NAME));
                        extendedRelationTableMapping.removeColumn(extendedRelationDao_1.ExtendedRelationDao.ID);
                        var baseTableNameColumn = extendedRelationTableMapping.getColumn(extendedRelationDao_1.ExtendedRelationDao.BASE_TABLE_NAME);
                        baseTableNameColumn.constantValue = newTable;
                        baseTableNameColumn.whereValue = table;
                        var mappingTableNameColumn = extendedRelationTableMapping.getColumn(extendedRelationDao_1.ExtendedRelationDao.MAPPING_TABLE_NAME);
                        mappingTableNameColumn.constantValue = newMappingTableName;
                        mappingTableNameColumn.whereValue = mappingTableName;
                        coreSQLUtils_1.CoreSQLUtils.transferTableContentForTableMapping(geoPackage.connection, extendedRelationTableMapping);
                    }
                });
            }
        }
        catch (e) {
            console.warn('Failed to create Related Tables for table: ' + newTable + ', copied from table: ' + table, e);
        }
    };
    /**
     * Get a Related Table Extension used only for deletions
     * @param geoPackage GeoPackage
     * @return Related Table Extension
     */
    GeoPackageExtensions.getRelatedTableExtension = function (geoPackage) {
        return new relatedTables_1.RelatedTablesExtension(geoPackage);
    };
    /**
     * Delete the Schema extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    GeoPackageExtensions.deleteSchema = function (geoPackage, table) {
        var dataColumnsDao = geoPackage.dataColumnsDao;
        try {
            if (dataColumnsDao.isTableExists()) {
                dataColumnsDao.deleteByTableName(table);
            }
        }
        catch (e) {
            throw new Error('Failed to delete Schema extension. GeoPackage: ' + geoPackage.name + ', Table: ' + table);
        }
    };
    /**
     * Delete the Schema extension
     * @param geoPackage GeoPackage
     */
    GeoPackageExtensions.deleteSchemaExtension = function (geoPackage) {
        var schemaExtension = new schema_1.SchemaExtension(geoPackage);
        if (schemaExtension.has()) {
            schemaExtension.removeExtension();
        }
    };
    /**
     * Copy the Schema extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     * @param newTable new table name
     */
    GeoPackageExtensions.copySchema = function (geoPackage, table, newTable) {
        try {
            if (geoPackage.isTable(dataColumnsDao_1.DataColumnsDao.TABLE_NAME)) {
                var dataColumnsTable = new userCustomTableReader_1.UserCustomTableReader(dataColumnsDao_1.DataColumnsDao.TABLE_NAME).readUserCustomTable(geoPackage);
                var nameColumn = dataColumnsTable.getColumnWithColumnName(dataColumnsDao_1.DataColumnsDao.COLUMN_NAME);
                if (nameColumn.hasConstraints()) {
                    nameColumn.clearConstraints();
                    if (dataColumnsTable.hasConstraints()) {
                        dataColumnsTable.clearConstraints();
                        var constraintSql = tableCreator_1.TableCreator.tableCreationScripts.data_columns[0];
                        var constraints = constraintParser_1.ConstraintParser.getConstraints(constraintSql);
                        dataColumnsTable.addConstraints(constraints.getTableConstraints());
                    }
                    alterTable_1.AlterTable.alterColumnForTable(geoPackage.connection, dataColumnsTable, nameColumn);
                }
                coreSQLUtils_1.CoreSQLUtils.transferTableContent(geoPackage.connection, dataColumnsDao_1.DataColumnsDao.TABLE_NAME, dataColumnsDao_1.DataColumnsDao.COLUMN_TABLE_NAME, newTable, table);
            }
        }
        catch (e) {
            console.warn('Failed to create Schema for table: '
                + newTable + ', copied from table: ' + table, e);
        }
    };
    /**
     * Delete the Metadata extensions for the table
     * @param geoPackage GeoPackage
     * @param table table name
     */
    GeoPackageExtensions.deleteMetadata = function (geoPackage, table) {
        var metadataReferenceDao = geoPackage.metadataReferenceDao;
        try {
            if (metadataReferenceDao.isTableExists()) {
                metadataReferenceDao.deleteByTableName(table);
            }
        }
        catch (SQLe) {
            throw new Error('Failed to delete Metadata extension. GeoPackage: ' + geoPackage.name + ', Table: ' + table);
        }
    };
    /**
     * Delete the Metadata extension
     * @param geoPackage GeoPackage
     */
    GeoPackageExtensions.deleteMetadataExtension = function (geoPackage) {
        var metadataExtension = new metadata_1.MetadataExtension(geoPackage);
        if (metadataExtension.has()) {
            metadataExtension.removeExtension();
        }
    };
    /**
     * Copy the Metadata extensions for the table
     * @param geoPackage  GeoPackage
     * @param table table name
     * @param newTable  new table name
     */
    GeoPackageExtensions.copyMetadata = function (geoPackage, table, newTable) {
        try {
            if (geoPackage.isTable(metadataReferenceDao_1.MetadataReferenceDao.TABLE_NAME)) {
                coreSQLUtils_1.CoreSQLUtils.transferTableContent(geoPackage.connection, metadataReferenceDao_1.MetadataReferenceDao.TABLE_NAME, metadataReferenceDao_1.MetadataReferenceDao.COLUMN_TABLE_NAME, newTable, table);
            }
        }
        catch (e) {
            console.warn('Failed to create Metadata for table: ' + newTable + ', copied from table: ' + table, e);
        }
    };
    /**
     * Delete the WKT for Coordinate Reference Systems extension
     * @param geoPackage GeoPackage
     */
    GeoPackageExtensions.deleteCrsWktExtension = function (geoPackage) {
        var crsWktExtension = new crsWkt_1.CrsWktExtension(geoPackage);
        if (crsWktExtension.has()) {
            crsWktExtension.removeExtension();
        }
    };
    return GeoPackageExtensions;
}());
exports.GeoPackageExtensions = GeoPackageExtensions;
//# sourceMappingURL=geoPackageExtensions.js.map