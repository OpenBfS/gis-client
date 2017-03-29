Ext.Loader.syncRequire(['Koala.util.AppContext']);

describe('Koala.util.AppContext', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.AppContext).to.not.be(undefined);
        });
    });

    describe('Static functions', function() {

        describe('#getAppContext', function() {
            // var mapComponent;
            it('is defined', function() {
                expect(Koala.util.AppContext.getAppContext).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.AppContext.getAppContext).to.be.a(Function);
            });
        });

        describe('#generateCheckToolVisibility', function() {
            it('is defined', function() {
                expect(Koala.util.AppContext.generateCheckToolVisibility)
                    .to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.AppContext.generateCheckToolVisibility)
                    .to.be.a(Function);
            });
        });

        describe('#hasTool', function() {
            it('is defined', function() {
                expect(Koala.util.AppContext.hasTool).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.AppContext.hasTool).to.be.a(Function);
            });
        });

        describe('#getMergedDataByKey', function() {
            it('is defined', function() {
                expect(Koala.util.AppContext.getMergedDataByKey).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.AppContext.getMergedDataByKey).to.be.a(Function);
            });
        });
    });
});
