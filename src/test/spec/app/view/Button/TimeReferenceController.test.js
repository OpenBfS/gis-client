Ext.Loader.syncRequire([
    'Koala.view.button.TimeReferenceController'
]);

describe('Koala.view.button.TimeReferenceController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.button.TimeReferenceController).to.not.be(undefined);
        });
    });
});
