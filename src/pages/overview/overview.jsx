import React, { useEffect, useState } from "react";
import useBreakpoint from "../../hooks/useBreakpoint";
import Placeholder from "../../assets/images/Folder/1.png";
import usePermission from "../../utils/usePermission";
import OverviewMobile from "./overviewMobile";
import OverviewTablet from "./overviewTablet";
import OverviewDesktop from "./overviewDesktop";
import { fetchAllPrograms } from "../../services/program/programService";

const Overview = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const { can_update } = usePermission();

  const [programs, setPrograms] = useState([]);
  const [showCSModal, setShowCSModal] = useState(true);

  const fetchProgramBanner = async () => {
    try {
      const data = await fetchAllPrograms();

      const mapped = (data || []).map((item) => ({
        id: item.program_id,
        title: item.program_name || item.name || "-",
        image: item.image_url || Placeholder,
        area: item.area_name || "All Area",
      }));

      setPrograms(mapped);
    } catch (e) {
      console.error("Fetch program banner failed:", e);
      setPrograms([]);
    }
  };

  useEffect(() => {
    fetchProgramBanner();
  }, []);

  const sharedProps = {
    programs,
    showCSModal,
    setShowCSModal,
    can_update,
  };

  if (isMobile) return <OverviewMobile {...sharedProps} />;
  if (isTablet) return <OverviewTablet {...sharedProps} />;
  return <OverviewDesktop {...sharedProps} />;
};

export default Overview;
