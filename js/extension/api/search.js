import axios from '@mapstore/libs/ajax';
import { API_BASE_URL } from '../constants';


/**
 * API - create GET request
 */
export function getRequestApi(name, apiCfg, params) {
    let url = apiCfg?.apiURL || API_BASE_URL;
    let requestParams = {
        params: params || {}
    };
    if (apiCfg?.authent) {
        requestParams.headers = {
            Authorization: `Basic ${btoa(apiCfg.authent)}`
        };
    }


    return axios.get(`${url}/${name}`, requestParams).then(({ data }) => data);
}
