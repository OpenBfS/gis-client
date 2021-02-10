Ext.Loader.syncRequire([
    'Koala.view.window.RoutingVehicleController',
    'Koala.view.window.RoutingVehicle'
]);

describe('Koala.view.window.RoutingVehicleController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.RoutingVehicleController).to.not.be(undefined);
        });
    });

    describe('#onSubmit', function() {

        var comp;
        var sandbox = sinon.createSandbox();

        beforeEach(function() {
            TestUtil.setupTestObjects();
            comp = Ext.create('Koala.view.window.RoutingVehicle', {
                vehicle: {
                    start: {
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

        it('reads the description field value', function() {
            var mockDescription = 'foo bar';

            comp.down('[name=description]').setValue(mockDescription);

            var spy = sinon.spy();
            comp.on('updatedVehicle', spy);

            comp.getController().onSubmit();

            var vehicle = spy.args[0][0];

            expect(vehicle.description).to.equal(mockDescription);
        });

        it('reads the start field value', function() {
            var mockStart = {
                address: 'foo',
                longitude: 1,
                latitude: 2
            };

            var field = comp.down('[name=start]');
            var store = field.getStore();
            store.loadRawData([mockStart]);
            field.setSelection(store.first());

            var spy = sinon.spy();
            comp.on('updatedVehicle', spy);

            comp.getController().onSubmit();

            var vehicle = spy.args[0][0];

            expect(vehicle.start.address).to.equal(mockStart.address);
            expect(vehicle.start.longitude).to.equal(mockStart.longitude);
            expect(vehicle.start.latitude).to.equal(mockStart.latitude);
        });

        it('reads the end field value', function() {
            var mockEnd = {
                address: 'foo',
                longitude: 1,
                latitude: 2
            };

            var field = comp.down('[name=end]');
            var store = field.getStore();
            store.loadRawData([mockEnd]);
            field.setSelection(store.first());

            var spy = sinon.spy();
            comp.on('updatedVehicle', spy);

            comp.getController().onSubmit();

            var vehicle = spy.args[0][0];

            expect(vehicle.end.address).to.equal(mockEnd.address);
            expect(vehicle.end.longitude).to.equal(mockEnd.longitude);
            expect(vehicle.end.latitude).to.equal(mockEnd.latitude);
        });

        it('reads the breaks field value', function() {
            var mockBreak = {
                description: 'foo bar',
                service: 2,
                time_windows: [[1, 1]]
            };

            var field = comp.down('[name=breaks]');
            field.fireEvent('overwriteStore', [mockBreak]);

            var spy = sinon.spy();
            comp.on('updatedVehicle', spy);

            comp.getController().onSubmit();

            var vehicle = spy.args[0][0];
            var breaks = vehicle.breaks;

            expect(breaks[0].description).to.equal(mockBreak.description);
            expect(breaks[0].service).to.equal(mockBreak.service);
            expect(breaks[0].time_windows[0][0]).to.equal(mockBreak.time_windows[0][0]);
            expect(breaks[0].time_windows[0][1]).to.equal(mockBreak.time_windows[0][1]);
        });

        it('reads the time_window field value', function() {
            var mockTimeWindow = [1, 100000000];

            var field = comp.down('[name=time_window]');
            field.down('[name=startday]')
                .setValue(new Date(mockTimeWindow[0] * 1000));
            field.down('[name=starttime]')
                .setValue(new Date(mockTimeWindow[0] * 1000));
            field.down('[name=endday]')
                .setValue(new Date(mockTimeWindow[1] * 1000));
            field.down('[name=endtime]')
                .setValue(new Date(mockTimeWindow[1] * 1000));

            var spy = sinon.spy();
            comp.on('updatedVehicle', spy);

            comp.getController().onSubmit();

            var vehicle = spy.args[0][0];
            var timeWindow = vehicle.time_window;

            expect(timeWindow[0]).to.equal(mockTimeWindow[0]);
            expect(timeWindow[1]).to.equal(mockTimeWindow[1]);
        });
    });
});
