(function (exports) {
    'use strict';
    let hello = require('hellojs');
    let getSites = function(){
        let sites = {};
        sites['JUQUEEN'] = {'name': 'JUQUEEN (JSC)', 'id': 'JUQUEEN',
                            'url': "https://hbp-unic.fz-juelich.de:7112/HBP_JUQUEEN/rest/core" };
        sites['JURECA'] = {'name': 'JURECA (JSC)', 'id': 'JURECA',
                           'url': "https://hbp-unic.fz-juelich.de:7112/HBP_JURECA/rest/core" };
        sites['VIZ_CSCS'] = {'name': 'VIZ (CSCS)', 'id': 'VIS',
                             'url': "https://contra.cscs.ch:8080/VIS-CSCS/rest/core" };
        sites['BGQ_CSCS'] = {'name': 'BGQ (CSCS)', 'id': 'BGQ',
                             'url': "https://contra.cscs.ch:8080/BGQ-CSCS/rest/core" };
        sites['MARE_NOSTRUM'] = {'name': 'Mare Nostrum (BSC)', 'id': 'MN',
                                 'url': "https://unicore-hbp.bsc.es:8080/BSC-MareNostrum/rest/core" };
        sites['PICO'] = {'name': 'PICO (CINECA)', 'id': 'PICO',
                         'url': "https://grid.hpc.cineca.it:9111/CINECA-PICO/rest/core" };
        sites['GALILEO'] = {'name': 'GALILEO (CINECA)', 'id': 'GALILEO',
                            'url': "https://grid.hpc.cineca.it:9111/CINECA-GALILEO/rest/core" };
        sites['FERMI'] = {'name': 'FERMI (CINECA)', 'id': 'FERMI',
                          'url': "https://grid.hpc.cineca.it:9111/CINECA-FERMI/rest/core" };
        sites['KIT'] = {'name': 'Cloud storage (KIT)', 'id': 'S3-KIT',
                        'url': "https://unicore.data.kit.edu:8080/HBP-KIT/rest/core" };
        return sites;
    };
    let getAuthenticationToken = function(){
        return new Promise((resolve, reject) => {
            hello.init({
                hbp: '7a9b6bb2-2f6d-4624-9045-d1f12d9dedaa'
            });

            hello.login('hbp', {display: 'page', force: false})
            .then(data => {
                resolve(data.authResponse.access_token);
            }, reject);
        });
    };
    let createHeaders = function(token){
        return {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
    };
    let handleErrors = function (response){
        if (!response.ok) {
            response.json().then(err => {
                console.error(err.errorMessage)
            });
            throw Error(response.statusText + ' - check console for more details');
        }
        return response;

    };
    let createJob = function(url, jobDefinition, token){
        let headers = createHeaders(token);
        return fetch(url + '/jobs', {
            method: 'POST',
            body: JSON.stringify(jobDefinition),
            headers: headers
        }).then(handleErrors);
    };
    let getJobProperties = function(jobURL, token){
        let headers = createHeaders(token);
        return fetch(jobURL, {
            method: 'GET',
            headers: headers
        })
        .then(handleErrors)
        .then(response => {
            return response.json();
        });
    };
    let uploadData = function(dataToUpload, uploadURL, token){
        let headers = createHeaders(token);
        headers['Content-Type'] = 'application/octet-stream';
        let data = dataToUpload.Data;
        let target = dataToUpload.To;
        return fetch(uploadURL + '/' + target, {
            method: 'PUT',
            body: data,
            headers: headers
        }).then(handleErrors);
    };
    let startJob = function(actionURL, token){
        let headers = createHeaders(token);
        return fetch(actionURL, {
            method: 'POST',
            body: JSON.stringify({}),
            headers: headers
        }).then(handleErrors);
    };
    let submitJob = function(site, jobDefinition, inputs){
        return new Promise((resolve, reject) => {
            let unicoreURL = getSites()[site.toUpperCase()]['url'];
            this.token = this.jobURL = this.actionStartURL = '';
            getAuthenticationToken()
            .then(token => {
                this.token = token;
                console.log('creating job...');
                return createJob(unicoreURL, jobDefinition, this.token);
            }, reject)
            .then(job => {
                this.jobURL = job.headers.get("location");
                console.log('getting job properties...');
                return getJobProperties(this.jobURL, this.token);
            }, reject)
            .then(properties => {
                let workingDirectory = properties._links.workingDirectory.href;
                this.actionStartURL = properties._links['action:start'].href;
                return Promise.all(inputs.map(input => {
                    console.log('uploading files...');
                    return uploadData(input, workingDirectory + '/files', this.token);
                }));
            }, reject)
            .then(() => {
                console.log('starting job...');
                return startJob(this.actionStartURL, this.token);
            }, reject)
            .then(started => {
                resolve(this.jobURL);
            }, reject);
        });
    };

    let jobSpec = {
        ApplicationName: 'Bash shell',
        Parameters: { SOURCE: 'input.sh'},
        Resources: {Nodes: '1'},
        haveClientStageIn: 'true'
    };
    let inputShContent = `
        #!/bin/sh
        date
        hostname
        whoami
        `
    let inputs = [{
        To: 'input.sh',
        Data: inputShContent
    }];

    // const poll = function () {
    //     checkURL(value)
    //         .then(() => {
    //             console.log('yay')
    //         })
    //         .catch(() => {
    //             setTimeout(() => {
    //                 value += 1
    //                 poll()
    //             }, value * 1000)
    //         });
    // };

    // poll();

    exports.submitJob = submitJob;
    exports.jobSpec = jobSpec;
    exports.inputShContent = inputShContent;
    exports.inputs = inputs;

}(exports));
