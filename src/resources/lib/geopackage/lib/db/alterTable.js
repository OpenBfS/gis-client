"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlterTable = void 0;
var userCustomTableReader_1 = require("../user/custom/userCustomTableReader");
var coreSQLUtils_1 = require("./coreSQLUtils");
var stringUtils_1 = require("./stringUtils");
var tableMapping_1 = require("./tableMapping");
var rawConstraint_1 = require("./table/rawConstraint");
var constraintParser_1 = require("./table/constraintParser");
var sqliteMaster_1 = require("./master/sqliteMaster");
var sqliteMasterColumn_1 = require("./master/sqliteMasterColumn");
var sqliteMasterType_1 = require("./master/sqliteMasterType");
var sqliteMasterQuery_1 = require("./master/sqliteMasterQuery");
var rtreeIndexDao_1 = require("../extension/rtree/rtreeIndexDao");
/**
 * Builds and performs alter table statements
 */
var AlterTable = /** @class */ (function () {
    function AlterTable() {
    }
    /**
     * Create the ALTER TABLE SQL command prefix
     * @param table table name
     * @return alter table SQL prefix
     */
    AlterTable.alterTableSQL = function (table) {
        return 'ALTER TABLE ' + stringUtils_1.StringUtils.quoteWrap(table);
    };
    /**
     * Rename a table
     * @param db connection
     * @param tableName table name
     * @param newTableName  new table name
     */
    AlterTable.renameTable = function (db, tableName, newTableName) {
        var sql = AlterTable.renameTableSQL(tableName, newTableName);
        db.run(sql);
    };
    /**
     * Create the rename table SQL
     * @param tableName table name
     * @param newTableName new table name
     * @return rename table SQL
     */
    AlterTable.renameTableSQL = function (tableName, newTableName) {
        return AlterTable.alterTableSQL(tableName) + ' RENAME TO ' + stringUtils_1.StringUtils.quoteWrap(newTableName);
    };
    /**
     * Rename a column
     * @param db connection
     * @param tableName table name
     * @param columnName column name
     * @param newColumnName new column name
     */
    AlterTable.renameColumn = function (db, tableName, columnName, newColumnName) {
        var sql = AlterTable.renameColumnSQL(tableName, columnName, newColumnName);
        db.run(sql);
    };
    /**
     * Create the rename column SQL
     * @param tableName table name
     * @param columnName column name
     * @param newColumnName new column name
     * @return rename table SQL
     */
    AlterTable.renameColumnSQL = function (tableName, columnName, newColumnName) {
        return AlterTable.alterTableSQL(tableName) + ' RENAME COLUMN ' + stringUtils_1.StringUtils.quoteWrap(columnName) + ' TO ' + stringUtils_1.StringUtils.quoteWrap(newColumnName);
    };
    /**
     * Add a column
     * @param db connection
     * @param tableName table name
     * @param columnName column name
     * @param columnDef column definition
     */
    AlterTable.addColumn = function (db, tableName, columnName, columnDef) {
        var sql = AlterTable.addColumnSQL(tableName, columnName, columnDef);
        db.run(sql);
    };
    /**
     * Create the add column SQL
     * @param tableName table name
     * @param columnName column name
     * @param columnDef column definition
     * @return add column SQL
     */
    AlterTable.addColumnSQL = function (tableName, columnName, columnDef) {
        return AlterTable.alterTableSQL(tableName) + ' ADD COLUMN ' + stringUtils_1.StringUtils.quoteWrap(columnName) + ' ' + columnDef;
    };
    /**
     * Drop a column
     * @param db connection
     * @param table table
     * @param columnName  column name
     */
    AlterTable.dropColumnForUserTable = function (db, table, columnName) {
        AlterTable.dropColumnsForUserTable(db, table, [columnName]);
    };
    /**
     * Drop columns
     *
     * @param db connection
     * @param table table
     * @param columnNames column names
     */
    AlterTable.dropColumnsForUserTable = function (db, table, columnNames) {
        var newTable = table.copy();
        columnNames.forEach(function (columnName) {
            newTable.dropColumnWithName(columnName);
        });
        // Build the table mapping
        var tableMapping = new tableMapping_1.TableMapping(newTable.getTableName(), newTable.getTableName(), newTable.getUserColumns().getColumns());
        columnNames.forEach(function (columnName) {
            tableMapping.addDroppedColumn(columnName);
        });
        AlterTable.alterTableWithTableMapping(db, newTable, tableMapping);
        columnNames.forEach(function (columnName) {
            table.dropColumnWithName(columnName);
        });
    };
    /**
     * Drop a column
     * @param db connection
     * @param tableName table name
     * @param columnName column name
     */
    AlterTable.dropColumn = function (db, tableName, columnName) {
        AlterTable.dropColumns(db, tableName, [columnName]);
    };
    /**
     * Drop columns
     *
     * @param db connection
     * @param tableName table name
     * @param columnNames column names
     */
    AlterTable.dropColumns = function (db, tableName, columnNames) {
        var userTable = new userCustomTableReader_1.UserCustomTableReader(tableName).readTable(db);
        AlterTable.dropColumnsForUserTable(db, userTable, columnNames);
    };
    /**
     * Alter a column
     * @param db connection
     * @param table table
     * @param column column
     * @param user column type
     */
    AlterTable.alterColumnForTable = function (db, table, column) {
        AlterTable.alterColumnsForTable(db, table, [column]);
    };
    /**
     * Alter columns
     * @param db connection
     * @param table table
     * @param columns columns
     */
    AlterTable.alterColumnsForTable = function (db, table, columns) {
        var newTable = table.copy();
        columns.forEach(function (column) {
            newTable.alterColumn(column);
        });
        AlterTable.alterTable(db, newTable);
        columns.forEach(function (column) {
            table.alterColumn(column);
        });
    };
    /**
     * Alter a column
     * @param db connection
     * @param tableName table name
     * @param column column
     */
    AlterTable.alterColumn = function (db, tableName, column) {
        AlterTable.alterColumns(db, tableName, [column]);
    };
    /**
     * Alter columns
     * @param db connection
     * @param tableName table name
     * @param columns columns
     */
    AlterTable.alterColumns = function (db, tableName, columns) {
        var userTable = new userCustomTableReader_1.UserCustomTableReader(tableName).readTable(db);
        AlterTable.alterColumnsForTable(db, userTable, columns);
    };
    /**
     * Copy the table
     * @param db connection
     * @param table table
     * @param newTableName new table name
     * @param transferContent transfer row content to the new table
     */
    AlterTable.copyTable = function (db, table, newTableName, transferContent) {
        if (transferContent === void 0) { transferContent = true; }
        // Build the table mapping
        var tableMapping = new tableMapping_1.TableMapping(table.getTableName(), newTableName, table.getUserColumns().getColumns());
        tableMapping.transferContent = transferContent;
        AlterTable.alterTableWithTableMapping(db, table, tableMapping);
    };
    /**
     * Copy the table
     * @param db connection
     * @param tableName table name
     * @param newTableName new table name
     * @param transferContent transfer row content to the new table
     */
    AlterTable.copyTableWithName = function (db, tableName, newTableName, transferContent) {
        if (transferContent === void 0) { transferContent = true; }
        var userTable = new userCustomTableReader_1.UserCustomTableReader(tableName).readTable(db);
        AlterTable.copyTable(db, userTable, newTableName, transferContent);
    };
    /**
     * Alter a table with a new table schema assuming a default table mapping.
     * This removes views on the table, creates a new table, transfers the old
     * table data to the new, drops the old table, and renames the new table to
     * the old. Indexes, triggers, and views that reference deleted columns are
     * not recreated. An attempt is made to recreate the others including any
     * modifications for renamed columns.
     *
     * Making Other Kinds Of Table Schema Changes:
     * https://www.sqlite.org/lang_altertable.html
     *
     * @param db connection
     * @param newTable  new table schema
     */
    AlterTable.alterTable = function (db, newTable) {
        // Build the table mapping
        var tableMapping = new tableMapping_1.TableMapping(newTable.getTableName(), newTable.getTableName(), newTable.getUserColumns().getColumns());
        AlterTable.alterTableWithTableMapping(db, newTable, tableMapping);
    };
    /**
     * Alter a table with a new table schema and table mapping.
     *
     * Altering a table: Removes views on the table, creates a new table,
     * transfers the old table data to the new, drops the old table, and renames
     * the new table to the old. Indexes, triggers, and views that reference
     * deleted columns are not recreated. An attempt is made to recreate the
     * others including any modifications for renamed columns.
     *
     * Creating a new table: Creates a new table and transfers the table data to
     * the new. Triggers are not created on the new table. Indexes and views
     * that reference deleted columns are not recreated. An attempt is made to
     * create the others on the new table.
     *
     * Making Other Kinds Of Table Schema Changes:
     * https://www.sqlite.org/lang_altertable.html
     *
     * @param db connection
     * @param newTable new table schema
     * @param tableMapping table mapping
     */
    AlterTable.alterTableWithTableMapping = function (db, newTable, tableMapping) {
        // Update column constraints
        newTable.getUserColumns().getColumns().forEach(function (column) {
            var columnConstraints = column.clearConstraints();
            columnConstraints.forEach(function (columnConstraint) {
                var updatedSql = coreSQLUtils_1.CoreSQLUtils.modifySQL(null, columnConstraint.name, columnConstraint.buildSql(), tableMapping);
                if (updatedSql !== null && updatedSql !== undefined) {
                    column.addConstraint(new rawConstraint_1.RawConstraint(columnConstraint.type, constraintParser_1.ConstraintParser.getName(updatedSql), updatedSql));
                }
            });
        });
        // Update table constraints
        var tableConstraints = newTable.clearConstraints();
        tableConstraints.forEach(function (tableConstraint) {
            var updatedSql = coreSQLUtils_1.CoreSQLUtils.modifySQL(null, tableConstraint.name, tableConstraint.buildSql(), tableMapping);
            if (updatedSql !== null && updatedSql !== undefined) {
                newTable.addConstraint(new rawConstraint_1.RawConstraint(tableConstraint.type, tableConstraint.name, updatedSql));
            }
        });
        // Build the create table sql
        var sql = coreSQLUtils_1.CoreSQLUtils.createTableSQL(newTable);
        AlterTable.alterTableWithSQLAndTableMapping(db, sql, tableMapping);
    };
    /**
     * Alter a table with a new table SQL creation statement and table mapping.
     *
     * Altering a table: Removes views on the table, creates a new table,
     * transfers the old table data to the new, drops the old table, and renames
     * the new table to the old. Indexes, triggers, and views that reference
     * deleted columns are not recreated. An attempt is made to recreate the
     * others including any modifications for renamed columns.
     *
     * Creating a new table: Creates a new table and transfers the table data to
     * the new. Triggers are not created on the new table. Indexes and views
     * that reference deleted columns are not recreated. An attempt is made to
     * create the others on the new table.
     *
     * Making Other Kinds Of Table Schema Changes:
     * https://www.sqlite.org/lang_altertable.html
     *
     * @param db
     *            connection
     * @param sql
     *            new table SQL
     * @param tableMapping
     *            table mapping
     */
    AlterTable.alterTableWithSQLAndTableMapping = function (db, sql, tableMapping) {
        var tableName = tableMapping.fromTable;
        // Determine if a new table copy vs an alter table
        var newTable = tableMapping.isNewTable();
        // 1. Disable foreign key constraints
        var enableForeignKeys = coreSQLUtils_1.CoreSQLUtils.setForeignKeys(db, false);
        // 2. Start a transaction
        var successful = true;
        db.transaction(function () {
            try {
                // 9a. Query for views
                var views = sqliteMaster_1.SQLiteMaster.queryViewsOnTable(db, [sqliteMasterColumn_1.SQLiteMasterColumn.NAME, sqliteMasterColumn_1.SQLiteMasterColumn.SQL], tableName);
                // Remove the views if not a new table
                if (!newTable) {
                    for (var i = 0; i < views.count(); i++) {
                        var viewName = views.getName(i);
                        try {
                            coreSQLUtils_1.CoreSQLUtils.dropView(db, viewName);
                        }
                        catch (error) {
                            console.warn('Failed to drop view: ' + viewName + ', table: ' + tableName, error);
                        }
                    }
                }
                // 3. Query indexes and triggers
                var indexesAndTriggers = sqliteMaster_1.SQLiteMaster.query(db, [sqliteMasterColumn_1.SQLiteMasterColumn.NAME, sqliteMasterColumn_1.SQLiteMasterColumn.TYPE, sqliteMasterColumn_1.SQLiteMasterColumn.SQL], [sqliteMasterType_1.SQLiteMasterType.INDEX, sqliteMasterType_1.SQLiteMasterType.TRIGGER], sqliteMasterQuery_1.SQLiteMasterQuery.createForColumnValue(sqliteMasterColumn_1.SQLiteMasterColumn.TBL_NAME, tableName));
                // Get the temporary or new table name
                var transferTable = void 0;
                if (newTable) {
                    transferTable = tableMapping.toTable;
                }
                else {
                    transferTable = coreSQLUtils_1.CoreSQLUtils.tempTableName(db, 'new', tableName);
                    tableMapping.toTable = transferTable;
                }
                // 4. Create the new table
                sql = sql.replace('"' + tableName + '"', '"' + transferTable + '"');
                db.run(sql);
                // If transferring content
                if (tableMapping.isTransferContent()) {
                    // 5. Transfer content to new table
                    coreSQLUtils_1.CoreSQLUtils.transferTableContentForTableMapping(db, tableMapping);
                }
                // If altering a table
                if (!newTable) {
                    // 6. Drop the old table
                    coreSQLUtils_1.CoreSQLUtils.dropTable(db, tableName);
                    // 7. Rename the new table
                    AlterTable.renameTable(db, transferTable, tableName);
                    tableMapping.toTable = tableName;
                }
                // 8. Create the indexes and triggers
                for (var i = 0; i < indexesAndTriggers.count(); i++) {
                    var create = !newTable;
                    if (!create) {
                        // Don't create rtree triggers for new tables
                        create = indexesAndTriggers.getType(i) != sqliteMasterType_1.SQLiteMasterType.TRIGGER || !indexesAndTriggers.getName(i).startsWith(rtreeIndexDao_1.RTreeIndexDao.PREFIX);
                    }
                    if (create) {
                        var tableSql = indexesAndTriggers.getSql(i);
                        if (tableSql != null) {
                            tableSql = coreSQLUtils_1.CoreSQLUtils.modifySQL(db, indexesAndTriggers.getName(i), tableSql, tableMapping);
                            if (tableSql != null) {
                                try {
                                    db.run(tableSql);
                                }
                                catch (e) {
                                    console.warn('Failed to recreate '
                                        + indexesAndTriggers.getType(i)
                                        + ' after table alteration. table: '
                                        + tableMapping.toTable + ', sql: '
                                        + tableSql, e);
                                }
                            }
                        }
                    }
                }
                // 9b. Recreate views
                for (var i = 0; i < views.count(); i++) {
                    var viewSql = views.getSql(i);
                    if (viewSql !== null && viewSql !== undefined) {
                        viewSql = coreSQLUtils_1.CoreSQLUtils.modifySQL(db, views.getName(i), viewSql, tableMapping);
                        if (viewSql !== null && viewSql !== undefined) {
                            try {
                                db.run(viewSql);
                            }
                            catch (e) {
                                console.warn('Failed to recreate view: '
                                    + views.getName(i) + ', table: '
                                    + tableMapping.toTable
                                    + ', sql: ' + viewSql, e);
                            }
                        }
                    }
                }
                // 10. Foreign key check
                if (enableForeignKeys) {
                    AlterTable.foreignKeyCheck(db);
                }
            }
            catch (e) {
                successful = false;
            }
        });
        // 12. Re-enable foreign key constraints
        if (enableForeignKeys) {
            coreSQLUtils_1.CoreSQLUtils.setForeignKeys(db, true);
        }
    };
    /**
     * Perform a foreign key check for violations
     * @param db connection
     */
    AlterTable.foreignKeyCheck = function (db) {
        var violations = coreSQLUtils_1.CoreSQLUtils.foreignKeyCheck(db);
        if (violations.length > 0) {
            var violationsMessage = [];
            for (var i = 0; i < violations.length; i++) {
                if (i > 0) {
                    violationsMessage = violationsMessage.concat(' ');
                }
                violationsMessage = violationsMessage.concat(i + 1).concat(': ');
                var violation = violations[i];
                for (var j = 0; j < violation.length; j++) {
                    if (j > 0) {
                        violationsMessage = violationsMessage.concat(', ');
                    }
                    violationsMessage = violationsMessage.concat(violation.get(j));
                }
            }
            throw new Error('Foreign Key Check Violations: ' + violationsMessage);
        }
    };
    return AlterTable;
}());
exports.AlterTable = AlterTable;
//# sourceMappingURL=alterTable.js.map