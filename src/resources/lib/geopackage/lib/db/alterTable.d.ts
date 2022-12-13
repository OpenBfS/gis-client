import { GeoPackageConnection } from './geoPackageConnection';
import { UserTable } from '../user/userTable';
import { TableMapping } from './tableMapping';
import { UserColumn } from '../user/userColumn';
/**
 * Builds and performs alter table statements
 */
export declare class AlterTable {
    /**
     * Create the ALTER TABLE SQL command prefix
     * @param table table name
     * @return alter table SQL prefix
     */
    static alterTableSQL(table: string): string;
    /**
     * Rename a table
     * @param db connection
     * @param tableName table name
     * @param newTableName  new table name
     */
    static renameTable(db: GeoPackageConnection, tableName: string, newTableName: string): void;
    /**
     * Create the rename table SQL
     * @param tableName table name
     * @param newTableName new table name
     * @return rename table SQL
     */
    static renameTableSQL(tableName: string, newTableName: string): string;
    /**
     * Rename a column
     * @param db connection
     * @param tableName table name
     * @param columnName column name
     * @param newColumnName new column name
     */
    static renameColumn(db: GeoPackageConnection, tableName: string, columnName: string, newColumnName: string): void;
    /**
     * Create the rename column SQL
     * @param tableName table name
     * @param columnName column name
     * @param newColumnName new column name
     * @return rename table SQL
     */
    static renameColumnSQL(tableName: string, columnName: string, newColumnName: string): string;
    /**
     * Add a column
     * @param db connection
     * @param tableName table name
     * @param columnName column name
     * @param columnDef column definition
     */
    static addColumn(db: GeoPackageConnection, tableName: string, columnName: string, columnDef: string): void;
    /**
     * Create the add column SQL
     * @param tableName table name
     * @param columnName column name
     * @param columnDef column definition
     * @return add column SQL
     */
    static addColumnSQL(tableName: string, columnName: string, columnDef: string): string;
    /**
     * Drop a column
     * @param db connection
     * @param table table
     * @param columnName  column name
     */
    static dropColumnForUserTable(db: GeoPackageConnection, table: UserTable<UserColumn>, columnName: string): void;
    /**
     * Drop columns
     *
     * @param db connection
     * @param table table
     * @param columnNames column names
     */
    static dropColumnsForUserTable(db: GeoPackageConnection, table: UserTable<UserColumn>, columnNames: Array<string>): void;
    /**
     * Drop a column
     * @param db connection
     * @param tableName table name
     * @param columnName column name
     */
    static dropColumn(db: GeoPackageConnection, tableName: string, columnName: string): void;
    /**
     * Drop columns
     *
     * @param db connection
     * @param tableName table name
     * @param columnNames column names
     */
    static dropColumns(db: GeoPackageConnection, tableName: string, columnNames: Array<string>): void;
    /**
     * Alter a column
     * @param db connection
     * @param table table
     * @param column column
     * @param user column type
     */
    static alterColumnForTable(db: GeoPackageConnection, table: UserTable<UserColumn>, column: any): void;
    /**
     * Alter columns
     * @param db connection
     * @param table table
     * @param columns columns
     */
    static alterColumnsForTable(db: GeoPackageConnection, table: UserTable<UserColumn>, columns: UserColumn[]): void;
    /**
     * Alter a column
     * @param db connection
     * @param tableName table name
     * @param column column
     */
    static alterColumn(db: GeoPackageConnection, tableName: string, column: UserColumn): void;
    /**
     * Alter columns
     * @param db connection
     * @param tableName table name
     * @param columns columns
     */
    static alterColumns(db: GeoPackageConnection, tableName: string, columns: UserColumn[]): void;
    /**
     * Copy the table
     * @param db connection
     * @param table table
     * @param newTableName new table name
     * @param transferContent transfer row content to the new table
     */
    static copyTable(db: GeoPackageConnection, table: UserTable<UserColumn>, newTableName: string, transferContent?: boolean): void;
    /**
     * Copy the table
     * @param db connection
     * @param tableName table name
     * @param newTableName new table name
     * @param transferContent transfer row content to the new table
     */
    static copyTableWithName(db: GeoPackageConnection, tableName: string, newTableName: string, transferContent?: boolean): void;
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
    static alterTable(db: GeoPackageConnection, newTable: UserTable<UserColumn>): void;
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
    static alterTableWithTableMapping(db: GeoPackageConnection, newTable: UserTable<UserColumn>, tableMapping: TableMapping): void;
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
    static alterTableWithSQLAndTableMapping(db: GeoPackageConnection, sql: string, tableMapping: TableMapping): void;
    /**
     * Perform a foreign key check for violations
     * @param db connection
     */
    static foreignKeyCheck(db: GeoPackageConnection): void;
}
