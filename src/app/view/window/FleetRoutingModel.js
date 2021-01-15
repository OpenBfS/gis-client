/* Copyright (c) 2015-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @class Koala.view.window.RoutingModel
 */
Ext.define('Koala.view.window.FleetRoutingModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-window-fleet-routing',

    requires: [
        'Koala.store.WayPoints',
        'Koala.store.RoutingInstructions',
        'Koala.store.RoutingSummaries',
        'Koala.store.GeocodingSuggestions'
    ],

    stores: {
        waypoints: {
            type: 'k-waypoints'
        },
        routinginstructions: {
            type: 'k-routinginstructions'
        },
        routingsummaries: {
            type: 'k-routingsummaries'
        },
        geocodingsuggestions: {
            type: 'k-geocodingsuggestions'
        }
    },

    data: {
        i18n: {
            fleetRoutingTitle: '',
            computeFleetRoutingButtonText: '',
            elevationBtnText: '',
            downloadButtonText: '',
            errorGeoCoding: '',
            errorRoutingRequest: '',
            errorDownloadRoute: '',
            routingSummaryDetailsButton: '',
            addAvoidArea: '',
            uploadGeoJson: '',
            deleteAvoidArea: '',
            drawAvoidArea: '',
            selectAvoidAreaFromLayer: '',
            errorFileUpload: '',
            errorUploadedGeometryType: '',
            errorTooManyFeatures: '',
            errorUploadedFileExtension: '',
            errorZeroFeatures: '',
            errorGetFeatureInfo: '',
            errorNoLayerFound: '',
            errorNoPolygonChosen: '',
            errorFleetRouting: '',
            addJobContextText: '',
            addVehicleContextText: '',
            setCurrentJobContextText: '',
            setCurrentVehicleStartContextText: '',
            setCurrentVehicleEndContextText: ''
        },
        routingProfile: 'driving-car',
        routeStyle: undefined,
        routeSegmentStyle: undefined,
        waypointStyle: undefined,
        avoidAreaStyle: undefined,
        avoidAreaOpacity: 0.5,
        waypointFontSize: undefined,
        rightClickCoordinate: undefined,
        mapContextMenu: null,
        waypointPopup: null,
        startValue: undefined,
        targetValue: undefined,
        elevationStyle: undefined,
        showRoutingResults: false,
        routingOpts: null,
        language: 'de',
        showRoutingInstructions: false,
        deleteAvoidAreaButtonVisible: false
    }
});
