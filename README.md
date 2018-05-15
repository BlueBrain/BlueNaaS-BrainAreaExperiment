# SimulationApp
Configure and Launch simulations in supercomputers using Unicore API.

### Installation
``` npm install ```

### Run as dev
``` npm run dev ```

### Deploy production
* `git review` will trigger: [jenkins plan](https://bbpcode.epfl.ch/ci/job/nse.simulation-launcher-deploy.gerrit/) this will deploy dev version in [dev simulation](https://bbp.epfl.ch/public/dev.simulationapp/index.html?#/)
* **Merge** will trigger: [jenkins plan](https://bbpcode.epfl.ch/ci/job/nse.simulation-launcher-deploy/)
* [**Container**](https://bbpopenstack.epfl.ch/dashboard/project/containers/container/simulationapp) Open Stack
* [**Website**](https://bbp.epfl.ch/public/simulationapp/index.html?#/)

### Generate the documentation
``` npm run jsdoc ```

### Documentation Online
https://lbologna.github.io/hbp-sp6-guidebook/online_usecases/brain_area_circuit_in_silico_experiments/hippocampus/configure_run_brainregion_preconf_model_data/configure_run_brainregion_preconf_model_data.html#run-simulations

### Neurodamus documentation
https://bbpteam.epfl.ch/project/spaces/download/attachments/12959382/NeurondamusIntro2017.pdf?version=1&modificationDate=1503503106000&api=v2
