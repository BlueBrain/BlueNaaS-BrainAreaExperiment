
import store from '@/services/store';
import { getComputerUrl, axiosInstance } from '@/services/unicore';
import eventBus from '@/services/event-bus';
import { getSavedComputerAndMappings, setSavedComputerAndMappings } from '@/services/db';

function getUser(computer) {
  const unicoreURL = getComputerUrl(computer);
  return axiosInstance(unicoreURL).then(r => r.data);
}

function setupFromStorage(newGroup) {
  const {
    computerSaved,
    groupSaved = newGroup,
    computerUserGroupsMap,
  } = getSavedComputerAndMappings(store.state.fullConfig.circuitName);
  // check based on saved params
  if (
    computerSaved &&
    groupSaved &&
    (computerUserGroupsMap.includes(groupSaved) &&
     computerUserGroupsMap.includes(computerSaved))
  ) {
    const available = computerUserGroupsMap.split('-')[1].split(',');
    if (store.state.userGroupsAvailable.toString() !== available.toString()) {
      store.commit('setUserGroupsAvailable', available);
    }
    if (store.state.fullConfig.computer !== computerSaved) {
      store.commit('setCurrentComputer', computerSaved);
    }
    if (store.state.userGroup !== groupSaved) {
      store.commit('setUserGroup', groupSaved);
    }
    return true;
  }
  return false;
}

async function setupUserProjects(newGroup) {
  const { computerSaved } = getSavedComputerAndMappings(store.state.fullConfig.circuitName);
  if (store.state.fullConfig.computer === computerSaved) {
    const wasSet = setupFromStorage(newGroup);
    if (wasSet) return store.state.userGroup;
  }
  const { computer } = store.state.fullConfig;

  if (store.state.userGroup) {
    // reset user project to fetch project information
    store.commit('setUserGroup', null);
  }

  const userInfo = await getUser(computer);

  if (!userInfo) {
    throw new Error('retrieving projects for this computer');
  }
  if (!userInfo.client.xlogin.availableGroups) {
    throw new Error('getting available groups');
  }

  const groupsAvailable = userInfo.client.xlogin.availableGroups.length ?
    userInfo.client.xlogin.availableGroups : ['*'];
  const currentGroup = groupsAvailable.length ? groupsAvailable[0] : '*';
  store.commit('setUserGroupsAvailable', groupsAvailable);
  if (!store.state.userGroup) {
    store.commit('setUserGroup', currentGroup);
    setSavedComputerAndMappings(computer, currentGroup, groupsAvailable);
  }

  return store.state.userGroup;
}

eventBus.$on('setup-from-storage', () => {
  setupFromStorage();
});

function setupUserProjectsShared(group) {
  return setupUserProjects(group)
    .catch((error) => {
      eventBus.$emit('show-error', error.message);
    });
}

eventBus.$on('change-user-group', (group, callback) => {
  if (store.state.userGroup === group) return;
  setupUserProjectsShared(group).then(callback);
});

eventBus.$on('change-computer', (computer, callback) => {
  if (computer !== store.state.fullConfig.computer) {
    store.commit('setCurrentComputer', computer);
    store.dispatch('setupFullConfig');
  }
  setupUserProjectsShared(null).then(callback);
});

export default {};
