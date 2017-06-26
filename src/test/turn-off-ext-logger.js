// This file will bind two global hooks to disable Ext.Logger and Ext.log
// before any test in any file.
beforeEach(TestUtil.extLogger.off);
afterEach(TestUtil.extLogger.on);
