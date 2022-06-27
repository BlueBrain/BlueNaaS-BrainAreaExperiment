
import store from '@/services/store';
import { tokenIsValid } from '@/services/unicore';
import { getAuth } from '@/services/db';

export function checkToken() {
  const token = getAuth();
  store.commit('setToken', token);
  return tokenIsValid();
}

export default {};
