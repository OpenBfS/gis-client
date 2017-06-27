Ext.Loader.syncRequire([
    'Koala.plugin.Hover',
    'BasiGX.view.component.Map'
]);

describe('Koala.plugin.Hover', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.plugin.Hover).to.not.be(undefined);
        });

        it('can be created', function() {
            var plugin = Ext.create('Koala.plugin.Hover');
            expect(plugin).to.not.be(undefined);
        });
    });

    describe('#onPointerRest', function() {
        it('does not fail', function() {
            var plugin = Ext.create('Koala.plugin.Hover');
            var objs = TestUtil.setupTestObjects();
            plugin.setCmp(objs.mapComponent);
            plugin.init(objs.mapComponent);
            expect(plugin.onPointerRest.bind(plugin)).withArgs({
                pixel: [100, 100],
                originalEvent: {
                    target: {
                        className: 'ol-selectable'
                    }
                }
            }).to.not.throwException();
            TestUtil.teardownTestObjects(objs);
        });

        it('does not fail with proper target', function() {
            var plugin = Ext.create('Koala.plugin.Hover');
            var objs = TestUtil.setupTestObjects();
            plugin.setCmp(objs.mapComponent);
            plugin.init(objs.mapComponent);
            expect(plugin.onPointerRest.bind(plugin)).withArgs({
                pixel: [100, 100],
                originalEvent: {
                    target: {
                        className: 'ol-unselectable'
                    }
                }
            }).to.not.throwException();
            TestUtil.teardownTestObjects(objs);
        });

        it('iterates over layers at pixel', function() {
            var plugin = Ext.create('Koala.plugin.Hover');
            var objs = TestUtil.setupTestObjects();
            plugin.setCmp(objs.mapComponent);
            plugin.init(objs.mapComponent);
            objs.map.forEachLayerAtPixel = function(pixel, func) {
                var layer = TestUtil.getMockedGetter({});
                layer.getSource = sinon.stub();
                func(layer, {});
            };
            sinon.spy(objs.map, 'forEachLayerAtPixel');
            expect(plugin.onPointerRest.bind(plugin)).withArgs({
                pixel: [100, 100],
                originalEvent: {
                    target: {
                        className: 'ol-unselectable'
                    }
                }
            }).to.not.throwException();
            expect(objs.map.forEachLayerAtPixel.calledOnce).to.be(true);
            TestUtil.teardownTestObjects(objs);
        });
    });
});
