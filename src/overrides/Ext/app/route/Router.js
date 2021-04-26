/* Copyright (c) 2021-present terrestris GmbH & Co. KG
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
 * Override for private class Router. This overrides
 * the multipleToken value from '|' to '%7C' in order
 * to allow url encoding of the url hash.
 *
 * @class Koala.override.Ext.app.route.Router
 */
Ext.define('Koala.override.Ext.app.route.Router', {
    override: 'Ext.app.route.Router',

    requires: ['Ext.app.route.Router'],

    multipleToken: '%7C'

});
