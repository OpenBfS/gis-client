"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstraintParser = void 0;
/**
 * SQL constraint parser from create table statements
 */
var tableConstraints_1 = require("./tableConstraints");
var columnConstraints_1 = require("./columnConstraints");
var constraint_1 = require("./constraint");
var constraintType_1 = require("./constraintType");
var rawConstraint_1 = require("./rawConstraint");
var stringUtils_1 = require("../stringUtils");
var ConstraintParser = /** @class */ (function () {
    function ConstraintParser() {
    }
    /**
     * Get the constraints for the table SQL
     * @param tableSql table SQL
     * @return constraints
     */
    ConstraintParser.getConstraints = function (tableSql) {
        var constraints = new tableConstraints_1.TableConstraints();
        // Find the start and end of the column definitions and table
        // constraints
        var start = -1;
        var end = -1;
        if (tableSql !== null && tableSql !== undefined) {
            start = tableSql.indexOf('(');
            end = tableSql.lastIndexOf(')');
        }
        if (start >= 0 && end >= 0) {
            var definitions = tableSql.substring(start + 1, end).trim();
            // Parse the column definitions and table constraints, divided by
            // columns when not within parentheses. Create constraints when
            // found.
            var openParentheses = 0;
            var sqlStart = 0;
            for (var i = 0; i < definitions.length; i++) {
                var character = definitions.charAt(i);
                if (character === '(') {
                    openParentheses++;
                }
                else if (character === ')') {
                    openParentheses--;
                }
                else if (character === ',' && openParentheses === 0) {
                    var constraintSql = definitions.substring(sqlStart, i);
                    ConstraintParser.addConstraints(constraints, constraintSql);
                    sqlStart = i + 1;
                }
            }
            if (sqlStart < definitions.length) {
                var constraintSql = definitions.substring(sqlStart, definitions.length);
                ConstraintParser.addConstraints(constraints, constraintSql);
            }
        }
        return constraints;
    };
    /**
     * Add constraints of the optional type or all constraints
     * @param constraints constraints to add to
     * @param constraintSql constraint SQL statement
     */
    ConstraintParser.addConstraints = function (constraints, constraintSql) {
        var constraint = ConstraintParser.getTableConstraint(constraintSql);
        if (constraint !== null && constraint !== undefined) {
            constraints.addTableConstraint(constraint);
        }
        else {
            var columnConstraints = ConstraintParser.getColumnConstraints(constraintSql);
            if (columnConstraints.hasConstraints()) {
                constraints.addColumnConstraints(columnConstraints);
            }
        }
    };
    /**
     * Attempt to get column constraints by parsing the SQL statement
     * @param constraintSql constraint SQL statement
     * @return constraints
     */
    ConstraintParser.getColumnConstraints = function (constraintSql) {
        var parts = constraintSql.trim().split(/\s+/);
        var columnName = stringUtils_1.StringUtils.quoteUnwrap(parts[0]);
        var constraints = new columnConstraints_1.ColumnConstraints(columnName);
        var constraintIndex = -1;
        var constraintType = null;
        for (var i = 1; i < parts.length; i++) {
            var part = parts[i];
            if (constraint_1.Constraint.CONSTRAINT === part.toUpperCase()) {
                if (constraintType !== null && constraintType !== undefined) {
                    constraints.addConstraint(ConstraintParser.createConstraint(parts, constraintIndex, i, constraintType));
                    constraintType = null;
                }
                constraintIndex = i;
            }
            else {
                var type = constraintType_1.ConstraintType.getColumnType(part);
                if (type !== null && type !== undefined) {
                    if (constraintType !== null && constraintType !== undefined) {
                        constraints.addConstraint(ConstraintParser.createConstraint(parts, constraintIndex, i, constraintType));
                        constraintIndex = -1;
                    }
                    if (constraintIndex < 0) {
                        constraintIndex = i;
                    }
                    constraintType = type;
                }
            }
        }
        if (constraintType !== null && constraintType !== undefined) {
            constraints.addConstraint(ConstraintParser.createConstraint(parts, constraintIndex, parts.length, constraintType));
        }
        return constraints;
    };
    /**
     * Create a constraint from the SQL parts with the range for the type
     * @param parts SQL parts
     * @param startIndex start index (inclusive)
     * @param endIndex end index (exclusive)
     * @param type constraint type
     * @return constraint
     */
    ConstraintParser.createConstraint = function (parts, startIndex, endIndex, type) {
        var constraintSql = '';
        for (var i = startIndex; i < endIndex; i++) {
            if (constraintSql.length > 0) {
                constraintSql = constraintSql.concat(' ');
            }
            constraintSql = constraintSql.concat(parts[i]);
        }
        var name = ConstraintParser.getName(constraintSql);
        return new rawConstraint_1.RawConstraint(type, name, constraintSql);
    };
    /**
     * Attempt to get the constraint by parsing the SQL statement
     * @param constraintSql constraint SQL statement
     * @param table true to search for a table constraint, false to search for a column constraint
     * @return constraint or null
     */
    ConstraintParser.getConstraint = function (constraintSql, table) {
        var constraint = null;
        var nameAndDefinition = ConstraintParser.getNameAndDefinition(constraintSql);
        var definition = nameAndDefinition[1];
        if (definition !== null && definition !== undefined) {
            var prefix = definition.split(/\s+/)[0];
            var type = void 0;
            if (table) {
                type = constraintType_1.ConstraintType.getTableType(prefix);
            }
            else {
                type = constraintType_1.ConstraintType.getColumnType(prefix);
            }
            if (type !== null && type !== undefined) {
                constraint = new rawConstraint_1.RawConstraint(type, nameAndDefinition[0], constraintSql.trim());
            }
        }
        return constraint;
    };
    /**
     * Attempt to get a table constraint by parsing the SQL statement
     * @param constraintSql constraint SQL statement
     * @return constraint or null
     */
    ConstraintParser.getTableConstraint = function (constraintSql) {
        return ConstraintParser.getConstraint(constraintSql, true);
    };
    /**
     * Check if the SQL is a table type constraint
     * @param constraintSql constraint SQL statement
     * @return true if a table constraint
     */
    ConstraintParser.isTableConstraint = function (constraintSql) {
        return ConstraintParser.getTableConstraint(constraintSql) !== null;
    };
    /**
     * Get the table constraint type of the constraint SQL
     * @param constraintSql constraint SQL
     * @return constraint type or null
     */
    ConstraintParser.getTableType = function (constraintSql) {
        var type = null;
        var constraint = ConstraintParser.getTableConstraint(constraintSql);
        if (constraint != null) {
            type = constraint.type;
        }
        return type;
    };
    /**
     * Determine if the table constraint SQL is the constraint type
     * @param type constraint type
     * @param constraintSql constraint SQL
     * @return true if the constraint type
     */
    ConstraintParser.isTableType = function (type, constraintSql) {
        var isType = false;
        var constraintType = ConstraintParser.getTableType(constraintSql);
        if (constraintType != null) {
            isType = type === constraintType;
        }
        return isType;
    };
    /**
     * Attempt to get a column constraint by parsing the SQL statement
     * @param constraintSql constraint SQL statement
     * @return constraint or null
     */
    ConstraintParser.getColumnConstraint = function (constraintSql) {
        return ConstraintParser.getConstraint(constraintSql, false);
    };
    /**
     * Check if the SQL is a column type constraint
     * @param constraintSql constraint SQL statement
     * @return true if a column constraint
     */
    ConstraintParser.isColumnConstraint = function (constraintSql) {
        return ConstraintParser.getColumnConstraint(constraintSql) != null;
    };
    /**
     * Get the column constraint type of the constraint SQL
     * @param constraintSql constraint SQL
     * @return constraint type or null
     */
    ConstraintParser.getColumnType = function (constraintSql) {
        var type = null;
        var constraint = ConstraintParser.getColumnConstraint(constraintSql);
        if (constraint != null) {
            type = constraint.type;
        }
        return type;
    };
    /**
     * Determine if the column constraint SQL is the constraint type
     * @param type constraint type
     * @param constraintSql constraint SQL
     * @return true if the constraint type
     */
    ConstraintParser.isColumnType = function (type, constraintSql) {
        var isType = false;
        var constraintType = ConstraintParser.getColumnType(constraintSql);
        if (constraintType != null) {
            isType = type == constraintType;
        }
        return isType;
    };
    /**
     * Attempt to get a constraint by parsing the SQL statement
     * @param constraintSql constraint SQL statement
     * @return constraint or null
     */
    ConstraintParser.getTableOrColumnConstraint = function (constraintSql) {
        var constraint = ConstraintParser.getTableConstraint(constraintSql);
        if (constraint === null || constraint === undefined) {
            constraint = ConstraintParser.getColumnConstraint(constraintSql);
        }
        return constraint;
    };
    /**
     * Check if the SQL is a constraint
     * @param constraintSql constraint SQL statement
     * @return true if a constraint
     */
    ConstraintParser.isConstraint = function (constraintSql) {
        return ConstraintParser.getTableOrColumnConstraint(constraintSql) !== null;
    };
    /**
     * Get the constraint type of the constraint SQL
     * @param constraintSql constraint SQL
     * @return constraint type or null
     */
    ConstraintParser.getType = function (constraintSql) {
        var type = null;
        var constraint = ConstraintParser.getTableOrColumnConstraint(constraintSql);
        if (constraint !== null && constraint !== undefined) {
            type = constraint.getType();
        }
        return type;
    };
    /**
     * Determine if the constraint SQL is the constraint type
     * @param type constraint type
     * @param constraintSql constraint SQL
     * @return true if the constraint type
     */
    ConstraintParser.isType = function (type, constraintSql) {
        var isType = false;
        var constraintType = ConstraintParser.getType(constraintSql);
        if (constraintType !== null && constraintType !== undefined) {
            isType = type === constraintType;
        }
        return isType;
    };
    /**
     * Get the constraint name if it has one
     * @param constraintSql constraint SQL
     * @return constraint name or null
     */
    ConstraintParser.getName = function (constraintSql) {
        var name = null;
        var matches = ConstraintParser.NAME_PATTERN(constraintSql);
        if (matches !== null && matches.length > ConstraintParser.NAME_PATTERN_NAME_GROUP) {
            name = stringUtils_1.StringUtils.quoteUnwrap(matches[ConstraintParser.NAME_PATTERN_NAME_GROUP]);
        }
        return name;
    };
    /**
     * Get the constraint name and remaining definition
     * @param constraintSql constraint SQL
     * @return array with name or null at index 0, definition at index 1
     */
    ConstraintParser.getNameAndDefinition = function (constraintSql) {
        var parts = [null, constraintSql];
        var matches = ConstraintParser.CONSTRAINT_PATTERN(constraintSql.trim());
        if (matches !== null && matches.length > ConstraintParser.CONSTRAINT_PATTERN_DEFINITION_GROUP) {
            var name_1 = stringUtils_1.StringUtils.quoteUnwrap(matches[ConstraintParser.CONSTRAINT_PATTERN_NAME_GROUP]);
            if (name_1 !== null && name_1 !== undefined) {
                name_1 = name_1.trim();
            }
            var definition = matches[ConstraintParser.CONSTRAINT_PATTERN_DEFINITION_GROUP];
            if (definition !== null && definition !== undefined) {
                definition = definition.trim();
            }
            parts = [name_1, definition];
        }
        return parts;
    };
    /**
     * Constraint name pattern
     */
    ConstraintParser.NAME_PATTERN = function (s) { return s.match(/CONSTRAINT\s+("[\s\S]+"|\S+)\s/i); };
    /**
     * Constraint name pattern name matcher group
     */
    ConstraintParser.NAME_PATTERN_NAME_GROUP = 1;
    /**
     * Constraint name and definition pattern
     */
    ConstraintParser.CONSTRAINT_PATTERN = function (s) { return s.match(/(CONSTRAINT\s+("[\s\S]+"|\S+)\s)?([\s\S]*)/i); };
    /**
     * Constraint name and definition pattern name matcher group
     */
    ConstraintParser.CONSTRAINT_PATTERN_NAME_GROUP = 2;
    /**
     * Constraint name and definition pattern definition matcher group
     */
    ConstraintParser.CONSTRAINT_PATTERN_DEFINITION_GROUP = 3;
    return ConstraintParser;
}());
exports.ConstraintParser = ConstraintParser;
//# sourceMappingURL=constraintParser.js.map