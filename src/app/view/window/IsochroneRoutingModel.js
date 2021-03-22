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
 * @class Koala.view.window.IsochroneRoutingModel
 */
Ext.define('Koala.view.window.IsochroneRoutingModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-window-isochrone-routing',

    requires: [
        'Koala.store.WayPoints',
        'Koala.store.GeocodingSuggestions',
        'Koala.store.Isochrones'
    ],

    stores: {
        waypoints: {
            type: 'k-waypoints'
        },
        geocodingsuggestions: {
            type: 'k-geocodingsuggestions'
        },
        isochrones: {
            type: 'k-isochrones'
        }
    },

    data: {
        i18n: {
            isochroneRoutingTitle: '',
            addressLabel: '',
            addressPlaceholder: '',
            errorIsochrones: '',
            errorGeoCoding: '',
            timeTooltip: '',
            distanceTooltip: '',
            submitButtonText: '',
            rangeFieldText: '',
            intervalFieldText: '',
            placeHolderKilometer: '',
            placeHolderMinutes: '',
            valueColumn: '',
            reachfactorColumn: '',
            areaColumn: '',
            intervalTooBigErrorText: '',
            intervalTooSmallErrorText: ''
        },
        // we set the style on each feature,
        // so this should stay undefined
        isochroneStyle: undefined,
        language: 'de',
        routingProfile: 'driving-car',
        range: undefined,
        interval: undefined,
        locationType: 'start',
        rangeType: 'time',
        smoothing: 0,
        areaUnits: 'm',
        units: 'm',
        showRoutingResults: false,
        // TODO: consider moving property to avoid area button
        deleteAvoidAreaButtonVisible: false,
        // hexcode value for 30% opacity is 4D
        isochroneAlpha: '4D',
        greenToRed: [
            '#1a9641',
            '#37a449',
            '#55b252',
            '#72c15b',
            '#90cf63',
            '#abdb6e',
            '#bee381',
            '#d0eb93',
            '#e3f3a5',
            '#f6fbb7',
            '#fff7b6',
            '#ffe6a2',
            '#fed58e',
            '#fec47a',
            '#feb266',
            '#f79756',
            '#ef7747',
            '#e75839',
            '#df382a',
            '#d7191c'
        ],
        minRangeMinutes: 1,
        minRangeKilometers: 0.1,
        maxNumberIntervals: 10,
        disableSubmitButton: true
    },
    formulas: {
        /**
         * Return interval in units required
         * by the isochrone API.
         */
        intervalInRequiredUnits: function(get) {
            if (get('rangeType') === 'distance') {
                // convert kilometer to meter
                return get('interval') * 1000;
            } else if (get('rangeType') === 'time') {
                // convert minutes to seconds
                return get('interval') * 60;
            }
        },
        /**
         * Return range in units required
         * by the isochrone API.
         */
        rangeInRequiredUnits: function(get) {
            if (get('rangeType') === 'distance') {
                // convert kilometer to meter
                return [get('range') * 1000];
            } else if (get('rangeType') === 'time') {
                // convert minutes to seconds
                return [get('range') * 60];
            }
        }
    }
});
