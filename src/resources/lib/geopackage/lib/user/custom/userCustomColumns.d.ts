/**
 * @module user/custom
 */
import { UserCustomColumn } from './userCustomColumn';
import { UserColumns } from '../userColumns';
/**
 * UserCustomColumns
 */
export declare class UserCustomColumns extends UserColumns<UserCustomColumn> {
    /**
     * Required columns
     */
    requiredColumns: string[];
    constructor(tableName: string, columns: UserCustomColumn[], requiredColumns: string[], custom: boolean);
    copy(): UserCustomColumns;
    /**
     * Get the required columns
     * @return required columns
     */
    getRequiredColumns(): string[];
    /**
     * Set the required columns
     * @param requiredColumns required columns
     */
    setRequiredColumns(requiredColumns?: string[]): void;
    /**
     * {@inheritDoc}
     */
    updateColumns(): void;
}
