"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpatialReferenceSystem = void 0;
var projection_1 = require("../../projection/projection");
var projectionConstants_1 = require("../../projection/projectionConstants");
/**
 * Spatial Reference System object. The coordinate reference system definitions it contains are referenced by the GeoPackage Contents and GeometryColumns objects to relate the vector and tile data in user tables to locations on the earth.
 * @class SpatialReferenceSystem
 */
var SpatialReferenceSystem = /** @class */ (function () {
    function SpatialReferenceSystem() {
    }
    Object.defineProperty(SpatialReferenceSystem.prototype, "projection", {
        /**
         * Return the proj4 projection specified by this SpatialReferenceSystem
         * @return {*}
         */
        get: function () {
            if (this.organization === 'NONE')
                return null;
            if (!!this.organization && this.organization.toUpperCase() === projectionConstants_1.ProjectionConstants.EPSG && (this.organization_coordsys_id === projectionConstants_1.ProjectionConstants.EPSG_CODE_4326 || this.organization_coordsys_id === projectionConstants_1.ProjectionConstants.EPSG_CODE_3857)) {
                return projection_1.Projection.getEPSGConverter(this.organization_coordsys_id);
            }
            else if (this.definition_12_063 && this.definition_12_063 !== '' && this.definition_12_063 !== 'undefined') {
                return projection_1.Projection.getConverter(this.definition_12_063);
            }
            else if (this.definition && this.definition !== '' && this.definition !== 'undefined') {
                return projection_1.Projection.getConverter(this.definition);
            }
            return null;
        },
        enumerable: false,
        configurable: true
    });
    SpatialReferenceSystem.TABLE_NAME = 'gpkg_spatial_ref_sys';
    return SpatialReferenceSystem;
}());
exports.SpatialReferenceSystem = SpatialReferenceSystem;
//# sourceMappingURL=spatialReferenceSystem.js.map