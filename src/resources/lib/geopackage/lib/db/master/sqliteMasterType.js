"use strict";
/**
 * SQLite Master table (sqlite_master) type column keywords
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteMasterType = void 0;
var SQLiteMasterType;
(function (SQLiteMasterType) {
    /**
     * Table keyword
     */
    SQLiteMasterType[SQLiteMasterType["TABLE"] = 0] = "TABLE";
    /**
     * Index keyword
     */
    SQLiteMasterType[SQLiteMasterType["INDEX"] = 1] = "INDEX";
    /**
     * View keyword
     */
    SQLiteMasterType[SQLiteMasterType["VIEW"] = 2] = "VIEW";
    /**
     * Trigger keyword
     */
    SQLiteMasterType[SQLiteMasterType["TRIGGER"] = 3] = "TRIGGER";
})(SQLiteMasterType = exports.SQLiteMasterType || (exports.SQLiteMasterType = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (SQLiteMasterType) {
    function nameFromType(type) {
        return SQLiteMasterType[type];
    }
    SQLiteMasterType.nameFromType = nameFromType;
    function fromName(type) {
        return SQLiteMasterType[type];
    }
    SQLiteMasterType.fromName = fromName;
})(SQLiteMasterType = exports.SQLiteMasterType || (exports.SQLiteMasterType = {}));
//# sourceMappingURL=sqliteMasterType.js.map