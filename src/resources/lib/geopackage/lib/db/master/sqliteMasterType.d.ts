/**
 * SQLite Master table (sqlite_master) type column keywords
 */
export declare enum SQLiteMasterType {
    /**
     * Table keyword
     */
    TABLE = 0,
    /**
     * Index keyword
     */
    INDEX = 1,
    /**
     * View keyword
     */
    VIEW = 2,
    /**
     * Trigger keyword
     */
    TRIGGER = 3
}
export declare namespace SQLiteMasterType {
    function nameFromType(type: SQLiteMasterType): string;
    function fromName(type: string): SQLiteMasterType;
}
