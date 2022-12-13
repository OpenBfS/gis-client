"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteMasterQuery = void 0;
/**
 * Query on the SQLiteMaster table
 */
var sqliteMasterColumn_1 = require("./sqliteMasterColumn");
var stringUtils_1 = require("../stringUtils");
var SQLiteMasterQuery = /** @class */ (function () {
    /**
     * Create a query with the combine operation
     * @param combineOperation combine operation
     */
    function SQLiteMasterQuery(combineOperation) {
        /**
         * List of queries
         */
        this.queries = [];
        /**
         * List of arguments
         */
        this.arguments = [];
        this.combineOperation = combineOperation;
    }
    /**
     * Add a query
     * @param column  column
     * @param operation operation
     * @param value value
     */
    SQLiteMasterQuery.prototype.add = function (column, operation, value) {
        this.validateAdd();
        this.queries.push('LOWER(' + stringUtils_1.StringUtils.quoteWrap(sqliteMasterColumn_1.SQLiteMasterColumn.nameFromType(column).toLowerCase()) + ') ' + operation + ' LOWER(?)');
        this.arguments.push(value);
    };
    /**
     * Add an is null query
     * @param column column
     */
    SQLiteMasterQuery.prototype.addIsNull = function (column) {
        this.validateAdd();
        this.queries.push(stringUtils_1.StringUtils.quoteWrap(sqliteMasterColumn_1.SQLiteMasterColumn.nameFromType(column).toLowerCase()) + ' IS NULL');
    };
    /**
     * Add an is not null query
     * @param column column
     */
    SQLiteMasterQuery.prototype.addIsNotNull = function (column) {
        this.validateAdd();
        this.queries.push(stringUtils_1.StringUtils.quoteWrap(sqliteMasterColumn_1.SQLiteMasterColumn.nameFromType(column).toLowerCase()) + ' IS NOT NULL');
    };
    /**
     * Validate the state of the query when adding to the query
     */
    SQLiteMasterQuery.prototype.validateAdd = function () {
        if ((this.combineOperation === null || this.combineOperation === undefined) && this.queries.length !== 0) {
            throw new Error('Query without a combination operation supports only a single query');
        }
    };
    /**
     * Determine a query has been set
     * @return true if has a query
     */
    SQLiteMasterQuery.prototype.has = function () {
        return this.queries.length !== 0;
    };
    /**
     * Build the query SQL
     * @return sql
     */
    SQLiteMasterQuery.prototype.buildSQL = function () {
        var sql = '';
        if (this.queries.length > 1) {
            sql = sql.concat('( ');
        }
        for (var i = 0; i < this.queries.length; i++) {
            if (i > 0) {
                sql = sql.concat(' ');
                sql = sql.concat(this.combineOperation);
                sql = sql.concat(' ');
            }
            sql = sql.concat(this.queries[i]);
        }
        if (this.queries.length > 1) {
            sql = sql.concat(' )');
        }
        return sql;
    };
    /**
     * Get the query arguments
     * @return arguments
     */
    SQLiteMasterQuery.prototype.getArguments = function () {
        return this.arguments;
    };
    /**
     * Create an empty query that supports a single query
     * @return query
     */
    SQLiteMasterQuery.create = function () {
        return new SQLiteMasterQuery(null);
    };
    /**
     * Create a query with multiple queries combined by an OR
     * @return query
     */
    SQLiteMasterQuery.createOr = function () {
        return new SQLiteMasterQuery('OR');
    };
    /**
     * Create a query with multiple queries combined by an AND
     * @return query
     */
    SQLiteMasterQuery.createAnd = function () {
        return new SQLiteMasterQuery('AND');
    };
    /**
     * Create a single equality query
     *
     * @param column column
     * @param value value
     * @return query
     */
    SQLiteMasterQuery.createForColumnValue = function (column, value) {
        var query = this.create();
        query.add(column, '=', value);
        return query;
    };
    /**
     * Create a single query
     * @param column column
     * @param operation operation
     * @param value value
     * @return query
     */
    SQLiteMasterQuery.createForOperationAndColumnValue = function (column, operation, value) {
        var query = this.create();
        query.add(column, operation, value);
        return query;
    };
    /**
     * Create an equality query with multiple values for a single column
     * combined with an OR
     * @param column column
     * @param values value
     * @return query
     */
    SQLiteMasterQuery.createOrForColumnValue = function (column, values) {
        var query = this.createOr();
        values.forEach(function (value) {
            query.add(column, '=', value);
        });
        return query;
    };
    /**
     * Create a query with multiple values for a single column combined with an
     * OR
     *
     * @param column column
     * @param operation operation
     * @param values value
     * @return query
     */
    SQLiteMasterQuery.createOrForOperationAndColumnValue = function (column, operation, values) {
        var query = this.createOr();
        values.forEach(function (value) {
            query.add(column, operation, value);
        });
        return query;
    };
    /**
     * Create an equality query with multiple values for a single column
     * combined with an AND
     * @param column column
     * @param values value
     * @return query
     */
    SQLiteMasterQuery.createAndForColumnValue = function (column, values) {
        var query = this.createAnd();
        values.forEach(function (value) {
            query.add(column, '=', value);
        });
        return query;
    };
    /**
     * Create a query with multiple values for a single column combined with an
     * AND
     * @param column column
     * @param operation operation
     * @param values value
     * @return query
     */
    SQLiteMasterQuery.createAndForOperationAndColumnValue = function (column, operation, values) {
        var query = this.createAnd();
        values.forEach(function (value) {
            query.add(column, operation, value);
        });
        return query;
    };
    /**
     * Create a query to find views in the sql column referring to the table
     * @param tableName table name
     * @return query
     */
    SQLiteMasterQuery.createTableViewQuery = function (tableName) {
        var queries = [];
        queries.push('%\"' + tableName + '\"%');
        queries.push('% ' + tableName + ' %');
        queries.push('%,' + tableName + ' %');
        queries.push('% ' + tableName + ',%');
        queries.push('%,' + tableName + ',%');
        queries.push('% ' + tableName);
        queries.push('%,' + tableName);
        return SQLiteMasterQuery.createOrForOperationAndColumnValue(sqliteMasterColumn_1.SQLiteMasterColumn.SQL, 'LIKE', queries);
    };
    return SQLiteMasterQuery;
}());
exports.SQLiteMasterQuery = SQLiteMasterQuery;
//# sourceMappingURL=sqliteMasterQuery.js.map