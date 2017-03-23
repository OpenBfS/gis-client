Ext.Loader.syncRequire(['Koala.util.Style']);

describe('Koala.util.Style', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Style).to.not.be(undefined);
        });
    });

    describe('Static functions', function() {
        describe('#isLogicalFilter', function() {
            it('is defined', function() {
                expect(Koala.util.Style.isLogicalFilter).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.isLogicalFilter).to.be.a(Function);
            });
        });

        describe('#isSpatialFilter', function() {
            it('is defined', function() {
                expect(Koala.util.Style.isSpatialFilter).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.isSpatialFilter).to.be.a(Function);
            });
        });

        describe('#isComparisonFilter', function() {
            it('is defined', function() {
                expect(Koala.util.Style.isComparisonFilter).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.isComparisonFilter).to.be.a(Function);
            });
        });

        describe('#symbolTypeFromVectorLayer', function() {
            it('is defined', function() {
                expect(Koala.util.Style.symbolTypeFromVectorLayer).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.symbolTypeFromVectorLayer).to.be.a(Function);
            });
        });

        describe('#getAttributekeysFromVectorLayer', function() {
            it('is defined', function() {
                expect(Koala.util.Style.getAttributekeysFromVectorLayer).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.getAttributekeysFromVectorLayer).to.be.a(Function);
            });
        });

        describe('#applyKoalaStyleToLayer', function() {
            it('is defined', function() {
                expect(Koala.util.Style.applyKoalaStyleToLayer).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.applyKoalaStyleToLayer).to.be.a(Function);
            });
        });

        describe('#getTextStylePlaceholder', function() {
            it('is defined', function() {
                expect(Koala.util.Style.getTextStylePlaceholder).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.getTextStylePlaceholder).to.be.a(Function);
            });
        });

        describe('#resolveTextStylePlaceholder', function() {
            it('is defined', function() {
                expect(Koala.util.Style.resolveTextStylePlaceholder).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.resolveTextStylePlaceholder).to.be.a(Function);
            });
        });

        describe('#evaluateScaleDenom', function() {
            it('is defined', function() {
                expect(Koala.util.Style.evaluateScaleDenom).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.evaluateScaleDenom).to.be.a(Function);
            });
        });

        describe('#evaluateFilter', function() {
            it('is defined', function() {
                expect(Koala.util.Style.evaluateFilter).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.evaluateFilter).to.be.a(Function);
            });
        });
    });
});
