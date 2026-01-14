Ext.Loader.syncRequire(['Koala.util.Authentication']);

describe('Koala.util.Authentication', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Authentication).to.not.be(undefined);
        });
    });
    describe('Static functions', function() {

        describe('#getAuthenticationHeader', function() {
            var fakeContext = {
                data: {
                    merge: {
                        'application_user': {
                            'username': 'Ümit',
                            'password': 'Vielfraß'
                        }
                    }
                }
            };
            var hash = 'w5xtaXQ6VmllbGZyYcOf';

            it('returns the correct header from a context', function() {
                var result = Koala.util.Authentication.getAuthenticationHeader(
                    fakeContext);
                expect(result).to.be('Basic ' + hash);
            });
        });

    });
});
