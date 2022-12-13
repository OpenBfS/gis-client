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
exports.DataColumnConstraintsDao = void 0;
var dao_1 = require("../dao/dao");
var dataColumnConstraints_1 = require("./dataColumnConstraints");
/**
 * DataColumnConstraints module.
 * @module dataColumnConstraints
 */
/**
 * Data Column Constraints Data Access Object
 * @class
 * @extends Dao
 * @param  {module:geoPackage~GeoPackage} geoPackage GeoPackage object
 */
var DataColumnConstraintsDao = /** @class */ (function (_super) {
    __extends(DataColumnConstraintsDao, _super);
    function DataColumnConstraintsDao() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gpkgTableName = DataColumnConstraintsDao.TABLE_NAME;
        _this.idColumns = [
            DataColumnConstraintsDao.COLUMN_CONSTRAINT_NAME,
            DataColumnConstraintsDao.COLUMN_CONSTRAINT_TYPE,
            DataColumnConstraintsDao.COLUMN_VALUE,
        ];
        return _this;
    }
    /**
     * Creates a new DataColumnConstraints object
     * @return {module:dataColumnConstraints~DataColumnConstraints}
     */
    DataColumnConstraintsDao.prototype.createObject = function (results) {
        var dcc = new dataColumnConstraints_1.DataColumnConstraints();
        if (results) {
            dcc.constraint_name = results.constraint_name;
            dcc.constraint_type = results.constraint_type;
            dcc.value = results.value;
            dcc.min = results.min;
            dcc.max = results.max;
            dcc.min_is_inclusive = results.min_is_inclusive;
            dcc.max_is_inclusive = results.max_is_inclusive;
            dcc.description = results.description;
        }
        return dcc;
    };
    /**
     * query by constraint name
     * @param  {String} constraintName     constraint name
     * @return {Iterable}
     */
    DataColumnConstraintsDao.prototype.queryByConstraintName = function (constraintName) {
        return this.queryForEach(DataColumnConstraintsDao.COLUMN_CONSTRAINT_NAME, constraintName);
    };
    /**
     * Query by the unique column values
     * @param  {String} constraintName     constraint name
     * @param  {String} constraintType     constraint type
     * @param  {String} value              value
     * @return {module:dataColumnConstraints~DataColumnConstraints}
     */
    DataColumnConstraintsDao.prototype.queryUnique = function (constraintName, constraintType, value) {
        var dataColumnConstraints = new dataColumnConstraints_1.DataColumnConstraints();
        dataColumnConstraints.constraint_name = constraintName;
        dataColumnConstraints.constraint_type = constraintType;
        dataColumnConstraints.value = value;
        return this.queryForSameId(dataColumnConstraints);
    };
    DataColumnConstraintsDao.TABLE_NAME = 'gpkg_data_column_constraints';
    DataColumnConstraintsDao.COLUMN_CONSTRAINT_NAME = 'constraint_name';
    DataColumnConstraintsDao.COLUMN_CONSTRAINT_TYPE = 'constraint_type';
    DataColumnConstraintsDao.COLUMN_VALUE = 'value';
    DataColumnConstraintsDao.COLUMN_MIN = 'min';
    DataColumnConstraintsDao.COLUMN_MIN_IS_INCLUSIVE = 'min_is_inclusive';
    DataColumnConstraintsDao.COLUMN_MAX = 'max';
    DataColumnConstraintsDao.COLUMN_MAX_IS_INCLUSIVE = 'max_is_inclusive';
    DataColumnConstraintsDao.COLUMN_DESCRIPTION = 'description';
    DataColumnConstraintsDao.ENUM_TYPE = 'enum';
    DataColumnConstraintsDao.GLOB_TYPE = 'glob';
    DataColumnConstraintsDao.RANGE_TYPE = 'range';
    return DataColumnConstraintsDao;
}(dao_1.Dao));
exports.DataColumnConstraintsDao = DataColumnConstraintsDao;
//# sourceMappingURL=dataColumnConstraintsDao.js.map