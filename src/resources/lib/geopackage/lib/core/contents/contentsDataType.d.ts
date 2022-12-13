export declare enum ContentsDataType {
    FEATURES = "features",
    TILES = "tiles",
    ATTRIBUTES = "attributes"
}
export declare namespace ContentsDataType {
    function nameFromType(type: ContentsDataType): string;
    function fromName(type: string): ContentsDataType;
}
