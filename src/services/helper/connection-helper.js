
import connectionsConfig from '@/config/connection-config';
import cloneDeep from 'lodash/cloneDeep';

const getDefaultConnections = () => cloneDeep(connectionsConfig.defaultConnections);

export { getDefaultConnections };

export default {};
