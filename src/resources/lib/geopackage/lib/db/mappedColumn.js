"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappedColumn = void 0;
var geoPackageDataType_1 = require("./geoPackageDataType");
var isNil_1 = __importDefault(require("lodash/isNil"));
var isEqual_1 = __importDefault(require("lodash/isEqual"));
/**
 * Mapped column, to a column and potentially from a differently named column
 */
var MappedColumn = /** @class */ (function () {
    /**
     * Constructor
     *
     * @param toColumn to column
     * @param fromColumn from column
     * @param defaultValue default value
     * @param dataType data type
     */
    function MappedColumn(toColumn, fromColumn, defaultValue, dataType) {
        this._toColumn = toColumn;
        this._fromColumn = fromColumn;
        this._defaultValue = defaultValue;
        this._dataType = dataType;
    }
    Object.defineProperty(MappedColumn.prototype, "toColumn", {
        /**
         * Get the to column
         * @return to column
         */
        get: function () {
            return this._toColumn;
        },
        /**
         * Set the to column
         * @param toColumn to column
         */
        set: function (toColumn) {
            this._toColumn = toColumn;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Determine if the column has a new name
     *
     * @return true if the to and from column names are different
     */
    MappedColumn.prototype.hasNewName = function () {
        return !(0, isNil_1.default)(this._fromColumn) && !(0, isEqual_1.default)(this._fromColumn, this._toColumn);
    };
    Object.defineProperty(MappedColumn.prototype, "fromColumn", {
        /**
         * Get the from column
         * @return from column
         */
        get: function () {
            return this._fromColumn;
        },
        /**
         * Set the from column
         * @param fromColumn to column
         */
        set: function (fromColumn) {
            this._fromColumn = fromColumn;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Check if the column has a default value
     * @return true if has a default value
     */
    MappedColumn.prototype.hasDefaultValue = function () {
        return !(0, isNil_1.default)(this._defaultValue);
    };
    Object.defineProperty(MappedColumn.prototype, "defaultValue", {
        /**
         * Get the default value
         * @return default value
         */
        get: function () {
            return this._defaultValue;
        },
        /**
         * Set the default value
         * @param defaultValue default value
         */
        set: function (defaultValue) {
            this._defaultValue = defaultValue;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the default value as a string
     * @return default value as string
     */
    MappedColumn.prototype.getDefaultValueAsString = function () {
        return geoPackageDataType_1.GeoPackageDataType.columnDefaultValue(this._defaultValue, this._dataType);
    };
    Object.defineProperty(MappedColumn.prototype, "dataType", {
        /**
         * Get the data type
         * @return data type
         */
        get: function () {
            return this._dataType;
        },
        /**
         * Set the data type
         * @param dataType data type
         */
        set: function (dataType) {
            this._dataType = dataType;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Check if the column has a constant value
     * @return true if has a constant value
     */
    MappedColumn.prototype.hasConstantValue = function () {
        return !(0, isNil_1.default)(this._constantValue);
    };
    Object.defineProperty(MappedColumn.prototype, "constantValue", {
        /**
         * Get the constant value
         * @return constant value
         */
        get: function () {
            return this._constantValue;
        },
        /**
         * Set the constant value
         * @param constantValue constant value
         */
        set: function (constantValue) {
            this._constantValue = constantValue;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the constant value as a string
     * @return constant value as string
     */
    MappedColumn.prototype.getConstantValueAsString = function () {
        return geoPackageDataType_1.GeoPackageDataType.columnDefaultValue(this._constantValue, this._dataType);
    };
    /**
     * Check if the column has a where value
     * @return true if has a where value
     */
    MappedColumn.prototype.hasWhereValue = function () {
        return !(0, isNil_1.default)(this._whereValue);
    };
    Object.defineProperty(MappedColumn.prototype, "whereValue", {
        /**
         * Get the where value
         * @return where value
         */
        get: function () {
            return this._whereValue;
        },
        /**
         * Set the where value
         * @param whereValue where value
         */
        set: function (whereValue) {
            this._whereValue = whereValue;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the where value as a string
     * @return where value as string
     */
    MappedColumn.prototype.getWhereValueAsString = function () {
        return geoPackageDataType_1.GeoPackageDataType.columnDefaultValue(this._whereValue, this._dataType);
    };
    /**
     * Set the where value
     * @param whereValue where value
     * @param whereOperator where operator
     */
    MappedColumn.prototype.setWhereValueAndOperator = function (whereValue, whereOperator) {
        this._whereValue = whereValue;
        this.whereOperator = whereOperator;
    };
    Object.defineProperty(MappedColumn.prototype, "whereOperator", {
        /**
         * Get the where operator
         * @return where operator
         */
        get: function () {
            return !(0, isNil_1.default)(this._whereOperator) ? this._whereOperator : '=';
        },
        /**
         * Set the where operator
         * @param whereOperator where operator
         */
        set: function (whereOperator) {
            this._whereOperator = whereOperator;
        },
        enumerable: false,
        configurable: true
    });
    return MappedColumn;
}());
exports.MappedColumn = MappedColumn;
//# sourceMappingURL=mappedColumn.js.map