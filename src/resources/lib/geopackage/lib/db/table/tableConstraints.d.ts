/**
 * Table Constraints including column constraint
 */
import { ColumnConstraints } from './columnConstraints';
import { Constraint } from './constraint';
import { Constraints } from './constraints';
export declare class TableConstraints {
    /**
     * Table constraints
     */
    constraints: Constraints;
    /**
     * Column constraints
     */
    private columnConstraints;
    /**
     * Add a table constraint
     * @param constraint constraint
     */
    addTableConstraint(constraint: Constraint): void;
    /**
     * Add table constraints
     * @param constraints constraints
     */
    addTableConstraints(constraints: Constraints): void;
    /**
     * Get the table constraints
     * @return table constraints
     */
    getTableConstraints(): Constraints;
    /**
     * Get the table constraint at the index
     * @param index constraint index
     * @return table constraint
     */
    getTableConstraint(index: number): Constraint;
    /**
     * Get the number of table constraints
     * @return table constraints count
     */
    numTableConstraints(): number;
    /**
     * Add a column constraint
     * @param columnName column name
     * @param constraint constraint
     */
    addColumnConstraint(columnName: string, constraint: Constraint): void;
    /**
     * Add column constraints
     * @param columnName column name
     * @param constraints constraints
     */
    addConstraints(columnName: string, constraints: Constraints): void;
    /**
     * Add column constraints
     * @param constraints constraints
     */
    addColumnConstraints(constraints: ColumnConstraints): void;
    /**
     * Get or create the column constraints for the column name
     * @param columnName column name
     * @return column constraints
     */
    getOrCreateColumnConstraints(columnName: string): ColumnConstraints;
    /**
     * Add column constraints
     * @param constraints column constraints
     */
    addColumnConstraintsMap(constraints: Map<string, ColumnConstraints>): void;
    /**
     * Get the column constraints
     * @return column constraints
     */
    getColumnConstraintsMap(): any;
    /**
     * Get the column names with constraints
     * @return column names
     */
    getColumnsWithConstraints(): string[];
    /**
     * Get the column constraints
     * @param columnName column name
     * @return constraints
     */
    getColumnConstraints(columnName: string): ColumnConstraints;
    /**
     * Get the column constraint at the index
     * @param columnName column name
     * @param index constraint index
     * @return column constraint
     */
    getColumnConstraint(columnName: string, index: number): Constraint;
    /**
     * Get the number of column constraints for the column name
     * @param columnName column name
     * @return column constraints count
     */
    numColumnConstraints(columnName: string): number;
    /**
     * Add table constraints
     * @param constraints table constraints
     */
    addAllConstraints(constraints: TableConstraints): void;
    /**
     * Check if there are constraints
     * @return true if has constraints
     */
    hasConstraints(): boolean;
    /**
     * Check if there are table constraints
     * @return true if has table constraints
     */
    hasTableConstraints(): boolean;
    /**
     * Check if there are column constraints
     * @return true if has column constraints
     */
    hasColumnConstraints(): boolean;
    /**
     * Check if there are column constraints for the column name
     * @param columnName column name
     * @return true if has column constraints
     */
    hasColumnConstraintsForColumn(columnName: string): boolean;
}
