"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Db = void 0;
var Db = /** @class */ (function () {
    function Db() {
    }
    Db.registerDbAdapter = function (adapter) {
        Db.adapterCreator = adapter;
    };
    Db.create = function (path) {
        return new Db.adapterCreator(path);
    };
    Db.adapterCreator = undefined;
    return Db;
}());
exports.Db = Db;
//# sourceMappingURL=db.js.map