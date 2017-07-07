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
    let getAuthenticationToken = async function(){
        hello.init({
            hbp: '7a9b6bb2-2f6d-4624-9045-d1f12d9dedaa'
        });
        try {
            let data = await hello.login('hbp', {display: 'page', force: false});
            return data.authResponse.access_token;
        } catch (e) {
            let error = (e && e.error && e.error.message) ? e.error.message : e;
            throw new Error(error);
        }
    };
    let createHeaders = function(token){
        return {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
        };
    };
    let getJobProperties = function(jobURL, token){
        let headers = createHeaders(token);
        headers['Content-Type'] = 'application/json';
        return fetch(jobURL, {
            method: 'GET',
            headers: headers
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
        });
    };
    let startJob = function(actionURL, token){
        let headers = createHeaders(token);
        headers['Content-Type'] = 'application/json';
        return fetch(actionURL, {
            method: 'POST',
            body: {},
            headers: headers
        });
    };
    let submitJob = async function(site, jobDefinition, inputs){
        try {
            let unicoreURL = getSites()[site.toUpperCase()]['url'];
            let token, workingDirectory, jobURL, actionStartURL;
            token = await getAuthenticationToken();

            let headers = createHeaders(token);
            headers['Content-Type'] = 'application/json';
            console.log('creating job...');
            let response = await fetch(unicoreURL + '/jobs', {
                method: 'POST',
                body: JSON.stringify(jobDefinition),
                headers: headers
            });
            if (!response.ok) {
                let res = await response.json();
                throw new Error(res.errorMessage);
            }

            jobURL = response.headers.location;
            if (jobURL) {
                console.log('getting job properties...');
                response = await getJobProperties(jobURL, token);
            } else {
                response = await response.json()
                throw new Error(response.errorMessage);
            }
            workingDirectory = response.data._links.workingDirectory.href;
            actionStartURL = response.data._links['action:start'].href;
            await Promise.all(inputs.map(input => {
                console.log('uploading files...');
                return uploadData(input, workingDirectory + '/files', token);
            }));

            console.log('starting job...');
            await startJob(actionStartURL, token);

            return jobURL;
        } catch (error) {
            console.error('error submiting job');
            let message = (error && error.message) ? error.message : error;
            throw new Error(message);
        }
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
