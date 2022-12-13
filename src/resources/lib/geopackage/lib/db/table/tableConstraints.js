"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableConstraints = void 0;
/**
 * Table Constraints including column constraint
 */
var columnConstraints_1 = require("./columnConstraints");
var constraints_1 = require("./constraints");
var TableConstraints = /** @class */ (function () {
    function TableConstraints() {
        /**
         * Table constraints
         */
        this.constraints = new constraints_1.Constraints();
        /**
         * Column constraints
         */
        this.columnConstraints = {};
    }
    /**
     * Add a table constraint
     * @param constraint constraint
     */
    TableConstraints.prototype.addTableConstraint = function (constraint) {
        this.constraints.add(constraint);
    };
    /**
     * Add table constraints
     * @param constraints constraints
     */
    TableConstraints.prototype.addTableConstraints = function (constraints) {
        this.constraints.addConstraints(constraints);
    };
    /**
     * Get the table constraints
     * @return table constraints
     */
    TableConstraints.prototype.getTableConstraints = function () {
        return this.constraints;
    };
    /**
     * Get the table constraint at the index
     * @param index constraint index
     * @return table constraint
     */
    TableConstraints.prototype.getTableConstraint = function (index) {
        if (index >= this.constraints.size()) {
            return null;
        }
        return this.constraints.get(index);
    };
    /**
     * Get the number of table constraints
     * @return table constraints count
     */
    TableConstraints.prototype.numTableConstraints = function () {
        return this.constraints.size();
    };
    /**
     * Add a column constraint
     * @param columnName column name
     * @param constraint constraint
     */
    TableConstraints.prototype.addColumnConstraint = function (columnName, constraint) {
        this.getOrCreateColumnConstraints(columnName).addConstraint(constraint);
    };
    /**
     * Add column constraints
     * @param columnName column name
     * @param constraints constraints
     */
    TableConstraints.prototype.addConstraints = function (columnName, constraints) {
        this.getOrCreateColumnConstraints(columnName).addConstraints(constraints);
    };
    /**
     * Add column constraints
     * @param constraints constraints
     */
    TableConstraints.prototype.addColumnConstraints = function (constraints) {
        this.getOrCreateColumnConstraints(constraints.name).addColumnConstraints(constraints);
    };
    /**
     * Get or create the column constraints for the column name
     * @param columnName column name
     * @return column constraints
     */
    TableConstraints.prototype.getOrCreateColumnConstraints = function (columnName) {
        var constraints = this.columnConstraints[columnName];
        if (constraints === null || constraints === undefined) {
            constraints = new columnConstraints_1.ColumnConstraints(columnName);
            this.columnConstraints[columnName] = constraints;
        }
        return constraints;
    };
    /**
     * Add column constraints
     * @param constraints column constraints
     */
    TableConstraints.prototype.addColumnConstraintsMap = function (constraints) {
        var _this = this;
        constraints.forEach(function (columnConstraints) {
            _this.addColumnConstraints(columnConstraints);
        });
    };
    /**
     * Get the column constraints
     * @return column constraints
     */
    TableConstraints.prototype.getColumnConstraintsMap = function () {
        return this.columnConstraints;
    };
    /**
     * Get the column names with constraints
     * @return column names
     */
    TableConstraints.prototype.getColumnsWithConstraints = function () {
        return Array.from(Object.keys(this.columnConstraints));
    };
    /**
     * Get the column constraints
     * @param columnName column name
     * @return constraints
     */
    TableConstraints.prototype.getColumnConstraints = function (columnName) {
        return this.columnConstraints[columnName];
    };
    /**
     * Get the column constraint at the index
     * @param columnName column name
     * @param index constraint index
     * @return column constraint
     */
    TableConstraints.prototype.getColumnConstraint = function (columnName, index) {
        var constraint = null;
        var columnConstraints = this.getColumnConstraints(columnName);
        if (columnConstraints !== null && columnConstraints !== undefined) {
            constraint = columnConstraints.getConstraint(index);
        }
        return constraint;
    };
    /**
     * Get the number of column constraints for the column name
     * @param columnName column name
     * @return column constraints count
     */
    TableConstraints.prototype.numColumnConstraints = function (columnName) {
        var count = 0;
        var columnConstraints = this.getColumnConstraints(columnName);
        if (columnConstraints !== null && columnConstraints !== undefined) {
            count = columnConstraints.numConstraints();
        }
        return count;
    };
    /**
     * Add table constraints
     * @param constraints table constraints
     */
    TableConstraints.prototype.addAllConstraints = function (constraints) {
        if (constraints != null) {
            this.addTableConstraints(constraints.getTableConstraints());
            this.addColumnConstraintsMap(constraints.getColumnConstraintsMap());
        }
    };
    /**
     * Check if there are constraints
     * @return true if has constraints
     */
    TableConstraints.prototype.hasConstraints = function () {
        return this.hasTableConstraints() || this.hasColumnConstraints();
    };
    /**
     * Check if there are table constraints
     * @return true if has table constraints
     */
    TableConstraints.prototype.hasTableConstraints = function () {
        return this.constraints.has();
    };
    /**
     * Check if there are column constraints
     * @return true if has column constraints
     */
    TableConstraints.prototype.hasColumnConstraints = function () {
        return Object.keys(this.columnConstraints).length > 0;
    };
    /**
     * Check if there are column constraints for the column name
     * @param columnName column name
     * @return true if has column constraints
     */
    TableConstraints.prototype.hasColumnConstraintsForColumn = function (columnName) {
        return this.numColumnConstraints(columnName) > 0;
    };
    return TableConstraints;
}());
exports.TableConstraints = TableConstraints;
//# sourceMappingURL=tableConstraints.js.map