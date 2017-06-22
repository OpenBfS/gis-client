Ext.Loader.syncRequire([
    'Koala.view.component.CartoWindowController'
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
    });

});
