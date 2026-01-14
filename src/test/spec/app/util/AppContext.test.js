Ext.Loader.syncRequire(['Koala.util.AppContext']);

describe('Koala.util.AppContext', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.AppContext).to.not.be(undefined);
        });
    });

    describe('Static functions', function() {
        var mapComponent;
        var testObjs;
        var realAppContext;
        beforeEach(function(done) {
            testObjs = TestUtil.setupTestObjects({
                mapComponentOpts: {
                    appContextPath: 'http://localhost:9876/base/resources/appContextTest.json'
                }
            });
            mapComponent = testObjs.mapComponent;
            Ext.Ajax.request({
                url: 'http://localhost:9876/base/resources/appContextTest.json',
                success: function(response) {
                    realAppContext = Ext.decode(response.responseText);
                    done();
                }
            });
        });
        afterEach(function() {
            TestUtil.teardownTestObjects(testObjs);
            realAppContext = null;
        });

        describe('#getAppContext', function() {
            it('is defined', function() {
                expect(Koala.util.AppContext.getAppContext).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.AppContext.getAppContext).to.be.a(Function);
            });
            it('returns the correct AppContext for undefined', function() {
                var contextFromUtil = Koala.util.AppContext.getAppContext();
                expect(contextFromUtil).to.eql(realAppContext);
            });
            it('returns the correct AppContext for mapComponent', function() {
                var contextFromUtil = Koala.util.AppContext.getAppContext(
                    mapComponent);
                expect(contextFromUtil).to.eql(realAppContext);
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
            it('returns a function', function() {
                expect(Koala.util.AppContext.generateCheckToolVisibility('printBtn'))
                    .to.be.a(Function);
            });
            it('the callback throws an error for undefined instances', function() {
                var logSpy = sinon.spy(Ext.log, 'error');
                var cb = Koala.util.AppContext.generateCheckToolVisibility('printBtn');
                var got = cb();
                expect(got).to.be(undefined);
                expect(logSpy.calledOnce).to.be(true);
            });
        });

        describe('#hasTool', function() {
            it('is defined', function() {
                expect(Koala.util.AppContext.hasTool).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.AppContext.hasTool).to.be.a(Function);
            });
            it('it returns true if a tool is included', function() {
                var hasTool = Koala.util.AppContext.hasTool('printBtn', realAppContext);
                expect(hasTool).to.be.ok();
            });
            it('it returns false if a tool is not included', function() {
                var hasTool = Koala.util.AppContext.hasTool('fake', realAppContext);
                expect(hasTool).to.not.be.ok();
            });
        });

        describe('#intersectsImisRoles', function() {
            it('is defined', function() {
                expect(Koala.util.AppContext.intersectsImisRoles).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.AppContext.intersectsImisRoles).to.be.a(Function);
            });
            it('it returns true if a imisrole is included', function() {
                var hasImisRole = Koala.util.AppContext.intersectsImisRoles(
                    ['ruf'], realAppContext);
                expect(hasImisRole).to.be.ok();
            });
            it('it returns false if a imisrole is not included', function() {
                var hasImisRole = Koala.util.AppContext.intersectsImisRoles(
                    ['fake'], realAppContext);
                expect(hasImisRole).to.not.be.ok();
            });
        });

        describe('#getMergedDataByKey', function() {
            it('is defined', function() {
                expect(Koala.util.AppContext.getMergedDataByKey).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.AppContext.getMergedDataByKey).to.be.a(Function);
            });
            it('returns the value if the given key exists', function() {
                var val = Koala.util.AppContext.getMergedDataByKey('redLineLayerName');
                expect(val).to.be(realAppContext.data.merge.redLineLayerName);
            });
            it('returns undefined if the given key doesnt exist', function() {
                var val = Koala.util.AppContext.getMergedDataByKey('fake');
                expect(val).to.be(undefined);
            });
        });
    });
});
