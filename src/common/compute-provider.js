
import { computers } from '@/common/constants';

const bb5VmmUrl = process.env.VUE_APP_VMM_URL;

const config = {
  BB5_MOOC: {
    name: 'MOOC BB5 Service Account',
    id: computers.BB5_MOOC,
    url: `${bb5VmmUrl}/rest/core`,
  },
  PIZ_DAINT: {
    name: 'PIZ_DAINT',
    id: computers.PIZ_DAINT,
    url: 'https://brissago.cscs.ch:8080/DAINT-CSCS/rest/core',
  },
  SERVICE_ACCOUNT: {
    name: 'MOOC Piz Daint Service Account',
    id: computers.SERVICE_ACCOUNT,
    url: 'https://bspsa.cineca.it/advanced/pizdaint/rest/core',
  },
};

export default config;
