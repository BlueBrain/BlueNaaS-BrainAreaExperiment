
import axios from 'axios';

const collabStorageEndpoint = 'https://services.humanbrainproject.eu/storage/v1/api';

async function getIpByName(collabId, fileName) {
  const newAxiosInstance = axios.create({
    headers: {
      common: {
        Accept: '*/*',
      },
    },
  });

  const fileUrl = `${collabStorageEndpoint}/entity/?path=/${collabId}/${fileName}`
    .replace(/\s+/g, '');

  const fileResponse = await newAxiosInstance(fileUrl);
  const fileUuid = fileResponse.data.uuid;

  const content = await newAxiosInstance(`${collabStorageEndpoint}/file/${fileUuid}/content/`);
  return content.data || null;
}

export default {
  getIpByName,
};
