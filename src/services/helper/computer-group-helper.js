
import store from '@/services/store';
import axios from 'axios';
import { getComputeProviders } from '@/services/unicore';
import eventBus from '@/services/event-bus';

function getUser(computer) {
  const unicoreURL = getComputeProviders()[computer.toUpperCase()].url;
  return axios(unicoreURL).then(r => r.data);
}

function getComputersAvailableForCurrentModel() {
  // will filter the computers that actually can run the circuit
  const computersCanRunCircuit = Object.keys(store.state.currentCircuitConfig.prefix);
  const computersAllowedToRun = store.state.allComputerAvailable.filter(computer => (
    computersCanRunCircuit.includes(computer)
  ));
  console.debug('ComputersAllowedToRun', computersAllowedToRun);
  return computersAllowedToRun;
}

function setupFromStorage(newGroup) {
  const computerSaved = localStorage.getItem('userComputer');
  const groupSaved = newGroup || localStorage.getItem('userGroup');
  const computerUserGroupsMap = localStorage.getItem('computerUserGroupsMap') || '';
  // check based on saved params
  if (
    computerSaved &&
    groupSaved &&
    (computerUserGroupsMap.includes(groupSaved) &&
     computerUserGroupsMap.includes(computerSaved))
  ) {
    const available = computerUserGroupsMap.split('-')[1].split(',');
    console.debug('Setup projects param from localStorage');
    if (store.state.userGroupsAvailable.toString() !== available.toString()) {
      store.commit('setUserGroupsAvailable', available);
    }
    if (store.state.currentComputer !== computerSaved) {
      store.commit('setCurrentComputer', computerSaved);
    }
    if (!store.state.userGroup !== groupSaved) {
      store.commit('setUserGroup', groupSaved);
    }
  }
}

async function setupUserProjects(newGroup) {
  if (store.state.currentComputer === localStorage.getItem('userComputer')) {
    setupFromStorage(newGroup);
    return store.state.userGroup;
  }
  const computer = store.state.currentComputer;
  console.debug('Get user accounts from network');

  if (store.state.userGroup) {
    // reset user project to fetch project information
    store.commit('setUserGroup', null);
  }

  const userInfo = await getUser(computer);

  if (!userInfo) {
    console.error('setupUserProjects');
    throw Error('retrieving projects for this computer');
  }
  if (!userInfo.client.xlogin.availableGroups) {
    console.error('getting availableGroups');
    throw Error('Error getting available groups');
  }

  const groupsAvailable = userInfo.client.xlogin.availableGroups.length ?
    userInfo.client.xlogin.availableGroups : [];
  const currentGroup = groupsAvailable.length ? groupsAvailable[0] : '*';
  store.commit('setUserGroupsAvailable', groupsAvailable);
  if (!store.state.userGroup) {
    store.commit('setUserGroup', currentGroup);
    localStorage.setItem('userGroup', currentGroup);
    localStorage.setItem('userComputer', computer);
  }

  // mapping groupsAvailable available for a specific computer
  if (computer && groupsAvailable) {
    localStorage.setItem(
      'computerUserGroupsMap',
      `${computer}-${groupsAvailable}`,
    );
  }

  return store.state.userGroup;
}

eventBus.$on('setupFromStorage', () => {
  setupFromStorage();
});

eventBus.$on('changeUserGroup', (group, callback) => {
  if (store.state.userGroup === group) return;
  setupUserProjects(group).then(() => {
    if (callback) callback();
  });
});

eventBus.$on('changeComputer', (computer, callback) => {
  if (store.state.currentComputer === computer) return;
  store.commit('setCurrentComputer', computer);
  setupUserProjects().then(() => {
    if (callback) callback();
  });
});


export { getComputersAvailableForCurrentModel };
export default {};
