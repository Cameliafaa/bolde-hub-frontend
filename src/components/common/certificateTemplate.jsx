import React from "react";
import CertificateBg from "../../assets/images/certificate/certificate.png";

const CertificateTemplate = React.forwardRef(({ username }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: "1123px",
        height: "794px",
        position: "relative",
      }}
    >
      {/* BACKGROUND */}
      <img
        src={CertificateBg}
        alt="certificate"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          zIndex: 1,
        }}
      />
      {/* USERNAME */}
      <div
        style={{
          position: "absolute",
          top: "335px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "70px",
          fontFamily: "'Great Vibes', cursive",
          color: "#1B7B83",
          zIndex: 10,
          whiteSpace: "nowrap",
        }}
      >
        {" "}
        {username}
      </div>{" "}
    </div>
  );
});

export default CertificateTemplate;
