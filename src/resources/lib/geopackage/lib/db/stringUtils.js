"use strict";
/**
 * String Utility methods
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtils = void 0;
var StringUtils = /** @class */ (function () {
    function StringUtils() {
    }
    /**
     * Wrap the name in double quotes
     * @param name  name
     * @return quoted name
     */
    StringUtils.quoteWrap = function (name) {
        var quoteName = null;
        if (name !== null) {
            if (name.startsWith('"') && name.endsWith('"')) {
                quoteName = name;
            }
            else {
                quoteName = '"' + name + '"';
            }
        }
        return quoteName;
    };
    /**
     * Remove double quotes from the name
     * @param name name
     * @return unquoted name
     */
    StringUtils.quoteUnwrap = function (name) {
        var unquotedName = null;
        if (name != null) {
            if (name.startsWith('"') && name.endsWith('"')) {
                unquotedName = name.substring(1, name.length - 1);
            }
            else {
                unquotedName = name;
            }
        }
        return unquotedName;
    };
    return StringUtils;
}());
exports.StringUtils = StringUtils;
//# sourceMappingURL=stringUtils.js.map