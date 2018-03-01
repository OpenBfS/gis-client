Ext.Loader.syncRequire([
    'Koala.util.Carto'
]);

describe('Koala.util.Carto', function() {
    describe('Basics', function() {

        it('can convert csv data', function() {
            var csv = '1,2,3,4,5';
            var html = Koala.util.Carto.convertData(csv);
            var div = document.createElement('div');
            div.innerHTML = html;
            expect(div.querySelectorAll('tr').length).to.be(1);
        });

        it('can convert geojson data', function() {
            var geojson = '{"type":"FeatureCollection","totalFeatures":18708422,"features":[{"'+
                'type":"Feature","id":"odl_brutto_1h.fid--7c618f36_15cc9961a95_-579d","geometr'+
                'y":{"type":"Point","coordinates":[4.7203,49.7616]},"geometry_name":"geom","pr'+
                'operties":{"id":"FR1361","locality_name":"CHARLEVILLE-MEZIERES_08_AGG_CP","st'+
                'art":"2016-10-26T01:00:00Z","end_measure":"2016-10-26T02:00:00Z","value":0.06'+
                '80999984741211,"nuclide":"Gamma-ODL-Brutto","duration":"1h","dom":"grossdoser'+
                'ate","network":"EURDEP","network_id":"X","style":"point","source":"EURDEP"}}],'+
                '"crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:EPSG::4326"}}}';
            var html = Koala.util.Carto.convertData(geojson);
            var div = document.createElement('div');
            div.innerHTML = html;
            // header plus one feature row
            expect(div.querySelectorAll('tr').length).to.be(2);
        });

        it('can convert array data', function() {
            var array = '[[1,2,3]]';
            var html = Koala.util.Carto.convertData(array);
            var div = document.createElement('div');
            div.innerHTML = html;
            expect(div.querySelectorAll('tr').length).to.be(1);
        });

    });
});
