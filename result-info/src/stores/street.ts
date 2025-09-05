import axios from "~/request/axios";
import { reactive } from "vue";
import type { StreetInfo, CommunityInfo } from "~/types/street";

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
    return streets;
  }
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
        });
      }
    }
    inited = true;
    streets.push(...data.streets);
    return data.streets;
  } else {
    return [] as StreetInfo[];
  }
}

export function useStreetCommunity() {
  getStreetsAndCommunities();
  function getNameByStreetId(id: string) {
    return StreetMap[id] ? StreetMap[id].name : '';
  }
  function getNameByCommunityId(id: string) {
    return CommunityMap[id] ? CommunityMap[id].name : '';
  }
  return {
    streets,
    StreetMap,
    CommunityMap,
    getNameByStreetId,
    getNameByCommunityId
  }
}
