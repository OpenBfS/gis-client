var requiredClasses = [
    'Koala.view.component.CartoWindowController',
    'Koala.view.component.CartoWindowModel',
    'Koala.view.component.CartoWindow'
];
if (!Ext.isModern) {
    requiredClasses.push('Koala.plugin.Hover');
}
Ext.Loader.syncRequire(requiredClasses);

describe('Koala.view.component.CartoWindowController', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.component.CartoWindowController).to.not.be(undefined);
        });

        it('can be created', function() {
            var controller = new Koala.view.component.CartoWindowController();
            expect(controller).to.not.be(undefined);
        });
    });

});
