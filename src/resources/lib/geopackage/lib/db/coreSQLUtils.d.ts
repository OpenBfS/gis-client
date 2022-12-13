import { UserColumn } from '../user/userColumn';
import { UserTable } from '../user/userTable';
import { GeoPackageConnection } from './geoPackageConnection';
import { TableMapping } from './tableMapping';
export declare class CoreSQLUtils {
    /**
     * Pattern for matching numbers
     */
    static NUMBER_PATTERN: string;
    /**
     * Create the user defined table SQL
     *
     * @param table user table
     * @param <TColumn> column type
     * @return create table SQL
     */
    static createTableSQL(table: UserTable<UserColumn>): string;
    /**
     * Create the column SQL in the format:
     * "column_name" column_type[(max)] [NOT NULL] [PRIMARY KEY AUTOINCREMENT]
     * @param column user column
     * @return column SQL
     */
    static columnSQL(column: UserColumn): string;
    /**
     * Create the column definition SQL in the format:
     * column_type[(max)] [NOT NULL] [PRIMARY KEY AUTOINCREMENT]
     * @param column  user column
     * @return column definition SQL
     */
    static columnDefinition(column: UserColumn): string;
    /**
     * Query for the foreign keys value
     *
     * @param db
     *            connection
     * @return true if enabled, false if disabled
     * @since 3.3.0
     */
    static foreignKeys(db: GeoPackageConnection): boolean;
    /**
     * Change the foreign keys state
     * @param db connection
     * @param on true to turn on, false to turn off
     * @return previous foreign keys value
     */
    static setForeignKeys(db: GeoPackageConnection, on: boolean): boolean;
    /**
     * Create the foreign keys SQL
     * @param on true to turn on, false to turn off
     * @return foreign keys SQL
     */
    static foreignKeysSQL(on: boolean): string;
    /**
     * Perform a foreign key check
     * @param db connection
     * @return empty list if valid or violation errors, 4 column values for each violation. see SQLite PRAGMA foreign_key_check
     */
    static foreignKeyCheck(db: GeoPackageConnection): any[];
    /**
     * Perform a foreign key check
     * @param db connection
     * @param tableName table name
     * @return empty list if valid or violation errors, 4 column values for each violation. see SQLite PRAGMA foreign_key_check
     */
    static foreignKeyCheckForTable(db: GeoPackageConnection, tableName: string): any[];
    /**
     * Create the foreign key check SQL
     * @param tableName table name
     * @return foreign key check SQL
     */
    static foreignKeyCheckSQL(tableName: string): string;
    /**
     * Create the integrity check SQL
     * @return integrity check SQL
     */
    static integrityCheckSQL(): string;
    /**
     * Create the quick check SQL
     * @return quick check SQL
     */
    static quickCheckSQL(): string;
    /**
     * Drop the table if it exists
     * @param db connection
     * @param tableName table name
     */
    static dropTable(db: GeoPackageConnection, tableName: string): void;
    /**
     * Create the drop table if exists SQL
     * @param tableName table name
     * @return drop table SQL
     */
    static dropTableSQL(tableName: string): string;
    /**
     * Drop the view if it exists
     * @param db connection
     * @param viewName view name
     */
    static dropView(db: GeoPackageConnection, viewName: string): void;
    /**
     * Create the drop view if exists SQL
     * @param viewName view name
     * @return drop view SQL
     */
    static dropViewSQL(viewName: string): string;
    /**
     * Transfer table content from one table to another
     * @param db connection
     * @param tableMapping table mapping
     */
    static transferTableContentForTableMapping(db: GeoPackageConnection, tableMapping: TableMapping): void;
    /**
     * Create insert SQL to transfer table content from one table to another
     * @param tableMapping table mapping
     * @return transfer SQL
     */
    static transferTableContentSQL(tableMapping: TableMapping): string;
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
    static transferTableContent(db: GeoPackageConnection, tableName: string, columnName: string, newColumnValue: any, currentColumnValue: any, idColumnName?: string): void;
    /**
     * Get an available temporary table name. Starts with prefix_baseName and
     * then continues with prefix#_baseName starting at 1 and increasing.
     * @param db connection
     * @param prefix name prefix
     * @param baseName base name
     * @return unused table name
     */
    static tempTableName(db: GeoPackageConnection, prefix: string, baseName: string): string;
    /**
     * Modify the SQL with a name change and the table mapping modifications
     * @param db optional connection, used for SQLite Master name conflict detection
     * @param name statement name
     * @param sql SQL statement
     * @param tableMapping table mapping
     * @return updated SQL, null if SQL contains a deleted column
     */
    static modifySQL(db: GeoPackageConnection, name: string, sql: string, tableMapping: TableMapping): string;
    /**
     * Modify the SQL with table mapping modifications
     * @param sql SQL statement
     * @param tableMapping table mapping
     * @return updated SQL, null if SQL contains a deleted column
     */
    static modifySQLWithTableMapping(sql: string, tableMapping: TableMapping): string;
    /**
     * Replace the name (table, column, etc) in the SQL with the replacement.
     * The name must be surrounded by non word characters (i.e. not a subset of
     * another name).
     * @param sql SQL statement
     * @param name name
     * @param replacement replacement value
     * @return null if not modified, SQL value if replaced at least once
     */
    static replaceName(sql: string, name: string, replacement: string): string;
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
    static createName(db: GeoPackageConnection, name: string, replace: string, replacement: string): string;
    /**
     * Rebuild the GeoPackage, repacking it into a minimal amount of disk space
     * @param db connection
     */
    static vacuum(db: GeoPackageConnection): void;
}
