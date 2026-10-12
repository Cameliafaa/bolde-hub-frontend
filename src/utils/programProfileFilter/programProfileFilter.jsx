export const isProgramAllowedForProfile = (detail, userContext) => {
  const { areaId, channelId, storeId } = userContext;

  if (
    areaId !== 0 &&
    detail.program_areas?.length &&
    !detail.program_areas.some(a => a.area_id === areaId)
  ) return false;

  if (
    channelId !== 0 &&
    detail.program_channels?.length &&
    !detail.program_channels.some(c => c.channel_id === channelId)
  ) return false;

  if (
    storeId !== 0 &&
    detail.program_stores?.length &&
    !detail.program_stores.some(s => s.store_id === storeId)
  ) return false;

  return true;
};
