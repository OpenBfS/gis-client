import { UserColumn } from './userColumn';
import { GeoPackageDataType } from '../db/geoPackageDataType';
import { Constraint } from '../db/table/constraint';
import { ConstraintType } from '../db/table/constraintType';
import { Contents } from '../core/contents/contents';
import { UserColumns } from './userColumns';
import { Constraints } from '../db/table/constraints';
/**
 * `UserTable` models optional [user data tables](https://www.geopackage.org/spec121/index.html#_options)
 * in a [GeoPackage]{@link module:geoPackage~GeoPackage}.
 *
 * @class
 * @param  {string} tableName table name
 * @param  {module:user/userColumn~UserColumn[]} columns user columns
 * @param  {string[]} [requiredColumns] required columns
 */
export declare class UserTable<TColumn extends UserColumn> {
    /**
     * Columns
     */
    columns: UserColumns<TColumn>;
    /**
     * Constraints
     */
    constraints: Constraints;
    /**
     * Foreign key to Contents
     */
    contents: Contents;
    /**
     *
     * @param columns
     */
    constructor(columns: UserColumns<TColumn>);
    copy(): UserTable<TColumn>;
    getTableName(): string;
    get tableType(): string;
    /**
     * Get the user columns
     * @return user columns
     */
    getUserColumns(): UserColumns<TColumn>;
    /**
     * Get the column index of the column name
     * @param  {string} columnName column name
     * @return {Number} the column index
     * @throws Will throw an error if the column is not found in the table
     */
    getColumnIndex(columnName: string): number;
    /**
     * Check if the table has the column
     * @param  {string} columnName name of the column
     * @return {Boolean}            true if the column exists in the table
     */
    hasColumn(columnName: string): boolean;
    /**
     * Get the column name from the index
     * @param  {Number} index index
     * @return {string} the column name
     */
    getColumnNameWithIndex(index: number): string;
    /**
     * Get the column from the index
     * @param  {Number} index index
     * @return {module:user/userColumn~UserColumn} column at the index
     */
    getColumnWithIndex(index: number): UserColumn;
    /**
     * Get column with the column name
     * @param  {string} columnName column name
     * @return {module:user/userColumn~UserColumn}            column at the index
     */
    getColumnWithColumnName(columnName: string): UserColumn;
    /**
     * Get the column count
     * @return {Number} the count of the columns
     */
    getColumnCount(): number;
    /**
     * Get the primary key column
     * @return {module:user/userColumn~UserColumn} the primary key column
     */
    getPkColumn(): UserColumn;
    /**
     * Get the primary key column name
     * @return primary key column name
     */
    getPkColumnName(): string;
    /**
     * Get the column index of the id column
     * @return {Number}
     */
    getIdColumnIndex(): number;
    /**
     * Get the primary key id column
     * @return {module:user/userColumn~UserColumn}
     */
    getIdColumn(): UserColumn;
    /**
     * Add constraint
     * @param constraint constraint
     */
    addConstraint(constraint: Constraint): void;
    /**
     * Add constraints
     * @param constraints constraints
     */
    addConstraints(constraints: Constraints): void;
    /**
     * Check if has constraints
     * @return true if has constraints
     */
    hasConstraints(): boolean;
    /**
     * Get the constraints
     * @return constraints
     */
    getConstraints(): Constraints;
    /**
     * Get the constraints of the provided type
     * @param type  constraint type
     * @return constraints
     */
    getConstraintsByType(type: ConstraintType): Constraint[];
    /**
     * Clear the constraints
     * @return cleared constraints
     */
    clearConstraints(): Constraint[];
    /**
     * Get the columns with the provided data type
     * @param type data type
     * @return columns
     */
    columnsOfType(type: GeoPackageDataType): UserColumn[];
    /**
     * Get the contents
     * @return contents
     */
    getContents(): Contents;
    /**
     * Set the contents
     * @param contents contents
     */
    setContents(contents: Contents): void;
    /**
     * Validate that the set contents are valid
     * @param contents contents
     */
    validateContents(contents: Contents): void;
    /**
     * Add a new column
     * @param column new column
     */
    addColumn(column: TColumn): void;
    /**
     * Rename a column
     * @param column column
     * @param newColumnName new column name
     */
    renameColumn(column: TColumn, newColumnName: string): void;
    /**
     * Rename a column
     * @param columnName column name
     * @param newColumnName new column name
     */
    renameColumnWithName(columnName: string, newColumnName: string): void;
    /**
     * Rename a column
     * @param index column index
     * @param newColumnName new column name
     */
    renameColumnAtIndex(index: number, newColumnName: string): void;
    /**
     * Drop a column
     * @param column column to drop
     */
    dropColumn(column: TColumn): void;
    /**
     * Drop a column
     * @param columnName column name
     */
    dropColumnWithName(columnName: string): void;
    /**
     * Drop a column
     * @param index column index
     */
    dropColumnWithIndex(index: number): void;
    /**
     * Alter a column
     * @param column altered column
     */
    alterColumn(column: TColumn): void;
}
