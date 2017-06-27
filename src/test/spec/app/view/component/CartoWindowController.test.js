Ext.Loader.syncRequire([
    'Koala.view.component.CartoWindowController',
    'Koala.view.component.CartoWindowModel',
    'Koala.view.component.CartoWindow',
    'Koala.plugin.Hover'
]);

describe('Koala.view.component.CartoWindowController', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.component.CartoWindowController).to.not.be(undefined);
        });

        it('can be created', function() {
            var controller = new Koala.view.component.CartoWindowController();
            expect(controller).to.not.be(undefined);
        });

        it('can be initialized', function() {
            // Setup
            var testObjs = TestUtil.setupTestObjects({
                mapComponentOpts: {
                    appContextPath: 'http://localhost:9876/base/resources/appContext.json',
                    plugins: [{
                        ptype: 'hoverBfS',
                        selectMulti: true,
                        selectEventOrigin: 'interaction'
                    }]
                }
            });
            sinon.stub(Ext.ComponentQuery, 'query');
            Ext.ComponentQuery.query.withArgs('k-component-map').returns([testObjs.mapComponent]);
            sinon.stub(BasiGX.util.Map, 'getMapComponent');
            BasiGX.util.Map.getMapComponent.returns(testObjs.mapComponent);
            var map = testObjs.mapComponent.getMap();
            var layer = map.getLayers().item(0);
            var view = Ext.create('Koala.view.component.CartoWindow', {
                map: map,
                cartoWindowId: 'Peter',
                layer: layer,
                feature: new ol.Feature({
                    geometry: new ol.geom.Point([1, 1])
                }),
                renderTo: Ext.getBody()
            });

            expect(view.getController().onInitialize.bind(view.getController())).to.not.throwException();

            //Teardown
            Ext.ComponentQuery.query.restore();
            BasiGX.util.Map.getMapComponent.restore();
            TestUtil.teardownTestObjects(testObjs);
        });

        it('can convert csv data', function() {
            var controller = new Koala.view.component.CartoWindowController();
            var csv = '1,2,3,4,5';
            var html = controller.convertData(csv);
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
            var controller = new Koala.view.component.CartoWindowController();
            var html = controller.convertData(geojson);
            var div = document.createElement('div');
            div.innerHTML = html;
            // header plus one feature row
            expect(div.querySelectorAll('tr').length).to.be(2);
        });

        it('can convert array data', function() {
            var array = '[[1,2,3]]';
            var controller = new Koala.view.component.CartoWindowController();
            var html = controller.convertData(array);
            var div = document.createElement('div');
            div.innerHTML = html;
            expect(div.querySelectorAll('tr').length).to.be(1);
        });
    });

});
