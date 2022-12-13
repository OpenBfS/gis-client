"use strict";
/**
 * projectionConstants module.
 * @module projection/projectionConstants
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectionConstants = void 0;
var ProjectionConstants = /** @class */ (function () {
    function ProjectionConstants() {
    }
    ProjectionConstants.EPSG = 'EPSG';
    ProjectionConstants.EPSG_PREFIX = 'EPSG:';
    ProjectionConstants.EPSG_CODE_3857 = 3857;
    ProjectionConstants.EPSG_CODE_4326 = 4326;
    ProjectionConstants.EPSG_CODE_900913 = 900913;
    ProjectionConstants.EPSG_CODE_102113 = 102113;
    ProjectionConstants.EPSG_3857 = ProjectionConstants.EPSG_PREFIX + ProjectionConstants.EPSG_CODE_3857;
    ProjectionConstants.EPSG_4326 = ProjectionConstants.EPSG_PREFIX + ProjectionConstants.EPSG_CODE_4326;
    ProjectionConstants.EPSG_900913 = ProjectionConstants.EPSG_PREFIX + ProjectionConstants.EPSG_CODE_900913;
    ProjectionConstants.EPSG_102113 = ProjectionConstants.EPSG_PREFIX + ProjectionConstants.EPSG_CODE_102113;
    ProjectionConstants.WEB_MERCATOR_MAX_LAT_RANGE = 85.0511287798066;
    ProjectionConstants.WEB_MERCATOR_MIN_LAT_RANGE = -85.05112877980659;
    ProjectionConstants.WEB_MERCATOR_MAX_LON_RANGE = 180.0;
    ProjectionConstants.WEB_MERCATOR_MIN_LON_RANGE = -180.0;
    ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH = 20037508.342789244;
    ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH = 180.0;
    ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT = 90.0;
    return ProjectionConstants;
}());
exports.ProjectionConstants = ProjectionConstants;
//# sourceMappingURL=projectionConstants.js.map