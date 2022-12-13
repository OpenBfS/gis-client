export declare enum ConstraintType {
    /**
     * Primary key table and column constraint
     */
    PRIMARY_KEY = 0,
    /**
     * Unique table and column constraint
     */
    UNIQUE = 1,
    /**
     * Check table and column constraint
     */
    CHECK = 2,
    /**
     * Foreign key table and column constraint
     */
    FOREIGN_KEY = 3,
    /**
     * Not null column constraint
     */
    NOT_NULL = 4,
    /**
     * Default column constraint
     */
    DEFAULT = 5,
    /**
     * Collate column constraint
     */
    COLLATE = 6,
    /**
     * Autoincrement column constraint
     */
    AUTOINCREMENT = 7
}
export declare namespace ConstraintType {
    function nameFromType(type: ConstraintType): string;
    function fromName(type: string): ConstraintType;
    /**
     * Table constraints
     */
    const TABLE_CONSTRAINTS: Set<ConstraintType>;
    /**
     * Column constraints
     */
    const COLUMN_CONSTRAINTS: Set<ConstraintType>;
    /**
     * Get a matching table constraint type from the value
     * @param value table constraint name value
     * @return constraint type or null
     */
    function getTableType(value: string): ConstraintType;
    /**
     * Get a matching column constraint type from the value
     *
     * @param value
     *            column constraint name value
     * @return constraint type or null
     */
    function getColumnType(value: string): ConstraintType;
    /**
     * Get a matching constraint type from the value
     *
     * @param value
     *            constraint name value
     * @return constraint type or null
     */
    function getType(value: string): ConstraintType;
}
