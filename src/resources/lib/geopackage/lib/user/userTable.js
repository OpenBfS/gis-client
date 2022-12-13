"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTable = void 0;
var constraints_1 = require("../db/table/constraints");
/**
 * `UserTable` models optional [user data tables](https://www.geopackage.org/spec121/index.html#_options)
 * in a [GeoPackage]{@link module:geoPackage~GeoPackage}.
 *
 * @class
 * @param  {string} tableName table name
 * @param  {module:user/userColumn~UserColumn[]} columns user columns
 * @param  {string[]} [requiredColumns] required columns
 */
var UserTable = /** @class */ (function () {
    /**
     *
     * @param columns
     */
    function UserTable(columns) {
        /**
         * Constraints
         */
        this.constraints = new constraints_1.Constraints();
        this.columns = columns;
        this.constraints = new constraints_1.Constraints();
    }
    UserTable.prototype.copy = function () {
        var userTableCopy = new UserTable(this.columns.copy());
        userTableCopy.constraints.addConstraints(this.constraints);
        if (this.contents !== null && this.contents !== undefined) {
            userTableCopy.contents = this.contents.copy();
        }
        return userTableCopy;
    };
    UserTable.prototype.getTableName = function () {
        return this.columns.getTableName();
    };
    Object.defineProperty(UserTable.prototype, "tableType", {
        get: function () {
            return 'userTable';
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the user columns
     * @return user columns
     */
    UserTable.prototype.getUserColumns = function () {
        return this.columns;
    };
    /**
     * Get the column index of the column name
     * @param  {string} columnName column name
     * @return {Number} the column index
     * @throws Will throw an error if the column is not found in the table
     */
    UserTable.prototype.getColumnIndex = function (columnName) {
        return this.columns.getColumnIndexForColumnName(columnName);
    };
    /**
     * Check if the table has the column
     * @param  {string} columnName name of the column
     * @return {Boolean}            true if the column exists in the table
     */
    UserTable.prototype.hasColumn = function (columnName) {
        try {
            this.getColumnIndex(columnName);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    /**
     * Get the column name from the index
     * @param  {Number} index index
     * @return {string} the column name
     */
    UserTable.prototype.getColumnNameWithIndex = function (index) {
        return this.columns.getColumnName(index);
    };
    /**
     * Get the column from the index
     * @param  {Number} index index
     * @return {module:user/userColumn~UserColumn} column at the index
     */
    UserTable.prototype.getColumnWithIndex = function (index) {
        return this.columns.getColumnForIndex(index);
    };
    /**
     * Get column with the column name
     * @param  {string} columnName column name
     * @return {module:user/userColumn~UserColumn}            column at the index
     */
    UserTable.prototype.getColumnWithColumnName = function (columnName) {
        return this.getColumnWithIndex(this.getColumnIndex(columnName));
    };
    /**
     * Get the column count
     * @return {Number} the count of the columns
     */
    UserTable.prototype.getColumnCount = function () {
        return this.columns.columnCount();
    };
    /**
     * Get the primary key column
     * @return {module:user/userColumn~UserColumn} the primary key column
     */
    UserTable.prototype.getPkColumn = function () {
        return this.columns.getPkColumn();
    };
    /**
     * Get the primary key column name
     * @return primary key column name
     */
    UserTable.prototype.getPkColumnName = function () {
        return this.columns.getPkColumnName();
    };
    /**
     * Get the column index of the id column
     * @return {Number}
     */
    UserTable.prototype.getIdColumnIndex = function () {
        return this.columns.getPkColumnIndex();
    };
    /**
     * Get the primary key id column
     * @return {module:user/userColumn~UserColumn}
     */
    UserTable.prototype.getIdColumn = function () {
        return this.getPkColumn();
    };
    /**
     * Add constraint
     * @param constraint constraint
     */
    UserTable.prototype.addConstraint = function (constraint) {
        this.constraints.add(constraint);
    };
    /**
     * Add constraints
     * @param constraints constraints
     */
    UserTable.prototype.addConstraints = function (constraints) {
        this.constraints.addConstraints(constraints);
    };
    /**
     * Check if has constraints
     * @return true if has constraints
     */
    UserTable.prototype.hasConstraints = function () {
        return this.constraints.has();
    };
    /**
     * Get the constraints
     * @return constraints
     */
    UserTable.prototype.getConstraints = function () {
        return this.constraints;
    };
    /**
     * Get the constraints of the provided type
     * @param type  constraint type
     * @return constraints
     */
    UserTable.prototype.getConstraintsByType = function (type) {
        return this.constraints.getConstraintsForType(type);
    };
    /**
     * Clear the constraints
     * @return cleared constraints
     */
    UserTable.prototype.clearConstraints = function () {
        return this.constraints.clear();
    };
    /**
     * Get the columns with the provided data type
     * @param type data type
     * @return columns
     */
    UserTable.prototype.columnsOfType = function (type) {
        return this.columns.columnsOfType(type);
    };
    /**
     * Get the contents
     * @return contents
     */
    UserTable.prototype.getContents = function () {
        return this.contents;
    };
    /**
     * Set the contents
     * @param contents contents
     */
    UserTable.prototype.setContents = function (contents) {
        this.contents = contents;
        if (contents !== null && contents !== undefined) {
            this.validateContents(contents);
        }
    };
    /**
     * Validate that the set contents are valid
     * @param contents contents
     */
    UserTable.prototype.validateContents = function (contents) {
    };
    /**
     * Add a new column
     * @param column new column
     */
    UserTable.prototype.addColumn = function (column) {
        this.columns.addColumn(column);
    };
    /**
     * Rename a column
     * @param column column
     * @param newColumnName new column name
     */
    UserTable.prototype.renameColumn = function (column, newColumnName) {
        this.columns.renameColumn(column, newColumnName);
    };
    /**
     * Rename a column
     * @param columnName column name
     * @param newColumnName new column name
     */
    UserTable.prototype.renameColumnWithName = function (columnName, newColumnName) {
        this.columns.renameColumnWithName(columnName, newColumnName);
    };
    /**
     * Rename a column
     * @param index column index
     * @param newColumnName new column name
     */
    UserTable.prototype.renameColumnAtIndex = function (index, newColumnName) {
        this.columns.renameColumnWithIndex(index, newColumnName);
    };
    /**
     * Drop a column
     * @param column column to drop
     */
    UserTable.prototype.dropColumn = function (column) {
        this.columns.dropColumn(column);
    };
    /**
     * Drop a column
     * @param columnName column name
     */
    UserTable.prototype.dropColumnWithName = function (columnName) {
        this.columns.dropColumnWithName(columnName);
    };
    /**
     * Drop a column
     * @param index column index
     */
    UserTable.prototype.dropColumnWithIndex = function (index) {
        this.columns.dropColumnWithIndex(index);
    };
    /**
     * Alter a column
     * @param column altered column
     */
    UserTable.prototype.alterColumn = function (column) {
        this.columns.alterColumn(column);
    };
    return UserTable;
}());
exports.UserTable = UserTable;
//# sourceMappingURL=userTable.js.map