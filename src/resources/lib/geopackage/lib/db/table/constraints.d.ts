import { ConstraintType } from './constraintType';
import { Constraint } from './constraint';
export declare class Constraints {
    /**
     * Constraints
     */
    constraints: any[];
    /**
     * Type Constraints
     */
    typedConstraints: {};
    /**
     * Constructor
     */
    constructor();
    /**
     * Add constraint
     * @param constraint constraint
     */
    add(constraint: Constraint): void;
    /**
     * Add constraints
     * @param constraints constraints
     */
    addConstraintArray(constraints: Constraint[]): void;
    /**
     * Add constraints
     * @param constraints constraints
     */
    addConstraints(constraints: Constraints): void;
    /**
     * Check if has constraints
     * @return true if has constraints
     */
    has(): boolean;
    /**
     * Check if has constraints of the provided type
     * @param type constraint type
     * @return true if has constraints
     */
    hasType(type: ConstraintType): boolean;
    /**
     * Get the constraints
     * @return constraints
     */
    all(): Constraint[];
    /**
     * Get the constraint at the index
     * @param index constraint index
     * @return constraint
     */
    get(index: number): Constraint;
    /**
     * Get the constraints of the provided type
     * @param type constraint type
     * @return constraints
     */
    getConstraintsForType(type: ConstraintType): Constraint[];
    /**
     * Clear the constraints
     * @return cleared constraints
     */
    clear(): Constraint[];
    /**
     * Clear the constraints of the provided type
     *
     * @param type
     *            constraint type
     * @return cleared constraints
     */
    clearConstraintsByType(type: ConstraintType): Constraint[];
    /**
     * Copy the constraints
     * @return constraints
     */
    copy(): Constraints;
    size(): number;
}
