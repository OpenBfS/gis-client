"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableInfo = void 0;
/**
 * Table Info queries (table_info)
 */
var tableColumn_1 = require("./tableColumn");
var geoPackageDataType_1 = require("../geoPackageDataType");
var geometryType_1 = require("../../features/user/geometryType");
var sqliteMaster_1 = require("../master/sqliteMaster");
var sqliteMasterColumn_1 = require("../master/sqliteMasterColumn");
var stringUtils_1 = require("../stringUtils");
var TableInfo = /** @class */ (function () {
    /**
     * Constructor
     * @param tableName table name
     * @param columns table columns
     */
    function TableInfo(tableName, columns) {
        var _this = this;
        /**
         * Column name to column mapping
         */
        this.namesToColumns = new Map();
        /**
         * Primary key column names
         */
        this.primaryKeys = [];
        this.tableName = tableName;
        this.columns = columns;
        columns.forEach(function (column) {
            _this.namesToColumns.set(column.getName(), column);
            if (column.isPrimaryKey()) {
                _this.primaryKeys.push(column);
            }
        });
    }
    /**
     * Get the table name
     * @return table name
     */
    TableInfo.prototype.getTableName = function () {
        return this.tableName;
    };
    /**
     * Number of columns
     *
     * @return column count
     */
    TableInfo.prototype.numColumns = function () {
        return this.columns.length;
    };
    /**
     * Get the columns
     * @return columns
     */
    TableInfo.prototype.getColumns = function () {
        return this.columns.slice();
    };
    /**
     * Get the column at the index
     * @param index column index
     * @return column
     */
    TableInfo.prototype.getColumnAtIndex = function (index) {
        if (index < 0 || index >= this.columns.length) {
            throw new Error('Column index: ' + index + ', not within range 0 to ' + (this.columns.length - 1));
        }
        return this.columns[index];
    };
    /**
     * Check if the table has the column
     * @param name column name
     * @return true if has column
     */
    TableInfo.prototype.hasColumn = function (name) {
        return this.getColumn(name) !== null && this.getColumn(name) !== undefined;
    };
    /**
     * Get the column with the name
     * @param name column name
     * @return column or null if does not exist
     */
    TableInfo.prototype.getColumn = function (name) {
        return this.namesToColumns.get(name);
    };
    /**
     * Check if the table has one or more primary keys
     * @return true if has at least one primary key
     */
    TableInfo.prototype.hasPrimaryKey = function () {
        return this.primaryKeys.length !== 0;
    };
    /**
     * Get the primary key columns
     * @return primary key columns
     */
    TableInfo.prototype.getPrimaryKeys = function () {
        return this.primaryKeys.slice();
    };
    /**
     * Get the single or first primary key if one exists
     * @return single or first primary key, null if no primary key
     */
    TableInfo.prototype.getPrimaryKey = function () {
        var pk = null;
        if (this.hasPrimaryKey()) {
            pk = this.primaryKeys[0];
        }
        return pk;
    };
    // @ts-ignore
    /**
     * Query for the table_info of the table name
     * @param db connection
     * @param tableName table name
     * @return table info or null if no table
     */
    TableInfo.info = function (db, tableName) {
        var sql = 'PRAGMA table_info(' + stringUtils_1.StringUtils.quoteWrap(tableName) + ')';
        var results = db.all(sql, null);
        var tableColumns = [];
        results.forEach(function (result) {
            var index = result.cid;
            var name = result.name;
            var type = result.type;
            var notNull = result.notnull === 1;
            var defaultValueString = result.dflt_value;
            var primaryKey = result.pk === 1;
            var autoincrement = false;
            if (primaryKey) {
                var autoincrementResult = db.all('SELECT tbl_name FROM ' + sqliteMaster_1.SQLiteMaster.TABLE_NAME + ' WHERE ' + sqliteMasterColumn_1.SQLiteMasterColumn.nameFromType(sqliteMasterColumn_1.SQLiteMasterColumn.TBL_NAME) + '=? AND ' + sqliteMasterColumn_1.SQLiteMasterColumn.nameFromType(sqliteMasterColumn_1.SQLiteMasterColumn.SQL) + ' LIKE ?', [tableName, '%AUTOINCREMENT%']);
                autoincrement = autoincrementResult.length === 1;
            }
            // If the type has a max limit on it, pull it off
            var max = null;
            if (type != null && type.endsWith(")")) {
                var maxStart = type.indexOf("(");
                if (maxStart > -1) {
                    var maxString = type.substring(maxStart + 1, type.length - 1);
                    if (maxString.length !== 0) {
                        try {
                            max = parseInt(maxString);
                            type = type.substring(0, maxStart);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }
            }
            var dataType = TableInfo.getDataType(type);
            var defaultValue = undefined;
            if (result.dflt_value) {
                defaultValue = result.dflt_value.replace(/\\'/g, '');
            }
            var tableColumn = new tableColumn_1.TableColumn(index, name, type, dataType, max, notNull, defaultValueString, defaultValue, primaryKey, autoincrement);
            tableColumns.push(tableColumn);
        });
        var tableInfo = null;
        if (tableColumns.length !== 0) {
            tableInfo = new TableInfo(tableName, tableColumns);
        }
        return tableInfo;
    };
    /**
     * Get the data type from the type value
     * @param type type value
     * @return data type or null
     */
    TableInfo.getDataType = function (type) {
        var dataType = geoPackageDataType_1.GeoPackageDataType.fromName(type);
        if (dataType === null || dataType === undefined) {
            // Check if a geometry and set as a blob
            var geomType = geometryType_1.GeometryType.fromName(type);
            if (geomType !== null && geomType !== undefined) {
                dataType = geoPackageDataType_1.GeoPackageDataType.BLOB;
            }
        }
        return dataType;
    };
    /**
     * Index column
     */
    TableInfo.CID = 'cid';
    /**
     * Name column
     */
    TableInfo.NAME = 'name';
    /**
     * Type column
     */
    TableInfo.TYPE = 'type';
    /**
     * Not null column
     */
    TableInfo.NOT_NULL = 'notnull';
    /**
     * Default value column
     */
    TableInfo.DFLT_VALUE = 'dflt_value';
    /**
     * Primary key column
     */
    TableInfo.PK = 'pk';
    /**
     * Default of NULL value
     */
    TableInfo.DEFAULT_NULL = 'NULL';
    return TableInfo;
}());
exports.TableInfo = TableInfo;
//# sourceMappingURL=tableInfo.js.map