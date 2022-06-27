
const bb5VmmUrl = process.env.VUE_APP_VMM_URL;

const config = {
  BB5: {
    name: 'MOOC BB5 Service Account',
    id: 'bb5',
    url: `${bb5VmmUrl}/rest/core`,
  },
};

export default config;
