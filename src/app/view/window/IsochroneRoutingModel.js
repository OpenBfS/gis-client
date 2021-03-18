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
            populationColumn: '',
            intervalTooBigErrorText: '',
            intervalTooSmallErrorText: ''
        },
        // we set the style on each feature,
        // so this should stay undefined
        isochroneStyle: undefined,
        language: 'de',
        // TODO use this prop in UI
        routingProfile: 'driving-car',
        // TODO use this prop in UI
        //      temporary set to 10 minutes (600 seconds)
        range: [600],
        // TODO use this prop in UI
        //      a maximum of 10 intervals is allowed, but interval is in unit
        //      so we have to check this properly.
        //      e.g. range=200(metres) => interval must be greater than equal 2
        interval: undefined,
        // TODO use this prop in UI
        locationType: 'start',
        // TODO use this prop in UI
        rangeType: 'time',
        // TODO use this prop in UI
        smoothing: 0,
        // TODO use this prop in UI
        areaUnits: 'm',
        // TODO use this prop in UI
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
        maxIntervalMinutes: 60,
        maxIntervalKilometers: 1000,
        maxNumberIntervals: 10
    }
});
