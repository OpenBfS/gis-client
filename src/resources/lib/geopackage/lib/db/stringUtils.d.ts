/**
 * String Utility methods
 */
export declare class StringUtils {
    /**
     * Wrap the name in double quotes
     * @param name  name
     * @return quoted name
     */
    static quoteWrap(name: string): string;
    /**
     * Remove double quotes from the name
     * @param name name
     * @return unquoted name
     */
    static quoteUnwrap(name: string): string;
}
