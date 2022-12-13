import { GeoPackageDataType } from '../db/geoPackageDataType';
import { DBValue } from '../db/dbAdapter';
import { Constraint } from '../db/table/constraint';
import { ColumnConstraints } from '../db/table/columnConstraints';
import { ConstraintType } from '../db/table/constraintType';
import { Constraints } from '../db/table/constraints';
/**
 * A `UserColumn` is meta-data about a single column from a {@link module:/user/userTable~UserTable}.
 *
 * @class
 * @param {Number} index column index
 * @param {string} name column name
 * @param {module:db/geoPackageDataType~GPKGDataType} dataType data type of the column
 * @param {?Number} max max value
 * @param {Boolean} notNull not null
 * @param {?Object} defaultValue default value or null
 * @param {Boolean} primaryKey `true` if this column is part of the table's primary key
 */
export declare class UserColumn {
    index: number;
    name: string;
    dataType: GeoPackageDataType;
    max?: number;
    notNull?: boolean;
    defaultValue?: DBValue;
    primaryKey?: boolean;
    autoincrement?: boolean;
    unique?: boolean;
    static readonly NO_INDEX = -1;
    /**
     * Not Null Constraint Order
     */
    static readonly NOT_NULL_CONSTRAINT_ORDER = 1;
    /**
     * Default Value Constraint Order
     */
    static readonly DEFAULT_VALUE_CONSTRAINT_ORDER = 2;
    /**
     * Primary Key Constraint Order
     */
    static readonly PRIMARY_KEY_CONSTRAINT_ORDER = 3;
    /**
     * Autoincrement Constraint Order
     */
    static readonly AUTOINCREMENT_CONSTRAINT_ORDER = 4;
    /**
     * Unique Constraint Order
     */
    static readonly UNIQUE_CONSTRAINT_ORDER = 5;
    constraints: Constraints;
    type: string;
    min: number;
    constructor(index: number, name: string, dataType: GeoPackageDataType, max?: number, notNull?: boolean, defaultValue?: DBValue, primaryKey?: boolean, autoincrement?: boolean, unique?: boolean);
    /**
     * Validate the data type
     * @param name column name
     * @param dataType  data type
     */
    static validateDataType(name: string, dataType: GeoPackageDataType): void;
    /**
     * Copy the column
     * @return copied column
     */
    copy(): UserColumn;
    /**
     * Clears the constraints
     */
    clearConstraints(): Constraint[];
    getConstraints(): Constraints;
    setIndex(index: number): void;
    /**
     * Check if the column has a valid index
     * @return true if has a valid index
     */
    hasIndex(): boolean;
    /**
     * Reset the column index
     */
    resetIndex(): void;
    /**
     * Get the index
     *
     * @return index
     */
    getIndex(): number;
    /**
     * Set the name
     * @param name column name
     */
    setName(name: string): void;
    /**
     * Get the name
     * @return name
     */
    getName(): string;
    /**
     * Determine if this column is named the provided name
     * @param name column name
     * @return true if named the provided name
     */
    isNamed(name: string): boolean;
    /**
     * Determine if the column has a max value
     * @return true if has max value
     */
    hasMax(): boolean;
    /**
     * Set the max
     * @param max max
     */
    setMax(max: number): void;
    /**
     * Get the max
     * @return max
     */
    getMax(): number;
    /**
     * Set the not null flag
     * @param notNull not null flag
     */
    setNotNull(notNull: boolean): void;
    /**
     * Get the is not null flag
     * @return not null flag
     */
    isNotNull(): boolean;
    /**
     * Determine if the column has a default value
     * @return true if has default value
     */
    hasDefaultValue(): boolean;
    /**
     * Set the default value
     * @param defaultValue default value
     */
    setDefaultValue(defaultValue: any): void;
    /**
     * Get the default value
     * @return default value
     */
    getDefaultValue(): any;
    /**
     * Set the primary key flag
     * @param primaryKey primary key flag
     */
    setPrimaryKey(primaryKey: boolean): void;
    /**
     * Get the primary key flag
     * @return primary key flag
     */
    isPrimaryKey(): boolean;
    /**
     * Set the autoincrement flag
     * @param autoincrement autoincrement flag
     */
    setAutoincrement(autoincrement: boolean): void;
    /**
     * Get the autoincrement flag
     * @return autoincrement flag
     */
    isAutoincrement(): boolean;
    /**
     * Set the unique flag
     * @param unique autoincrement flag
     */
    protected setUnique(unique: boolean): void;
    /**
     * Get the autoincrement flag
     * @return autoincrement flag
     */
    isUnique(): boolean;
    /**
     * Set the data type
     * @param dataType data type
     */
    setDataType(dataType: GeoPackageDataType): void;
    /**
     * Get the data type
     * @return data type
     */
    getDataType(): GeoPackageDataType;
    getTypeName(name: string, dataType: GeoPackageDataType): string;
    /**
     * Validate that if max is set, the data type is text or blob
     */
    validateMax(): boolean;
    /**
     *  Create a new primary key column
     *
     *  @param {Number} index column index
     *  @param {string} name  column name
     *  @param {boolean} autoincrement column autoincrement
     *
     *  @return {UserColumn} created column
     */
    static createPrimaryKeyColumn(index: number, name: string, autoincrement?: boolean): UserColumn;
    /**
     *  Create a new column
     *
     *  @param {Number} index        column index
     *  @param {string} name         column name
     *  @param {module:db/geoPackageDataType~GPKGDataType} type         data type
     *  @param {Number} max max value
     *  @param {Boolean} notNull      not null
     *  @param {Object} defaultValue default value or nil
     *
     *  @return {module:user/userColumn~UserColumn} created column
     */
    static createColumn(index: number, name: string, type: GeoPackageDataType, notNull?: boolean, defaultValue?: DBValue, max?: number): UserColumn;
    /**
     * Add the default constraints that are enabled (not null, default value,
     * primary key, autoincrement) from the column properties
     */
    protected addDefaultConstraints(): void;
    /**
     * Add a constraint
     * @param constraint constraint
     */
    addConstraint(constraint: Constraint): void;
    /**
     * Set the constraint order by constraint type
     * @param constraint constraint
     */
    setConstraintOrder(constraint: Constraint): void;
    /**
     * Add a constraint
     * @param constraint constraint
     */
    addConstraintSql(constraint: string): void;
    /**
     * Add constraints
     * @param constraints constraints
     */
    addConstraints(constraints: Constraints): void;
    /**
     * Add constraints
     * @param constraints constraints
     */
    addColumnConstraints(constraints: ColumnConstraints): void;
    /**
     * Add a not null constraint
     */
    private addNotNullConstraint;
    /**
     * Add a default value constraint
     * @param defaultValue default value
     */
    private addDefaultValueConstraint;
    /**
     * Add a primary key constraint
     */
    private addPrimaryKeyConstraint;
    /**
     * Add an autoincrement constraint
     */
    private addAutoincrementConstraint;
    /**
     * Add a unique constraint
     */
    private addUniqueConstraint;
    /**
     * Removes constraints by type
     */
    removeConstraintByType(type: ConstraintType): void;
    getType(): string;
    hasConstraints(): boolean;
    /**
     * Build the SQL for the constraint
     * @param constraint constraint
     * @return SQL or null
     */
    buildConstraintSql(constraint: Constraint): string;
}
