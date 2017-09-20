# SimulationApp
Run simulations in supercomputers using Unicore API.

### Installation
``` npm install ```

### Run as dev
``` npm run dev ```

### Deploy production
* `git review` will trigger: [jenkins plan](https://bbpcode.epfl.ch/ci/job/platform.simulationapp_to_objectstorage.gerrit/)
* **Merge** will trigger: [jenkins plan](https://bbpcode.epfl.ch/ci/job/platform.simulationapp_to_objectstorage/)
* [**Container**](https://bbpopenstack.epfl.ch/dashboard/project/containers/container/simulationapp) Open Stack
* [**Website**](https://bbp.epfl.ch/public/simulationapp/index.html#/)

### Generate the documentation
``` npm run jsdoc ```