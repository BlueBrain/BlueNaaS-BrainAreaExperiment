
module.exports = (function() {
  'use strict';
  let axios = require('axios');
  let hello = require('assets/hbp.hello.js').hellojs;
  let analysisConfig = require('assets/analysis-config.json');
  let simulationConfig = require('assets/simulation-config.json');
  let token = '';
  let utils = require('assets/utils.js');
  function actionJob(actionURL) {
    // actions like start, restart, abort
    let headers = createHeaders(token);
    return axios({
      'url': actionURL,
      'method': 'post',
      'data': JSON.stringify({}),
      'headers': headers,
    });
  };
  function createHeaders(token) {
    return {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  };
  function createJob(url, jobDefinition) {
    let headers = createHeaders(token);
    return axios({
      'url': url + '/jobs',
      'method': 'post',
      'data': JSON.stringify(jobDefinition),
      'headers': headers,
    });
  };
  function deleteJob(url) {
    let headers = createHeaders(token);
    return axios({
      'url': url,
      'method': 'delete',
      'data': JSON.stringify({}),
      'headers': headers,
    });
  };
  function deleteJobFromAssociatedFile(simulationWorkDir, idToDelete) {
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
  };
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
  };
  function getAllJobsExapandedWithChildren(site) {
    // get the information of all jobs asociated with key + the children
    let jobsList = [];
    let chainPromise = [];
    let output = [];
    return getAllJobs(site)
    .then((parsed) => {
      jobsList = parsed.jobs;
      if (jobsList.length <= 0) return;
      jobsList.forEach((job) => {
        let jobExapandedInfo = {};
        let chain = getJobProperties(job)
        .then((jobInfo) => {
          jobExapandedInfo = jobInfo;
          let url = `${jobInfo._links.workingDirectory.href}/files`;
          return getFilesList(url);
        })
        .then((childrenInfo) => {
          jobExapandedInfo['children'] = childrenInfo.children;
          let id = getLastJobId(job);
          jobExapandedInfo['id'] = id;
          output.push(jobExapandedInfo);
        });
        chainPromise.push(chain);
      });
      return Promise.all(chainPromise);
    })
    .then(() => {
      return output;
    }, (error) => {throw Error('getAllJobsExapandedWithChildren - ' + error);});
  };
  function getAssociatedLocation(workingDirectory) {
    let analysisPath = analysisConfig.analysisConnectionPath;
    let url = `${workingDirectory}/files/${analysisPath}`;
    return getFiles(url)
    .then((analysisObject) => (analysisObject))
    // even if the file is not there it will be updated later
    .catch((e) => ([]));
  };
  function getFiles(jobURL) {
    let headers = createHeaders(token);
    headers['Accept'] = 'application/octet-stream';
    return axios({
      'url': jobURL,
      'method': 'get',
      'headers': headers,
    })
    .then((r) => (r.data))
    .catch((e) => {throw Error('getFiles ' + e);});
  };
  function getFilesList(jobURL) {
    let headers = createHeaders(token);
    return axios({
      'url': jobURL,
      'method': 'get',
      'headers': headers,
    })
    .then((r) => (r.data))
    .catch((e) => {throw Error('getting file list ' + e);});
  };
  function getFilesToCopy(filesURL) {
    return this.getFilesList(filesURL)
    .then((files) => {
      let allowed = [];
      let avoidFilesList = analysisConfig.filesToAvoidCopy;
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
  };
  function getConfig(configParams, blueConfig) {
    /**
      * @params
      *   configParams {applicationName, title, nodes, computer}
      *   BlueConfig
      */
    return getPatition(configParams.computer)
    .then((partition) => {
      let shellCommand = simulationConfig[configParams.computer].script.join('\n');
      let jobSpec = {
        'ApplicationName': configParams.applicationName,
        'Name': configParams.title || 'unnamed job',
        'haveClientStageIn': 'true',
        'Resources': {
          'Nodes': configParams.nodes,
          'Runtime': configParams.runtime,
          'Queue': partition,
        },
      };
      let inputs = [];

      // this is a workaround for running simulations using shell instead of BSP.
      if (configParams.applicationName === 'Bash shell') {
        jobSpec['Parameters'] = {'SOURCE': 'input.sh'};

        let inputShContent = '';
        if (shellCommand) {
          inputShContent = shellCommand;
        }
        inputs = [
          {'To': 'input.sh', 'Data': inputShContent},
          {'To': 'blueconfig.json', 'Data': JSON.stringify(blueConfig)},
        ];
      }
      jobSpec.Resources = utils.default.compact(jobSpec.Resources);
      return {
        'jobSpec': jobSpec,
        'inputs': inputs,
      };
    });
  };
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
  };
  function getJobById(jobId, computer) {
    computer = computer.toUpperCase();
    let site = getSites()[computer].url;
    let url = site + '/jobs/' + jobId;
    return getJobProperties(url);
  };
  function getJobProperties(jobURL) {
    let headers = createHeaders(token);
    return axios({
      'url': jobURL,
      'method': 'get',
      'headers': headers,
    })
    .then((response) => (response.data))
    .catch((e) => {throw Error('Error getting job properties');});
  };
  function getLastJobId(url) {
    return url.split('/').pop();
  };
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
  };
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
  };
  function getPatition(site) {
    return getUser(site).then((user) => {
      let userMappedAccount = user.client.xlogin.UID;
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
  };
  function generateUpdatedAssociatedFile(simulationWorkDirectory, analysisObject) {
    return getAssociatedLocation(simulationWorkDirectory)
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
      return uploadData(input, simulationWorkDirectory + '/files');
    })
    .catch((e) => {
      throw Error('generateUpdatedAssociatedFile ' + e);
    });
  };
  function init() {
    hello.init({
      // 'hbp': '7a9b6bb2-2f6d-4624-9045-d1f12d9dedaa',
      'hbp': 'c292031c-c91f-43fa-b1a9-72e65eb18e44',
    });
    return hello.login('hbp', {
      'display': 'page',
      'force': false,
      'page_uri': window.location.href,
    })
    .then((data) => {
      token = data.authResponse.access_token;
    }, (error) => {throw Error('init ' + e);});
  };
  function submitAnalysis(moveObject, script) {
    let configName = analysisConfig.configFileName;
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
            'computer' = computer name e.g: JUQUEEN
          },
          'to': {
            'workingDirectory' = (this will be created and fill in here)
            'computer': computer name e.g: JURECA
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
      let jobSpec = {
        'ApplicationName': 'Bash shell',
        'Parameters': {'SOURCE': 'input.sh'},
        'Name': moveObject.title || 'unnamed job',
        'Resources': {'Nodes': moveObject.nodes},
        'haveClientStageIn': 'true',
      };
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
          'To': configName,
          'Data': JSON.stringify(analysisParamsConfig),
        },
      ];
      let transferArray = [];
      let newJobDestination = {};

      this.submitJob(moveObject.to.computer, jobSpec, inputs)
      .then((destinationJobObject) => {
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
        let upload = uploadData(input, moveObject.to.workingDirectory + '/files');
        prom.push(upload);
        let association = generateUpdatedAssociatedFile(
          moveObject.from.workingDirectory,
          destinationJobObject
        );
        prom.push(association);
        return Promise.all(prom);
      })
      .then(([uploaded, assocFile]) => {
        // avoid copying files but return something for the last element in the chain
        if (sameMachine) return '';
        // get all the files to be copied
        console.log('getting files to be copied ...');
        return this.getFilesToCopy(`${moveObject.from.workingDirectory}/files`);
      })
      .then((files) => {
        // avoid copying files but return something for the last element in the chain
        if (sameMachine) return '';
        files.forEach(function(fileName, i) {
          // change the object so transferFile transfers each individual file
          // this is for have each object with its own information becasue async calls
          console.log('coping ...', fileName);
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
  };
  // function submitJob(site, jobDefinition, inputs) {
  function submitJob(runConfig, blueConfig) {
    // TODO: these variables are now global for unicore. use submit job scope.
    let unicoreURL = getSites()[runConfig.computer.toUpperCase()]['url'];
    this.jobURL = this.actionStartURL = this.workingDirectory = '';
    let inputs = [];
    return init()
    .then(() => {
      return getConfig(runConfig, blueConfig);
    })
    .then((launchParams) => {
      inputs = launchParams.inputs;
      console.log('creating job...');
      return createJob(unicoreURL, launchParams.jobSpec);
    })
    .then((job) => {
      this.jobURL = job.headers.location;
      console.log('getting job properties...');
      return getJobProperties(this.jobURL);
    })
    .then((properties) => {
      this.workingDirectory = properties._links.workingDirectory.href;
      this.actionStartURL = properties._links['action:start'].href;
      return Promise.all(inputs.map((input) => {
        console.log('uploading files...');
        return uploadData(input, this.workingDirectory + '/files');
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
    }, (e) => {throw Error('Submit job' + e);});
  };
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
          }, 10 * 1000);
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
  };
  function uploadData(dataToUpload, uploadURL) {
    let headers = createHeaders(token);
    headers['Content-Type'] = 'application/octet-stream';
    let data = dataToUpload.Data;
    let target = dataToUpload.To;
    return axios({
      'url': uploadURL + '/' + target,
      'method': 'put',
      'data': data,
      'headers': headers,
    });
  };
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
  return {
    getAssociatedLocation,
    deleteJob,
    deleteJobFromAssociatedFile,
    uploadData,
    submitJob,
    actionJob,
    getAllJobs,
    getAllJobsExapandedWithChildren,
    getJobById,
    getJobProperties,
    getFiles,
    getFilesList,
    getFilesToCopy,
    getImage,
    getConfig,
    getUser,
    init,
    submitAnalysis,
    transferFiles,
  };
}());
