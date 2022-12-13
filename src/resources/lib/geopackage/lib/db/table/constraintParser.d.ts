/**
 * SQL constraint parser from create table statements
 */
import { TableConstraints } from './tableConstraints';
import { ColumnConstraints } from './columnConstraints';
import { Constraint } from './constraint';
import { ConstraintType } from './constraintType';
export declare class ConstraintParser {
    /**
     * Constraint name pattern
     */
    static NAME_PATTERN: (s: string) => RegExpMatchArray;
    /**
     * Constraint name pattern name matcher group
     */
    static NAME_PATTERN_NAME_GROUP: number;
    /**
     * Constraint name and definition pattern
     */
    static CONSTRAINT_PATTERN: (s: string) => string[];
    /**
     * Constraint name and definition pattern name matcher group
     */
    static CONSTRAINT_PATTERN_NAME_GROUP: number;
    /**
     * Constraint name and definition pattern definition matcher group
     */
    static CONSTRAINT_PATTERN_DEFINITION_GROUP: number;
    /**
     * Get the constraints for the table SQL
     * @param tableSql table SQL
     * @return constraints
     */
    static getConstraints(tableSql: string): TableConstraints;
    /**
     * Add constraints of the optional type or all constraints
     * @param constraints constraints to add to
     * @param constraintSql constraint SQL statement
     */
    static addConstraints(constraints: TableConstraints, constraintSql: string): void;
    /**
     * Attempt to get column constraints by parsing the SQL statement
     * @param constraintSql constraint SQL statement
     * @return constraints
     */
    static getColumnConstraints(constraintSql: string): ColumnConstraints;
    /**
     * Create a constraint from the SQL parts with the range for the type
     * @param parts SQL parts
     * @param startIndex start index (inclusive)
     * @param endIndex end index (exclusive)
     * @param type constraint type
     * @return constraint
     */
    static createConstraint(parts: string[], startIndex: number, endIndex: number, type: ConstraintType): Constraint;
    /**
     * Attempt to get the constraint by parsing the SQL statement
     * @param constraintSql constraint SQL statement
     * @param table true to search for a table constraint, false to search for a column constraint
     * @return constraint or null
     */
    static getConstraint(constraintSql: string, table: boolean): Constraint;
    /**
     * Attempt to get a table constraint by parsing the SQL statement
     * @param constraintSql constraint SQL statement
     * @return constraint or null
     */
    static getTableConstraint(constraintSql: string): Constraint;
    /**
     * Check if the SQL is a table type constraint
     * @param constraintSql constraint SQL statement
     * @return true if a table constraint
     */
    static isTableConstraint(constraintSql: string): boolean;
    /**
     * Get the table constraint type of the constraint SQL
     * @param constraintSql constraint SQL
     * @return constraint type or null
     */
    static getTableType(constraintSql: string): ConstraintType;
    /**
     * Determine if the table constraint SQL is the constraint type
     * @param type constraint type
     * @param constraintSql constraint SQL
     * @return true if the constraint type
     */
    static isTableType(type: ConstraintType, constraintSql: string): boolean;
    /**
     * Attempt to get a column constraint by parsing the SQL statement
     * @param constraintSql constraint SQL statement
     * @return constraint or null
     */
    static getColumnConstraint(constraintSql: string): Constraint;
    /**
     * Check if the SQL is a column type constraint
     * @param constraintSql constraint SQL statement
     * @return true if a column constraint
     */
    static isColumnConstraint(constraintSql: string): boolean;
    /**
     * Get the column constraint type of the constraint SQL
     * @param constraintSql constraint SQL
     * @return constraint type or null
     */
    static getColumnType(constraintSql: string): ConstraintType;
    /**
     * Determine if the column constraint SQL is the constraint type
     * @param type constraint type
     * @param constraintSql constraint SQL
     * @return true if the constraint type
     */
    static isColumnType(type: ConstraintType, constraintSql: string): boolean;
    /**
     * Attempt to get a constraint by parsing the SQL statement
     * @param constraintSql constraint SQL statement
     * @return constraint or null
     */
    static getTableOrColumnConstraint(constraintSql: string): Constraint;
    /**
     * Check if the SQL is a constraint
     * @param constraintSql constraint SQL statement
     * @return true if a constraint
     */
    static isConstraint(constraintSql: string): boolean;
    /**
     * Get the constraint type of the constraint SQL
     * @param constraintSql constraint SQL
     * @return constraint type or null
     */
    static getType(constraintSql: string): ConstraintType;
    /**
     * Determine if the constraint SQL is the constraint type
     * @param type constraint type
     * @param constraintSql constraint SQL
     * @return true if the constraint type
     */
    static isType(type: ConstraintType, constraintSql: string): boolean;
    /**
     * Get the constraint name if it has one
     * @param constraintSql constraint SQL
     * @return constraint name or null
     */
    static getName(constraintSql: string): string;
    /**
     * Get the constraint name and remaining definition
     * @param constraintSql constraint SQL
     * @return array with name or null at index 0, definition at index 1
     */
    static getNameAndDefinition(constraintSql: string): string[];
}
