"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constraint = void 0;
var stringUtils_1 = require("../stringUtils");
var Constraint = /** @class */ (function () {
    function Constraint(type, name, order) {
        if (order === void 0) { order = Number.MAX_SAFE_INTEGER; }
        this.type = type;
        this.name = name;
        this.order = order;
    }
    /**
     * Build the name SQL
     *
     * @return name SQL
     */
    Constraint.prototype.buildNameSql = function () {
        var sql = '';
        if (this.name !== null && this.name !== undefined) {
            sql = Constraint.CONSTRAINT + ' ' + stringUtils_1.StringUtils.quoteWrap(this.name) + ' ';
        }
        return sql;
    };
    /**
     * Builds the sql
     */
    Constraint.prototype.buildSql = function () {
        return '';
    };
    Constraint.prototype.copy = function () {
        return new Constraint(this.type, this.name);
    };
    Constraint.prototype.getName = function () {
        return this.name;
    };
    Constraint.prototype.getType = function () {
        return this.type;
    };
    Constraint.prototype.compareTo = function (constraint) {
        return this.getOrder(this.order) - this.getOrder(constraint.order) <= 0 ? -1 : 1;
    };
    Constraint.prototype.getOrder = function (order) {
        return order !== null && order !== undefined ? order : Number.MAX_VALUE;
    };
    /**
     * Constraint keyword
     */
    Constraint.CONSTRAINT = 'CONSTRAINT';
    return Constraint;
}());
exports.Constraint = Constraint;
//# sourceMappingURL=constraint.js.map