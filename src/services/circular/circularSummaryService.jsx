import { computeCircularSummary } from "../../utils/circularSummary/circularSummary";
import { isProgramAllowedForProfile } from "../../utils/programProfileFilter/programProfileFilter";
import { ApiRequest } from "../apiRequest";

export const fetchCircularSummaryByProfile = async () => {
  const profileRes = await ApiRequest({
    url: "/profile/me",
    method: "GET",
  });

  const userContext = {
    areaId: profileRes.data.area_id,
    channelId: profileRes.data.channel_id,
    storeId: profileRes.data.store_id,
  };
  const programRes = await ApiRequest({
    url: "/programs/all",
    method: "GET",
  });
  const approved = programRes.data.filter((p) =>
    p.approvals?.every((a) => a.status === "approved"),
  );
  const details = await Promise.all(
    approved.map((p) =>
      ApiRequest({
        url: `/programs/detail/${p.program_id}`,
        method: "GET",
      }).then((res) => ({ program: p, detail: res.data })),
    ),
  );

  const filtered = details.filter(({ detail }) =>
    isProgramAllowedForProfile(detail, userContext),
  );

  const summary = computeCircularSummary(filtered.map((f) => f.program));

  return summary;
};
