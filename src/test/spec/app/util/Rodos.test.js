Ext.Loader.syncRequire(['Koala.util.Rodos']);

describe('Koala.util.Rodos', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Rodos).to.not.be(undefined);
        });
    });
    describe('#requestLayersOfProject', function() {
        it('is defined', function() {
            expect(Koala.util.Rodos.requestLayersOfProject).to.not.be(undefined);
        });
        it('requests the Layers of a rodos project and calls "setRodosLayers"', function(done) {
            //Setup
            var testObjs = TestUtil.setupTestObjects({
                mapComponentOpts: {
                    appContextPath: '/base/resources/appContext.json'
                }
            });
            var appContext = Koala.util.AppContext.getAppContext();
            appContext.data.merge.urls['rodos-results'] = '/base/resources/' +
                'rodos/projects/';
            var projectUid = '7e00266f-0aa9-1547-6def-063282b90958local';

            Koala.util.Rodos.requestLayersOfProject(projectUid);
            var setLayersSpy = sinon.stub(Koala.util.Rodos, 'setRodosLayers');

            setTimeout(function() {
                expect(setLayersSpy.calledOnce).to.be(true);
                done();
            }, 100);

            // Teardown
            TestUtil.teardownTestObjects(testObjs);
        });

    });
    describe('#setRodosLayers', function() {
        it('is defined', function() {
            expect(Koala.util.Rodos.setRodosLayers).to.not.be(undefined);
        });
    });
});
