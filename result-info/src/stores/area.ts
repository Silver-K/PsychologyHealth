import axios from "~/request/axios";
import type { AreaItemT } from "~/types/area";

type RespData = {
  success: true;
  data: AreaItemT[];
  message: string;
}
export async function getFocusArea() {
  const resp = await axios<RespData>('/api/data/get-areas', {
    method: 'GET',
  });
  if (resp && resp.status === 200 && resp.data) {
    const { data } = resp.data;
    return data;
  } else {
    return [] as AreaItemT[];
  }
}