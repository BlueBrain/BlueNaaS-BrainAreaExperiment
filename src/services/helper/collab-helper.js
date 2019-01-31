
import axios from 'axios';
import visualizationConfig from '@/config/visualization-config';

const collabStorageEndpoint = 'https://services.humanbrainproject.eu/storage/v1/api';
// let newAxiosInstance = null; // async assign

async function getIpByName(fileName) {
  const newAxiosInstance = axios.create();

  const fileUrl = `${collabStorageEndpoint}/entity/?path=/
    ${visualizationConfig.collabId}/${visualizationConfig.folderName}/
    ${fileName}`.replace(/\s+/g, '');

  const fileResponse = await newAxiosInstance(fileUrl);
  const fileUuid = fileResponse.data.uuid;

  newAxiosInstance.defaults.headers.common.Accept = '*/*';
  delete newAxiosInstance.defaults.headers.common['Content-Type'];

  const content = await newAxiosInstance(`${collabStorageEndpoint}/file/${fileUuid}/content/`);
  return content.data || null;
}

export default {
  getIpByName,
};
