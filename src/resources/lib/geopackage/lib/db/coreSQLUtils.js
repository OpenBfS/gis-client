"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreSQLUtils = void 0;
/**
 * Core SQL Utility methods
 */
var stringUtils_1 = require("./stringUtils");
var tableMapping_1 = require("./tableMapping");
var tableInfo_1 = require("./table/tableInfo");
var sqliteMaster_1 = require("./master/sqliteMaster");
var sqliteMasterQuery_1 = require("./master/sqliteMasterQuery");
var sqliteMasterColumn_1 = require("./master/sqliteMasterColumn");
var CoreSQLUtils = /** @class */ (function () {
    function CoreSQLUtils() {
    }
    /**
     * Create the user defined table SQL
     *
     * @param table user table
     * @param <TColumn> column type
     * @return create table SQL
     */
    CoreSQLUtils.createTableSQL = function (table) {
        // Build the create table sql
        var sql = '';
        sql = sql.concat('CREATE TABLE ')
            .concat(stringUtils_1.StringUtils.quoteWrap(table.getTableName()))
            .concat(' (');
        // Add each column to the sql
        var columns = table.getUserColumns().getColumns();
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (i > 0) {
                sql = sql.concat(',');
            }
            sql = sql.concat('\n  ');
            sql = sql.concat(CoreSQLUtils.columnSQL(column));
        }
        // Add unique constraints
        table.getConstraints().all().forEach(function (constraint) {
            sql = sql.concat(',\n  ');
            sql = sql.concat(constraint.buildSql());
        });
        sql = sql.concat('\n);');
        return sql;
    };
    /**
     * Create the column SQL in the format:
     * "column_name" column_type[(max)] [NOT NULL] [PRIMARY KEY AUTOINCREMENT]
     * @param column user column
     * @return column SQL
     */
    CoreSQLUtils.columnSQL = function (column) {
        return stringUtils_1.StringUtils.quoteWrap(column.getName()) + ' ' + CoreSQLUtils.columnDefinition(column);
    };
    /**
     * Create the column definition SQL in the format:
     * column_type[(max)] [NOT NULL] [PRIMARY KEY AUTOINCREMENT]
     * @param column  user column
     * @return column definition SQL
     */
    CoreSQLUtils.columnDefinition = function (column) {
        var sql = '';
        sql = sql.concat(column.getType());
        if (column.hasMax()) {
            sql = sql.concat('(').concat(column.getMax().toString()).concat(')');
        }
        column.getConstraints().all().forEach(function (constraint) {
            sql = sql.concat(' ');
            sql = sql.concat(column.buildConstraintSql(constraint));
        });
        return sql.toString();
    };
    /**
     * Query for the foreign keys value
     *
     * @param db
     *            connection
     * @return true if enabled, false if disabled
     * @since 3.3.0
     */
    CoreSQLUtils.foreignKeys = function (db) {
        var foreignKeys = db.get('PRAGMA foreign_keys', null)[0];
        return foreignKeys !== null && foreignKeys !== undefined && foreignKeys;
    };
    /**
     * Change the foreign keys state
     * @param db connection
     * @param on true to turn on, false to turn off
     * @return previous foreign keys value
     */
    CoreSQLUtils.setForeignKeys = function (db, on) {
        var foreignKeys = CoreSQLUtils.foreignKeys(db);
        if (foreignKeys !== on) {
            var sql = CoreSQLUtils.foreignKeysSQL(on);
            db.run(sql);
        }
        return foreignKeys;
    };
    /**
     * Create the foreign keys SQL
     * @param on true to turn on, false to turn off
     * @return foreign keys SQL
     */
    CoreSQLUtils.foreignKeysSQL = function (on) {
        return 'PRAGMA foreign_keys = ' + on;
    };
    /**
     * Perform a foreign key check
     * @param db connection
     * @return empty list if valid or violation errors, 4 column values for each violation. see SQLite PRAGMA foreign_key_check
     */
    CoreSQLUtils.foreignKeyCheck = function (db) {
        var sql = CoreSQLUtils.foreignKeyCheckSQL(null);
        return db.all(sql, null);
    };
    /**
     * Perform a foreign key check
     * @param db connection
     * @param tableName table name
     * @return empty list if valid or violation errors, 4 column values for each violation. see SQLite PRAGMA foreign_key_check
     */
    CoreSQLUtils.foreignKeyCheckForTable = function (db, tableName) {
        var sql = CoreSQLUtils.foreignKeyCheckSQL(tableName);
        return db.all(sql, null);
    };
    /**
     * Create the foreign key check SQL
     * @param tableName table name
     * @return foreign key check SQL
     */
    CoreSQLUtils.foreignKeyCheckSQL = function (tableName) {
        return 'PRAGMA foreign_key_check' + (tableName !== null && tableName !== undefined ? '(' + stringUtils_1.StringUtils.quoteWrap(tableName) + ')' : '');
    };
    /**
     * Create the integrity check SQL
     * @return integrity check SQL
     */
    CoreSQLUtils.integrityCheckSQL = function () {
        return 'PRAGMA integrity_check';
    };
    /**
     * Create the quick check SQL
     * @return quick check SQL
     */
    CoreSQLUtils.quickCheckSQL = function () {
        return 'PRAGMA quick_check';
    };
    /**
     * Drop the table if it exists
     * @param db connection
     * @param tableName table name
     */
    CoreSQLUtils.dropTable = function (db, tableName) {
        var sql = CoreSQLUtils.dropTableSQL(tableName);
        db.run(sql);
    };
    /**
     * Create the drop table if exists SQL
     * @param tableName table name
     * @return drop table SQL
     */
    CoreSQLUtils.dropTableSQL = function (tableName) {
        return 'DROP TABLE IF EXISTS ' + stringUtils_1.StringUtils.quoteWrap(tableName);
    };
    /**
     * Drop the view if it exists
     * @param db connection
     * @param viewName view name
     */
    CoreSQLUtils.dropView = function (db, viewName) {
        var sql = CoreSQLUtils.dropViewSQL(viewName);
        db.run(sql);
    };
    /**
     * Create the drop view if exists SQL
     * @param viewName view name
     * @return drop view SQL
     */
    CoreSQLUtils.dropViewSQL = function (viewName) {
        return 'DROP VIEW IF EXISTS ' + stringUtils_1.StringUtils.quoteWrap(viewName);
    };
    /**
     * Transfer table content from one table to another
     * @param db connection
     * @param tableMapping table mapping
     */
    CoreSQLUtils.transferTableContentForTableMapping = function (db, tableMapping) {
        var sql = CoreSQLUtils.transferTableContentSQL(tableMapping);
        db.run(sql);
    };
    /**
     * Create insert SQL to transfer table content from one table to another
     * @param tableMapping table mapping
     * @return transfer SQL
     */
    CoreSQLUtils.transferTableContentSQL = function (tableMapping) {
        var insert = 'INSERT INTO ';
        insert = insert.concat(stringUtils_1.StringUtils.quoteWrap(tableMapping.toTable));
        insert = insert.concat(' (');
        var selectColumns = '';
        var where = '';
        if (tableMapping.hasWhere()) {
            where = where.concat(tableMapping.where);
        }
        var columns = tableMapping.getColumns();
        tableMapping.getColumnNames().forEach(function (key) {
            var toColumn = key;
            var column = columns[key];
            if (selectColumns.length > 0) {
                insert = insert.concat(', ');
                selectColumns = selectColumns.concat(', ');
            }
            insert = insert.concat(stringUtils_1.StringUtils.quoteWrap(toColumn));
            if (column.hasConstantValue()) {
                selectColumns = selectColumns.concat(column.getConstantValueAsString());
            }
            else {
                if (column.hasDefaultValue()) {
                    selectColumns = selectColumns.concat('ifnull(');
                }
                selectColumns = selectColumns.concat(stringUtils_1.StringUtils.quoteWrap(column.fromColumn));
                if (column.hasDefaultValue()) {
                    selectColumns = selectColumns.concat(',');
                    selectColumns = selectColumns.concat(column.getDefaultValueAsString());
                    selectColumns = selectColumns.concat(')');
                }
            }
            if (column.hasWhereValue()) {
                if (where.length > 0) {
                    where = where.concat(' AND ');
                }
                where = where.concat(stringUtils_1.StringUtils.quoteWrap(column.fromColumn));
                where = where.concat(' ');
                where = where.concat(column.whereOperator);
                where = where.concat(' ');
                where = where.concat(column.getWhereValueAsString());
            }
        });
        insert = insert.concat(') SELECT ');
        insert = insert.concat(selectColumns);
        insert = insert.concat(' FROM ');
        insert = insert.concat(stringUtils_1.StringUtils.quoteWrap(tableMapping.fromTable));
        if (where.length > 0) {
            insert = insert.concat(' WHERE ');
            insert = insert.concat(where);
        }
        return insert.toString();
    };
    /**
     * Transfer table content to itself with new rows containing a new column
     * value. All rows containing the current column value are inserted as new
     * rows with the new column value.
     * @param db connection
     * @param tableName table name
     * @param columnName column name
     * @param newColumnValue new column value for new rows
     * @param currentColumnValue column value for rows to insert as new rows
     * @param idColumnName id column name
     */
    CoreSQLUtils.transferTableContent = function (db, tableName, columnName, newColumnValue, currentColumnValue, idColumnName) {
        var tableInfo = tableInfo_1.TableInfo.info(db, tableName);
        var tableMapping = tableMapping_1.TableMapping.fromTableInfo(tableInfo);
        if (idColumnName != null) {
            tableMapping.removeColumn(idColumnName);
        }
        var column = tableMapping.getColumn(columnName);
        column.constantValue = newColumnValue;
        column.whereValue = currentColumnValue;
        CoreSQLUtils.transferTableContentForTableMapping(db, tableMapping);
    };
    /**
     * Get an available temporary table name. Starts with prefix_baseName and
     * then continues with prefix#_baseName starting at 1 and increasing.
     * @param db connection
     * @param prefix name prefix
     * @param baseName base name
     * @return unused table name
     */
    CoreSQLUtils.tempTableName = function (db, prefix, baseName) {
        var name = prefix + '_' + baseName;
        var nameNumber = 0;
        while (db.tableExists(name)) {
            name = prefix + (++nameNumber) + '_' + baseName;
        }
        return name;
    };
    /**
     * Modify the SQL with a name change and the table mapping modifications
     * @param db optional connection, used for SQLite Master name conflict detection
     * @param name statement name
     * @param sql SQL statement
     * @param tableMapping table mapping
     * @return updated SQL, null if SQL contains a deleted column
     */
    CoreSQLUtils.modifySQL = function (db, name, sql, tableMapping) {
        var updatedSql = sql;
        if (name !== null && name !== undefined && tableMapping.isNewTable()) {
            var newName = CoreSQLUtils.createName(db, name, tableMapping.fromTable, tableMapping.toTable);
            var updatedName = CoreSQLUtils.replaceName(updatedSql, name, newName);
            if (updatedName !== null && updatedName !== undefined) {
                updatedSql = updatedName;
            }
            var updatedTable = CoreSQLUtils.replaceName(updatedSql, tableMapping.fromTable, tableMapping.toTable);
            if (updatedTable !== null && updatedTable !== undefined) {
                updatedSql = updatedTable;
            }
        }
        updatedSql = CoreSQLUtils.modifySQLWithTableMapping(updatedSql, tableMapping);
        return updatedSql;
    };
    /**
     * Modify the SQL with table mapping modifications
     * @param sql SQL statement
     * @param tableMapping table mapping
     * @return updated SQL, null if SQL contains a deleted column
     */
    CoreSQLUtils.modifySQLWithTableMapping = function (sql, tableMapping) {
        var updatedSql = sql;
        var droppedColumns = Array.from(tableMapping.droppedColumns);
        for (var i = 0; i < droppedColumns.length; i++) {
            var column = droppedColumns[i];
            var updated = CoreSQLUtils.replaceName(updatedSql, column, ' ');
            if (updated !== null && updated !== undefined) {
                updatedSql = null;
                break;
            }
        }
        if (updatedSql !== null && updatedSql !== undefined) {
            tableMapping.getMappedColumns().forEach(function (column) {
                if (column.hasNewName()) {
                    var updated = CoreSQLUtils.replaceName(updatedSql, column.fromColumn, column.toColumn);
                    if (updated !== null && updated !== undefined) {
                        updatedSql = updated;
                    }
                }
            });
        }
        return updatedSql;
    };
    /**
     * Replace the name (table, column, etc) in the SQL with the replacement.
     * The name must be surrounded by non word characters (i.e. not a subset of
     * another name).
     * @param sql SQL statement
     * @param name name
     * @param replacement replacement value
     * @return null if not modified, SQL value if replaced at least once
     */
    CoreSQLUtils.replaceName = function (sql, name, replacement) {
        var updatedSql = null;
        // Quick check if contained in the SQL
        if (sql.indexOf(name) >= 0) {
            var updated = false;
            var updatedSqlBuilder = '';
            // Split the SQL apart by the name
            var parts = sql.split(name);
            for (var i = 0; i <= parts.length; i++) {
                if (i > 0) {
                    // Find the character before the name
                    var before_1 = '_';
                    var beforePart = parts[i - 1];
                    if (beforePart.length === 0) {
                        if (i == 1) {
                            // SQL starts with the name, allow
                            before_1 = ' ';
                        }
                    }
                    else {
                        before_1 = beforePart.substring(beforePart.length - 1);
                    }
                    // Find the character after the name
                    var after_1 = '_';
                    if (i < parts.length) {
                        var afterPart = parts[i];
                        if (afterPart.length !== 0) {
                            after_1 = afterPart.substring(0, 1);
                        }
                    }
                    else if (sql.endsWith(name)) {
                        // SQL ends with the name, allow
                        after_1 = ' ';
                    }
                    else {
                        break;
                    }
                    // Check the before and after characters for non word
                    // characters
                    if (before_1.match('\\W').length > 0 && after_1.match('\\W').length > 0) {
                        // Replace the name
                        updatedSqlBuilder = updatedSqlBuilder.concat(replacement);
                        updated = true;
                    }
                    else {
                        // Preserve the name
                        updatedSqlBuilder = updatedSqlBuilder.concat(name);
                    }
                }
                // Add the part to the SQL
                if (i < parts.length) {
                    updatedSqlBuilder = updatedSqlBuilder.concat(parts[i]);
                }
            }
            // Set if the SQL was modified
            if (updated) {
                updatedSql = updatedSqlBuilder.toString();
            }
        }
        return updatedSql;
    };
    /**
     * Create a new name by replacing a case insensitive value with a new value.
     * If no replacement is done, create a new name in the form name_#, where #
     * is either 2 or one greater than an existing name number suffix. When a db
     * connection is provided, check for conflicting SQLite Master names and
     * increment # until an available name is found.
     * @param db optional connection, used for SQLite Master name conflict detection
     * @param name current name
     * @param replace value to replace
     * @param replacement replacement value
     * @return new name
     */
    CoreSQLUtils.createName = function (db, name, replace, replacement) {
        // Attempt the replacement
        var newName = name.replace(new RegExp(replace), replacement);
        // If no name change was made
        if (newName === name) {
            var baseName = newName;
            var count = 1;
            // Find any existing end number: name_#
            var index = baseName.lastIndexOf('_');
            if (index >= 0 && index + 1 < baseName.length) {
                var numberPart = baseName.substring(index + 1);
                if (numberPart.match(CoreSQLUtils.NUMBER_PATTERN).length > 0) {
                    baseName = baseName.substring(0, index);
                    count = parseInt(numberPart);
                }
            }
            // Set the new name to name_2 or name_(#+1)
            newName = baseName + '_' + (++count);
            if (db !== null && db !== undefined) {
                // Check for conflicting SQLite Master table names
                while (sqliteMaster_1.SQLiteMaster.count(db, null, sqliteMasterQuery_1.SQLiteMasterQuery.createForColumnValue(sqliteMasterColumn_1.SQLiteMasterColumn.NAME, newName)) > 0) {
                    newName = baseName + '_' + (++count);
                }
            }
        }
        return newName;
    };
    /**
     * Rebuild the GeoPackage, repacking it into a minimal amount of disk space
     * @param db connection
     */
    CoreSQLUtils.vacuum = function (db) {
        db.run('VACUUM');
    };
    /**
     * Pattern for matching numbers
     */
    CoreSQLUtils.NUMBER_PATTERN = '\\d+';
    return CoreSQLUtils;
}());
exports.CoreSQLUtils = CoreSQLUtils;
//# sourceMappingURL=coreSQLUtils.js.map