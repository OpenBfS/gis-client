import { ConstraintType } from './constraintType';
export declare class Constraint {
    type: ConstraintType;
    name?: string;
    order: number;
    /**
     * Constraint keyword
     */
    static CONSTRAINT: string;
    constructor(type: ConstraintType, name?: string, order?: number);
    /**
     * Build the name SQL
     *
     * @return name SQL
     */
    buildNameSql(): string;
    /**
     * Builds the sql
     */
    buildSql(): string;
    copy(): Constraint;
    getName(): string;
    getType(): ConstraintType;
    compareTo(constraint: Constraint): 1 | -1;
    private getOrder;
}
