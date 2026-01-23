Ext.Loader.syncRequire(['Koala.util.Hooks']);

describe('Koala.util.Hooks', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Hooks).to.not.be(undefined);
        });
    });
    // describe('#executeBeforeAddHook', function() {
    //     it('is defined', function() {
    //         expect(Koala.util.Hooks.executeBeforeAddHook).to.not.be(undefined);
    //     });
    //     it('calls all specified Hook functions', function() {
    //         // Setup
    //         var testObjs = TestUtil.setupTestObjects({
    //             mapComponentOpts: {
    //                 appContextPath: 'http://localhost:9876/base/resources/appContextTest.json'
    //             }
    //         });
    //         var fakeForm = 'im the form argument';
    //         var fakeField = 'im the filed argument';
    //         var docCreatorRec = Ext.create('GeoExt.data.model.print.LayoutAttribute', {
    //             name: 'doc_creator',
    //             type: 'string',
    //             clientInfo: 5
    //         });
    //         var docName = docCreatorRec.get('name');
    //         var legendTemplateRec = Ext.create('GeoExt.data.model.print.LayoutAttribute', {
    //             name: 'legend_template',
    //             type: 'string',
    //             clientInfo: 5
    //         });
    //         var legendName = legendTemplateRec.get('name');

    //         if (Koala.util.Hooks.beforeAdd[docName]) {
    //             var docStub = sinon.stub(Koala.util.Hooks.beforeAdd, docName);
    //             Koala.util.Hooks.executeBeforeAddHook(fakeForm, fakeField, docCreatorRec);
    //             expect(docStub.calledOnce).to.be(true);
    //             docStub.restore();
    //         }

    //         if (Koala.util.Hooks.beforeAdd[legendName]) {
    //             var legendStub = sinon.stub(Koala.util.Hooks.beforeAdd, legendName);
    //             Koala.util.Hooks.executeBeforeAddHook(fakeForm, fakeField, legendTemplateRec);
    //             expect(legendStub.calledOnce).to.be(true);
    //             legendStub.restore();
    //         }

    //         // Teardown
    //         TestUtil.teardownTestObjects(testObjs);
    //     });
    // });
    // describe('#executeBeforePostHook', function() {
    //     it('is defined', function() {
    //         expect(Koala.util.Hooks.executeBeforePostHook).to.not.be(undefined);
    //     });
    //     it('calls all specified Hook functions', function() {
    //         // Setup
    //         var testObjs = TestUtil.setupTestObjects({
    //             mapComponentOpts: {
    //                 appContextPath: 'http://localhost:9876/base/resources/appContextTest.json'
    //             }
    //         });
    //         var attributeName = 'doc_creator';
    //         var attributeValue = 'Peter';
    //         var postAttributes = {};

    //         if (Koala.util.Hooks.beforePost[attributeName]) {
    //             var docStub = sinon.stub(Koala.util.Hooks.beforePost, attributeName);
    //             Koala.util.Hooks.executeBeforePostHook(attributeName, attributeValue, postAttributes);
    //             expect(docStub.calledOnce).to.be(true);
    //             docStub.restore();
    //         }

    //         // Teardown
    //         TestUtil.teardownTestObjects(testObjs);
    //     });
    // });
});
