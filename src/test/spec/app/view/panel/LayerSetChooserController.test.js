Ext.Loader.syncRequire([
    'Koala.view.panel.LayerSetChooserController'
]);

describe('Koala.view.panel.LayerSetChooserController', function() {
    describe('Basics', function() {
        beforeEach(function() {
            sinon.stub(Ext.ComponentQuery, 'query');
            var tree = {};
            var store = {};
            store.each = sinon.stub();
            store.clearFilter = sinon.stub();
            tree.getStore = sinon.stub().returns(store);
            tree.down = sinon.stub().returns(TestUtil.getMockedElement());
            Ext.ComponentQuery.query.returns([tree]);
        });

        afterEach(function() {
            Ext.ComponentQuery.query.restore();
        });

        it('is defined', function() {
            expect(Koala.view.panel.LayerSetChooserController).to.not.be(undefined);
        });

        it('can be created', function() {
            var ctrl = new Koala.view.panel.LayerSetChooserController();
            expect(ctrl).to.not.be(undefined);
        });

        it('can handle layer set selection change', function() {
            var ctrl = new Koala.view.panel.LayerSetChooserController();
            expect(ctrl.handleLayerSetSelectionchange.bind(ctrl)).to.not.throwException();
        });
    });
});
