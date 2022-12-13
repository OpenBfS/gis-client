/**
 * SQLite Master table (sqlite_master) column keywords
 */
export declare enum SQLiteMasterColumn {
    /**
     * The sqlite_master.type column will be one of the following text strings:
     * 'table', 'index', 'view', or 'trigger' according to the type of object
     * defined. The 'table' string is used for both ordinary and virtual tables.
     */
    TYPE = 0,
    /**
     * The sqlite_master.name column will hold the name of the object.
     */
    NAME = 1,
    /**
     * The sqlite_master.tbl_name column holds the name of a table or view that
     * the object is associated with. For a table or view, the tbl_name column
     * is a copy of the name column. For an index, the tbl_name is the name of
     * the table that is indexed. For a trigger, the tbl_name column stores the
     * name of the table or view that causes the trigger to fire.
     */
    TBL_NAME = 2,
    /**
     * The sqlite_master.rootpage column stores the page number of the root
     * b-tree page for tables and indexes. For rows that define views, triggers,
     * and virtual tables, the rootpage column is 0 or NULL.
     */
    ROOTPAGE = 3,
    /**
     * The sqlite_master.sql column stores SQL text that describes the object.
     * This SQL text is a CREATE TABLE, CREATE VIRTUAL TABLE, CREATE INDEX,
     * CREATE VIEW, or CREATE TRIGGER statement that if evaluated against the
     * database file when it is the main database of a database connection would
     * recreate the object.
     */
    SQL = 4
}
export declare namespace SQLiteMasterColumn {
    function nameFromType(type: SQLiteMasterColumn): string;
    function fromName(type: string): SQLiteMasterColumn;
    function asArray(): SQLiteMasterColumn[];
}
