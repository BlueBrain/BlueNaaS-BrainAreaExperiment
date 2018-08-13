import * as unicoreAPI from 'mixins/unicore.js';
import Vue from 'vue';
import visualizationConfig from 'assets/visualization-config.json';
import {replaceMultiplePaths} from 'assets/utils.js';
import {urlToComputerAndId} from 'mixins/unicore';
import {isRunning} from 'assets/job-status.js';
import template from 'lodash/template';
import templateSettings from 'lodash/templateSettings';

// Use mustache style in templates
templateSettings.interpolate = /{{([\s\S]+?)}}/g;

function launchVisualization(job, simulationUserProject, computer) {
  let promisePhysicalLocation = unicoreAPI.jobUrlToPhysicalLocation(
    job._links.self.href,
    simulationUserProject
  );

  let promiseGetReport = unicoreAPI.getFilesToCopy(
    `${job._links.workingDirectory.href}/files`,
    simulationUserProject,
    visualizationConfig.filesToAvoidCopy
  ).then((filesToCopy) => {
    let reportMap = {};
    filesToCopy.map((name) => {
      if (name.endsWith('.bbp')) {
        name = name.replace('.bbp', '');
        reportMap[name] = name;
      }
    });
    if (Object.keys(reportMap).length > 1) {
      // more than one report so select which one
      return swal({
        title: 'Select Report to Visualize',
        input: 'select',
        inputOptions: reportMap,
        inputPlaceholder: 'Select Report',
        showCancelButton: true,
      })
      .then((selection) => {
        let finalReport = selection.value;
        if (selection.value === '') {
          finalReport = Object.keys(reportMap)[0];
        }
        return finalReport;
      });
    }
    return Object.keys(reportMap)[0];
  });

  let promiseChangeBlueConfigPaths = unicoreAPI.getFiles(
    `${job._links.workingDirectory.href}/files/BlueConfig`,
    simulationUserProject
  ).then((blueConfig) => {
    return replaceMultiplePaths(blueConfig, visualizationConfig.BlueConfigPath);
  });

  return Promise.all([promisePhysicalLocation, promiseGetReport, promiseChangeBlueConfigPaths])
  .then(([physicalLocation, report, blueConfig]) => {
    console.debug('Visualizing report', report);
    // add BlueConfig because I had to move the new with new paths for Viz
    visualizationConfig.scripts['BlueConfig'] = blueConfig;
    let fileNames = Object.keys(visualizationConfig.scripts);
    let inputs = [];
    // avoid copy the simulation input
    let onlyInputs = true;
    let moveObject = {
      computer: computer,
      projectSelected: simulationUserProject,
      nodes: 1,
      runtime: 100,
      title: 'Vizualization for ' + job.name,
      isViz: true, // to use the head node that has network for ssh
    };

    fileNames.forEach((fileName) => {
      let scriptStr = visualizationConfig.scripts[fileName];
      // compatible with BlueConfig
      if (Array.isArray(scriptStr)) scriptStr = scriptStr.join('\n');

      const circuitTarget = report.match(new RegExp('(.*)_report_'))[1];

      const scriptTemplate = template(scriptStr);

      const script = scriptTemplate(Object.assign(
        {
          BASE: physicalLocation,
          REPORT_NAME: report,
          CIRCUIT_TARGET: circuitTarget,
        },
        visualizationConfig.const
      ));

      inputs.push({
        To: fileName,
        Data: script,
      });
    });
    console.debug('Submiting job for visualization');
    return unicoreAPI.submitJob(moveObject, inputs, onlyInputs);
  })
  .then((newJob) => {
    console.debug('starting job...');
    let newJobId = urlToComputerAndId(newJob._links.self.href).id;
    console.debug('Visualization job id', newJobId);
    unicoreAPI.actionJob(newJob._links['action:start'].href);

    let input = {
      To: 'viz_link.txt',
      Data: newJob._links.self.href,
    };

    unicoreAPI.uploadData(
      input,
      job._links.workingDirectory.href + '/files',
      simulationUserProject
    );

    return pollingVizPromise(newJob._links.self.href, simulationUserProject);
  });
}

function pollingVizPromise(vizJobUrl, simulationUserProject) {
  return new Promise((resolve) => {
    let pollingViz = setInterval(getVizStatus, 5000);

    function getVizStatus() {
      console.debug('Polling vizualization job status');
      unicoreAPI.getJobProperties(vizJobUrl, simulationUserProject)
      .then((properties) => {
        if (!isRunning(properties.status)) {
          clearInterval(pollingViz);
          console.debug('Viz polling done');
          resolve(vizJobUrl);
        }
      });
    }
  });
}

function setFileContent(destination, name, fileContent, isBlob = false) {
  // TODO: avoid loading the same file multiple times because of
  // collaps and expand multiple times
  if (!isBlob) {
    if (typeof fileContent === 'object') {
      fileContent = JSON.stringify(fileContent, null, 2);
    }
    Vue.set(destination, name, fileContent.split('\n'));
    console.debug('++ Loaded content', name);
  } else {
    let reader = new FileReader();
    reader.onloadend = () => {
      Vue.set(destination, name, reader.result);
    };
    reader.readAsDataURL(fileContent);
  }
}

export {
  launchVisualization,
  setFileContent,
};
