Ext.Loader.syncRequire([
    'Koala.view.component.CartoWindowController',
    'Koala.view.component.CartoWindowModel',
    'Koala.view.component.CartoWindow'
]);

describe('Koala.view.component.CartoWindowController', function() {

    describe('Basics', function() {
        beforeEach(function() {
            sinon.stub(Ext.ComponentQuery, 'query');
        });

        afterEach(function() {
            Ext.ComponentQuery.query.restore();
        });

        it('is defined', function() {
            expect(Koala.view.component.CartoWindowController).to.not.be(undefined);
        });

        it('can be created', function() {
            var controller = new Koala.view.component.CartoWindowController();
            expect(controller).to.not.be(undefined);
        });

        it('can be initialized', function() {
            var controller = new Koala.view.component.CartoWindowController();
            sinon.stub(controller, 'createOverlay');
            sinon.stub(controller, 'getOrCreateLineLayer');
            sinon.stub(controller, 'createLineFeature');

            var mockedView = {el: TestUtil.getMockedElement()};
            var close = TestUtil.getMockedElement();
            mockedView.el.down.returns(close);
            var feat = TestUtil.getMockedGetter({});
            var geom = {};
            geom.getCoordinates = sinon.stub().returns([]);
            feat.getGeometry = sinon.stub().returns(geom);
            var layer = TestUtil.getMockedGetter('');
            mockedView.layer = layer;
            mockedView.getMap = sinon.stub();
            mockedView.getFeature = sinon.stub().returns(feat);
            mockedView.getLayer = sinon.stub().returns(layer);
            mockedView.addCls = sinon.stub();
            mockedView.getCartoWindowId = sinon.stub();
            mockedView.lookupViewModel = sinon.stub().returns(TestUtil.getMockedGetter({}));
            var mockedHover = {};
            mockedHover.cleanupHoverArtifacts = sinon.stub();
            var mockedMapComp = {};
            mockedMapComp.getPlugin = sinon.stub().returns(mockedHover);
            Ext.ComponentQuery.query.returns([mockedMapComp]);
            controller.setView(mockedView);
            controller.onInitialize();
            expect(controller.onInitialize.bind(controller)).to.not.throwException();
            controller.createOverlay.restore();
            controller.getOrCreateLineLayer.restore();
            controller.createLineFeature.restore();
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
