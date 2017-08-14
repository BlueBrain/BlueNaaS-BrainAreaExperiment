module.exports = (function() {
    'use strict';
    let hello = require('assets/hbp.hello.js').hellojs;
    let token = '';
    let actionJob = function(actionURL) {
        // actions like start, restart, abort
        let headers = createHeaders(token);
        return fetch(actionURL, {
            'method': 'POST',
            'body': JSON.stringify({}),
            'headers': headers,
        }).then(handleErrors);
    };
    let checkFileExists = function(fileURL) {
        let headers = createHeaders(token);
        return fetch(fileURL, {
            'method': 'GET',
            'headers': headers,
        })
        .then(handleErrors)
        .then((response) => {
            return response.json();
        }, Promise.reject);
    };
    let createHeaders = function(token) {
        return {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
    };
    let createJob = function(url, jobDefinition) {
        let headers = createHeaders(token);
        return fetch(url + '/jobs', {
            'method': 'POST',
            'body': JSON.stringify(jobDefinition),
            'headers': headers,
        }).then(handleErrors);
    };
    let deleteJob = function(url) {
        let headers = createHeaders(token);
        return fetch(url, {
            'method': 'DELETE',
            'body': JSON.stringify({}),
            'headers': headers,
        }).then(handleErrors);
    };
    let getAllJobs = function(site) {
        let unicoreURL = getSites()[site.toUpperCase()]['url'];
        let headers = createHeaders(token);
        return fetch(unicoreURL + '/jobs', {
            'method': 'GET',
            'headers': headers,
        })
        .then(handleErrors)
        .then((response) => {
            return response.json();
        });
    };
    let init = function() {
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
        });
    };
    let getFiles = function(jobURL) {
        let headers = createHeaders(token);
        headers['Accept'] = 'application/octet-stream';
        return fetch(jobURL, {
            'method': 'GET',
            'headers': headers,
        })
        .then((response) => {
            return response.text();
        }, Promise.reject);
    };
    let getFilesList = function(jobURL) {
        let headers = createHeaders(token);
        return fetch(jobURL, {
            'method': 'GET',
            'headers': headers,
        })
        .then((response) => {
            return response.text();
        }, Promise.reject);
    };
    let getImage = function(jobURL) {
        let headers = createHeaders(token);
        headers['Accept'] = 'application/octet-stream';
        delete headers['Content-Type'];
        return fetch(jobURL, {
            'method': 'GET',
            'headers': headers,
        })
        .then((response) => {
            return response.blob();
        }, Promise.reject);
    };
    let getJobById = function(jobId, computer) {
        computer = computer.toUpperCase();
        let site = getSites()[computer].url;
        let url = site + '/jobs/' + jobId;
        return getJobProperties(url);
    };
    let getJobProperties = function(jobURL) {
        let headers = createHeaders(token);
        return fetch(jobURL, {
            'method': 'GET',
            'headers': headers,
        })
        .then(handleErrors)
        .then((response) => {
            return response.json();
        }, Promise.reject);
    };
    let getSites = function() {
        let sites = {};
        sites['JUQUEEN'] = {'name': 'JUQUEEN (JSC)', 'id': 'JUQUEEN',
            'url': 'https://hbp-unic.fz-juelich.de:7112/HBP_JUQUEEN/rest/core'};
        sites['JURECA'] = {'name': 'JURECA (JSC)', 'id': 'JURECA',
            'url': 'https://hbp-unic.fz-juelich.de:7112/HBP_JURECA/rest/core'};
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
    let handleErrors = function(response, callback, params) {
        if (!response.ok) {
            // if (response.status === 403) {
            // console.log('403....');
            // return hello.logout();
            // return getAuthenticationToken();
            // });
            // } else {
            response.json().then((err) => {
                console.error(err.errorMessage);
            }, (anotherError) => {});
            throw Error(response.statusText + ' - check console for more details');
            // }
        } else {
            return response;
        }
    };
    let submitValidation = function(moveObject) {
        return new Promise((resolve, reject) => {
            /**
                Create a new job so we have working space where to copy files for validation
                    and upload the script to run validation after the files are move
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
                }
            */
            let jobSpec = {
                'ApplicationName': 'Bash shell',
                'Parameters': {'SOURCE': 'input.sh'},
                'Resources': {'Nodes': '1'},
                'haveClientStageIn': 'true',
            };
            let inputShContent = `
                /homec/bp0/bp000024/jureca/venv_bluepy_analysis/bin/analysis_launch.py --blueconfig BlueConfig --output . --usertarget user.target
                `;
            let inputs = [{
                'To': 'input.sh',
                'Data': inputShContent,
            }];
            this.checkFileExists(moveObject.from.workingDirectory + '/files/out.dat')
            .then((output) => {
                return Promise.resolve();
            }, (error) => {
                throw Error('No simulation output file (out.dat). No validation can be run');
            })
            .then(() => {
                return this.submitJob(moveObject.to.computer, jobSpec, inputs);
            })
            .then((jobObject) => {
                // mapping in simulation the validation path.
                let input = {
                    'To': 'validation_path',
                    'Data': JSON.stringify(jobObject),
                };
                // fill the destination and pass it to transfer
                moveObject.to['workingDirectory'] = jobObject._links.workingDirectory.href;
                let transferArray = [];
                transferArray.push(this.uploadData(input, moveObject.from.workingDirectory + '/files'));
                console.log(`moving ${moveObject.files.length} files ...`);
                moveObject.files.forEach(function(val, i) {
                    // change the object so transferFile transfer each individual file
                    moveObject['fileName'] = moveObject.files[i];
                    transferArray.push(transferFiles(moveObject));
                });
                Promise.all(transferArray).then(([upload, transfer]) => {
                    // add this field so we have the info to start the job
                    transfer['destinationJob'] = jobObject;
                    return resolve(transfer);
                }, (error) => {
                    console.error(error);
                    reject(error);
                });
            }, reject);
        });
    };
    let submitJob = function(site, jobDefinition, inputs) {
        return new Promise((resolve, reject) => {
            let unicoreURL = getSites()[site.toUpperCase()]['url'];
            // TODO: these variables are now global for unicore. use submit job scope.
            this.jobURL = this.actionStartURL = this.workingDirectory = '';
            init()
            .then(() => {
                console.log('creating job...');
                return createJob(unicoreURL, jobDefinition);
            })
            .then((job) => {
                this.jobURL = job.headers.get('location');
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
                resolve(jobDetails);
            });
        });
    };
    let transferFiles = function(moveObject) {
        /**
            Returns object with the information about transfer but not job
        */
        // this transferFile will be done when the poll find DONE or FAILED
        let getTransferInfo = function(trasferURL) {
            let headers = createHeaders(token);
            return fetch(trasferURL, {
                'method': 'GET',
                'headers': headers,
            })
            .then(handleErrors)
            .then((response) => {
                return response.json();
            }, Promise.reject);
        };
        let polling = function(transferLocation, resolve, reject) {
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
            });
        };
        return new Promise((resolve, reject) => {
            // TODO: have in mind that this api of StorageManagement?res could change
            let destURL = moveObject.to.workingDirectory + '/transfers';
            let storageURL = getSites()[moveObject.from.computer.toUpperCase()]['url'];
            storageURL = storageURL.replace('rest/core', 'services/StorageManagement?res=');
            let originWorkId = moveObject.from.workingDirectory.split('/').pop();
            let sourceURL = `UFTP:${storageURL}${originWorkId}#/${moveObject.fileName}`;
            let payload = {
                'file': moveObject.fileName,
                'source': sourceURL,
                'extraParameters': {
                    'uftp.compression': true,
                },
            };
            // post to move files request and check with poll
            let headers = createHeaders(token);
            fetch(destURL, {
                'method': 'POST',
                'body': JSON.stringify(payload),
                'headers': headers,
            })
            .then(handleErrors)
            .then((transfer) => {
                let transferLocation = transfer.headers.get('location');
                // passing the resolve so the poll is who finish the transterFiles
                polling(transferLocation, resolve, reject);
            });
        });
    };
    let uploadData = function(dataToUpload, uploadURL) {
        let headers = createHeaders(token);
        headers['Content-Type'] = 'application/octet-stream';
        let data = dataToUpload.Data;
        let target = dataToUpload.To;
        return fetch(uploadURL + '/' + target, {
            'method': 'PUT',
            'body': data,
            'headers': headers,
        }).then(handleErrors);
    };
    return {
        'checkFileExists': checkFileExists,
        'deleteJob': deleteJob,
        'uploadData': uploadData,
        'submitJob': submitJob,
        'actionJob': actionJob,
        'getAllJobs': getAllJobs,
        'getJobById': getJobById,
        'getJobProperties': getJobProperties,
        'getFiles': getFiles,
        'getFilesList': getFilesList,
        'getImage': getImage,
        'init': init,
        'submitValidation': submitValidation,
        'transferFiles': transferFiles,
    };
}());

/**
    ------ example of job's params for Shell Commands
    let jobSpec = {
        // each application name is related to a script
        // be carefull with case sensitive.
        // for shell commands:
        'ApplicationName': 'Bash shell',
        'Parameters': {'SOURCE': 'input.sh'},
        'Resources': {'Nodes': '1'},
        'haveClientStageIn': 'true',
    };
    let inputShContent = `
        #!/bin/sh
        date
        hostname
        whoami
        `;
    let inputs = [{
        'To': 'input.sh',
        'Data': inputShContent,
    }];
    ------ END example of job's params
    ------ example of job's params for SIMULATION
    let jobSpec = {
        'ApplicationName': 'BSP',
        'Parameters': {
            'CONFIG': 'BlueConfig',
            'TARGET': 'user.target',
            'OUTPUT': 'output',
        },
        'Resources': {'Nodes': '32'},
        'haveClientStageIn': 'true',
    };
    inputs = [
        {
            'To': 'BlueConfig',
            // 'Data': require('raw-loader!assets/BlueConfig'),
        },
        {
            'To': 'user.target',
            'Data': require('raw-loader!assets/user.target'),
        },
    ];
    ------ END example of job's params for SIMULATION
*/
