var ProjectTile = require('./projectTile');
function tileWorker(e) {
    var self = this;
    var job = e.data;
    var data = ProjectTile(job);
    // @ts-ignore
    self.postMessage(data);
    self.close();
}
module.exports = function (self) {
    self.onmessage = tileWorker;
    self.onerror = function (e) {
        console.log('error', e);
    };
};
//# sourceMappingURL=tileWorker.js.map