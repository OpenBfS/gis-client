"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableMapping = void 0;
var isNil_1 = __importDefault(require("lodash/isNil"));
var isEqual_1 = __importDefault(require("lodash/isEqual"));
var keys_1 = __importDefault(require("lodash/keys"));
var values_1 = __importDefault(require("lodash/values"));
var mappedColumn_1 = require("./mappedColumn");
/**
 * Mapping between column names being mapped to and the mapped column
 * information
 *
 * @author osbornb
 * @since 3.3.0
 */
var TableMapping = /** @class */ (function () {
    /**
     * Constructor
     * @param fromTableName table name
     * @param toTableName table name
     * @param columns user columns
     */
    function TableMapping(fromTableName, toTableName, columns) {
        var _this = this;
        /**
         * Transfer row content to new table
         */
        this._transferContent = true;
        /**
         * Mapping between column names and mapped columns
         */
        this._columns = {};
        /**
         * Dropped columns from the previous table version
         */
        this._droppedColumns = new Set();
        this._fromTable = fromTableName;
        this._toTable = toTableName;
        columns.forEach(function (column) {
            _this.addMappedColumn(new mappedColumn_1.MappedColumn(column.name, column.name, column.defaultValue, column.dataType));
        });
    }
    TableMapping.fromTableInfo = function (tableInfo) {
        var tableMapping = new TableMapping(tableInfo.getTableName(), tableInfo.getTableName(), []);
        tableInfo.getColumns().forEach(function (column) {
            tableMapping.addMappedColumn(new mappedColumn_1.MappedColumn(column.getName(), column.getName(), column.getDefaultValue(), column.getDataType()));
        });
        return tableMapping;
    };
    Object.defineProperty(TableMapping.prototype, "fromTable", {
        /**
         * Get the from table name
         * @return from table name
         */
        get: function () {
            return this._fromTable;
        },
        /**
         * Set the from table name
         * @param fromTable from table name
         */
        set: function (fromTable) {
            this._fromTable = fromTable;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableMapping.prototype, "toTable", {
        /**
         * Get the to table name
         * @return to table name
         */
        get: function () {
            return this._toTable;
        },
        /**
         * Set the to table name
         * @param toTable to table name
         */
        set: function (toTable) {
            this._toTable = toTable;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Check if the table mapping is to a new table
     * @return true if a new table
     */
    TableMapping.prototype.isNewTable = function () {
        return !(0, isNil_1.default)(this._toTable) && !(0, isEqual_1.default)(this._toTable, this._fromTable);
    };
    /**
     * Is the transfer content flag enabled
     * @return true if data should be transfered to the new table
     */
    TableMapping.prototype.isTransferContent = function () {
        return this._transferContent;
    };
    Object.defineProperty(TableMapping.prototype, "transferContent", {
        /**
         * Set the transfer content flag
         * @param transferContent true if data should be transfered to the new table
         */
        set: function (transferContent) {
            this._transferContent = transferContent;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add a column
     * @param column mapped column
     */
    TableMapping.prototype.addMappedColumn = function (column) {
        this._columns[column.toColumn] = column;
    };
    /**
     * Add a column
     * @param columnName column name
     */
    TableMapping.prototype.addColumnWithName = function (columnName) {
        this._columns[columnName] = new mappedColumn_1.MappedColumn(columnName, null, null, null);
    };
    /**
     * Remove a column
     *
     * @param columnName
     *            column name
     * @return removed mapped column or null
     */
    TableMapping.prototype.removeColumn = function (columnName) {
        var removedColumn = this._columns[columnName];
        delete this._columns[columnName];
        return removedColumn;
    };
    /**
     * Get the column names
     * @return column names
     */
    TableMapping.prototype.getColumnNames = function () {
        return (0, keys_1.default)(this._columns);
    };
    /**
     * Get the columns as an entry set
     * @return columns
     */
    TableMapping.prototype.getColumns = function () {
        return this._columns;
    };
    /**
     * Get the mapped column values
     * @return columns
     */
    TableMapping.prototype.getMappedColumns = function () {
        return (0, values_1.default)(this._columns);
    };
    /**
     * Get the mapped column for the column name
     * @param columnName column name
     * @return mapped column
     */
    TableMapping.prototype.getColumn = function (columnName) {
        return this._columns[columnName];
    };
    /**
     * Add a dropped column
     * @param columnName column name
     */
    TableMapping.prototype.addDroppedColumn = function (columnName) {
        this._droppedColumns.add(columnName);
    };
    /**
     * Remove a dropped column
     * @param columnName column name
     * @return true if removed
     */
    TableMapping.prototype.removeDroppedColumn = function (columnName) {
        return this._droppedColumns.delete(columnName);
    };
    Object.defineProperty(TableMapping.prototype, "droppedColumns", {
        /**
         * Get a set of dropped columns
         * @return dropped columns
         */
        get: function () {
            return this._droppedColumns;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Check if the column name is a dropped column
     * @param columnName column name
     * @return true if a dropped column
     */
    TableMapping.prototype.isDroppedColumn = function (columnName) {
        return this._droppedColumns.has(columnName);
    };
    /**
     * Check if there is a custom where clause
     * @return true if where clause
     */
    TableMapping.prototype.hasWhere = function () {
        return !(0, isNil_1.default)(this._where);
    };
    Object.defineProperty(TableMapping.prototype, "where", {
        /**
         * Get the where clause
         * @return where clause
         */
        get: function () {
            return this._where;
        },
        /**
         * Set the where clause
         * @param where where clause
         */
        set: function (where) {
            this._where = where;
        },
        enumerable: false,
        configurable: true
    });
    return TableMapping;
}());
exports.TableMapping = TableMapping;
//# sourceMappingURL=tableMapping.js.map