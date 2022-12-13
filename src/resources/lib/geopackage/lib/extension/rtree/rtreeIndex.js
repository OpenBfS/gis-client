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
exports.RTreeIndex = void 0;
var baseExtension_1 = require("../baseExtension");
var extension_1 = require("../extension");
var rtreeIndexDao_1 = require("./rtreeIndexDao");
var envelopeBuilder_1 = require("../../geom/envelopeBuilder");
var geometryData_1 = require("../../geom/geometryData");
/**
 * RTreeIndex extension
 * @class RTreeIndex
 * @extends BaseExtension
 * @param {module:geoPackage~GeoPackage} geoPackage The GeoPackage object
 */
var RTreeIndex = /** @class */ (function (_super) {
    __extends(RTreeIndex, _super);
    function RTreeIndex(geoPackage, featureDao) {
        var _this = _super.call(this, geoPackage) || this;
        _this.extensionName = extension_1.Extension.buildExtensionName(rtreeIndexDao_1.RTreeIndexDao.EXTENSION_RTREE_INDEX_AUTHOR, rtreeIndexDao_1.RTreeIndexDao.EXTENSION_RTREE_INDEX_NAME_NO_AUTHOR);
        _this.extensionDefinition = rtreeIndexDao_1.RTreeIndexDao.EXTENSION_RTREE_INDEX_DEFINITION;
        if (featureDao !== null && featureDao !== undefined) {
            _this.tableName = featureDao.table_name;
            _this.primaryKeyColumn = featureDao.idColumns[0];
            _this.columnName = featureDao.getGeometryColumnName();
        }
        _this.rtreeIndexDao = new rtreeIndexDao_1.RTreeIndexDao(geoPackage, featureDao);
        _this.extensionExists = _this.hasExtension(_this.extensionName, _this.tableName, _this.columnName);
        _this.createAllFunctions();
        return _this;
    }
    RTreeIndex.prototype.getRTreeIndexExtension = function () {
        return this.getExtension(this.extensionName, this.tableName, this.columnName);
    };
    RTreeIndex.prototype.getOrCreateExtension = function () {
        return this.getOrCreate(this.extensionName, this.tableName, this.columnName, this.extensionDefinition, extension_1.Extension.WRITE_ONLY);
    };
    /**
     * Create the RTree Index extension for the feature table, geometry column,
     * and id column. Creates the SQL functions, loads the tree, and creates the
     * triggers.
     * @param tableName table name
     * @param geometryColumnName geometry column name
     * @param idColumnName id column name
     * @return extension
     */
    RTreeIndex.prototype.createWithParameters = function (tableName, geometryColumnName, idColumnName) {
        if (this.hasExtension(this.extensionName, tableName, geometryColumnName)) {
            return this.getRTreeIndexExtension();
        }
        this.getOrCreate(this.extensionName, tableName, geometryColumnName, rtreeIndexDao_1.RTreeIndexDao.EXTENSION_RTREE_INDEX_DEFINITION, extension_1.Extension.WRITE_ONLY);
        this.createRTreeIndex(tableName, geometryColumnName);
        this.loadRTreeIndex(tableName, geometryColumnName, idColumnName);
        this.createAllTriggers(tableName, geometryColumnName, idColumnName);
        return this.getRTreeIndexExtension();
    };
    /**
     * Create the extension
     * @param {Function} [progress] progress function
     * @returns {Extension[]}
     */
    RTreeIndex.prototype.create = function (progress) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        var safeProgress = progress || function () { };
        if (this.extensionExists) {
            return this.getRTreeIndexExtension();
        }
        this.getOrCreate(this.extensionName, this.tableName, this.columnName, rtreeIndexDao_1.RTreeIndexDao.EXTENSION_RTREE_INDEX_DEFINITION, extension_1.Extension.WRITE_ONLY);
        this.createAllFunctions();
        this.createRTreeIndex(this.tableName, this.columnName);
        var totalCount = this.connection.count(this.tableName);
        safeProgress({
            description: 'Creating Feature Index',
            count: 0,
            totalCount: totalCount,
            layer: this.tableName,
        });
        try {
            this.loadRTreeIndex(this.tableName, this.columnName, this.primaryKeyColumn);
        }
        catch (e) {
            console.log('ERROR CREATING RTREE INDEX', e);
        }
        this.createAllTriggers(this.tableName, this.columnName, this.primaryKeyColumn);
        return this.getRTreeIndexExtension();
    };
    RTreeIndex.prototype.createAllTriggers = function (tableName, geometryColumnName, idColumnName) {
        var insertTrigger = 'CREATE TRIGGER "rtree_' +
            tableName +
            '_' +
            geometryColumnName +
            '_insert" AFTER INSERT ON "' +
            tableName +
            '" WHEN (new.' +
            geometryColumnName +
            ' NOT NULL AND NOT ST_IsEmpty(NEW.' +
            geometryColumnName +
            ')) ' +
            'BEGIN ' +
            '  INSERT OR REPLACE INTO "rtree_' +
            tableName +
            '_' +
            geometryColumnName +
            '" VALUES (' +
            '    NEW.' +
            idColumnName +
            ',' +
            '    ST_MinX(NEW.' +
            geometryColumnName +
            '), ST_MaxX(NEW.' +
            geometryColumnName +
            '), ' +
            '    ST_MinY(NEW.' +
            geometryColumnName +
            '), ST_MaxY(NEW.' +
            geometryColumnName +
            ') ' +
            '  ); ' +
            'END;';
        var update1Trigger = 'CREATE TRIGGER "rtree_' +
            tableName +
            '_' +
            geometryColumnName +
            '_update1" AFTER UPDATE OF ' +
            geometryColumnName +
            ' ON "' +
            tableName +
            '" WHEN OLD.' +
            idColumnName +
            ' = NEW.' +
            idColumnName +
            ' AND ' +
            '     (NEW.' +
            geometryColumnName +
            ' NOTNULL AND NOT ST_IsEmpty(NEW.' +
            geometryColumnName +
            ')) ' +
            'BEGIN ' +
            '  INSERT OR REPLACE INTO "rtree_' +
            tableName +
            '_' +
            geometryColumnName +
            '" VALUES (' +
            '    NEW.' +
            idColumnName +
            ',' +
            '    ST_MinX(NEW.' +
            geometryColumnName +
            '), ST_MaxX(NEW.' +
            geometryColumnName +
            '), ' +
            '    ST_MinY(NEW.' +
            geometryColumnName +
            '), ST_MaxY(NEW.' +
            geometryColumnName +
            ') ' +
            '  ); ' +
            'END;';
        var update2Trigger = 'CREATE TRIGGER "rtree_' +
            tableName +
            '_' +
            geometryColumnName +
            '_update2" AFTER UPDATE OF ' +
            geometryColumnName +
            ' ON "' +
            tableName +
            '" WHEN OLD.' +
            idColumnName +
            ' = NEW.' +
            idColumnName +
            ' AND ' +
            '       (NEW.' +
            geometryColumnName +
            ' ISNULL OR ST_IsEmpty(NEW.' +
            geometryColumnName +
            ')) ' +
            'BEGIN ' +
            '  DELETE FROM "rtree_' +
            tableName +
            '_' +
            geometryColumnName +
            '" WHERE id = OLD.' +
            idColumnName +
            '; ' +
            'END;';
        var update3Trigger = 'CREATE TRIGGER "rtree_' +
            tableName +
            '_' +
            geometryColumnName +
            '_update3" AFTER UPDATE OF ' +
            geometryColumnName +
            ' ON "' +
            tableName +
            '" WHEN OLD.' +
            idColumnName +
            ' != NEW.' +
            idColumnName +
            ' AND ' +
            '       (NEW.' +
            geometryColumnName +
            ' NOTNULL AND NOT ST_IsEmpty(NEW.' +
            geometryColumnName +
            ')) ' +
            'BEGIN ' +
            '  DELETE FROM "rtree_' +
            tableName +
            '_' +
            geometryColumnName +
            '" WHERE id = OLD.' +
            idColumnName +
            '; ' +
            '  INSERT OR REPLACE INTO "rtree_' +
            tableName +
            '_' +
            geometryColumnName +
            '" VALUES (' +
            '    NEW.' +
            idColumnName +
            ', ' +
            '    ST_MinX(NEW.' +
            geometryColumnName +
            '), ST_MaxX(NEW.' +
            geometryColumnName +
            '), ' +
            '    ST_MinY(NEW.' +
            geometryColumnName +
            '), ST_MaxY(NEW.' +
            geometryColumnName +
            ')' +
            '  ); ' +
            'END;';
        var update4Trigger = 'CREATE TRIGGER "rtree_' +
            tableName +
            '_' +
            geometryColumnName +
            '_update4" AFTER UPDATE ON "' +
            tableName +
            '"  WHEN OLD.' +
            idColumnName +
            ' != NEW.' +
            idColumnName +
            ' AND ' +
            '       (NEW.' +
            geometryColumnName +
            ' ISNULL OR ST_IsEmpty(NEW.' +
            geometryColumnName +
            ')) ' +
            'BEGIN ' +
            '  DELETE FROM "rtree_' +
            tableName +
            '_' +
            geometryColumnName +
            '" WHERE id IN (OLD.' +
            idColumnName +
            ', NEW.' +
            idColumnName +
            '); ' +
            'END;';
        var deleteTrigger = 'CREATE TRIGGER "rtree_' +
            tableName +
            '_' +
            geometryColumnName +
            '_delete" AFTER DELETE ON "' +
            tableName +
            '" WHEN old.' +
            geometryColumnName +
            ' NOT NULL ' +
            'BEGIN' +
            '  DELETE FROM "rtree_' +
            tableName +
            '_' +
            geometryColumnName +
            '" WHERE id = OLD.' +
            idColumnName +
            '; ' +
            'END;';
        var changes = 0;
        changes += this.connection.run(insertTrigger).changes;
        changes += this.connection.run(update1Trigger).changes;
        changes += this.connection.run(update2Trigger).changes;
        changes += this.connection.run(update3Trigger).changes;
        changes += this.connection.run(update4Trigger).changes;
        changes += this.connection.run(deleteTrigger).changes;
        return changes === 6;
    };
    RTreeIndex.prototype.loadRTreeIndex = function (tableName, geometryColumnName, idColumnName) {
        return (this.connection.run('INSERT OR REPLACE INTO "rtree_' +
            tableName +
            '_' +
            geometryColumnName +
            '" SELECT ' +
            idColumnName +
            ', st_minx(' +
            geometryColumnName +
            '), st_maxx(' +
            geometryColumnName +
            '), st_miny(' +
            geometryColumnName +
            '), st_maxy(' +
            geometryColumnName +
            ') FROM "' +
            tableName + '"').changes === 1);
    };
    RTreeIndex.prototype.createRTreeIndex = function (tableName, columnName) {
        return (this.connection.run('CREATE VIRTUAL TABLE "rtree_' +
            tableName +
            '_' +
            columnName +
            '" USING rtree(id, minx, maxx, miny, maxy)').changes === 1);
    };
    RTreeIndex.prototype.createAllFunctions = function () {
        this.createMinXFunction();
        this.createMaxXFunction();
        this.createMinYFunction();
        this.createMaxYFunction();
        this.createIsEmptyFunction();
    };
    RTreeIndex.prototype.createMinXFunction = function () {
        this.connection.registerFunction('ST_MinX', function (buffer) {
            var geom = new geometryData_1.GeometryData(buffer);
            if (!geom.geometry) {
                return null;
            }
            var envelope = geom.envelope;
            if (!envelope) {
                envelope = envelopeBuilder_1.EnvelopeBuilder.buildEnvelopeWithGeometry(geom.geometry);
            }
            if (envelope.minX === Infinity) {
                return null;
            }
            return envelope.minX;
        });
    };
    RTreeIndex.prototype.createMinYFunction = function () {
        this.connection.registerFunction('ST_MinY', function (buffer) {
            var geom = new geometryData_1.GeometryData(buffer);
            if (!geom.geometry) {
                return null;
            }
            var envelope = geom.envelope;
            if (!envelope) {
                envelope = envelopeBuilder_1.EnvelopeBuilder.buildEnvelopeWithGeometry(geom.geometry);
            }
            if (envelope.minY === Infinity) {
                return null;
            }
            return envelope.minY;
        });
    };
    RTreeIndex.prototype.createMaxXFunction = function () {
        this.connection.registerFunction('ST_MaxX', function (buffer) {
            var geom = new geometryData_1.GeometryData(buffer);
            if (!geom.geometry) {
                return null;
            }
            var envelope = geom.envelope;
            if (!envelope) {
                envelope = envelopeBuilder_1.EnvelopeBuilder.buildEnvelopeWithGeometry(geom.geometry);
            }
            if (envelope.maxX === -Infinity) {
                return null;
            }
            return envelope.maxX;
        });
    };
    RTreeIndex.prototype.createMaxYFunction = function () {
        this.connection.registerFunction('ST_MaxY', function (buffer) {
            var geom = new geometryData_1.GeometryData(buffer);
            if (!geom.geometry) {
                return null;
            }
            var envelope = geom.envelope;
            if (!envelope) {
                envelope = envelopeBuilder_1.EnvelopeBuilder.buildEnvelopeWithGeometry(geom.geometry);
            }
            if (envelope.maxY === -Infinity) {
                return null;
            }
            return envelope.maxY;
        });
    };
    RTreeIndex.prototype.createIsEmptyFunction = function () {
        this.connection.registerFunction('ST_IsEmpty', function (buffer) {
            var geom = new geometryData_1.GeometryData(buffer);
            var empty = !geom || geom.empty || !geom.geometry;
            return empty ? 1 : 0;
        });
    };
    RTreeIndex.prototype.has = function (table, column) {
        return this.hasExtension(this.extensionName, table, column);
    };
    RTreeIndex.prototype.deleteTable = function (tableName) {
        var _this = this;
        try {
            if (this.extensionsDao.isTableExists()) {
                var extensions = this.extensionsDao.queryByExtensionAndTableName(this.extensionName, tableName);
                extensions.forEach(function (extension) {
                    _this.deleteTableAndColumn(extension.getTableName(), extension.column_name);
                });
            }
        }
        catch (e) {
            throw new Error("Failed to delete RTree Index extensions for table. GeoPackage: " + this.geoPackage.name + ", Table: " + tableName);
        }
    };
    /**
     * Delete the RTree Index extension for the table and geometry column. Drops
     * the triggers, RTree table, and deletes the extension.
     * @param tableName table name
     * @param geometryColumnName geometry column name
     */
    RTreeIndex.prototype.deleteTableAndColumn = function (tableName, geometryColumnName) {
        if (this.has(tableName, geometryColumnName)) {
            this.dropTableAndColumn(tableName, geometryColumnName);
            try {
                this.extensionsDao.deleteByExtensionAndTableNameAndColumnName(this.extensionName, tableName, geometryColumnName);
            }
            catch (e) {
                throw new Error("Failed to delete RTree Index extension. GeoPackage: " + this.geoPackage.name + ", Table: " + tableName + ", Geometry Column: " + geometryColumnName);
            }
        }
    };
    RTreeIndex.prototype.deleteAll = function () {
        var _this = this;
        try {
            if (this.extensionsDao.isTableExists()) {
                var extensions = this.extensionsDao.queryByExtensionAndTableName(this.extensionName, this.tableName);
                extensions.forEach(function (extension) {
                    _this.deleteTableAndColumn(extension.getTableName(), extension.column_name);
                });
            }
        }
        catch (e) {
            throw new Error("Failed to delete RTree Index extensions for table. GeoPackage: " + this.geoPackage.name + ", Table: " + this.tableName);
        }
    };
    /**
     * Drop the the triggers and RTree table for the feature table
     * @param featureTable feature table
     */
    RTreeIndex.prototype.dropByFeatureTable = function (featureTable) {
        this.dropTableAndColumn(featureTable.getTableName(), featureTable.getGeometryColumnName());
    };
    /**
     * Drop the the triggers and RTree table for the table and geometry column
     *
     * @param tableName table name
     * @param geometryColumnName geometry column name
     */
    RTreeIndex.prototype.dropTableAndColumn = function (tableName, geometryColumnName) {
        this.dropAllTriggers(tableName, geometryColumnName);
        this.dropRTreeIndex(tableName, geometryColumnName);
    };
    /**
     * Drop the RTree Index Virtual Table
     * @param featureTable feature table
     */
    RTreeIndex.prototype.dropRTreeIndexByFeatureTable = function (featureTable) {
        this.dropRTreeIndex(featureTable.getTableName(), featureTable.getGeometryColumnName());
    };
    /**
     * Drop the RTree Index Virtual Table
     * @param tableName table name
     * @param geometryColumnName geometry column name
     */
    RTreeIndex.prototype.dropRTreeIndex = function (tableName, geometryColumnName) {
        try {
            this.geoPackage.connection.run('DROP TABLE "rtree_' + tableName + '_' + geometryColumnName + '"');
        }
        catch (e) {
            // If no rtree module, try to delete manually
            if (e.getMessage().indexOf("no such module: rtree") > -1) {
                this.geoPackage.connection.run('DROP TABLE IF EXISTS "rtree_' + tableName + '_' + geometryColumnName + '_node"');
                this.geoPackage.connection.run('DROP TABLE IF EXISTS "rtree_' + tableName + '_' + geometryColumnName + '_parent"');
                this.geoPackage.connection.run('DROP TABLE IF EXISTS "rtree_' + tableName + '_' + geometryColumnName + '_rowid"');
                this.geoPackage.connection.run('PRAGMA writable_schema = ON');
                this.geoPackage.connection.run('DELETE FROM sqlite_master WHERE type = "table" AND name = "rtree_' + tableName + '_' + geometryColumnName + '"');
                this.geoPackage.connection.run('PRAGMA writable_schema = OFF');
            }
            else {
                throw e;
            }
        }
    };
    /**
     * Check if the feature table has the RTree extension and if found, drop the
     * triggers
     * @param featureTable feature table
     */
    RTreeIndex.prototype.dropTriggersByFeatureTable = function (featureTable) {
        this.dropTriggers(featureTable.getTableName(), featureTable.getGeometryColumnName());
    };
    /**
     * Check if the table and column has the RTree extension and if found, drop
     * the triggers
     * @param tableName table name
     * @param columnName column name
     * @return true if dropped
     */
    RTreeIndex.prototype.dropTriggers = function (tableName, columnName) {
        var dropped = this.has(tableName, columnName);
        if (dropped) {
            this.dropAllTriggers(tableName, columnName);
        }
        return dropped;
    };
    /**
     * Drop Triggers that Maintain Spatial Index Values
     * @param featureTable feature table
     */
    RTreeIndex.prototype.dropAllTriggersByFeatureTable = function (featureTable) {
        this.dropAllTriggers(featureTable.getTableName(), featureTable.getGeometryColumnName());
    };
    /**
     * Drop Triggers that Maintain Spatial Index Values
     *
     * @param tableName table name
     * @param geometryColumnName geometry column name
     */
    RTreeIndex.prototype.dropAllTriggers = function (tableName, geometryColumnName) {
        this.dropInsertTrigger(tableName, geometryColumnName);
        this.dropUpdate1Trigger(tableName, geometryColumnName);
        this.dropUpdate2Trigger(tableName, geometryColumnName);
        this.dropUpdate3Trigger(tableName, geometryColumnName);
        this.dropUpdate4Trigger(tableName, geometryColumnName);
        this.dropDeleteTrigger(tableName, geometryColumnName);
    };
    /**
     * Drop insert trigger
     *
     * @param tableName
     *            table name
     * @param geometryColumnName
     *            geometry column name
     */
    RTreeIndex.prototype.dropInsertTrigger = function (tableName, geometryColumnName) {
        this.dropTrigger(tableName, geometryColumnName, RTreeIndex.TRIGGER_INSERT_NAME);
    };
    /**
     * Drop update 1 trigger
     *
     * @param tableName table name
     * @param geometryColumnName  geometry column name
     */
    RTreeIndex.prototype.dropUpdate1Trigger = function (tableName, geometryColumnName) {
        this.dropTrigger(tableName, geometryColumnName, RTreeIndex.TRIGGER_UPDATE1_NAME);
    };
    /**
     * Drop update 2 trigger
     *
     * @param tableName
     *            table name
     * @param geometryColumnName
     *            geometry column name
     */
    RTreeIndex.prototype.dropUpdate2Trigger = function (tableName, geometryColumnName) {
        this.dropTrigger(tableName, geometryColumnName, RTreeIndex.TRIGGER_UPDATE2_NAME);
    };
    /**
     * Drop update 3 trigger
     *
     * @param tableName
     *            table name
     * @param geometryColumnName
     *            geometry column name
     */
    RTreeIndex.prototype.dropUpdate3Trigger = function (tableName, geometryColumnName) {
        this.dropTrigger(tableName, geometryColumnName, RTreeIndex.TRIGGER_UPDATE3_NAME);
    };
    /**
     * Drop update 4 trigger
     *
     * @param tableName
     *            table name
     * @param geometryColumnName
     *            geometry column name
     */
    RTreeIndex.prototype.dropUpdate4Trigger = function (tableName, geometryColumnName) {
        this.dropTrigger(tableName, geometryColumnName, RTreeIndex.TRIGGER_UPDATE4_NAME);
    };
    /**
     * Drop delete trigger
     *
     * @param tableName
     *            table name
     * @param geometryColumnName
     *            geometry column name
     */
    RTreeIndex.prototype.dropDeleteTrigger = function (tableName, geometryColumnName) {
        this.dropTrigger(tableName, geometryColumnName, RTreeIndex.TRIGGER_DELETE_NAME);
    };
    /**
     * Drop the trigger for the table, geometry column, and trigger name
     * @param tableName table name
     * @param geometryColumnName geometry column name
     * @param triggerName trigger name
     */
    RTreeIndex.prototype.dropTrigger = function (tableName, geometryColumnName, triggerName) {
        this.geoPackage.connection.run('DROP TRIGGER IF EXISTS "rtree_' + tableName + '_' + geometryColumnName + '_' + triggerName + '"');
    };
    /**
     * Trigger Insert name
     */
    RTreeIndex.TRIGGER_INSERT_NAME = 'insert';
    /**
     * Trigger update 1 name
     */
    RTreeIndex.TRIGGER_UPDATE1_NAME = 'update1';
    /**
     * Trigger update 2 name
     */
    RTreeIndex.TRIGGER_UPDATE2_NAME = 'update2';
    /**
     * Trigger update 3 name
     */
    RTreeIndex.TRIGGER_UPDATE3_NAME = 'update3';
    /**
     * Trigger update 4 name
     */
    RTreeIndex.TRIGGER_UPDATE4_NAME = 'update4';
    /**
     * Trigger delete name
     */
    RTreeIndex.TRIGGER_DELETE_NAME = 'delete';
    return RTreeIndex;
}(baseExtension_1.BaseExtension));
exports.RTreeIndex = RTreeIndex;
//# sourceMappingURL=rtreeIndex.js.map