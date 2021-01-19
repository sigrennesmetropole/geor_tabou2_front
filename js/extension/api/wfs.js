import axios from '@mapstore/libs/ajax';
import { GEOSERVER_WFS_URL } from '../constants'

export function getGeomByCql(idLayer, filter) {
    if (!idLayer || !filter) return;

    const URL = `${GEOSERVER_WFS_URL}/ows?service=WFS&version=1.0.0&request=GetFeature&outputFormat=application%2Fjson&srsname=EPSG:3857&typeName=${idLayer}&CQL_FILTER=${filter}`

    return axios.get(URL, {
        cql_filter: { filter },
        tymeName: { idLayer }
    }
    ).then(({ data }) => data);
}