"use strict";
/**
 * UserRow module.
 * @module user/userRow
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRow = void 0;
var geoPackageDataType_1 = require("../db/geoPackageDataType");
var UserRow = /** @class */ (function () {
    /**
     * User Row containing the values from a single result row
     * @param table User Table
     * @param columnTypes Column types of this row, based upon the data values
     * @param values Array of the row values
     */
    function UserRow(table, columnTypes, values) {
        this.table = table;
        this.columnTypes = columnTypes;
        this.values = values;
        if (!this.columnTypes) {
            var columnCount = this.table.getColumnCount();
            this.columnTypes = {};
            this.values = {};
            for (var i = 0; i < columnCount; i++) {
                this.columnTypes[this.table.columns.getColumnName(i)] = this.table.columns.getColumnForIndex(i).dataType;
                this.values[this.table.columns.getColumnName(i)] = this.table.columns.getColumnForIndex(i).defaultValue;
            }
        }
    }
    Object.defineProperty(UserRow.prototype, "idColumn", {
        /**
         * Gets the id column
         * @return {module:user/userColumn~UserColumn}
         */
        get: function () {
            return this.table.getIdColumn();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UserRow.prototype, "columnCount", {
        /**
         * Get the column count
         * @return {number} column count
         */
        get: function () {
            return this.table.getColumnCount();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UserRow.prototype, "columnNames", {
        /**
         * Get the column names
         * @return {Array} column names
         */
        get: function () {
            return this.table.columns._columnNames;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the column name at the index
     * @param  {Number} index index
     * @return {string}       column name
     */
    UserRow.prototype.getColumnNameWithIndex = function (index) {
        return this.table.getColumnNameWithIndex(index);
    };
    /**
     * Get the column index of the column name
     * @param  {string} columnName column name
     * @return {Number}            column index
     */
    UserRow.prototype.getColumnIndexWithColumnName = function (columnName) {
        return this.table.getColumnIndex(columnName);
    };
    /**
     * Get the value at the index
     * @param  {Number} index index
     * @return {object}       value
     */
    UserRow.prototype.getValueWithIndex = function (index) {
        var value = this.values[this.getColumnNameWithIndex(index)];
        if (value !== undefined) {
            value = this.toObjectValue(index, value);
        }
        return value;
    };
    /**
     * Get the value of the column name
     * @param  {string} columnName column name
     * @return {Object}            value
     */
    UserRow.prototype.getValueWithColumnName = function (columnName) {
        var value = this.values[columnName];
        var dataType = this.getRowColumnTypeWithColumnName(columnName);
        if (value === undefined || value === null)
            return value;
        if (dataType === geoPackageDataType_1.GeoPackageDataType.BOOLEAN) {
            return value === 1 ? true : false;
        }
        else if (dataType === geoPackageDataType_1.GeoPackageDataType.BLOB) {
            return Buffer.from(value);
        }
        return value;
    };
    /**
     * Get the value from the database as an object based on the column
     * @param index column index
     * @param value value from the database
     */
    UserRow.prototype.toObjectValue = function (index, value) {
        var objectValue = value;
        var column = this.getColumnWithIndex(index);
        if (column.dataType === geoPackageDataType_1.GeoPackageDataType.BOOLEAN && value) {
            return value === 1 ? true : false;
        }
        return objectValue;
    };
    /**
     * Get the value which will be persisted to the database based on the column
     * @param columnName name of the column
     */
    UserRow.prototype.toDatabaseValue = function (columnName) {
        var column = this.getColumnWithColumnName(columnName);
        var value = this.getValueWithColumnName(columnName);
        if (column.dataType === geoPackageDataType_1.GeoPackageDataType.BOOLEAN) {
            return value === true ? 1 : 0;
        }
        return value;
    };
    /**
     * Get the row column type at the index
     * @param  {Number} index index
     * @return {Number}       row column type
     */
    UserRow.prototype.getRowColumnTypeWithIndex = function (index) {
        return this.columnTypes[this.getColumnNameWithIndex(index)];
    };
    /**
     * Get the row column type of the column name
     * @param  {string} columnName column name
     * @return {Number}            row column type
     */
    UserRow.prototype.getRowColumnTypeWithColumnName = function (columnName) {
        return this.columnTypes[columnName];
    };
    /**
     * Get the column at the index
     * @param  {Number} index index
     * @return {UserColumn}       column
     */
    UserRow.prototype.getColumnWithIndex = function (index) {
        return this.table.getColumnWithIndex(index);
    };
    /**
     * Get the column of the column name
     * @param  {string} columnName column name
     * @return {UserColumn}            column
     */
    UserRow.prototype.getColumnWithColumnName = function (columnName) {
        return this.table.getColumnWithColumnName(columnName);
    };
    Object.defineProperty(UserRow.prototype, "id", {
        /**
         * Get the id value, which is the value of the primary key
         * @return {Number} id value
         */
        get: function () {
            var id = null;
            if (this.pkColumn) {
                id = this.getValueWithIndex(this.pkColumnIndex);
            }
            return id;
        },
        /**
         * Set the primary key id value
         * @param {Number} id id
         */
        set: function (id) {
            this.values[this.table.getPkColumnName()] = id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UserRow.prototype, "pkColumnIndex", {
        /**
         * Get the primary key column Index
         * @return {Number} pk index
         */
        get: function () {
            return this.table.getUserColumns().getPkColumnIndex();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UserRow.prototype, "pkColumn", {
        /**
         * Get the primary key column
         * @return {UserColumn} pk column
         */
        get: function () {
            return this.table.getPkColumn();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Set the value at the index
     * @param {Number} index index
     * @param {object} value value
     */
    UserRow.prototype.setValueWithIndex = function (index, value) {
        if (index === this.table.getUserColumns().getPkColumnIndex()) {
            throw new Error('Cannot update the primary key of the row.  Table Name: ' +
                this.table.getTableName() +
                ', Index: ' +
                index +
                ', Name: ' +
                this.table.getPkColumnName());
        }
        this.setValueWithColumnName(this.getColumnNameWithIndex(index), value);
    };
    /**
     * Set the value at the index without validation
     * @param {Number} index index
     * @param {Object} value value
     */
    UserRow.prototype.setValueNoValidationWithIndex = function (index, value) {
        this.values[this.getColumnNameWithIndex(index)] = value;
    };
    /**
     * Set the value of the column name
     * @param {string} columnName column name
     * @param {Object} value      value
     */
    UserRow.prototype.setValueWithColumnName = function (columnName, value) {
        var dataType = this.getRowColumnTypeWithColumnName(columnName);
        if (dataType === geoPackageDataType_1.GeoPackageDataType.BOOLEAN) {
            value === true ? (this.values[columnName] = 1) : (this.values[columnName] = 0);
        }
        else if (dataType === geoPackageDataType_1.GeoPackageDataType.DATE) {
            this.values[columnName] = value.toISOString().slice(0, 10);
        }
        else if (dataType === geoPackageDataType_1.GeoPackageDataType.DATETIME) {
            this.values[columnName] = value.toISOString();
        }
        else {
            this.values[columnName] = value;
        }
    };
    UserRow.prototype.hasIdColumn = function () {
        return this.table.getUserColumns().getPkColumnIndex() !== undefined;
    };
    UserRow.prototype.hasId = function () {
        var hasId = false;
        if (this.hasIdColumn()) {
            var objectValue = this.getValueWithIndex(this.table.getUserColumns().getPkColumnIndex());
            hasId = objectValue !== null && objectValue !== undefined && typeof objectValue === 'number';
        }
        return hasId;
    };
    /**
     * Clears the id so the row can be used as part of an insert or create
     */
    UserRow.prototype.resetId = function () {
        this.values[this.table.getPkColumnName()] = undefined;
    };
    return UserRow;
}());
exports.UserRow = UserRow;
//# sourceMappingURL=userRow.js.map