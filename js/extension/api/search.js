import axios from '@mapstore/libs/ajax';
import { API_BASE_URL } from '../constants';

/**
 * API - get commune values
 */
export function getCommunes() {
    return axios.get(`${API_BASE_URL}/communes`, { params: {} }).then(({ data }) => data);
}