import axios from '@mapstore/libs/ajax';
import { API_BASE_URL } from '../constants';


/**
 * API - create GET request
 */
export function getRequestApi(name, params) {
    params = params || {};
    return axios.get(`${API_BASE_URL}/${name}`, { params: params }).then(({ data }) => data);
}
