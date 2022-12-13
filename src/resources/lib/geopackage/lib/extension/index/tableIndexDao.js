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
exports.TableIndexDao = void 0;
var dao_1 = require("../../dao/dao");
var tableCreator_1 = require("../../db/tableCreator");
var tableIndex_1 = require("./tableIndex");
/**
 * Table Index Data Access Object
 * @class
 * @extends Dao
 * @param {module:geoPackage~GeoPackage}  geoPackage The GeoPackage object
 */
var TableIndexDao = /** @class */ (function (_super) {
    __extends(TableIndexDao, _super);
    function TableIndexDao() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gpkgTableName = TableIndexDao.TABLE_NAME;
        _this.idColumns = [TableIndexDao.COLUMN_TABLE_NAME];
        return _this;
    }
    /**
     * Create a new TableIndex object
     * @return {module:extension/index~TableIndex}
     */
    TableIndexDao.prototype.createObject = function (results) {
        var ti = new tableIndex_1.TableIndex();
        if (results) {
            ti.table_name = results.table_name;
            ti.last_indexed = results.last_indexed;
        }
        return ti;
    };
    /**
     * Creates the tables necessary
     * @return {boolean}
     */
    TableIndexDao.prototype.createTable = function () {
        var tc = new tableCreator_1.TableCreator(this.geoPackage);
        return tc.createTableIndex();
    };
    TableIndexDao.TABLE_NAME = 'nga_table_index';
    TableIndexDao.COLUMN_TABLE_NAME = 'table_name';
    TableIndexDao.COLUMN_LAST_INDEXED = 'last_indexed';
    return TableIndexDao;
}(dao_1.Dao));
exports.TableIndexDao = TableIndexDao;
//# sourceMappingURL=tableIndexDao.js.map