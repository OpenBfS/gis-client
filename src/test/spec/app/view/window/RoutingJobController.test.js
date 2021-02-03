Ext.Loader.syncRequire([
    'Koala.view.window.RoutingJobController',
    'Koala.view.window.RoutingJob'
]);

describe('Koala.view.window.RoutingJobController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.RoutingJobController).to.not.be(undefined);
        });
    });

    describe('#onSubmit', function() {

        var comp;
        var sandbox = sinon.createSandbox();

        beforeEach(function() {
            TestUtil.setupTestObjects();
            comp = Ext.create('Koala.view.window.RoutingJob', {
                job: {
                    address: {
                        address: 'foo',
                        longitude: 1,
                        latitude: 2
                    }
                }
            });
        });

        afterEach(function() {
            TestUtil.teardownTestObjects();
            sandbox.restore();
        });

        it('reads the time_windows field value', function() {
            var mockWindows = [[1, 1]];
            comp.down('[name=time_windows]').getStore()
                .setAllFromTimestamp(mockWindows);

            var spy = sinon.spy();
            comp.on('updatedJob', spy);

            comp.getController().onSubmit();

            var job = spy.args[0][0];

            expect(job.time_windows).to.have.length(1);
            expect(job.time_windows[0][0]).to.equal(mockWindows[0][0]);
            expect(job.time_windows[0][1]).to.equal(mockWindows[0][1]);
        });

        it('reads the address field value', function() {
            var mockAddress = {
                address: 'foo',
                longitude: 1,
                latitude: 2
            };

            var field = comp.down('[name=address]');
            var store = field.getStore();
            store.loadRawData([mockAddress]);
            field.setSelection(store.first());

            var spy = sinon.spy();
            comp.on('updatedJob', spy);

            comp.getController().onSubmit();

            var job = spy.args[0][0];

            expect(job.address.address).to.equal(mockAddress.address);
            expect(job.address.longitude).to.equal(mockAddress.longitude);
            expect(job.address.latitude).to.equal(mockAddress.latitude);
        });

        it('reads the description field value', function() {
            var mockDescription = 'foo bar';

            comp.down('[name=description]').setValue(mockDescription);

            var spy = sinon.spy();
            comp.on('updatedJob', spy);

            comp.getController().onSubmit();

            var job = spy.args[0][0];

            expect(job.description).to.equal(mockDescription);
        });

        it('reads the priority field value', function() {
            var mockPriority = 2;

            comp.down('[name=priority]').setValue(mockPriority);

            var spy = sinon.spy();
            comp.on('updatedJob', spy);

            comp.getController().onSubmit();

            var job = spy.args[0][0];

            expect(job.priority).to.equal(mockPriority);
        });

        it('reads the service field value', function() {
            var mockService = 30 * 60;

            comp.down('[name=service]').setValue(mockService);

            var spy = sinon.spy();
            comp.on('updatedJob', spy);

            comp.getController().onSubmit();

            var job = spy.args[0][0];

            expect(job.service).to.equal(mockService);
        });
    });
});
