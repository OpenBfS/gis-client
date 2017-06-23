Ext.Loader.syncRequire([
    'Koala.view.panel.ThemeTreeController'
]);

describe('Koala.view.panel.ThemeTreeController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.panel.ThemeTreeController).to.not.be(undefined);
        });

        it('can toggle layer set view', function() {
            var view = TestUtil.getMockedElement();
            view.up.returns(view);
            view.down.returns(view);
            var ctrl = new Koala.view.panel.ThemeTreeController();
            ctrl.setView(view);
            ctrl.toggleLayerSetView();
            expect(view.hide.called).to.not.be(true);
        });

        it('can toggle layer set view', function() {
            var view = TestUtil.getMockedElement();
            view.up.returns(view);
            view.down.returns(view);
            view.isVisible.returns(true);
            var ctrl = new Koala.view.panel.ThemeTreeController();
            ctrl.setView(view);
            ctrl.toggleLayerSetView();
            expect(view.hide.called).to.be(true);
        });
    });
});
