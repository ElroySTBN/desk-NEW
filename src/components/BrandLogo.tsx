import React from "react";

type BrandLogoProps = {
  className?: string;
  alt?: string;
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ className, alt = "RaiseMed.IA" }) => {
  return (
    <img
      src="/logosvg-cropped.svg"
      alt={alt}
      className={className}
    />
  );
};

export default BrandLogo;


