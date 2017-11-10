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
    let getAssociatedLocation = function(workingDirectory) {
        let url = workingDirectory + '/files/analysis_path';
        return getFiles(url)
        .then((location) => {
            try {
                let analysisObject = JSON.parse(location);
                return Promise.resolve(analysisObject);
            } catch (e) {
                throw new Error('No analysis file. Images cannot be shown');
            }
        }, console.warn);
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
            return response.json();
        }, Promise.reject)
        .then((files) => {
            return files;
        });
    };
    let getFilesToCopy = function(filesURL) {
        return this.getFilesList(filesURL)
        .then((files) => {
            let allowed = [];
            files.children.forEach((file) => {
                if (!file.endsWith('backup') &&
                    file.indexOf('UNICORE_SCRIPT_EXIT_CODE') < 0 &&
                    file.indexOf('stderr') < 0 &&
                    file.indexOf('stdout') < 0 &&
                    file.indexOf('analysis_path') < 0) {
                    // remove the '/'
                    allowed.push(file.substr(1));
                }
            });
            return allowed;
        });
    };
    let getConfig = function(configParams, blueConfig, shellCommand) {
        /**
        * @params
        *   configParams {applicationName, title, nodes, project}
        *   BlueConfig
        *   shellCommand to be used when the job starts
        */
        let jobSpec = {
            'ApplicationName': configParams.applicationName,
            'Name': configParams.title,
            'Project': configParams.project,
            'haveClientStageIn': 'true',
            'Resources': {
                'Nodes': configParams.nodes,
                'Runtime': configParams.runtime,
            },
        };
        let inputs = [];

        // this is a workaround for running simulations using shell instead of BSP.
        if (configParams.applicationName === 'Bash shell') {
            jobSpec['Parameters'] = {'SOURCE': 'input.sh'};

            let inputShContent = '';
            if (shellCommand) {
                inputShContent = shellCommand;
            } else {
                inputShContent = `
                    #!/bin/sh
                    date
                    hostname
                    whoami
                    source /homec/bp0/bp000022/modulecmd/3.2.10/init/bash
                    module use /homec/bp0/bp000022/modulesfiles
                    module purge
                    module load nix/hpc/neuron-hippocampus/7.5-201706
                    mkdir -p output
                    /homec/bp0/bp000024/simulation_launch_venv/bin/simulation_launch.py -vv --blueconfig BlueConfig --output output
                `;
            }
            inputs = [
                {
                    'To': 'input.sh',
                    'Data': inputShContent,
                },
                {
                    'To': 'BlueConfig',
                    // 'Data': require('raw-loader!assets/BlueConfigEx2'),
                    'Data': JSON.stringify(blueConfig),
                },
            ];
        }
        return {
            'jobSpec': jobSpec,
            'inputs': inputs,
        };
    };
    let getImage = function(imageURL) {
        return new Promise((resolve, reject) => {
            let headers = createHeaders(token);
            headers['Accept'] = 'application/octet-stream';
            delete headers['Content-Type'];
            fetch(imageURL, {
                'method': 'GET',
                'headers': headers,
            })
            .then((imageBinary) => {
                return imageBinary.blob();
            }, Promise.reject)
            .then((image) => {
                if (image.size > 0) {
                    resolve(image);
                } else {
                    reject('Image not found');
                }
            });
        });
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
    let getResourcesAvailable = function() {
        /** returns the site and project that the user have access related to HBP
         *  way to obtain the data from https://github.com/HumanBrainProject/pyunicore/blob/dev/pyunicore/pyunicore.py
        */
        let headers = createHeaders(token);
        let projectsArray = [];
        let getJson = function(url) {
            return fetch(url, {
                'method': 'GET',
                'headers': headers,
            })
            .then(handleErrors)
            .then((response) => {
                return response.json();
            })
            .catch((e) => {})
            .then((notFound) => {
                // workaround to wait Promise.all even if rejected
                return notFound;
            });
        };
        let getResourceInfo = function(objReference) {
            return getJson(objReference.url)
            .then((info) => {
                if (info) {
                    // add the UID because somethimes the projecs available
                    // are empty even if I have account.
                    objReference.project = info.client.xlogin.availableUIDs;
                    return objReference;
                }
            });
        };
        let filterComputerName = function(url) {
            // to be consistent with the getSites names returns that name based on the url
            let sites = getSites();
            let keys = Object.keys(sites);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (sites[key].url === url) {
                    return key;
                }
            }
        };
        // let filterProject = function(sites) {
        //     let filtered = [];
        //     sites.forEach((site) => {
        //         if (site && Array.isArray(site.project)) {
        //             filtered.push(site);
        //         }
        //     });
        //     return filtered;
        // };
        return new Promise((resolve, reject) => {
            // get the resources
            getJson(HBP_RESOURCES_URL)
            .then((resources) => {
                resources.entries.forEach((site) => {
                    let href = site['href'];
                    let serviceType = site['type'];
                    if ('TargetSystemFactory' === serviceType) {
                        let re = new RegExp('https://.*/rest/core', 'g');
                        let obj = {};
                        [obj.url] = re.exec(href);
                        obj.computerName = filterComputerName(obj.url);
                        // get the user projects and add them to obj element
                        projectsArray.push(getResourceInfo(obj));
                    }
                });
                // this will execute all of them even if reject is trown
                Promise.all(projectsArray)
                .then((filledObj) => {
                    // let filtered = filterProject(filledObj);
                    let filtered = filledObj.filter((site) => {return site && site.computerName;});
                    resolve(filtered);
                });
            });
        });
    };
    let getSites = function() {
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
    let submitAnalysis = function(moveObject) {
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
                }
            */
            let jobSpec = {
                'ApplicationName': 'Bash shell',
                'Parameters': {'SOURCE': 'input.sh'},
                'Name': moveObject.title,
                'Resources': {'Nodes': moveObject.nodes},
                'haveClientStageIn': 'true',
            };
            let inputShContent = `
                /homec/bp0/bp000024/jureca/venv_bluepy_analysis/bin/analysis_launch.py --blueconfig BlueConfig --output . --usertarget /homec/bp0/bp000024/proj30/hippocampus/user.target
                `;
            let inputs = [{
                'To': 'input.sh',
                'Data': inputShContent,
            }];

            return this.submitJob(moveObject.to.computer, jobSpec, inputs)
            .then((jobObject) => {
                // mapping in simulation the analysis path.
                let input = {
                    'To': 'analysis_path',
                    'Data': JSON.stringify(jobObject),
                };
                // fill the destination and pass it to transfer
                moveObject.to['workingDirectory'] = jobObject._links.workingDirectory.href;
                let transferArray = [];
                // upload the analysis_path file
                transferArray.push(this.uploadData(input, moveObject.from.workingDirectory + '/files'));
                console.log(`moving ${moveObject.files.length} files ...`);
                // get all the files to be copied
                console.log('getting files to be copied ...');
                return this.getFilesToCopy(`${moveObject.from.workingDirectory}/files`)
                .then((files) => {
                    console.log('coping ...', files);
                    moveObject.files = files;
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
        'getAssociatedLocation': getAssociatedLocation,
        'deleteJob': deleteJob,
        'uploadData': uploadData,
        'submitJob': submitJob,
        'actionJob': actionJob,
        'getAllJobs': getAllJobs,
        'getJobById': getJobById,
        'getJobProperties': getJobProperties,
        'getFiles': getFiles,
        'getFilesList': getFilesList,
        'getFilesToCopy': getFilesToCopy,
        'getImage': getImage,
        'getConfig': getConfig,
        'getResourcesAvailable': getResourcesAvailable,
        'init': init,
        'submitAnalysis': submitAnalysis,
        'transferFiles': transferFiles,
    };
}());
