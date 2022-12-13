"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constraints = void 0;
var sortedIndex_1 = __importDefault(require("lodash/sortedIndex"));
var Constraints = /** @class */ (function () {
    /**
     * Constructor
     */
    function Constraints() {
        /**
         * Constraints
         */
        this.constraints = [];
        /**
         * Type Constraints
         */
        this.typedConstraints = {};
    }
    /**
     * Add constraint
     * @param constraint constraint
     */
    Constraints.prototype.add = function (constraint) {
        var orders = this.constraints.map(function (c) { return c.order; });
        var lastIndex = orders.lastIndexOf(constraint.order);
        var insertLocation = lastIndex + 1;
        if (lastIndex === -1) {
            insertLocation = (0, sortedIndex_1.default)(this.constraints.map(function (c) { return c.order; }), constraint.order);
        }
        if (insertLocation === this.constraints.length) {
            this.constraints.push(constraint);
        }
        else {
            this.constraints.splice(insertLocation, 0, constraint);
        }
        if (this.typedConstraints[constraint.getType()] === null || this.typedConstraints[constraint.getType()] === undefined) {
            this.typedConstraints[constraint.getType()] = [];
        }
        this.typedConstraints[constraint.getType()].push(constraint);
    };
    /**
     * Add constraints
     * @param constraints constraints
     */
    Constraints.prototype.addConstraintArray = function (constraints) {
        for (var i = 0; i < constraints.length; i++) {
            this.add(constraints[i]);
        }
    };
    /**
     * Add constraints
     * @param constraints constraints
     */
    Constraints.prototype.addConstraints = function (constraints) {
        this.addConstraintArray(constraints.all());
    };
    /**
     * Check if has constraints
     * @return true if has constraints
     */
    Constraints.prototype.has = function () {
        return this.constraints.length > 0;
    };
    /**
     * Check if has constraints of the provided type
     * @param type constraint type
     * @return true if has constraints
     */
    Constraints.prototype.hasType = function (type) {
        return this.getConstraintsForType(type).length !== 0;
    };
    /**
     * Get the constraints
     * @return constraints
     */
    Constraints.prototype.all = function () {
        return this.constraints;
    };
    /**
     * Get the constraint at the index
     * @param index constraint index
     * @return constraint
     */
    Constraints.prototype.get = function (index) {
        return this.constraints[index];
    };
    /**
     * Get the constraints of the provided type
     * @param type constraint type
     * @return constraints
     */
    Constraints.prototype.getConstraintsForType = function (type) {
        var constraints = this.typedConstraints[type];
        if (constraints === null || constraints === undefined) {
            constraints = [];
        }
        return constraints;
    };
    /**
     * Clear the constraints
     * @return cleared constraints
     */
    Constraints.prototype.clear = function () {
        var constraintsCopy = this.constraints.slice();
        this.constraints = [];
        this.typedConstraints = {};
        return constraintsCopy;
    };
    /**
     * Clear the constraints of the provided type
     *
     * @param type
     *            constraint type
     * @return cleared constraints
     */
    Constraints.prototype.clearConstraintsByType = function (type) {
        var typedConstraints = this.typedConstraints[type];
        delete this.typedConstraints[type];
        if (typedConstraints === null) {
            typedConstraints = [];
        }
        else if (typedConstraints.length === 0) {
            this.constraints = this.constraints.filter(function (c) { return c.getType() !== type; });
        }
        return typedConstraints;
    };
    /**
     * Copy the constraints
     * @return constraints
     */
    Constraints.prototype.copy = function () {
        var constraints = new Constraints();
        constraints.addConstraints(this);
        return constraints;
    };
    Constraints.prototype.size = function () {
        return this.constraints.length;
    };
    return Constraints;
}());
exports.Constraints = Constraints;
//# sourceMappingURL=constraints.js.map