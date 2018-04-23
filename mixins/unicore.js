
module.exports = (function() {
  'use strict';
  let axios = require('axios');
  let hello = require('assets/hbp.hello.js');
  let analysisConfig = require('assets/analysis-config.json');
  let simulationConfig = require('assets/simulation-config.json');
  let token = null;
  let utils = require('assets/utils.js').default;
  let jobsDB = require('assets/jobs-db.js').default;
  function actionJob(actionURL) {
    // actions like start, restart, abort
    let headers = createHeaders(token);
    return axios({
      'url': actionURL,
      'method': 'post',
      'data': JSON.stringify({}),
      'headers': headers,
    });
  }
  function createHeaders(token, userProject) {
    let headers = {};
    headers['Authorization'] = 'Bearer ' + token;
    headers['Accept'] = 'application/json';
    headers['Content-Type'] = 'application/json';
    if (userProject) {
      headers['X-UNICORE-User-Preferences'] = 'uid:' + userProject;
    }
    return headers;
  }
  function getProjectSelectedByLog(log) {
    /* this will search for the user that submitted the job
     * so we are able to get the files from that user **/
    if (!log || log.length < 3) return;
    let multiple = new RegExp('Xlogin.*active=(.+)].*]');
    let result = test(multiple);
    if (!result) {
      let unique = new RegExp('uid: \\[(.*)\\], gids');
      result = test(unique);
    }
    return result;
    function test(reg) {
      let m = log[2].match(reg);
      if (m && m[1]) {
        return m[1];
      }
      return false;
    }
  }
  function createJob(url, jobDefinition, userProject) {
    let headers = createHeaders(token, userProject);
    return axios({
      'url': url + '/jobs',
      'method': 'post',
      'data': JSON.stringify(jobDefinition),
      'headers': headers,
    });
  }
  function deleteJob(url) {
    return getPermissions(url)
    .then((userProject) => {
      let headers = createHeaders(token, userProject);
      return axios({
        'url': url,
        'method': 'delete',
        'data': JSON.stringify({}),
        'headers': headers,
      });
    });
    function getPermissions(url) {
      let m = url.match(new RegExp('HBP_(.*)/rest'));
      if (m && m[1]) {
        return getUser(m[1])
        .then((user) => {
          return getJobProperties(url, user.client.xlogin.UID);
        })
        .then((jobInfo) => {
          return getProjectSelectedByLog(jobInfo.log);
        });
      } else {
        throw String('Getting permissions for deleting');
      }
    }
  }
  function deleteJobFromAssociatedFile(simulationWorkDir, idToDelete) {
    console.debug('Delete job from associationFile');
    return getAssociatedLocation(simulationWorkDir)
    .then((associationFile) => {
      let newAssociationFile = [];
      let analysisPath = analysisConfig.analysisConnectionPath;
      if (associationFile) {
        associationFile.forEach((oldAnalysis) => {
          let oldId = oldAnalysis._links.self.href.split('/').pop();
          if (oldId !== idToDelete) {
            newAssociationFile.push(oldAnalysis);
          }
        });
      }
      // mapping in simulation the analysis path.
      let input = {
        'To': analysisPath,
        'Data': JSON.stringify(newAssociationFile),
      };
      // upload the analysis_path.json file
      return uploadData(input, simulationWorkDir + '/files');
    });
  }
  function getAllJobs(site) {
    let unicoreURL = getSites()[site.toUpperCase()]['url'];
    let headers = createHeaders(token);
    return axios({
      'url': unicoreURL + '/jobs',
      'method': 'get',
      'headers': headers,
    })
    .then((response) => (response.data))
    .catch((e) => {throw Error('Getting all jobs - ' + e);});
  }
  function getAllJobsExpandedWithChildren(site) {
    // get the information of all jobs asociated with key + the children
    let jobsList = [];
    let chainPromise = [];
    let output = [];
    return getAllJobs(site)
    .then((parsed) => {
      jobsList = parsed.jobs;
      if (jobsList.length <= 0) return;
      jobsList.forEach((job) => {
        let id = getLastJobId(job);
        let jobExapandedInfo = {};
        let chain = getJobProperties(job)
        .then((jobInfo) => {
          jobExapandedInfo = jobInfo;
          if (jobExapandedInfo.children) {
            return null; // avoid assign in then
          }
          let project = getProjectSelectedByLog(jobInfo.log);
          let url = `${jobInfo._links.workingDirectory.href}/files`;
          return getFilesList(url, project);
        })
        .then((childrenInfo) => {
          if (childrenInfo) {
            jobExapandedInfo['children'] = childrenInfo.children || [];
            jobExapandedInfo['id'] = id;
            jobsDB.addJob(jobExapandedInfo); // updated the children information
          }
          output.push(jobExapandedInfo);
          return jobExapandedInfo;
        });
        chainPromise.push(chain);
      });
      return Promise.all(chainPromise);
    })
    .then(() => {
      return output;
    }, (error) => {throw Error('getAllJobsExapandedWithChildren - ' + error);});
  }
  function getAssociatedLocation(workingDirectory, userProject) {
    let analysisPath = analysisConfig.analysisConnectionPath;
    let url = `${workingDirectory}/files/${analysisPath}`;
    return getFiles(url, userProject)
    .then((analysisObject) => (analysisObject))
    // even if the file is not there it will be updated later
    .catch((e) => ([]));
  }
  function getFiles(jobURL, userProject) {
    // display logs
    utils.matchFiles(jobURL, userProject);
    let headers = createHeaders(token, userProject);
    headers['Accept'] = 'application/octet-stream';
    return axios({
      'url': jobURL,
      'method': 'get',
      'headers': headers,
    })
    .then((r) => (r.data))
    .catch((e) => {throw Error('getFiles ' + e);});
  }
  function getFilesList(jobURL, userProject) {
    let headers = createHeaders(token, userProject);
    return axios({
      'url': jobURL,
      'method': 'get',
      'headers': headers,
    })
    .then((r) => (r.data))
    .catch((e) => {
      console.error('getting file list ' + e);
      return Promise.resolve({});
    });
  }
  function getFilesToCopy(filesURL, userProject, listFilesToAvoid) {
    return this.getFilesList(filesURL, userProject)
    .then((files) => {
      let allowed = [];
      let avoidFilesList = [];
      if (!listFilesToAvoid) {
        avoidFilesList = analysisConfig.filesToAvoidCopy;
      } else {avoidFilesList = listFilesToAvoid;}

      files.children.map((file) => {
        // remove the '/'
        let fileName = file.substr(1);
        let found = avoidFilesList.find((avoidFile) => {
          return fileName.indexOf(avoidFile) !== -1;
        });
        if (found) return;
        allowed.push(fileName);
      });
      return allowed;
    });
  }
  function getConfig(configParams) {
    /**
      * @params
      *   configParams {applicationName, title, nodes, computer}
      */
    let computer = configParams.computer || configParams.to.computer;
    return getPatition(computer, configParams.projectSelected)
    .then((partition) => {
      let jobSpec = {
        'ApplicationName': 'Bash shell',
        'Name': configParams.title || 'unnamed job',
        'Parameters': {
          'SOURCE': 'input.sh',
          'UC_PREFER_INTERACTIVE_EXECUTION': configParams.isViz,
        },
        'haveClientStageIn': 'true',
        'Resources': {
          'Nodes': configParams.nodes,
          'Runtime': configParams.runtime,
          'Queue': partition,
        },
      };
      // remove the nulls
      jobSpec.Resources = utils.compact(jobSpec.Resources);
      jobSpec.Parameters = utils.compact(jobSpec.Parameters);

      return jobSpec;
    });
  }
  function getImage(imageURL) {
    let headers = createHeaders(token);
    headers['Accept'] = 'application/octet-stream';
    delete headers['Content-Type'];
    return axios({
      'url': imageURL,
      'method': 'get',
      'responseType': 'blob',
      'headers': headers,
    })
    .then((image) => {
      return image.data;
    })
    .catch((e) => {
      throw String('Image not found');
    });
  }
  function getJobById(jobId, computer) {
    computer = computer.toUpperCase();
    let site = getSites()[computer].url;
    let url = site + '/jobs/' + jobId;
    return getJobProperties(url);
  }
  function getJobProperties(jobURL, userProject) {
    return jobsDB.getJobByUrl(jobURL)
    .then((job) => {
      console.debug('Getting job from DB');
      return job.details;
    })
    .catch((notFound) => {
      console.debug('Getting job from network', jobURL);
      let headers = createHeaders(token, userProject);
      return axios({
        'url': jobURL,
        'method': 'get',
        'headers': headers,
      })
      .then((response) => {
        jobsDB.addJob(response.data);
        return response.data;
      })
      .catch((e) => {throw Error('Error getting job properties');});
    });
  }
  function getLastJobId(url) {
    return url.split('/').pop();
  }
  function getSites() {
    let sites = {};
    sites['JUQUEEN'] = {'name': 'JUQUEEN (JSC)', 'id': 'JUQUEEN',
      'url': 'https://hbp-unic.fz-juelich.de:7112/HBP_JUQUEEN/rest/core'};
    sites['JURECA'] = {'name': 'JURECA (JSC)', 'id': 'JURECA',
      'url': 'https://hbp-unic.fz-juelich.de:7112/HBP_JURECA/rest/core'};
    sites['JURON'] = {'name': 'JURON (JSC)', 'id': 'JURON',
      'url': 'https://hbp-unic.fz-juelich.de:7112/HBP_JURON/rest/core'};
    sites['JULIA'] = {'name': 'JULIA (JSC)', 'id': 'JULIA',
      'url': 'https://hbp-unic.fz-juelich.de:7112/HBP_JULIA/rest/core'};
    sites['VIZ_CSCS'] = {'name': 'VIZ (CSCS)', 'id': 'VIS',
      'url': 'https://contra.cscs.ch:8080/VIS-CSCS/rest/core'};
    sites['BGQ_CSCS'] = {'name': 'BGQ (CSCS)', 'id': 'BGQ',
      'url': 'https://contra.cscs.ch:8080/BGQ-CSCS/rest/core'};
    sites['MARE_NOSTRUM'] = {'name': 'Mare Nostrum (BSC)', 'id': 'MN',
      'url': 'https://unicore-hbp.bsc.es:8080/BSC-MareNostrum/rest/core'};
    sites['PICO'] = {'name': 'PICO (CINECA)', 'id': 'PICO',
      'url': 'https://grid.hpc.cineca.it:9111/CINECA-PICO/rest/core'};
    sites['GALILEO'] = {'name': 'GALILEO (CINECA)', 'id': 'GALILEO',
      'url': 'https://grid.hpc.cineca.it:9111/CINECA-GALILEO/rest/core'};
    sites['FERMI'] = {'name': 'FERMI (CINECA)', 'id': 'FERMI',
      'url': 'https://grid.hpc.cineca.it:9111/CINECA-FERMI/rest/core'};
    sites['KIT'] = {'name': 'Cloud storage (KIT)', 'id': 'S3-KIT',
      'url': 'https://unicore.data.kit.edu:8080/HBP-KIT/rest/core'};
    return sites;
  }
  function getUser(site) {
    let unicoreURL = getSites()[site.toUpperCase()]['url'];
    let headers = createHeaders(token);
    return axios({
      'url': unicoreURL,
      'method': 'get',
      'headers': headers,
    })
    .then((response) => (response.data))
    .catch((e) => {throw Error('Error getting user information');});
  }
  function getPatition(site, projectSelected = null) {
    let userAccountPromise = [];
    if (projectSelected) {
      let t = Promise.resolve(projectSelected);
      userAccountPromise.push(t);
    } else {
      let t = getUser(site).then((user) => (user.client.xlogin.UID));
      userAccountPromise.push(t);
    }

    return Promise.all(userAccountPromise)
    .then((userMappedAccount) => {
      userMappedAccount = userMappedAccount[0];
      let computerConfig = simulationConfig[site.toUpperCase()];
      if (computerConfig && computerConfig.partitions) {
        let partition = filterPartition(computerConfig, userMappedAccount);
        if (partition) {
          return partition;
        }
      }
      return null;
    });
    function filterPartition(computerConfig, account) {
      let partitions = Object.keys(computerConfig.partitions);
      let selectedProject = partitions.find((partition) => {
        return account.indexOf(partition) >= 0;
      });
      let selectedPartition = computerConfig.partitions[selectedProject];
      console.debug('selectedPartition', selectedPartition);
      return selectedPartition;
    }
  }
  function generateUpdatedAssociatedFile(simulationWorkDirectory, analysisObject, userProject) {
    return getAssociatedLocation(simulationWorkDirectory, userProject)
    .then((associationFile) => {
      let newAssociationFile = [];
      let analysisPath = analysisConfig.analysisConnectionPath;
      associationFile.forEach((oldAnalysis) => {
        newAssociationFile.push(oldAnalysis);
      });
      newAssociationFile.push(analysisObject);
      // mapping in simulation the analysis path.
      let input = {
        'To': analysisPath,
        'Data': JSON.stringify(newAssociationFile),
      };
      // upload the analysis_path.json file
      console.debug('Uploading associationFile');
      return uploadData(input, simulationWorkDirectory + '/files', userProject);
    })
    .catch((e) => {
      throw Error('generateUpdatedAssociatedFile ' + e);
    });
  }
  function submitAnalysis(moveObject, script) {
    return new Promise((resolve, reject) => {
      /**
        Create a new job so we have working space where to copy files for analysis
          and upload the script to run analysis after the files are move
        Move files from diferent locations using Unicore API
        Returns one object with the information about transfer and
          inside another 'destinationJob' object with info about destination job
        @param {Object} moveObject
        {
          'from': {
            'workingDirectory' = origin job working directory
              e.g: "https://hbp-unic.fz-juelich.de:7112/HBP_JURECA/rest/core/ +
              storages/262788e5-571b-4965-8726-a337564f434d-uspace"
            'computer' = computer name e.g: JUQUEEN,
            'projectSelected' = userid of the project to launch job
          },
          'to': {
            'workingDirectory' = (this will be created and fill in here)
            'computer': computer name e.g: JURECA,
            'projectSelected' = userid of the project to launch job
          }
          'files' = array with name of files to copy
          'nodes' = number of nodes used to run the analysis
          'title' = title of the job
          // the following params should be in a new config file to upload
          // so the script reads that file before to start the analysis
          'checkedAnalysis' = list with the analysis to be run
          'numberOfCells' = % cells to visualize
          'target' = target where the analysis should be applied,
          'reportForAnalysis' = the report for the traces plot
        }
      */
      // create analysis_config
      let analysisParamsConfig = {
        'list_analysis': moveObject.checkedAnalysis,
        'number_of_cells': moveObject.numberOfCells,
        'target_analysis': moveObject.target,
        'report_analysis': moveObject.reportForAnalysis,
      };
      let scriptReplaced = '';
      // this bool will determine if the files will be copied or referenced
      let sameMachine = false;
      // change input sh {{origin}} for the from computer in case
      // from and to are the same (you have the same user)
      if (moveObject.from.computer === moveObject.to.computer) {
        sameMachine = true;
      }
      let inputs = [
        {
          'To': analysisConfig.configFileName,
          'Data': analysisParamsConfig,
        },
      ];
      let transferArray = [];
      let newJobDestination = {};
      console.debug('submiting job');
      // avoid copy the simulation input
      let onlyInputs = true;
      this.submitJob(moveObject, inputs, onlyInputs)
      .then((destinationJobObject) => {
        console.debug('job created');
        newJobDestination = destinationJobObject;
        let prom = [];
        // fill the destination and pass it to transfer
        moveObject.to['workingDirectory'] = newJobDestination._links.workingDirectory.href;
        if (sameMachine) {
          let originPath = workingDirToMachinePath(moveObject.from.workingDirectory);
          let destinationPath = workingDirToMachinePath(moveObject.to.workingDirectory);
          // replace blueconfig path and output path
          scriptReplaced = script.join('\n')
          .replace(/{{origin}}/, originPath)
          .replace(/{{origin}}/, destinationPath);
        } else {
          scriptReplaced = script.join('\n').replace(/{{origin}}/g, '.');
        }
        let input = {
          'To': 'input.sh',
          'Data': scriptReplaced,
        };
        let upload = uploadData(
          input,
          moveObject.to.workingDirectory + '/files',
          moveObject.to.projectSelected
        );
        prom.push(upload);
        let association = generateUpdatedAssociatedFile(
          moveObject.from.workingDirectory,
          destinationJobObject,
          moveObject.from.projectSelected
        );
        prom.push(association);
        return Promise.all(prom);
      })
      .then(([uploaded, assocFile]) => {
        console.debug('after after associationFile');
        // avoid copying files but return something for the last element in the chain
        if (sameMachine) return '';
        // get all the files to be copied
        console.debug('getting files to be copied ...');
        return this.getFilesToCopy(
          `${moveObject.from.workingDirectory}/files`,
          moveObject.from.projectSelected
        );
      })
      .then((files) => {
        // avoid copying files but return something for the last element in the chain
        if (sameMachine) return '';
        files.forEach(function(fileName, i) {
          // change the object so transferFile transfers each individual file
          // this is for have each object with its own information becasue async calls
          console.debug('coping ...', fileName);
          moveObject['fileName'] = fileName;
          transferArray.push(transferFiles(moveObject));
        });
        return Promise.all(transferArray);
      })
      .then(([upload, transfer]) => {
        if (sameMachine) {
          transfer = {'avoidCopy': true};
        };
        // add this field so we have the info to start the job
        transfer['destinationJob'] = newJobDestination;
        return resolve(transfer);
      }, reject);
    });
  }
  function submitJob(runConfig, inputs, onlyInputs = false) {
    // TODO: these variables are now global for unicore. use submit job scope.
    /**
      * inputs [{ To: '', Data: {} }]
      */
    let computer = runConfig.computer || runConfig.to.computer;
    let userProject = runConfig.projectSelected || runConfig.to.projectSelected;
    computer = computer.toUpperCase();
    let unicoreURL = getSites()[computer]['url'];
    this.jobURL = this.actionStartURL = this.workingDirectory = '';
    return init()
    .then(() => {
      return getConfig(runConfig);
    })
    .then((launchParams) => {
      let shellCommand = simulationConfig[computer].script.join('\n');
      if (!onlyInputs && shellCommand) {
        inputs.push({'To': 'input.sh', 'Data': shellCommand});
      }
      console.debug('creating job...');
      return createJob(unicoreURL, launchParams, userProject);
    })
    .then((job) => {
      this.jobURL = job.headers.location;
      console.debug('getting job properties...');
      return getJobProperties(this.jobURL, userProject);
    })
    .then((properties) => {
      this.workingDirectory = properties._links.workingDirectory.href;
      this.actionStartURL = properties._links['action:start'].href;
      return Promise.all(inputs.map((input) => {
        console.debug('uploading files...');
        return uploadData(input, this.workingDirectory + '/files', userProject);
      }));
    })
    .then(() => {
      // make it compatible with the job structure
      let jobDetails = {
        '_links': {
          'self': {
            'href': this.jobURL,
          },
          'workingDirectory': {
            'href': this.workingDirectory,
          },
          'action:start': {
            'href': this.actionStartURL,
          },
        },
      };
      return (jobDetails);
    }, (e) => {throw Error('Submit job ' + e);});
  }
  function transferFiles(moveObject) {
    /**
      Returns object with the information about transfer but not job
    */
    // this transferFile will be done when the poll find DONE or FAILED
    function getTransferInfo(trasferURL) {
      let headers = createHeaders(token);
      return axios({
        'url': trasferURL,
        'method': 'get',
        'headers': headers,
      })
      .then((response) => (response.data))
      .catch((e) => {throw Error('getTransferInfo ' + e);});
    };
    function polling(transferLocation, resolve, reject) {
      getTransferInfo(transferLocation)
      .then((transfer) => {
        if (transfer.status === 'DONE') {
          console.log('Transfer DONE');
          resolve(transfer);
        } else if (transfer.status === 'FAILED') {
          console.log('Transfer FAILED');
          reject(transfer.statusMessage);
        } else {
          console.log('transfer polling');
          setTimeout(function() {
            polling(transferLocation, resolve, reject);
          }, 5 * 1000);
        }
      }, reject);
    };
    return new Promise((resolve, reject) => {
      // TODO: have in mind that this api of StorageManagement?res could change
      let destURL = moveObject.to.workingDirectory + '/transfers';
      let storageURL = getSites()[moveObject.from.computer.toUpperCase()]['url'];
      storageURL = storageURL.replace('rest/core', 'services/StorageManagement?res=');
      let originWorkId = moveObject.from.workingDirectory.split('/').pop();
      let sourceURL = `BFT:${storageURL}${originWorkId}#/${moveObject.fileName}`;
      let payload = {
        'file': moveObject.fileName,
        'source': sourceURL,
      };
      // post to move files request and check with poll
      let headers = createHeaders(token);
      axios({
        'url': destURL,
        'method': 'post',
        'data': JSON.stringify(payload),
        'headers': headers,
      })
      .then((transfer) => {
        let transferLocation = transfer.headers.location;
        // passing the resolve so the poll is who finish the transterFiles
        polling(transferLocation, resolve, reject);
      }, reject);
    });
  }
  function uploadData(dataToUpload, uploadURL, userProject = '') {
    let headers = createHeaders(token, userProject);
    headers['Content-Type'] = 'application/octet-stream';
    let data = dataToUpload.Data;
    let target = dataToUpload.To;
    return axios({
      'url': uploadURL + '/' + target,
      'method': 'put',
      'data': data,
      'headers': headers,
    });
  }
  function workingDirToMachinePath(workingDirectory) {
    if (workingDirectory.indexOf('JURECA') > 0) {
      try {
        let id = workingDirectory.match('storages\/(.*)-uspace')[1];
        let base = analysisConfig.workDirectoyBase.JURECA;
        return base + id;
      } catch (e) {
        console.error('Error parsing workingDirToMachinePath', e);
      }
    }
  };
  function jobUrlToPhysicalLocation(jobURL, userProject) {
    let headers = createHeaders(token, userProject);
    return axios({
      'url': jobURL,
      'headers': headers,
    })
    .then((jobInfo) => {
      return axios({
        'url': jobInfo.data._links.workingDirectory.href,
        'headers': headers,
      });
    })
    .then((location) => {
      return location.data.mountPoint;
    });
  }
  function init() {
    return hello.isAuth().then(() => {
      token = hello.token;
    });
  }
  return {
    getAssociatedLocation,
    deleteJob,
    deleteJobFromAssociatedFile,
    uploadData,
    submitJob,
    actionJob,
    getAllJobs,
    getAllJobsExpandedWithChildren,
    getJobById,
    getJobProperties,
    getFiles,
    getFilesList,
    getFilesToCopy,
    getImage,
    getConfig,
    getUser,
    init,
    jobUrlToPhysicalLocation,
    submitAnalysis,
    getProjectSelectedByLog,
    transferFiles,
  };
}());
