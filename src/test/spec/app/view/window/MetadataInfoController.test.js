Ext.Loader.syncRequire([
    'Koala.view.window.MetadataInfoController'
]);

describe('Koala.view.window.MetadataInfoController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.MetadataInfoController).to.not.be(undefined);
        });
    });
});
