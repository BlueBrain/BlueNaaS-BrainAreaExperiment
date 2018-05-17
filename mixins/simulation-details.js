import unicoreAPI from 'mixins/unicore.js';
import visualizationConfig from 'assets/visualization-config.json';
import {urlToId, replaceMultiplePaths, replaceConst} from 'assets/utils.js';

function launchVisualization(job, simulationUserProject, computer) {
  swal.enableLoading();
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
        'title': 'Select Report to Visualize',
        'input': 'select',
        'inputOptions': reportMap,
        'inputPlaceholder': 'Select Report',
        'showCancelButton': true,
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
      'computer': computer,
      'projectSelected': simulationUserProject,
      'nodes': 1,
      'runtime': 100,
      'title': 'Vizualization for ' + job.name,
      'isViz': true, // to use the head node that has network for ssh
    };

    fileNames.forEach((fileName) => {
      let data = visualizationConfig.scripts[fileName];
      if (Array.isArray(data)) data = data.join('\n');
      if (data.includes('{{BASE}}')) {
        data = data.replace(/{{BASE}}/g, physicalLocation);
      }
      if (data.includes('{{REPORTNAME}}')) {
        data = data.replace(/{{REPORTNAME}}/g, report);
      }
      if (data.includes('{{CIRCUITTARGET}}')) {
        let match = report.match(new RegExp('(.*)_report_'));
        if (match.length > 1) {
          data = data.replace(/{{CIRCUITTARGET}}/g, match[1]);
        }
      }

      data = replaceConst(data, visualizationConfig.const);

      inputs.push({
        'To': fileName,
        'Data': data,
      });
    });
    console.debug('Submiting job for visualization');
    return unicoreAPI.submitJob(moveObject, inputs, onlyInputs);
  })
  .then((newJob) => {
    console.debug('starting job...');
    let newJobId = urlToId(newJob._links.self.href).id;
    console.debug('Visualization job id', newJobId);
    unicoreAPI.actionJob(newJob._links['action:start'].href);
    let input = {
      'To': 'job_link.txt',
      'Data': newJobId,
    };
    unicoreAPI.uploadData(
      input,
      job._links.workingDirectory.href + '/files',
      simulationUserProject
    );
    swal.disableLoading();
    return swal({
      'title': 'Visualization Job Was Submitted!',
      'html': `<p>We are copying the files... </p>
              <p>THIS CAN TAKE A WHILE. </p>`,
      'type': 'success',
      'showCancelButton': true,
      'focusConfirm': true,
      'confirmButtonText': 'Open Brayns',
    }).then((choice) => {
      if (choice.value) {
        window.open(
          'https://bbp-brayns.epfl.ch/?host=https://brayns.humanbrainproject.org',
          '_blank'
        );
      }
    });
  });
}

export {
  launchVisualization,
};
