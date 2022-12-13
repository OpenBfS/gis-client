"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueConstraint = void 0;
var constraintType_1 = require("./constraintType");
var constraint_1 = require("./constraint");
/**
 * Table unique constraint for one or more columns
 */
var UniqueConstraint = /** @class */ (function (_super) {
    __extends(UniqueConstraint, _super);
    function UniqueConstraint(name) {
        var columns = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            columns[_i - 1] = arguments[_i];
        }
        var _this = _super.call(this, constraintType_1.ConstraintType.UNIQUE, name) || this;
        /**
         * Columns included in the unique constraint
         */
        _this.columns = [];
        _this.add.apply(_this, __spreadArray([], __read(columns), false));
        return _this;
    }
    /**
     * {@inheritDoc}
     */
    UniqueConstraint.prototype.buildSql = function () {
        var sql = '';
        sql = sql.concat(this.buildNameSql());
        sql = sql.concat(UniqueConstraint.UNIQUE);
        sql = sql.concat(' (');
        for (var i = 0; i < this.columns.length; i++) {
            var column = this.columns[i];
            if (i > 0) {
                sql = sql.concat(', ');
            }
            sql = sql.concat(column.getName());
        }
        sql = sql.concat(')');
        return sql;
    };
    /**
     * {@inheritDoc}
     */
    UniqueConstraint.prototype.copy = function () {
        return new (UniqueConstraint.bind.apply(UniqueConstraint, __spreadArray([void 0, this.name], __read(this.columns), false)))();
    };
    /**
     * Add columns
     * @param columns columns
     */
    UniqueConstraint.prototype.add = function () {
        var _this = this;
        var columns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            columns[_i] = arguments[_i];
        }
        columns.forEach(function (column) {
            _this.columns.push(column);
        });
    };
    /**
     * Get the columns
     *
     * @return columns
     */
    UniqueConstraint.prototype.getColumns = function () {
        return this.columns;
    };
    /**
     * Constraint keyword
     */
    UniqueConstraint.UNIQUE = 'UNIQUE';
    return UniqueConstraint;
}(constraint_1.Constraint));
exports.UniqueConstraint = UniqueConstraint;
//# sourceMappingURL=uniqueConstraint.js.map