
class ChunkRequester {
  constructor(fetchFn, callback, parallelRequests = 5) {
    this.parallelRequests = parallelRequests;
    this.freeReqWorkers = parallelRequests;
    this.jobs = [];
    this.callback = callback;
    this.fetchFn = fetchFn;
    this.onFinish = () => {};
  }

  addJobs(jobs) {
    this.jobs.push(...jobs);
    if (!this.jobs.length) {
      this.onFinish();
      return;
    }
    for (let i = 0; i < this.parallelRequests; i += 1) {
      this.process();
    }
  }

  cancelFetching() {
    this.jobs = [];
  }

  setOnFinishFn(func) {
    this.onFinish = func;
  }

  process() {
    if (this.freeReqWorkers === this.parallelRequests && !this.jobs.length) {
      this.onFinish();
    }
    if (!this.jobs.length) return;
    this.freeReqWorkers -= 1;
    this.job = this.jobs.shift();
    this.fetchFn([this.job])
      .then(([jobExpanded]) => {
        if (this.callback) {
          this.callback(jobExpanded);
        }
        this.freeReqWorkers += 1;
        this.process();
      });
  }
}

export default ChunkRequester;
