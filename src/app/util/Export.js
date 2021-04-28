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
 * @class Koala.util.Export
 */
Ext.define('Koala.util.Export', {

    statics: {

        /**
         * Export a file.
         *
         * @param {Object|String|Number|Boolean} data The data to export.
         * @param {String} filename The name of the file including file extension.
         * @param {String} type The content-type of the file.
         */
        exportFile: function(data, filename, type) {
            var blob;
            if (type) {
                blob = new Blob([data], {
                    type: type
                });
            } else {
                blob = new Blob([data]);
            }
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        }
    }

});
