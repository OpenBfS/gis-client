"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnConstraints = void 0;
var constraints_1 = require("./constraints");
var ColumnConstraints = /** @class */ (function () {
    /**
     * Constructor
     * @param name column name
     */
    function ColumnConstraints(name) {
        this.name = name;
        /**
         * Column constraints
         */
        this.constraints = new constraints_1.Constraints();
    }
    /**
     * Add a constraint
     * @param constraint constraint
     */
    ColumnConstraints.prototype.addConstraint = function (constraint) {
        this.constraints.add(constraint);
    };
    /**
     * Add constraints
     * @param constraints constraints
     */
    ColumnConstraints.prototype.addConstraints = function (constraints) {
        this.constraints.addConstraints(constraints);
    };
    /**
     * Get the constraints
     * @return constraints
     */
    ColumnConstraints.prototype.getConstraints = function () {
        return this.constraints;
    };
    /**
     * Get the constraint at the index
     * @param index constraint index
     * @return constraint
     */
    ColumnConstraints.prototype.getConstraint = function (index) {
        if (index >= this.constraints.size()) {
            return null;
        }
        return this.constraints.get(index);
    };
    /**
     * Get the number of constraints
     * @return constraints count
     */
    ColumnConstraints.prototype.numConstraints = function () {
        return this.constraints.size();
    };
    /**
     * Add constraints
     * @param constraints constraints
     */
    ColumnConstraints.prototype.addColumnConstraints = function (constraints) {
        if (constraints !== null && constraints !== undefined) {
            this.addConstraints(constraints.getConstraints());
        }
    };
    /**
     * Check if there are constraints
     * @return true if has constraints
     */
    ColumnConstraints.prototype.hasConstraints = function () {
        return this.constraints.has();
    };
    return ColumnConstraints;
}());
exports.ColumnConstraints = ColumnConstraints;
//# sourceMappingURL=columnConstraints.js.map