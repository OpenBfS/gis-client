/**
 * attributeTableReader module.
 * @module attributes/attributesTableReader
 */
import { UserTableReader } from '../user/userTableReader';
import { AttributesTable } from './attributesTable';
import { UserColumn } from '../user/userColumn';
import { AttributesColumn } from './attributesColumn';
import { TableColumn } from '../db/table/tableColumn';
import { GeoPackage } from '../geoPackage';
/**
 * Reads the metadata from an existing attribute table
 * @class AttributesTableReader
 * @extends UserTableReader
 * @classdesc Reads the metadata from an existing attributes table
 */
export declare class AttributesTableReader extends UserTableReader<AttributesColumn, AttributesTable> {
    constructor(table_name: string);
    /**
     * Read the attribute table
     * @param geoPackage
     */
    readAttributeTable(geoPackage: GeoPackage): AttributesTable;
    /**
     * @inheritDoc
     */
    createTable(tableName: string, columns: UserColumn[]): AttributesTable;
    /**
     * @inheritDoc
     */
    createColumn(tableColumn: TableColumn): AttributesColumn;
}
