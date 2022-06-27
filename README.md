# SimulationApp
Configure and Launch simulations in supercomputers using Unicore API.

### Usage
This app is deployed in [OpenShift](https://simulation-launcher-bsp-epfl.apps.hbp.eu/index.html#/circuits/hippo_hbp_sa_full_ca1) as part of the [Ebrains Wizard](https://bluebrain.github.io/bsp-usecase-wizard/dev/index.html)

### Installation
``` npm install ```

### Run as dev
``` npm run dev ```

### Deploy to Ebrains OpenShift
* Go to OpenShift https://okd.hbp.eu/console/project/bsp-epfl/browse/deployments
* On the top-right corner under profile, click on "Copy Login Command" and paste it on the terminal
* Build the image `docker build -t docker-registry.ebrains.eu/bsp-epfl/sim-launcher:ebrains .`
* Login to Ebrains image registry:
  * Go to [registry](https://docker-registry.ebrains.eu/harbor/projects/2/repositories/sim-launcher)
  * Click on the user profile and get the `Username` and the `CLI secret`
  * Type `docker login docker-registry.ebrains.eu`
* Push image `docker push docker-registry.ebrains.eu/bsp-epfl/sim-launcher:ebrains`

### MOOC BBP specific info
For this MOOC in BBP infrastructure, we have a specific branch `mooc-bbp` because this app is different from the original one.
Some of the changes are:
- Use VMM - LTI authentication
- Show token expiration page when VMM fails
- Dedicated plan to deploy in Openshift (https://bbpgitlab.epfl.ch/nse/simulation-launcher-ui/-/jobs/29876)
- Dedicated deployment (https://ocp.bbp.epfl.ch:8443/console/project/bbp-ou-nse/browse/dc/mooc-sim-launcher?tab=history)

### Generate the documentation
``` npm run jsdoc ```

### Documentation Online
https://github.com/lbologna/hbp-sp6-guidebook/blob/improve_sim_launcher_doc/source/online_usecases/brain_area_circuit_in_silico_experiments/hippocampus/configure_run_brainregion_preconf_model_data/configure_run_brainregion_preconf_model_data.rst

### Neurodamus documentation
https://bbpteam.epfl.ch/project/spaces/download/attachments/12959382/NeurondamusIntro2017.pdf?version=1&modificationDate=1503503106000&api=v2
