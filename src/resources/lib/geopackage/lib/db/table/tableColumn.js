"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableColumn = void 0;
/**
 * Table raw or unparsed constraint
 */
var TableColumn = /** @class */ (function () {
    /**
     * Constructor
     *
     * @param index column index
     * @param name column name
     * @param type column type
     * @param dataType column data type
     * @param max max value
     * @param notNull not null flag
     * @param defaultValueString default value as a string
     * @param defaultValue default value
     * @param primaryKey primary key flag
     * @param autoincrement autoincrement flag
     */
    function TableColumn(index, name, type, dataType, max, notNull, defaultValueString, defaultValue, primaryKey, autoincrement) {
        this.index = index;
        this.name = name;
        this.type = type;
        this.dataType = dataType;
        this.max = max;
        this.notNull = notNull;
        this.defaultValueString = defaultValueString;
        this.defaultValue = defaultValue;
        this.primaryKey = primaryKey;
        this.autoincrement = autoincrement;
    }
    /**
     * Get the column index
     *
     * @return column index
     */
    TableColumn.prototype.getIndex = function () {
        return this.index;
    };
    /**
     * Get the column name
     *
     * @return column name
     */
    TableColumn.prototype.getName = function () {
        return this.name;
    };
    /**
     * Get the column type
     *
     * @return column type
     */
    TableColumn.prototype.getType = function () {
        return this.type;
    };
    /**
     * Get the column data type
     *
     * @return column data type, may be null
     */
    TableColumn.prototype.getDataType = function () {
        return this.dataType;
    };
    /**
     * Is the column the data type
     * @param dataType data type
     * @return true if the data type
     */
    TableColumn.prototype.isDataType = function (dataType) {
        return this.dataType === dataType;
    };
    /**
     * Get the column max value
     * @return max value or null if no max
     */
    TableColumn.prototype.getMax = function () {
        return this.max;
    };
    /**
     * Is this a not null column?
     * @return true if not nullable
     */
    TableColumn.prototype.isNotNull = function () {
        return this.notNull;
    };
    /**
     * Get the default value as a string
     * @return default value as a string
     */
    TableColumn.prototype.getDefaultValueString = function () {
        return this.defaultValueString;
    };
    /**
     * Get the default value
     * @return default value
     */
    TableColumn.prototype.getDefaultValue = function () {
        return this.defaultValue;
    };
    /**
     * Is this a primary key column?
     * @return true if primary key column
     */
    TableColumn.prototype.isPrimaryKey = function () {
        return this.primaryKey;
    };
    /**
     * Is this an autoincrement column?
     * @return true if an autoincrement column
     */
    TableColumn.prototype.isAutoIncrement = function () {
        return this.autoincrement;
    };
    return TableColumn;
}());
exports.TableColumn = TableColumn;
//# sourceMappingURL=tableColumn.js.map