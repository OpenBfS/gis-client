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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawConstraint = void 0;
var constraint_1 = require("./constraint");
/**
 * Table raw or unparsed constraint
 */
var RawConstraint = /** @class */ (function (_super) {
    __extends(RawConstraint, _super);
    /**
     * Constructor
     * @param type constraint type
     * @param name constraint name
     * @param sql constraint SQL
     * @param order constraint order
     */
    function RawConstraint(type, name, sql, order) {
        if (order === void 0) { order = null; }
        var _this = _super.call(this, type, name, order) || this;
        _this.sql = sql;
        return _this;
    }
    RawConstraint.prototype.buildSql = function () {
        var sql = this.sql;
        if (!sql.toUpperCase().startsWith(constraint_1.Constraint.CONSTRAINT)) {
            sql = this.buildNameSql() + sql;
        }
        return sql;
    };
    return RawConstraint;
}(constraint_1.Constraint));
exports.RawConstraint = RawConstraint;
//# sourceMappingURL=rawConstraint.js.map