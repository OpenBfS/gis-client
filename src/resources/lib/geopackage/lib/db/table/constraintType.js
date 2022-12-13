"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstraintType = void 0;
var ConstraintType;
(function (ConstraintType) {
    /**
     * Primary key table and column constraint
     */
    ConstraintType[ConstraintType["PRIMARY_KEY"] = 0] = "PRIMARY_KEY";
    /**
     * Unique table and column constraint
     */
    ConstraintType[ConstraintType["UNIQUE"] = 1] = "UNIQUE";
    /**
     * Check table and column constraint
     */
    ConstraintType[ConstraintType["CHECK"] = 2] = "CHECK";
    /**
     * Foreign key table and column constraint
     */
    ConstraintType[ConstraintType["FOREIGN_KEY"] = 3] = "FOREIGN_KEY";
    /**
     * Not null column constraint
     */
    ConstraintType[ConstraintType["NOT_NULL"] = 4] = "NOT_NULL";
    /**
     * Default column constraint
     */
    ConstraintType[ConstraintType["DEFAULT"] = 5] = "DEFAULT";
    /**
     * Collate column constraint
     */
    ConstraintType[ConstraintType["COLLATE"] = 6] = "COLLATE";
    /**
     * Autoincrement column constraint
     */
    ConstraintType[ConstraintType["AUTOINCREMENT"] = 7] = "AUTOINCREMENT";
})(ConstraintType = exports.ConstraintType || (exports.ConstraintType = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (ConstraintType) {
    function nameFromType(type) {
        return ConstraintType[type];
    }
    ConstraintType.nameFromType = nameFromType;
    function fromName(type) {
        return ConstraintType[type];
    }
    ConstraintType.fromName = fromName;
    /**
     * Table constraints
     */
    ConstraintType.TABLE_CONSTRAINTS = new Set([ConstraintType.PRIMARY_KEY, ConstraintType.UNIQUE, ConstraintType.CHECK, ConstraintType.FOREIGN_KEY]);
    /**
     * Column constraints
     */
    ConstraintType.COLUMN_CONSTRAINTS = new Set([ConstraintType.PRIMARY_KEY, ConstraintType.NOT_NULL, ConstraintType.UNIQUE, ConstraintType.CHECK, ConstraintType.DEFAULT, ConstraintType.COLLATE, ConstraintType.FOREIGN_KEY, ConstraintType.AUTOINCREMENT]);
    /**
     * Table constraint parsing lookup values
     */
    var tableLookup = new Map();
    Array.from(ConstraintType.TABLE_CONSTRAINTS).forEach(function (type) {
        addLookups(tableLookup, type);
    });
    /**
     * Column constraint parsing lookup values
     */
    var columnLookup = new Map();
    Array.from(ConstraintType.COLUMN_CONSTRAINTS).forEach(function (type) {
        addLookups(columnLookup, type);
    });
    /**
     * Add constraint lookup values
     * @param lookup lookup map
     * @param type constraint type
     */
    function addLookups(lookup, type) {
        var name = ConstraintType.nameFromType(type);
        var parts = name.split('_');
        lookup.set(parts[0], type);
        if (parts.length > 0) {
            lookup.set(name.replace('_', ' '), type);
        }
    }
    /**
     * Get a matching table constraint type from the value
     * @param value table constraint name value
     * @return constraint type or null
     */
    function getTableType(value) {
        return tableLookup.get(value.toUpperCase());
    }
    ConstraintType.getTableType = getTableType;
    /**
     * Get a matching column constraint type from the value
     *
     * @param value
     *            column constraint name value
     * @return constraint type or null
     */
    function getColumnType(value) {
        return columnLookup.get(value.toUpperCase());
    }
    ConstraintType.getColumnType = getColumnType;
    /**
     * Get a matching constraint type from the value
     *
     * @param value
     *            constraint name value
     * @return constraint type or null
     */
    function getType(value) {
        var type = getTableType(value);
        if (type == null) {
            type = getColumnType(value);
        }
        return type;
    }
    ConstraintType.getType = getType;
})(ConstraintType = exports.ConstraintType || (exports.ConstraintType = {}));
//# sourceMappingURL=constraintType.js.map