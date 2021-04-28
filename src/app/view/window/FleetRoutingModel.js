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
 * @class Koala.view.window.FleetRoutingModel
 */
Ext.define('Koala.view.window.FleetRoutingModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-window-fleet-routing',

    requires: [
        'Koala.store.WayPoints',
        'Koala.store.RoutingInstructions',
        'Koala.store.RoutingSummaries',
        'Koala.store.GeocodingSuggestions',
        'Koala.store.FleetRoutingSummary',
        'Koala.store.RoutingJobs',
        'Koala.store.RoutingVehicles'
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
        },
        fleetroutingsummary: {
            type: 'k-fleetroutingsummary'
        },
        routingjobs: {
            type: 'k-routingjobs'
        },
        routingvehicles: {
            type: 'k-routingvehicles'
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
            errorInvalidJobsJson: '',
            errorInvalidVehiclesJson: '',
            infoImportedJobs: '',
            infoInvalidJobs: '',
            infoImportedVehicles: '',
            infoInvalidVehicles: '',
            addJobContextText: '',
            addVehicleContextText: '',
            setCurrentJobContextText: '',
            setCurrentVehicleStartContextText: '',
            setCurrentVehicleEndContextText: '',
            totalDuration: '',
            totalDrivingDuration: '',
            totalServiceDuration: '',
            totalWaitingDuration: '',
            numberjobsMissing: '',
            fleetRoutingSummary: '',
            routesHeading: '',
            vehicleText: '',
            startText: '',
            viaText: '',
            duration: '',
            distance: '',
            startTime: '',
            arrivalTime: '',
            settingsTitle: '',
            routingAlgorithmClassicTooltip: '',
            routingAlgorithmForceAllTooltip: ''
        },
        routingProfile: 'driving-car',
        routeStyle: undefined,
        routeSegmentStyle: undefined,
        waypointStyle: undefined,
        jobMarkerStyle: undefined,
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
        deleteAvoidAreaButtonVisible: false,
        routingAlgorithm: 'classic',
        disableOptimizeRoute: true
    }
});
