/**
 * Column Constraints
 */
import { Constraint } from './constraint';
import { Constraints } from './constraints';
export declare class ColumnConstraints {
    name: string;
    /**
     * Column constraints
     */
    constraints: Constraints;
    /**
     * Constructor
     * @param name column name
     */
    constructor(name: string);
    /**
     * Add a constraint
     * @param constraint constraint
     */
    addConstraint(constraint: Constraint): void;
    /**
     * Add constraints
     * @param constraints constraints
     */
    addConstraints(constraints: Constraints): void;
    /**
     * Get the constraints
     * @return constraints
     */
    getConstraints(): Constraints;
    /**
     * Get the constraint at the index
     * @param index constraint index
     * @return constraint
     */
    getConstraint(index: number): Constraint;
    /**
     * Get the number of constraints
     * @return constraints count
     */
    numConstraints(): number;
    /**
     * Add constraints
     * @param constraints constraints
     */
    addColumnConstraints(constraints: ColumnConstraints): void;
    /**
     * Check if there are constraints
     * @return true if has constraints
     */
    hasConstraints(): boolean;
}
