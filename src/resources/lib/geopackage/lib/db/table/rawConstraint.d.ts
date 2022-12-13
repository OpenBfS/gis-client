import { Constraint } from './constraint';
import { ConstraintType } from './constraintType';
/**
 * Table raw or unparsed constraint
 */
export declare class RawConstraint extends Constraint {
    sql: string;
    /**
     * Constructor
     * @param type constraint type
     * @param name constraint name
     * @param sql constraint SQL
     * @param order constraint order
     */
    constructor(type: ConstraintType, name: string, sql: string, order?: number);
    buildSql(): string;
}
