import axios from "~/request/axios";
import { reactive } from "vue";
import type { StreetInfo, CommunityInfo } from "~/types/street";
import { promiseWithResolvers } from "~/helpers/promise";

const { promise: getStreetPromise, resolve } = promiseWithResolvers<StreetInfo[]>();
let inited = false;
const StreetMap: Record<string, StreetInfo> = reactive({});
const CommunityMap: Record<string, CommunityInfo> = reactive({});
const streets: StreetInfo[] = reactive([]);
type RespData = {
  success: true;
  data: { streets: StreetInfo[], communities: CommunityInfo[] };
  message: string;
}
export async function getStreetsAndCommunities() {
  if (inited) {
    return getStreetPromise;
  }
  inited = true;
  const resp = await axios<RespData>('/api/data/get-street', {
    method: 'GET',
  });
  if (resp && resp.status === 200 && resp.data) {
    const { data } = resp.data;
    for (const key of ['streets', 'communities'] as const) {
      const map = key === 'streets' ? StreetMap : CommunityMap;
      if (Array.isArray(data[key])) {
        data[key].forEach((item) => {
          map[item.id] = item;
          map[item.name] = item;
        });
      }
    }
    streets.length = 0;
    streets.push(...data.streets);
    resolve(data.streets);
    return getStreetPromise;
  } else {
    inited = false;
    return [] as StreetInfo[];
  }
}

export function useStreetCommunity() {
  const promise = getStreetsAndCommunities();
  function getNameByStreetId(id: string) {
    return StreetMap[id] ? StreetMap[id].name : '';
  }
  function getNameByCommunityId(id: string) {
    return CommunityMap[id] ? CommunityMap[id].name : '';
  }
  async function ensureStreetCommunityData() {
    await promise;
  }
  return {
    streets,
    StreetMap,
    CommunityMap,
    getNameByStreetId,
    getNameByCommunityId,
    ensureStreetCommunityData
  }
}
