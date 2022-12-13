/**
 * @memberOf module:extension/style
 * @class StyleMappingDao
 */
import { UserMappingDao } from '../relatedTables/userMappingDao';
import { UserCustomDao } from '../../user/custom/userCustomDao';
import { GeoPackage } from '../../geoPackage';
import { StyleMappingTable } from './styleMappingTable';
import { StyleMappingRow } from './styleMappingRow';
import { UserRow } from '../../user/userRow';
import { DBValue } from '../../db/dbAdapter';
import { GeoPackageDataType } from '../../db/geoPackageDataType';
import { GeometryType } from '../../features/user/geometryType';
/**
 * Style Mapping DAO for reading user mapping data tables
 * @extends UserMappingDao
 * @param  {module:user/custom~UserCustomDao} userCustomDao
 * @param  {module:geoPackage~GeoPackage} geoPackage      geopackage object
 * @param {StyleMappingTable} [styleMappingTable]
 * @constructor
 */
export declare class StyleMappingDao extends UserMappingDao<StyleMappingRow> {
    constructor(userCustomDao: UserCustomDao<StyleMappingRow>, geoPackage: GeoPackage, styleMappingTable?: StyleMappingTable);
    get table(): StyleMappingTable;
    /**
     * Create a new {module:user/custom~UserCustomTable}
     * @param  {module:user/custom~UserCustomDao} userCustomDao
     * @return {module:user/custom~UserCustomTable} userCustomTable user custom table
     */
    createMappingTable(userCustomDao: UserCustomDao<UserRow>): StyleMappingTable;
    /**
     * Create a user mapping row
     * @param  {module:db/geoPackageDataType[]} columnTypes  column types
     * @param  {module:dao/columnValues~ColumnValues[]} values values
     * @return {module:extension/style.StyleMappingRow} style mapping row
     */
    newRow(columnTypes?: {
        [key: string]: GeoPackageDataType;
    }, values?: Record<string, DBValue>): StyleMappingRow;
    /**
     * Delete by base id and geometry type
     * @param  {Number} baseId base id
     * @param  {GeometryType} geometryType geometry type
     * @return {Number} number of deleted rows
     */
    deleteByBaseIdAndGeometryType(baseId: number, geometryType: GeometryType): number;
}
