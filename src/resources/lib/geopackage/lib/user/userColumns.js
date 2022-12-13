"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserColumns = void 0;
var geoPackageDataType_1 = require("../db/geoPackageDataType");
var UserColumns = /** @class */ (function () {
    /**
     * Constructor
     * @param tableName table name
     * @param columns columns
     * @param custom custom column specification
     */
    function UserColumns(tableName, columns, custom) {
        if (custom === void 0) { custom = false; }
        /**
         * Primary key column index
         */
        this._pkIndex = -1;
        this._tableName = tableName;
        this._columns = columns;
        this._custom = custom;
        this._nameToIndex = new Map();
        this._columnNames = [];
    }
    /**
     * Copy the user columns
     * @return copied user columns
     */
    UserColumns.prototype.copy = function () {
        var columns = [];
        this._columns.forEach(function (column) {
            columns.push(column.copy());
        });
        var copy = new UserColumns(this._tableName, columns, this._custom);
        copy._columnNames = Array.from(this._columnNames);
        copy._nameToIndex = new Map(this._nameToIndex);
        copy._pkIndex = this._pkIndex;
        return copy;
    };
    /**
     * Update the table columns
     */
    UserColumns.prototype.updateColumns = function () {
        var _this = this;
        this._nameToIndex.clear();
        if (!this._custom) {
            var indices_1 = new Set();
            // Check for missing indices and duplicates
            var needsIndex_1 = [];
            this._columns.forEach(function (column) {
                if (column.hasIndex()) {
                    var index = column.getIndex();
                    if (indices_1.has(index)) {
                        throw new Error("Duplicate index: " + index + ", Table Name: " + _this._tableName);
                    }
                    else {
                        indices_1.add(index);
                    }
                }
                else {
                    needsIndex_1.push(column);
                }
            });
            // Update columns that need an index
            var currentIndex_1 = -1;
            needsIndex_1.forEach(function (column) {
                while (indices_1.has(++currentIndex_1)) {
                }
                column.setIndex(currentIndex_1);
            });
            // Sort the columns by index
            this._columns.sort(function (a, b) {
                return a.index - b.index;
            });
        }
        this._pkIndex = -1;
        this._columnNames = [];
        for (var index = 0; index < this._columns.length; index++) {
            var column = this._columns[index];
            var columnName = column.getName();
            var lowerCaseColumnName = columnName.toLowerCase();
            if (!this._custom) {
                if (column.getIndex() != index) {
                    throw new Error("No column found at index: "
                        + index + ", Table Name: " + this._tableName);
                }
                if (this._nameToIndex.has(lowerCaseColumnName)) {
                    throw new Error('Duplicate column found at index: ' + index
                        + ', Table Name: ' + this._tableName + ', Name: '
                        + columnName);
                }
            }
            if (column.isPrimaryKey()) {
                if (this._pkIndex != -1) {
                    var error = 'More than one primary key column was found for ';
                    if (this._custom) {
                        error = error.concat('custom specified table columns');
                    }
                    else {
                        error = error.concat('table');
                    }
                    error = error.concat('. table: ' + this._tableName + ', index1: '
                        + this._pkIndex + ', index2: ' + index);
                    if (this._custom) {
                        error = error.concat(', columns: ' + this._columnNames);
                    }
                    throw new Error(error);
                }
                this._pkIndex = index;
            }
            this._columnNames[index] = columnName;
            this._nameToIndex.set(lowerCaseColumnName, index);
        }
    };
    /**
     * Check for duplicate column names
     *
     * @param index index
     * @param previousIndex previous index
     * @param column column
     */
    UserColumns.prototype.duplicateCheck = function (index, previousIndex, column) {
        if (previousIndex !== null && previousIndex !== undefined) {
            throw new Error('More than one ' + column + ' column was found for table \'' + this._tableName + '\'. Index ' + previousIndex + ' and ' + index);
        }
    };
    /**
     * Check for the expected data type
     * @param expected expected data type
     * @param column user column
     */
    UserColumns.prototype.typeCheck = function (expected, column) {
        var actual = column.getDataType();
        if (actual === null || actual === undefined || actual !== expected) {
            throw new Error('Unexpected ' + column.getName()
                + ' column data type was found for table \'' + this._tableName
                + '\', expected: ' + geoPackageDataType_1.GeoPackageDataType.nameFromType(expected) + ', actual: '
                + (actual !== null && actual !== undefined ? geoPackageDataType_1.GeoPackageDataType.nameFromType(actual) : 'null'));
        }
    };
    /**
     * Check for missing columns
     * @param index column index
     * @param column user column
     */
    UserColumns.prototype.missingCheck = function (index, column) {
        if (index === null || index === undefined) {
            throw new Error('No ' + column + ' column was found for table \'' + this._tableName + '\'');
        }
    };
    /**
     * Get the column index of the column name
     * @param columnName column name
     * @return column index
     */
    UserColumns.prototype.getColumnIndexForColumnName = function (columnName) {
        return this.getColumnIndex(columnName, true);
    };
    /**
     * Get the column index of the column name
     * @param columnName column name
     * @param required column existence is required
     * @return column index
     */
    UserColumns.prototype.getColumnIndex = function (columnName, required) {
        var index = this._nameToIndex.get(columnName.toLowerCase());
        if (required && (index === null || index === undefined)) {
            var error = 'Column does not exist in ';
            if (this._custom) {
                error = error.concat('custom specified table columns');
            }
            else {
                error = error.concat('table');
            }
            error = error.concat('. table: ' + this._tableName + ', column: ' + columnName);
            if (this._custom) {
                error = error.concat(', columns: ' + this._columnNames);
            }
            throw new Error(error);
        }
        return index;
    };
    /**
     * Get the array of column names
     * @return column names
     */
    UserColumns.prototype.getColumnNames = function () {
        return this._columnNames;
    };
    /**
     * Get the column name at the index
     * @param index column index
     * @return column name
     */
    UserColumns.prototype.getColumnName = function (index) {
        return this._columnNames[index];
    };
    /**
     * Get the list of columns
     * @return columns
     */
    UserColumns.prototype.getColumns = function () {
        return this._columns;
    };
    /**
     * Get the column at the index
     * @param index column index
     * @return column
     */
    UserColumns.prototype.getColumnForIndex = function (index) {
        return this._columns[index];
    };
    /**
     * Get the column of the column name
     * @param columnName column name
     * @return column
     */
    UserColumns.prototype.getColumn = function (columnName) {
        return this.getColumnForIndex(this.getColumnIndexForColumnName(columnName));
    };
    /**
     * Check if the table has the column
     * @param columnName column name
     * @return true if has the column
     */
    UserColumns.prototype.hasColumn = function (columnName) {
        return this._nameToIndex.has(columnName.toLowerCase());
    };
    /**
     * Get the column count
     * @return column count
     */
    UserColumns.prototype.columnCount = function () {
        return this._columns.length;
    };
    /**
     * Get the table name
     * @return table name
     */
    UserColumns.prototype.getTableName = function () {
        return this._tableName;
    };
    /**
     * Set the table name
     * @param tableName table name
     */
    UserColumns.prototype.setTableName = function (tableName) {
        this._tableName = tableName;
    };
    /**
     * Is custom column specification (partial and/or ordering)
     * @return custom flag
     */
    UserColumns.prototype.isCustom = function () {
        return this._custom;
    };
    /**
     * Set the custom column specification flag
     * @param custom custom flag
     */
    UserColumns.prototype.setCustom = function (custom) {
        this._custom = custom;
    };
    /**
     * Check if the table has a primary key column
     * @return true if has a primary key
     */
    UserColumns.prototype.hasPkColumn = function () {
        return this._pkIndex >= 0;
    };
    /**
     * Get the primary key column index
     * @return primary key column index
     */
    UserColumns.prototype.getPkColumnIndex = function () {
        return this._pkIndex;
    };
    /**
     * Get the primary key column
     * @return primary key column
     */
    UserColumns.prototype.getPkColumn = function () {
        var column = null;
        if (this.hasPkColumn()) {
            column = this._columns[this._pkIndex];
        }
        return column;
    };
    /**
     * Get the primary key column name
     * @return primary key column name
     */
    UserColumns.prototype.getPkColumnName = function () {
        return this.getPkColumn().getName();
    };
    /**
     * Get the columns with the provided data type
     * @param type data type
     * @return columns
     */
    UserColumns.prototype.columnsOfType = function (type) {
        return this._columns.filter(function (column) { return column.getDataType() === type; });
    };
    /**
     * Add a new column
     * @param column new column
     */
    UserColumns.prototype.addColumn = function (column) {
        this._columns.push(column);
        this.updateColumns();
    };
    /**
     * Rename a column
     * @param column column
     * @param newColumnName new column name
     */
    UserColumns.prototype.renameColumn = function (column, newColumnName) {
        this.renameColumnWithName(column.getName(), newColumnName);
        column.setName(newColumnName);
    };
    /**
     * Rename a column
     * @param columnName column name
     * @param newColumnName new column name
     */
    UserColumns.prototype.renameColumnWithName = function (columnName, newColumnName) {
        this.renameColumnWithIndex(this.getColumnIndexForColumnName(columnName), newColumnName);
    };
    /**
     * Rename a column
     * @param index column index
     * @param newColumnName new column name
     */
    UserColumns.prototype.renameColumnWithIndex = function (index, newColumnName) {
        this._columns[index].setName(newColumnName);
        this.updateColumns();
    };
    /**
     * Drop a column
     * @param column column to drop
     */
    UserColumns.prototype.dropColumn = function (column) {
        this.dropColumnWithIndex(column.getIndex());
    };
    /**
     * Drop a column
     * @param columnName column name
     */
    UserColumns.prototype.dropColumnWithName = function (columnName) {
        this.dropColumnWithIndex(this.getColumnIndexForColumnName(columnName));
    };
    /**
     * Drop a column
     * @param index column index
     */
    UserColumns.prototype.dropColumnWithIndex = function (index) {
        this._columns.splice(index, 1);
        this._columns.forEach(function (column) { return column.resetIndex(); });
        this.updateColumns();
    };
    /**
     * Alter a column
     * @param column altered column
     */
    UserColumns.prototype.alterColumn = function (column) {
        var existingColumn = this.getColumn(column.getName());
        var index = existingColumn.getIndex();
        column.setIndex(index);
        this._columns[index] = column;
    };
    return UserColumns;
}());
exports.UserColumns = UserColumns;
//# sourceMappingURL=userColumns.js.map