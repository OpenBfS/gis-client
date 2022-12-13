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
exports.UserCustomDao = void 0;
/**
 * @module user/custom
 */
var userDao_1 = require("../userDao");
var userCustomTableReader_1 = require("./userCustomTableReader");
/**
 * User Custom Dao
 * @class
 * @extends UserDao
 * @param  {module:geoPackage~GeoPackage} geoPackage      geopackage object
 * @param  {module:user/custom~UserCustomTable} userCustomTable user custom table
 */
var UserCustomDao = /** @class */ (function (_super) {
    __extends(UserCustomDao, _super);
    function UserCustomDao(geoPackage, table) {
        return _super.call(this, geoPackage, table) || this;
    }
    UserCustomDao.prototype.createObject = function (results) {
        return this.getRow(results);
    };
    /**
     * Reads the table specified from the geopackage
     * @param  {module:geoPackage~GeoPackage} geoPackage      geopackage object
     * @param  {string} tableName       table name
     * @return {module:user/custom~UserCustomDao}
     */
    UserCustomDao.readTable = function (geoPackage, tableName) {
        var reader = new userCustomTableReader_1.UserCustomTableReader(tableName);
        var userCustomTable = reader.readTable(geoPackage.database);
        return new UserCustomDao(geoPackage, userCustomTable);
    };
    return UserCustomDao;
}(userDao_1.UserDao));
exports.UserCustomDao = UserCustomDao;
//# sourceMappingURL=userCustomDao.js.map