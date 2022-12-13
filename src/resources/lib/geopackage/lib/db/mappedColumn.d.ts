import { GeoPackageDataType } from './geoPackageDataType';
/**
 * Mapped column, to a column and potentially from a differently named column
 */
export declare class MappedColumn {
    /**
     * To column
     */
    _toColumn: string;
    /**
     * From column or null if the same as to column
     */
    _fromColumn: string;
    /**
     * Default to column value
     */
    _defaultValue: any;
    /**
     * Column data type
     */
    _dataType: GeoPackageDataType;
    /**
     * Constant value
     */
    _constantValue: any;
    /**
     * Where value
     */
    _whereValue: any;
    /**
     * Where value comparison operator (=, <, etc)
     */
    _whereOperator: string;
    /**
     * Constructor
     *
     * @param toColumn to column
     * @param fromColumn from column
     * @param defaultValue default value
     * @param dataType data type
     */
    constructor(toColumn: string, fromColumn: string, defaultValue: any, dataType: GeoPackageDataType);
    /**
     * Get the to column
     * @return to column
     */
    get toColumn(): string;
    /**
     * Set the to column
     * @param toColumn to column
     */
    set toColumn(toColumn: string);
    /**
     * Determine if the column has a new name
     *
     * @return true if the to and from column names are different
     */
    hasNewName(): boolean;
    /**
     * Get the from column
     * @return from column
     */
    get fromColumn(): string;
    /**
     * Set the from column
     * @param fromColumn to column
     */
    set fromColumn(fromColumn: string);
    /**
     * Check if the column has a default value
     * @return true if has a default value
     */
    hasDefaultValue(): boolean;
    /**
     * Get the default value
     * @return default value
     */
    get defaultValue(): any;
    /**
     * Get the default value as a string
     * @return default value as string
     */
    getDefaultValueAsString(): string;
    /**
     * Set the default value
     * @param defaultValue default value
     */
    set defaultValue(defaultValue: any);
    /**
     * Get the data type
     * @return data type
     */
    get dataType(): GeoPackageDataType;
    /**
     * Set the data type
     * @param dataType data type
     */
    set dataType(dataType: GeoPackageDataType);
    /**
     * Check if the column has a constant value
     * @return true if has a constant value
     */
    hasConstantValue(): boolean;
    /**
     * Get the constant value
     * @return constant value
     */
    get constantValue(): any;
    /**
     * Get the constant value as a string
     * @return constant value as string
     */
    getConstantValueAsString(): string;
    /**
     * Set the constant value
     * @param constantValue constant value
     */
    set constantValue(constantValue: any);
    /**
     * Check if the column has a where value
     * @return true if has a where value
     */
    hasWhereValue(): boolean;
    /**
     * Get the where value
     * @return where value
     */
    get whereValue(): any;
    /**
     * Get the where value as a string
     * @return where value as string
     */
    getWhereValueAsString(): string;
    /**
     * Set the where value
     * @param whereValue where value
     */
    set whereValue(whereValue: any);
    /**
     * Set the where value
     * @param whereValue where value
     * @param whereOperator where operator
     */
    setWhereValueAndOperator(whereValue: any, whereOperator: string): void;
    /**
     * Get the where operator
     * @return where operator
     */
    get whereOperator(): string;
    /**
     * Set the where operator
     * @param whereOperator where operator
     */
    set whereOperator(whereOperator: string);
}
