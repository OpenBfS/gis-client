/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
 * @class Koala.model.MetadataRecord
 */
Ext.define('Koala.model.MetadataRecord', {
    requires: [
        'Koala.util.Object'
    ],
    extend: 'Ext.data.Model',
    fields: [{
        name: 'type',
        mapping: function(data){
            var path = [
                'gmd:hierarchyLevel',
                'gmd:MD_ScopeCode',
                '@codeListValue'
            ];
            var val = Koala.util.Object.getPathOr(data, path, 'bfs');
            return val;
        }
    }, {
        name: 'fileIdentifier',
        mapping: function(data){
            var path = [
                'gmd:fileIdentifier',
                'gco:CharacterString',
                '#text'
            ];
            var val = Koala.util.Object.getPathOr(data, path);
            return val;
        }
    }, {
        name: 'name',
        mapping: function(dataRec){
            var val;
            var path = [
                'gmd:identificationInfo'
            ];
            if (dataRec.type === "service") {
                path.push('srv:SV_ServiceIdentification');
            } else {
                path.push('gmd:MD_DataIdentification');
            }
            path.push('gmd:citation');
            path.push('gmd:CI_Citation');
            path.push('gmd:title');
            path.push('gco:CharacterString');
            path.push('#text');

            val = Koala.util.Object.getPathOr(
                dataRec,
                path
            );
            return val;
        }
    }, {
        name: 'abstract',
        mapping: function(dataRec){
            var val;
            if (dataRec.type === "service") {
                val = Koala.util.Object.getPathStrOr(
                    dataRec,
                    'gmd:identificationInfo/srv:SV_ServiceIdentification/gmd:abstract/gco:CharacterString/#text'
                );
            } else {
                val = Koala.util.Object.getPathStrOr(
                    dataRec,
                    'gmd:identificationInfo/gmd:MD_DataIdentification/gmd:abstract/gco:CharacterString/#text'
                );
            }
            return val;
        }
    }, {
        name: 'serviceType',
        mapping: function(dataRec){
            var val;
            if (dataRec.type === "service") {
                val = Koala.util.Object.getPathStrOr(
                    dataRec,
                    'gmd:identificationInfo/srv:SV_ServiceIdentification/srv:serviceTypeVersion/gco:CharacterString/#text'
                );
            } else {
                val = null;
            }
            return val;
        }
    }, {
        name: 'source',
        mapping: function(dataRec){
            var val;
            if (dataRec.type === "service") {
                var tmp = Koala.util.Object.getPathStrOr(
                    dataRec,
                    'gmd:identificationInfo/srv:SV_ServiceIdentification/srv:containsOperations/srv:SV_OperationMetadata/srv:connectPoint/gmd:CI_OnlineResource/gmd:linkage/gmd:URL'
                );
                val = tmp.split('?')[0];
            } else {
                val = null;
            }
            return val;
        }
    }, {
        name: 'contact',
        mapping: function(dataRec){
            var val;
            if (dataRec.type === "service") {
                val = Koala.util.Object.getPathStrOr(
                    dataRec,
                    'gmd:identificationInfo/srv:SV_ServiceIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:organisationName/gco:CharacterString/#text'
                );
            } else {
                val = Koala.util.Object.getPathStrOr(
                    dataRec,
                    'gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:organisationName/gco:CharacterString/#text'
                );
            }
            return val;
        }
    }]
});
