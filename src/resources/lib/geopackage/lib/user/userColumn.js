"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserColumn = void 0;
/**
 * @module user/userColumn
 */
var isEqual_1 = __importDefault(require("lodash/isEqual"));
var geoPackageDataType_1 = require("../db/geoPackageDataType");
var rawConstraint_1 = require("../db/table/rawConstraint");
var constraintParser_1 = require("../db/table/constraintParser");
var constraintType_1 = require("../db/table/constraintType");
var userTableDefaults_1 = require("./userTableDefaults");
var constraints_1 = require("../db/table/constraints");
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
var UserColumn = /** @class */ (function () {
    function UserColumn(index, name, dataType, max, notNull, defaultValue, primaryKey, autoincrement, unique) {
        this.index = index;
        this.name = name;
        this.dataType = dataType;
        this.max = max;
        this.notNull = notNull;
        this.defaultValue = defaultValue;
        this.primaryKey = primaryKey;
        this.autoincrement = autoincrement;
        this.unique = unique;
        this.constraints = new constraints_1.Constraints();
        this.validateMax();
        this.type = this.getTypeName(name, dataType);
        this.addDefaultConstraints();
    }
    /**
     * Validate the data type
     * @param name column name
     * @param dataType  data type
     */
    UserColumn.validateDataType = function (name, dataType) {
        if (dataType === null || dataType === undefined) {
            throw new Error('Data Type is required to create column: ' + name);
        }
    };
    /**
     * Copy the column
     * @return copied column
     */
    UserColumn.prototype.copy = function () {
        var userColumnCopy = new UserColumn(this.index, this.name, this.dataType, this.max, this.notNull, this.defaultValue, this.primaryKey, this.unique);
        userColumnCopy.min = this.min;
        userColumnCopy.constraints = this.constraints.copy();
        return userColumnCopy;
    };
    /**
     * Clears the constraints
     */
    UserColumn.prototype.clearConstraints = function () {
        return this.constraints.clear();
    };
    UserColumn.prototype.getConstraints = function () {
        return this.constraints;
    };
    UserColumn.prototype.setIndex = function (index) {
        if (this.hasIndex()) {
            if (!(0, isEqual_1.default)(index, this.index)) {
                throw new Error('User Column with a valid index may not be changed. Column Name: ' + this.name + ', Index: ' + this.index + ', Attempted Index: ' + this.index);
            }
        }
        else {
            this.index = index;
        }
    };
    /**
     * Check if the column has a valid index
     * @return true if has a valid index
     */
    UserColumn.prototype.hasIndex = function () {
        return this.index > UserColumn.NO_INDEX;
    };
    /**
     * Reset the column index
     */
    UserColumn.prototype.resetIndex = function () {
        this.index = UserColumn.NO_INDEX;
    };
    /**
     * Get the index
     *
     * @return index
     */
    UserColumn.prototype.getIndex = function () {
        return this.index;
    };
    /**
     * Set the name
     * @param name column name
     */
    UserColumn.prototype.setName = function (name) {
        this.name = name;
    };
    /**
     * Get the name
     * @return name
     */
    UserColumn.prototype.getName = function () {
        return this.name;
    };
    /**
     * Determine if this column is named the provided name
     * @param name column name
     * @return true if named the provided name
     */
    UserColumn.prototype.isNamed = function (name) {
        return this.name === name;
    };
    /**
     * Determine if the column has a max value
     * @return true if has max value
     */
    UserColumn.prototype.hasMax = function () {
        return this.max != null;
    };
    /**
     * Set the max
     * @param max max
     */
    UserColumn.prototype.setMax = function (max) {
        this.max = max;
    };
    /**
     * Get the max
     * @return max
     */
    UserColumn.prototype.getMax = function () {
        return this.max;
    };
    /**
     * Set the not null flag
     * @param notNull not null flag
     */
    UserColumn.prototype.setNotNull = function (notNull) {
        if (this.notNull !== notNull) {
            if (notNull) {
                this.addNotNullConstraint();
            }
            else {
                this.removeConstraintByType(constraintType_1.ConstraintType.NOT_NULL);
            }
        }
        this.notNull = notNull;
    };
    /**
     * Get the is not null flag
     * @return not null flag
     */
    UserColumn.prototype.isNotNull = function () {
        return this.notNull;
    };
    /**
     * Determine if the column has a default value
     * @return true if has default value
     */
    UserColumn.prototype.hasDefaultValue = function () {
        return this.defaultValue !== null && this.defaultValue !== undefined;
    };
    /**
     * Set the default value
     * @param defaultValue default value
     */
    UserColumn.prototype.setDefaultValue = function (defaultValue) {
        this.removeConstraintByType(constraintType_1.ConstraintType.DEFAULT);
        if (defaultValue !== null && defaultValue !== undefined) {
            this.addDefaultValueConstraint(defaultValue);
        }
        this.defaultValue = defaultValue;
    };
    /**
     * Get the default value
     * @return default value
     */
    UserColumn.prototype.getDefaultValue = function () {
        return this.defaultValue;
    };
    /**
     * Set the primary key flag
     * @param primaryKey primary key flag
     */
    UserColumn.prototype.setPrimaryKey = function (primaryKey) {
        if (this.primaryKey !== primaryKey) {
            if (primaryKey) {
                this.addPrimaryKeyConstraint();
            }
            else {
                this.autoincrement = false;
                this.removeConstraintByType(constraintType_1.ConstraintType.AUTOINCREMENT);
                this.removeConstraintByType(constraintType_1.ConstraintType.PRIMARY_KEY);
            }
        }
        this.primaryKey = primaryKey;
    };
    /**
     * Get the primary key flag
     * @return primary key flag
     */
    UserColumn.prototype.isPrimaryKey = function () {
        return this.primaryKey;
    };
    /**
     * Set the autoincrement flag
     * @param autoincrement autoincrement flag
     */
    UserColumn.prototype.setAutoincrement = function (autoincrement) {
        if (this.autoincrement !== autoincrement) {
            if (autoincrement) {
                this.addAutoincrementConstraint();
            }
            else {
                this.removeConstraintByType(constraintType_1.ConstraintType.AUTOINCREMENT);
            }
        }
        this.autoincrement = autoincrement;
    };
    /**
     * Get the autoincrement flag
     * @return autoincrement flag
     */
    UserColumn.prototype.isAutoincrement = function () {
        return this.autoincrement;
    };
    /**
     * Set the unique flag
     * @param unique autoincrement flag
     */
    UserColumn.prototype.setUnique = function (unique) {
        if (this.unique !== unique) {
            if (unique) {
                this.addUniqueConstraint();
            }
            else {
                this.removeConstraintByType(constraintType_1.ConstraintType.UNIQUE);
            }
        }
        this.unique = unique;
    };
    /**
     * Get the autoincrement flag
     * @return autoincrement flag
     */
    UserColumn.prototype.isUnique = function () {
        return this.unique;
    };
    /**
     * Set the data type
     * @param dataType data type
     */
    UserColumn.prototype.setDataType = function (dataType) {
        this.dataType = dataType;
    };
    /**
     * Get the data type
     * @return data type
     */
    UserColumn.prototype.getDataType = function () {
        return this.dataType;
    };
    UserColumn.prototype.getTypeName = function (name, dataType) {
        UserColumn.validateDataType(name, dataType);
        return geoPackageDataType_1.GeoPackageDataType.nameFromType(dataType);
    };
    /**
     * Validate that if max is set, the data type is text or blob
     */
    UserColumn.prototype.validateMax = function () {
        if (this.max && this.dataType !== geoPackageDataType_1.GeoPackageDataType.TEXT && this.dataType !== geoPackageDataType_1.GeoPackageDataType.BLOB) {
            throw new Error('Column max is only supported for TEXT and BLOB columns. column: ' +
                this.name +
                ', max: ' +
                this.max +
                ', type: ' +
                this.dataType);
        }
        return true;
    };
    /**
     *  Create a new primary key column
     *
     *  @param {Number} index column index
     *  @param {string} name  column name
     *  @param {boolean} autoincrement column autoincrement
     *
     *  @return {UserColumn} created column
     */
    UserColumn.createPrimaryKeyColumn = function (index, name, autoincrement) {
        if (autoincrement === void 0) { autoincrement = userTableDefaults_1.UserTableDefaults.DEFAULT_AUTOINCREMENT; }
        return new UserColumn(index, name, geoPackageDataType_1.GeoPackageDataType.INTEGER, undefined, true, undefined, true, autoincrement);
    };
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
    UserColumn.createColumn = function (index, name, type, notNull, defaultValue, max) {
        if (notNull === void 0) { notNull = false; }
        return new UserColumn(index, name, type, max, notNull, defaultValue, false);
    };
    /**
     * Add the default constraints that are enabled (not null, default value,
     * primary key, autoincrement) from the column properties
     */
    UserColumn.prototype.addDefaultConstraints = function () {
        if (this.isNotNull()) {
            this.addNotNullConstraint();
        }
        if (this.hasDefaultValue()) {
            this.addDefaultValueConstraint(this.getDefaultValue());
        }
        if (this.isPrimaryKey()) {
            this.addPrimaryKeyConstraint();
            if (this.isAutoincrement()) {
                this.addAutoincrementConstraint();
            }
        }
        if (this.isUnique()) {
            this.addUniqueConstraint();
        }
    };
    /**
     * Add a constraint
     * @param constraint constraint
     */
    UserColumn.prototype.addConstraint = function (constraint) {
        if (constraint.order === null || constraint.order === undefined) {
            this.setConstraintOrder(constraint);
        }
        this.constraints.add(constraint);
    };
    /**
     * Set the constraint order by constraint type
     * @param constraint constraint
     */
    UserColumn.prototype.setConstraintOrder = function (constraint) {
        var order = null;
        switch (constraint.getType()) {
            case constraintType_1.ConstraintType.PRIMARY_KEY:
                order = UserColumn.PRIMARY_KEY_CONSTRAINT_ORDER;
                break;
            case constraintType_1.ConstraintType.UNIQUE:
                order = UserColumn.UNIQUE_CONSTRAINT_ORDER;
                break;
            case constraintType_1.ConstraintType.NOT_NULL:
                order = UserColumn.NOT_NULL_CONSTRAINT_ORDER;
                break;
            case constraintType_1.ConstraintType.DEFAULT:
                order = UserColumn.DEFAULT_VALUE_CONSTRAINT_ORDER;
                break;
            case constraintType_1.ConstraintType.AUTOINCREMENT:
                order = UserColumn.AUTOINCREMENT_CONSTRAINT_ORDER;
                break;
            default:
        }
        constraint.order = order;
    };
    /**
     * Add a constraint
     * @param constraint constraint
     */
    UserColumn.prototype.addConstraintSql = function (constraint) {
        var type = constraintParser_1.ConstraintParser.getType(constraint);
        var name = constraintParser_1.ConstraintParser.getName(constraint);
        this.constraints.add(new rawConstraint_1.RawConstraint(type, name, constraint));
    };
    /**
     * Add constraints
     * @param constraints constraints
     */
    UserColumn.prototype.addConstraints = function (constraints) {
        this.constraints.addConstraints(constraints);
    };
    /**
     * Add constraints
     * @param constraints constraints
     */
    UserColumn.prototype.addColumnConstraints = function (constraints) {
        this.addConstraints(constraints.getConstraints());
    };
    /**
     * Add a not null constraint
     */
    UserColumn.prototype.addNotNullConstraint = function () {
        this.addConstraint(new rawConstraint_1.RawConstraint(constraintType_1.ConstraintType.NOT_NULL, null, "NOT NULL", UserColumn.NOT_NULL_CONSTRAINT_ORDER));
    };
    /**
     * Add a default value constraint
     * @param defaultValue default value
     */
    UserColumn.prototype.addDefaultValueConstraint = function (defaultValue) {
        this.addConstraint(new rawConstraint_1.RawConstraint(constraintType_1.ConstraintType.DEFAULT, null, "DEFAULT " + geoPackageDataType_1.GeoPackageDataType.columnDefaultValue(defaultValue, this.getDataType()), UserColumn.DEFAULT_VALUE_CONSTRAINT_ORDER));
    };
    /**
     * Add a primary key constraint
     */
    UserColumn.prototype.addPrimaryKeyConstraint = function () {
        this.addConstraint(new rawConstraint_1.RawConstraint(constraintType_1.ConstraintType.PRIMARY_KEY, null, "PRIMARY KEY", UserColumn.PRIMARY_KEY_CONSTRAINT_ORDER));
    };
    /**
     * Add an autoincrement constraint
     */
    UserColumn.prototype.addAutoincrementConstraint = function () {
        if (this.isPrimaryKey()) {
            this.addConstraint(new rawConstraint_1.RawConstraint(constraintType_1.ConstraintType.AUTOINCREMENT, null, "AUTOINCREMENT", UserColumn.AUTOINCREMENT_CONSTRAINT_ORDER));
        }
        else {
            throw new Error('Autoincrement may only be set on a primary key column');
        }
    };
    /**
     * Add a unique constraint
     */
    UserColumn.prototype.addUniqueConstraint = function () {
        this.addConstraint(new rawConstraint_1.RawConstraint(constraintType_1.ConstraintType.UNIQUE, null, "UNIQUE", UserColumn.UNIQUE_CONSTRAINT_ORDER));
    };
    /**
     * Removes constraints by type
     */
    UserColumn.prototype.removeConstraintByType = function (type) {
        this.constraints.clearConstraintsByType(type);
    };
    UserColumn.prototype.getType = function () {
        return this.type;
    };
    UserColumn.prototype.hasConstraints = function () {
        return this.constraints.has();
    };
    /**
     * Build the SQL for the constraint
     * @param constraint constraint
     * @return SQL or null
     */
    UserColumn.prototype.buildConstraintSql = function (constraint) {
        var sql = null;
        if (userTableDefaults_1.UserTableDefaults.DEFAULT_PK_NOT_NULL || !this.isPrimaryKey() || constraint.getType() !== constraintType_1.ConstraintType.NOT_NULL) {
            sql = constraint.buildSql();
        }
        return sql;
    };
    UserColumn.NO_INDEX = -1;
    /**
     * Not Null Constraint Order
     */
    UserColumn.NOT_NULL_CONSTRAINT_ORDER = 1;
    /**
     * Default Value Constraint Order
     */
    UserColumn.DEFAULT_VALUE_CONSTRAINT_ORDER = 2;
    /**
     * Primary Key Constraint Order
     */
    UserColumn.PRIMARY_KEY_CONSTRAINT_ORDER = 3;
    /**
     * Autoincrement Constraint Order
     */
    UserColumn.AUTOINCREMENT_CONSTRAINT_ORDER = 4;
    /**
     * Unique Constraint Order
     */
    UserColumn.UNIQUE_CONSTRAINT_ORDER = 5;
    return UserColumn;
}());
exports.UserColumn = UserColumn;
//# sourceMappingURL=userColumn.js.map