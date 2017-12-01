# SimulationApp
Run simulations in supercomputers using Unicore API.

### Installation
``` npm install ```

### Run as dev
``` npm run dev ```

### Deploy production
* `git review` will trigger: [jenkins plan](https://bbpcode.epfl.ch/ci/job/platform.simulationapp_to_objectstorage.gerrit/) this will deploy dev version in [dev simulation](https://bbp.epfl.ch/public/dev.simulationapp/index.html#/)
* **Merge** will trigger: [jenkins plan](https://bbpcode.epfl.ch/ci/job/platform.simulationapp_to_objectstorage/)
* [**Container**](https://bbpopenstack.epfl.ch/dashboard/project/containers/container/simulationapp) Open Stack
* [**Website**](https://bbp.epfl.ch/public/simulationapp/index.html#/)

### Generate the documentation
``` npm run jsdoc ```

### Documentation Online
https://lbologna.github.io/hbp-sp6-guidebook/online_usecases/small_circuit_in_silico_experiments/small_circuit_in_silico_experiments.html

### Neurodamus documentation
https://bbpteam.epfl.ch/project/spaces/download/attachments/12959382/NeurondamusIntro2017.pdf?version=1&modificationDate=1503503106000&api=v2