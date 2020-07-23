import AdmZip from 'adm-zip';
import axios from 'axios';
import { DataSource } from '../util';

const DataSources = {
    "rate": "https://download.cms.gov/marketplace-puf/2020/rate-puf.zip",
    "attributes": "https://download.cms.gov/marketplace-puf/2020/plan-attributes-puf.zip",
    "costSharing": "https://download.cms.gov/marketplace-puf/2020/benefits-and-cost-sharing-puf.zip",
} as const;

export async function getData(name: DataSource): Promise<Buffer> {
    const rawZippedData = (await axios.get(DataSources[name], { responseType: "arraybuffer" })).data;
    const zipfile = new AdmZip(rawZippedData);
    return zipfile.getEntries()[0].getData();
}