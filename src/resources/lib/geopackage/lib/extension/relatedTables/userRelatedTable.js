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
exports.UserRelatedTable = void 0;
var userCustomTable_1 = require("../../user/custom/userCustomTable");
/**
 * User Defined Related Table
 * @param  {string} tableName table name
 * @param  {array} columns   attribute columns
 */
/**
 * User Defined Related Table
 * @param  {string} tableName       table name
 * @param  {string} relationName    relation name
 * @param  {string} dataType        Contents data type
 * @param  {module:user/userColumn~UserColumn} columns         columns
 * @param  {string[]} [requiredColumns] required columns
 * @return {module:extension/relatedTables~UserRelatedTable}
 */
var UserRelatedTable = /** @class */ (function (_super) {
    __extends(UserRelatedTable, _super);
    function UserRelatedTable(tableName, relation_name, data_type, columns, requiredColumns) {
        var _this = _super.call(this, tableName, columns, requiredColumns) || this;
        _this.relation_name = relation_name;
        _this.data_type = data_type;
        return _this;
    }
    Object.defineProperty(UserRelatedTable.prototype, "tableType", {
        get: function () {
            return 'userRelatedTable';
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets the contents
     * @param  {module:core/contents~Contents} contents contents
     * @throw Error if the contents data type does not match this data type
     */
    UserRelatedTable.prototype.setContents = function (contents) {
        // verify the contents have a relation name data type
        if (!contents.data_type || contents.data_type !== this.data_type) {
            throw new Error('The contents of this related table must have a data type of ' + this.data_type);
        }
        this.contents = contents;
        return true;
    };
    return UserRelatedTable;
}(userCustomTable_1.UserCustomTable));
exports.UserRelatedTable = UserRelatedTable;
//# sourceMappingURL=userRelatedTable.js.map