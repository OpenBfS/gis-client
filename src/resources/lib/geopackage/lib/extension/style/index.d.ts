/**
 * @module extension/style
 */
import { BaseExtension } from '../baseExtension';
import { Extension } from '../extension';
import { IconDao } from './iconDao';
import { StyleDao } from './styleDao';
import { StyleMappingDao } from './styleMappingDao';
import { FeatureTable } from '../../features/user/featureTable';
import { FeatureStyles } from './featureStyles';
import { FeatureStyle } from './featureStyle';
import { Styles } from './styles';
import { Icons } from './icons';
import { IconRow } from './iconRow';
import { FeatureRow } from '../../features/user/featureRow';
import { RelatedTablesExtension } from '../relatedTables';
import { ContentsIdExtension } from '../contents';
import { GeoPackage } from '../../geoPackage';
import { ExtendedRelation } from '../relatedTables/extendedRelation';
import { StyleRow } from './styleRow';
import { GeometryType } from '../../features/user/geometryType';
/**
 * Style extension
 * @param  {module:geoPackage~GeoPackage} geoPackage GeoPackage object
 * @extends BaseExtension
 * @constructor
 */
export declare class FeatureStyleExtension extends BaseExtension {
    relatedTablesExtension: RelatedTablesExtension;
    contentsIdExtension: ContentsIdExtension;
    static readonly EXTENSION_NAME = "nga_feature_style";
    static readonly EXTENSION_AUTHOR = "nga";
    static readonly EXTENSION_NAME_NO_AUTHOR = "feature_style";
    static readonly EXTENSION_DEFINITION = "http://ngageoint.github.io/GeoPackage/docs/extensions/feature-style.html";
    static readonly TABLE_MAPPING_STYLE: string;
    static readonly TABLE_MAPPING_TABLE_STYLE: string;
    static readonly TABLE_MAPPING_ICON: string;
    static readonly TABLE_MAPPING_TABLE_ICON: string;
    constructor(geoPackage: GeoPackage);
    /**
     * Get or create the metadata extension
     *  @param {module:features/user/featureTable|String} featureTable, defaults to null
     * @return {Promise}
     */
    getOrCreateExtension(featureTable: FeatureTable | string): Extension;
    /**
     * Determine if the GeoPackage has the extension or has the extension for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @returns {Boolean}
     */
    has(featureTable: FeatureTable | string): boolean;
    /**
     * Gets featureTables
     * @returns {String[]}
     */
    getTables(): string[];
    /**
     * Get the related tables extension
     * @returns {module:extension/relatedTables~RelatedTablesExtension}
     */
    getRelatedTables(): RelatedTablesExtension;
    /**
     * Get the contentsId extension
     * @returns {module:extension/contents~ContentsIdExtension}
     */
    getContentsId(): ContentsIdExtension;
    /**
     * Create style, icon, table style, and table icon relationships for the
     * feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {any}
     */
    createRelationships(featureTable: FeatureTable | string): {
        styleRelationship: ExtendedRelation;
        tableStyleRelationship: ExtendedRelation;
        iconRelationship: ExtendedRelation;
        tableIconRelationship: ExtendedRelation;
    };
    /**
     * Check if feature table has a style, icon, table style, or table icon
     * relationships
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @returns {boolean}
     */
    hasRelationship(featureTable: string | FeatureTable): boolean;
    /**
     * Create a style relationship for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {any}
     */
    createStyleRelationship(featureTable: string | FeatureTable): ExtendedRelation;
    /**
     * Determine if a style relationship exists for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @returns {boolean}
     */
    hasStyleRelationship(featureTable: string | FeatureTable): boolean;
    /**
     * Create a feature table style relationship
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {ExtendedRelation}
     */
    createTableStyleRelationship(featureTable: string | FeatureTable): ExtendedRelation;
    /**
     * Determine if a feature table style relationship exists
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @returns {boolean} true if relationship exists
     */
    hasTableStyleRelationship(featureTable: string | FeatureTable): boolean;
    /**
     * Create an icon relationship for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {ExtendedRelation}
     */
    createIconRelationship(featureTable: string | FeatureTable): ExtendedRelation;
    /**
     * Determine if an icon relationship exists for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @returns {boolean} true if relationship exists
     */
    hasIconRelationship(featureTable: string | FeatureTable): boolean;
    /**
     * Create a feature table icon relationship
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {ExtendedRelation}
     */
    createTableIconRelationship(featureTable: string | FeatureTable): ExtendedRelation;
    /**
     * Determine if a feature table icon relationship exists
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @returns {Boolean} true if relationship exists
     */
    hasTableIconRelationship(featureTable: string | FeatureTable): boolean;
    /**
     * Get the mapping table name
     * @param tablePrefix table name prefix
     * @param {module:features/user/featureTable|String} featureTable feature table name
     * @returns {String} mapping table name
     */
    getMappingTableName(tablePrefix: string, featureTable: string | FeatureTable): string;
    /**
     * Check if the style extension relationship between a feature table and
     * style extension table exists
     * @param {String} mappingTableName mapping table name
     * @param {String} baseTable base table name
     * @param {String} relatedTable related table name
     * @returns {boolean} true if relationship exists
     */
    _hasStyleRelationship(mappingTableName: string, baseTable: string, relatedTable: string): boolean;
    /**
     * Create a style extension relationship between a feature table and style
     * extension table
     * @param {String} mappingTableName mapping table name
     * @param {String} featureTable feature table
     * @param {String} baseTable base table name
     * @param {String} relatedTable related table name
     * @return {ExtendedRelation}
     * @private
     */
    _createStyleRelationship(mappingTableName: string, featureTable: string, baseTable: string, relatedTable: string): ExtendedRelation;
    /**
     * Private function to aid in creation of the a style extension relationship between a feature table and style extension table
     * @param {String} mappingTableName
     * @param {String} baseTable
     * @param {String} relatedTable
     * @return {ExtendedRelation}
     * @private
     */
    _handleCreateStyleRelationship(mappingTableName: string, baseTable: string, relatedTable: string): ExtendedRelation;
    /**
     * Delete the style and icon table and row relationships for all feature
     * tables
     */
    deleteAllRelationships(): {
        styleRelationships: number;
        tableStyleRelationships: number;
        iconRelationship: number;
        tableIconRelationship: number;
    };
    /**
     * Delete the style and icon table and row relationships for the feature
     * table
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteRelationships(featureTable: string | FeatureTable): {
        styleRelationships: number;
        tableStyleRelationships: number;
        iconRelationship: number;
        tableIconRelationship: number;
    };
    /**
     * Delete a style relationship for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteStyleRelationship(featureTable: string | FeatureTable): number;
    /**
     * Delete a table style relationship for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteTableStyleRelationship(featureTable: string | FeatureTable): number;
    /**
     * Delete a icon relationship for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteIconRelationship(featureTable: string | FeatureTable): number;
    /**
     * Delete a table icon relationship for the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteTableIconRelationship(featureTable: string | FeatureTable): number;
    /**
     * Delete a style extension feature table relationship and the mapping table
     * @param {String} mappingTableName
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @private
     */
    _deleteStyleRelationship(mappingTableName: string, featureTable: string | FeatureTable): number;
    /**
     * Get a Style Mapping DAO
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.StyleMappingDao} style mapping DAO
     */
    getStyleMappingDao(featureTable: string | FeatureTable): StyleMappingDao;
    /**
     * Get a Table Style Mapping DAO
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.StyleMappingDao} table style mapping DAO
     */
    getTableStyleMappingDao(featureTable: string | FeatureTable): StyleMappingDao;
    /**
     * Get a Icon Mapping DAO
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.StyleMappingDao} icon mapping DAO
     */
    getIconMappingDao(featureTable: FeatureTable | string): StyleMappingDao;
    /**
     * Get a Table Icon Mapping DAO
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.StyleMappingDao} table icon mapping DAO
     */
    getTableIconMappingDao(featureTable: string | FeatureTable): StyleMappingDao;
    /**
     * Get a Style Mapping DAO from a table name
     * @param {String} tablePrefix table name prefix
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.StyleMappingDao} style mapping dao
     * @private
     */
    _getMappingDao(tablePrefix: string, featureTable: string | FeatureTable): StyleMappingDao;
    /**
     * Get a style DAO
     * @return {module:extension/style.StyleDao} style DAO
     */
    getStyleDao(): StyleDao;
    /**
     * Get a icon DAO
     * @return {module:extension/style.IconDao}
     */
    getIconDao(): IconDao;
    /**
     * Get the feature table default feature styles
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.FeatureStyles} table feature styles or null
     */
    getTableFeatureStyles(featureTable: string | FeatureTable): FeatureStyles;
    /**
     * Get the default style of the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.StyleRow} style row
     */
    getTableStyleDefault(featureTable: string | FeatureTable): StyleRow;
    /**
     * Get the style of the feature table and geometry type
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {GeometryType} geometryType geometry type
     * @return {module:extension/style.StyleRow} style row
     */
    getTableStyle(featureTable: string | FeatureTable, geometryType: GeometryType): StyleRow;
    /**
     * Get the feature table default styles
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.Styles} table styles or null
     */
    getTableStyles(featureTable: string | FeatureTable): Styles;
    /**
     * Get the default icon of the feature table
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.IconRow} icon row
     */
    getTableIconDefault(featureTable: string | FeatureTable): IconRow;
    /**
     * Get the icon of the feature table and geometry type
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {GeometryType} geometryType geometry type
     * @return {module:extension/style.IconRow} icon row
     */
    getTableIcon(featureTable: string | FeatureTable, geometryType: GeometryType): IconRow;
    /**
     * Get the feature table default icons
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {module:extension/style.Icons} table icons or null
     */
    getTableIcons(featureTable: string | FeatureTable): Icons;
    /**
     * Gets Icons for featureId and mappingDao
     * @param {Number} featureId
     * @param mappingDao
     * @param {boolean} tableIcons
     * @returns {module:extension/style.Icons}
     * @private
     */
    getIcons(featureId: number, mappingDao: StyleMappingDao, tableIcons?: boolean): Icons;
    /**
     * Gets Styles for featureId and mappingDao
     * @param {Number} featureId
     * @param {module:extension/style.StyleMappingDao} mappingDao
     * @param {boolean} tableStyles
     * @returns {module:extension/style.Styles}
     */
    getStyles(featureId: number, mappingDao: StyleMappingDao, tableStyles?: boolean): Styles;
    /**
     * Get the feature styles for the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @return {module:extension/style.FeatureStyles} feature styles or null
     */
    getFeatureStylesForFeatureRow(featureRow: FeatureRow): FeatureStyles;
    /**
     * Get the feature styles for the feature row
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @return {module:extension/style.FeatureStyles} feature styles or null
     */
    getFeatureStyles(featureTable: string | FeatureTable, featureId: number): FeatureStyles;
    /**
     * Get the styles for the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @return {module:extension/style.Styles} styles or null
     */
    getStylesForFeatureRow(featureRow: FeatureRow): Styles;
    /**
     * Get the styles for the feature id
     * @param {String} tableName table name
     * @param {Number} featureId feature id
     * @return {module:extension/style.Styles} styles or null
     */
    getStylesForFeatureId(tableName: string, featureId: number): Styles;
    /**
     * Get the icons for the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @return {module:extension/style.Icons} icons or null
     */
    getIconsForFeatureRow(featureRow: FeatureRow): Icons;
    /**
     * Get the icons for the feature id
     * @param {String} tableName table name
     * @param {Number} featureId feature id
     * @return {module:extension/style.Icons} icons or null
     */
    getIconsForFeatureId(tableName: string, featureId: number): Icons;
    /**
     * Get the feature style (style and icon) of the feature row, searching in
     * order: feature geometry type style or icon, feature default style or
     * icon, table geometry type style or icon, table default style or icon
     * @param {module:features/user/featureRow} featureRow feature row
     * @return {module:extension/style.FeatureStyle} feature style
     */
    getFeatureStyleForFeatureRow(featureRow: FeatureRow): FeatureStyle;
    /**
     * Get the feature style (style and icon) of the feature, searching in
     * order: feature geometry type style or icon, feature default style or
     * icon, table geometry type style or icon, table default style or icon
     * @param {module:features/user/featureRow} featureRow feature row
     * @return {module:extension/style.FeatureStyle} feature style
     */
    getFeatureStyleDefault(featureRow: FeatureRow): FeatureStyle;
    /**
     * Get the icon of the feature, searching in order: feature geometry type
     * icon, feature default icon, when tableIcon enabled continue searching:
     * table geometry type icon, table default icon
     * @param {module:features/user/featureTable|String} featureTable
     * @param {Number} featureId
     * @param {GeometryType} geometryType
     * @param {Boolean} tableIcon
     * @returns {module:extension/style.IconRow}
     * @private
     */
    getIcon(featureTable: string | FeatureTable, featureId: number, geometryType: GeometryType, tableIcon: boolean): IconRow;
    /**
     * Get the style of the feature, searching in order: feature geometry type
     * style, feature default style, when tableStyle enabled continue searching:
     * table geometry type style, table default style
     * @param {module:features/user/featureTable|String} featureTable
     * @param {Number} featureId
     * @param {GeometryType} geometryType
     * @param {Boolean} tableStyle
     * @returns {module:extension/style.StyleRow}
     * @private
     */
    getStyle(featureTable: string | FeatureTable, featureId: number, geometryType: GeometryType, tableStyle: boolean): StyleRow;
    /**
     * Set the feature table default feature styles
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {module:extension/style.FeatureStyles} featureStyles feature styles
     * @return {any}
     */
    setTableFeatureStyles(featureTable: string | FeatureTable, featureStyles?: FeatureStyles): {
        tableStyles: {
            styleDefault: number;
            styles: number[];
        };
        tableIcons: {
            iconDefault: number;
            icons: number[];
        };
        deleted?: {
            styles: number;
            icons: number;
        };
    };
    /**
     * Set the feature table default styles
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {module:extension/style.Styles} styles default styles
     * @return {any}
     */
    setTableStyles(featureTable: string | FeatureTable, styles?: Styles): {
        styleDefault: number;
        styles: number[];
        deleted: number;
    };
    /**
     * Set the feature table style default
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {module:extension/style.StyleRow} style style row
     * @return {number}
     */
    setTableStyleDefault(featureTable: string | FeatureTable, style: StyleRow): number;
    /**
     * Set the feature table style for the geometry type
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.StyleRow} style style row
     * @return {number}
     */
    setTableStyle(featureTable: string | FeatureTable, geometryType: GeometryType, style?: StyleRow): number;
    /**
     * Set the feature table default icons
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {module:extension/style.Icons} icons default icons
     * @return {any}
     */
    setTableIcons(featureTable: string | FeatureTable, icons?: Icons): {
        iconDefault: number;
        icons: number[];
        deleted: number;
    };
    /**
     * Set the feature table icon default
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {module:extension/style.IconRow} icon icon row
     * @return {number}
     */
    setTableIconDefault(featureTable: string | FeatureTable, icon?: IconRow): number;
    /**
     * Set the feature table icon for the geometry type
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.IconRow} icon icon row
     * @return {number}
     */
    setTableIcon(featureTable: string | FeatureTable, geometryType: GeometryType, icon?: IconRow): number;
    /**
     * Set the feature styles for the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.FeatureStyles} featureStyles feature styles
     * @return {any}
     */
    setFeatureStylesForFeatureRow(featureRow: FeatureRow, featureStyles: FeatureStyles): {
        styles: {
            styleDefault: number;
            styles: number[];
        };
        icons: {
            iconDefault: number;
            icons: number[];
            deleted?: {
                style: number;
                icon: number;
            };
        };
    };
    /**
     * Set the feature styles for the feature table and feature id
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {module:extension/style.FeatureStyles} featureStyles feature styles
     * @return {any}
     */
    setFeatureStyles(featureTable: string | FeatureTable, featureId: number, featureStyles?: FeatureStyles): {
        styles: {
            styleDefault: number;
            styles: number[];
        };
        icons: {
            iconDefault: number;
            icons: number[];
        };
        deleted?: {
            deletedStyles: number;
            deletedIcons: number;
        };
    };
    /**
     * Set the feature style (style and icon) of the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.FeatureStyle} featureStyle feature style
     * @return {any}
     */
    setFeatureStyleForFeatureRow(featureRow: FeatureRow, featureStyle: FeatureStyle): {
        style: number;
        icon: number;
        deleted?: {
            style: number;
            icon: number;
        };
    };
    /**
     * Set the feature style (style and icon) of the feature row for the
     * specified geometry type
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.FeatureStyle} featureStyle feature style
     * @return {any}
     */
    setFeatureStyleForFeatureRowAndGeometryType(featureRow: FeatureRow, geometryType: GeometryType, featureStyle: FeatureStyle): {
        style: number;
        icon: number;
        deleted?: {
            style: number;
            icon: number;
        };
    };
    /**
     * Set the feature style default (style and icon) of the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.FeatureStyle} featureStyle feature style
     * @return {any}
     */
    setFeatureStyleDefaultForFeatureRow(featureRow: FeatureRow, featureStyle: FeatureStyle): {
        style: number;
        icon: number;
        deleted?: {
            style: number;
            icon: number;
        };
    };
    /**
     * Set the feature style (style and icon) of the feature
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.FeatureStyle} featureStyle feature style
     * @return {any}
     */
    setFeatureStyle(featureTable: string | FeatureTable, featureId: number, geometryType: GeometryType, featureStyle?: FeatureStyle): {
        style: number;
        icon: number;
        deleted?: {
            style: number;
            icon: number;
        };
    };
    /**
     * Set the feature style (style and icon) of the feature
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {module:extension/style.FeatureStyle} featureStyle feature style
     * @return {object}
     */
    setFeatureStyleDefault(featureTable: string | FeatureTable, featureId: number, featureStyle: FeatureStyle): {
        style: number;
        icon: number;
        deleted?: {
            style: number;
            icon: number;
        };
    };
    /**
     * Set the styles for the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.Styles} styles styles
     * @return {Promise}
     */
    setStylesForFeatureRow(featureRow: FeatureRow, styles: Styles): {
        styleDefault: number;
        styles: number[];
        deleted: number;
    };
    /**
     * Set the styles for the feature table and feature id
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {module:extension/style.Styles} styles styles
     * @return {Promise}
     */
    setStyles(featureTable: string | FeatureTable, featureId: number, styles?: Styles): {
        styleDefault: number;
        styles: number[];
        deleted: number;
    };
    /**
     * Set the style of the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.StyleRow} style style row
     * @return {Promise}
     */
    setStyleForFeatureRow(featureRow: FeatureRow, style: StyleRow): number;
    /**
     * Set the style of the feature row for the specified geometry type
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.StyleRow} style style row
     * @return {Promise}
     */
    setStyleForFeatureRowAndGeometryType(featureRow: FeatureRow, geometryType: GeometryType, style: StyleRow): number;
    /**
     * Set the default style of the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.StyleRow} style style row
     * @return {Promise}
     */
    setStyleDefaultForFeatureRow(featureRow: FeatureRow, style: StyleRow): number;
    /**
     * Set the style of the feature
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.StyleRow} style style row
     * @return {number}
     */
    setStyle(featureTable: string | FeatureTable, featureId: number, geometryType: GeometryType, style: StyleRow): number;
    /**
     * Set the default style of the feature
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {module:extension/style.StyleRow} style style row
     * @return {number}
     */
    setStyleDefault(featureTable: string | FeatureTable, featureId: number, style: StyleRow): number;
    /**
     * Set the icons for the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.Icons} icons icons
     * @return {Promise}
     */
    setIconsForFeatureRow(featureRow: FeatureRow, icons: Icons): {
        iconDefault: number;
        icons: number[];
        deleted: number;
    };
    /**
     * Set the icons for the feature table and feature id
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {module:extension/style.Icons} icons icons
     * @return {Promise}
     */
    setIcons(featureTable: string | FeatureTable, featureId: number, icons?: Icons): {
        iconDefault: number;
        icons: number[];
        deleted: number;
    };
    /**
     * Set the icon of the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.IconRow} icon icon row
     * @return {number}
     */
    setIconForFeatureRow(featureRow: FeatureRow, icon: IconRow): number;
    /**
     * Set the icon of the feature row for the specified geometry type
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.IconRow} icon icon row
     * @return {number}
     */
    setIconForFeatureRowAndGeometryType(featureRow: FeatureRow, geometryType: GeometryType, icon: IconRow): number;
    /**
     * Set the default icon of the feature row
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {module:extension/style.IconRow} icon icon row
     * @return {number}
     */
    setIconDefaultForFeatureRow(featureRow: FeatureRow, icon: IconRow): number;
    /**
     * Get the icon of the feature, searching in order: feature geometry type
     * icon, feature default icon, table geometry type icon, table default icon
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {GeometryType} geometryType geometry type
     * @param {module:extension/style.IconRow} icon icon row
     * @return {number}
     */
    setIcon(featureTable: string | FeatureTable, featureId: number, geometryType: GeometryType, icon?: IconRow): number;
    /**
     * Set the default icon of the feature
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {module:extension/style.IconRow} icon icon row
     * @return {number}
     */
    setIconDefault(featureTable: string | FeatureTable, featureId: number, icon: IconRow): number;
    /**
     * Get the style id, either from the existing style or by inserting a new one
     * @param {module:extension/style.StyleRow} style style row
     * @return {Number} style id
     */
    getOrInsertStyle(style: StyleRow): number;
    /**
     * Get the icon id, either from the existing icon or by inserting a new one
     * @param {module:extension/style.IconRow} icon icon row
     * @return {Number} icon id
     */
    getOrInsertIcon(icon: IconRow): number;
    /**
     * Insert a style mapping row
     * @param {module:extension/style.StyleMappingDao} mappingDao mapping dao
     * @param {Number} baseId base id, either contents id or feature id
     * @param {Number} relatedId related id, either style or icon id
     * @param {GeometryType} geometryType geometry type or null
     */
    insertStyleMapping(mappingDao: StyleMappingDao, baseId: number, relatedId: number, geometryType?: GeometryType): number;
    /**
     * Delete all feature styles including table styles, table icons, style, and icons
     * @param {module:features/user/featureTable~FeatureTable|String} featureTable feature table
     */
    deleteAllFeatureStyles(featureTable: string | FeatureTable): {
        tableStyles: {
            styles: number;
            icons: number;
        };
        styles: {
            styles: number;
            icons: number;
        };
    };
    /**
     * Delete all styles including table styles and feature row style
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteAllStyles(featureTable: string | FeatureTable): {
        tableStyles: number;
        styles: number;
    };
    /**
     * Delete all icons including table icons and feature row icons
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteAllIcons(featureTable: string | FeatureTable): {
        tableIcons: number;
        icons: number;
    };
    /**
     * Delete the feature table feature styles
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteTableFeatureStyles(featureTable: string | FeatureTable): {
        styles: number;
        icons: number;
    };
    /**
     * Delete the feature table styles
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteTableStyles(featureTable: string | FeatureTable): number;
    /**
     * Delete the feature table default style
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteTableStyleDefault(featureTable: string | FeatureTable): number;
    /**
     * Delete the feature table style for the geometry type
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {GeometryType} geometryType geometry type
     */
    deleteTableStyle(featureTable: string | FeatureTable, geometryType: GeometryType): number;
    /**
     * Delete the feature table icons
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteTableIcons(featureTable: string | FeatureTable): number;
    /**
     * Delete the feature table default icon
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteTableIconDefault(featureTable: string | FeatureTable): number;
    /**
     * Delete the feature table icon for the geometry type
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {GeometryType} geometryType geometry type
     */
    deleteTableIcon(featureTable: string | FeatureTable, geometryType: GeometryType): number;
    /**
     * Delete the table style mappings
     * @param {module:extension/style.StyleMappingDao} mappingDao  mapping dao
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteTableMappings(mappingDao: StyleMappingDao, featureTable: string | FeatureTable): number;
    /**
     * Delete the table style mapping with the geometry type value
     * @param {module:extension/style.StyleMappingDao} mappingDao  mapping dao
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {GeometryType} geometryType geometry type
     */
    deleteTableMapping(mappingDao: StyleMappingDao, featureTable: string | FeatureTable, geometryType: GeometryType): number;
    /**
     * Delete all feature styles
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteFeatureStyles(featureTable: string | FeatureTable): {
        styles: number;
        icons: number;
    };
    /**
     * Delete all styles
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteStyles(featureTable: string | FeatureTable): number;
    /**
     * Delete feature row styles
     * @param {module:features/user/featureRow} featureRow feature row
     */
    deleteStylesForFeatureRow(featureRow: FeatureRow): number;
    /**
     * Delete feature row styles
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     */
    deleteStylesForFeatureId(featureTable: string | FeatureTable, featureId: number): number;
    /**
     * Delete the feature row default style
     * @param {module:features/user/featureRow} featureRow feature row
     */
    deleteStyleDefaultForFeatureRow(featureRow: FeatureRow): number;
    /**
     * Delete the feature row default style
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     */
    deleteStyleDefault(featureTable: string | FeatureTable, featureId: number): number;
    /**
     * Delete the feature row style for the feature row geometry type
     * @param {module:features/user/featureRow} featureRow feature row
     */
    deleteStyleForFeatureRow(featureRow: FeatureRow): number;
    /**
     * Delete the feature row style for the geometry type
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {GeometryType} geometryType geometry type
     */
    deleteStyleForFeatureRowAndGeometryType(featureRow: FeatureRow, geometryType: GeometryType): number;
    /**
     * Delete the feature row style for the geometry type
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {GeometryType} geometryType geometry type
     */
    deleteStyle(featureTable: string | FeatureTable, featureId: number, geometryType: GeometryType): number;
    /**
     * Delete the style row and associated mappings by style row
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {module:extension/style.StyleRow} styleRow style row
     */
    deleteStyleAndMappingsByStyleRow(featureTable: string | FeatureTable, styleRow: StyleRow): number;
    /**
     * Delete the style row and associated mappings by style row id
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} styleRowId style row id
     */
    deleteStyleAndMappingsByStyleRowId(featureTable: string | FeatureTable, styleRowId: number): number;
    /**
     * Delete all icons
     * @param {module:features/user/featureTable|String} featureTable feature table
     */
    deleteIcons(featureTable: string | FeatureTable): number;
    /**
     * Delete feature row icons
     * @param {module:features/user/featureRow} featureRow feature row
     */
    deleteIconsForFeatureRow(featureRow: FeatureRow): number;
    /**
     * Delete feature row icons
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     */
    deleteIconsForFeatureId(featureTable: string | FeatureTable, featureId: number): number;
    /**
     * Delete the feature row default icon
     * @param {module:features/user/featureRow} featureRow feature row
     */
    deleteIconDefaultForFeatureRow(featureRow: FeatureRow): number;
    /**
     * Delete the feature row default icon
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     */
    deleteIconDefault(featureTable: FeatureTable | string, featureId: number): number;
    /**
     * Delete the feature row icon for the feature row geometry type
     * @param {module:features/user/featureRow} featureRow feature row
     */
    deleteIconForFeatureRow(featureRow: FeatureRow): number;
    /**
     * Delete the feature row icon for the geometry type
     * @param {module:features/user/featureRow} featureRow feature row
     * @param {GeometryType} geometryType geometry type
     */
    deleteIconForFeatureRowAndGeometryType(featureRow: FeatureRow, geometryType: GeometryType): number;
    /**
     * Delete the feature row icon for the geometry type
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} featureId feature id
     * @param {GeometryType} geometryType geometry type
     */
    deleteIcon(featureTable: FeatureTable | string, featureId: number, geometryType: GeometryType): number;
    /**
     * Delete the icon row and associated mappings by icon row
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {module:extension/style.IconRow} iconRow icon row
     */
    deleteIconAndMappingsByIconRow(featureTable: FeatureTable | string, iconRow: IconRow): number;
    /**
     * Delete the icon row and associated mappings by icon row id
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @param {Number} iconRowId icon row id
     */
    deleteIconAndMappingsByIconRowId(featureTable: FeatureTable | string, iconRowId: number): number;
    /**
     * Delete all style mappings
     * @param {module:extension/style.StyleMappingDao} mappingDao  mapping dao
     */
    deleteMappings(mappingDao?: StyleMappingDao): number;
    /**
     * Delete the style mappings
     * @param {module:extension/style.StyleMappingDao} mappingDao  mapping dao
     * @param {Number} featureId feature id
     */
    deleteMappingsForFeatureId(mappingDao?: StyleMappingDao, featureId?: number): number;
    /**
     * Delete the style mapping with the geometry type value
     * @param {module:extension/style.StyleMappingDao} mappingDao  mapping dao
     * @param {Number} featureId feature id
     * @param {GeometryType} geometryType geometry type
     */
    deleteMapping(mappingDao?: StyleMappingDao, featureId?: number, geometryType?: GeometryType): number;
    /**
     * Get all the unique style row ids the table maps to
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return style row ids
     */
    getAllTableStyleIds(featureTable: FeatureTable | string): number[];
    /**
     * Get all the unique icon row ids the table maps to
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return icon row ids
     */
    getAllTableIconIds(featureTable: FeatureTable | string): number[];
    /**
     * Get all the unique style row ids the features map to
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {Number[]} style row ids
     */
    getAllStyleIds(featureTable: FeatureTable | string): number[];
    /**
     * Get all the unique icon row ids the features map to
     * @param {module:features/user/featureTable|String} featureTable feature table
     * @return {Number[]} icon row ids
     */
    getAllIconIds(featureTable: FeatureTable | string): number[];
    /**
     * Get name of feature table
     * @param featureTable
     * @returns {String}
     */
    getFeatureTableName(featureTable: FeatureTable | string): string;
    /**
     * Remove all traces of the extension
     */
    removeExtension(): number;
}
