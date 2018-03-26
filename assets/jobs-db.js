
import PouchDB from 'pouchdb-browser';
import utils from 'assets/utils';
let db = new PouchDB('my_database');
const STATUS = {
  'successful': 'SUCCESSFUL',
  'failed': 'FAILED',
  'ready': 'READY',
};

function addJob(job) {
  checkJob(job);
  let jobToPush = {};
  let options = {};
  if (job.status === STATUS.successful ||
      job.status === STATUS.failed) {
    jobToPush = {
      '_id': job.id,
      'computer': job.computer,
      'details': job,
    };
  } else {
    if (job._rev) { // already exists, update
      jobToPush = job;
      options = {'force': true};
    } else {return;}
  }

  return db.put(jobToPush, options)
  .then(() => {
    console.debug('Job saved in DB');
  })
  .catch((err) => {
    if (err) {
      if (err.message === 'Document update conflict') {
        return update(job);
      }
      throw Error('saving in the DB');
    }
  });

  function checkJob(job) {
    // will (if it is the case) parse full URL to job format
    if ((!job.id || !job.computer) && job._links) {
      let info = utils.urlToId(job._links.self.href);
      job.id = info.id;
      job.computer = info.computer;
    }
  }

  function update(job) {
    console.debug('Updating...');
    // return db.remove(job.id);
    return getJob(job.id, job.computer).then((prev) => {
      prev.details = job;
      return addJob(prev);
    });
  }
}

function getJobByUrl(url) {
  let info = utils.urlToId(url);
  return getJob(info.id, info.computer);
}

function getJob(id, computer) {
  return db.get(id).then((job) => {
    if (job.computer === computer) {
      return job;
    } else {
      let t = 'Job id in different computer';
      console.warn(t);
      throw String(t);
    }
  });
}

export default {
  addJob,
  getJob,
  getJobByUrl,
};
