
import { axiosInstance } from '@/services/unicore';

const collabStorageEndpoint = 'https://services.humanbrainproject.eu/storage/v1/api';

async function getIpByName(collabId, fileName) {
  const fileUrl = `${collabStorageEndpoint}/entity/?path=/${collabId}/${fileName}`
    .replace(/\s+/g, '');

  const fileResponse = await axiosInstance(fileUrl);
  const fileUuid = fileResponse.data.uuid;

  const content = await axiosInstance(`${collabStorageEndpoint}/file/${fileUuid}/content/`);
  return content.data || null;
}

export default {
  getIpByName,
};
