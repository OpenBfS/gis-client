import { UserColumn } from '../../user/userColumn';
import { Constraint } from './constraint';
/**
 * Table unique constraint for one or more columns
 */
export declare class UniqueConstraint extends Constraint {
    /**
     * Constraint keyword
     */
    static UNIQUE: string;
    /**
     * Columns included in the unique constraint
     */
    columns: UserColumn[];
    constructor(name?: string, ...columns: UserColumn[]);
    /**
     * {@inheritDoc}
     */
    buildSql(): string;
    /**
     * {@inheritDoc}
     */
    copy(): UniqueConstraint;
    /**
     * Add columns
     * @param columns columns
     */
    add(...columns: UserColumn[]): void;
    /**
     * Get the columns
     *
     * @return columns
     */
    getColumns(): UserColumn[];
}
