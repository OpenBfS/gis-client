Ext.define('Koala.model.MetadataRecord', {
    extend: 'Ext.data.Model',
    fields: [{
        name:'type',
        mapping: function(dataRec){
            return dataRec['gmd:hierarchyLevel']['gmd:MD_ScopeCode']
            ['@codeListValue'];
        }
    },{
        name:'fileIdentifier',
        mapping: function(dataRec){
            return dataRec['gmd:fileIdentifier']['gco:CharacterString']
            ['#text'];
        }
    },{
        name: 'name',
        mapping: function(dataRec){
             if (dataRec.type == "service") {
                 return dataRec['gmd:identificationInfo']
                 ['srv:SV_ServiceIdentification']['gmd:citation']
                 ['gmd:CI_Citation']['gmd:title']['gco:CharacterString']
                 ['#text'];
             } else {
                 return dataRec['gmd:identificationInfo']
                 ['gmd:MD_DataIdentification']['gmd:citation']
                 ['gmd:CI_Citation']['gmd:title']['gco:CharacterString']
                 ['#text'];
             }
    }},{
        name: 'abstract',
        mapping: function(dataRec){
            if (dataRec.type == "service") {
                return dataRec['gmd:identificationInfo']
                ['srv:SV_ServiceIdentification']['gmd:abstract']
                ['gco:CharacterString']['#text'];
            } else {
                return dataRec['gmd:identificationInfo']
                ['gmd:MD_DataIdentification']['gmd:abstract']
                ['gco:CharacterString']['#text'];
                
            }
            
        }
    }, {
        name: 'serviceType',
        mapping: function(dataRec){
            if (dataRec.type == "service") {
                return dataRec['gmd:identificationInfo']
                ['srv:SV_ServiceIdentification']['srv:serviceTypeVersion']
                ['gco:CharacterString']['#text'];
            } else {
                return null;
            }
        }
    }, {
        name: 'source',
        mapping: function(dataRec){
            if (dataRec.type == "service") {
                return dataRec['gmd:identificationInfo']
                ['srv:SV_ServiceIdentification']['srv:containsOperations']
                ['srv:SV_OperationMetadata']['srv:connectPoint']
                ['gmd:CI_OnlineResource']['gmd:linkage']['gmd:URL'].split('?')[0];
            } else {
                return null;
            }
        }
    }, {
        name: 'contact',
        mapping: function(dataRec){
            if (dataRec.type == "service") {
                return dataRec['gmd:identificationInfo']
                ['srv:SV_ServiceIdentification']['gmd:pointOfContact']
                ['gmd:CI_ResponsibleParty']['gmd:organisationName']
                ['gco:CharacterString']['#text'];
            } else {
                return dataRec['gmd:identificationInfo']
                ['gmd:MD_DataIdentification']['gmd:pointOfContact']
                ['gmd:CI_ResponsibleParty']['gmd:organisationName']
                ['gco:CharacterString']['#text'];
            }
        }
    }]
});