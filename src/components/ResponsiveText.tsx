"use client";

import { ReactNode } from "react";
import { Text } from "@/once-ui/components";

interface ResponsiveTextProps {
  desktopText: ReactNode;
  mobileText: ReactNode;
  mobileFontSize?: string; // Optional prop to adjust mobile font size
  mobileLineHeight?: string; // Optional prop to adjust mobile line height
}

export const ResponsiveText = ({ desktopText, mobileText, mobileFontSize, mobileLineHeight }: ResponsiveTextProps) => {
  return (
    <>
      <span className="desktop-text">{desktopText}</span>
      <span className="mobile-text" style={{ fontSize: mobileFontSize || "1.2rem", lineHeight: mobileLineHeight || "1.5" }}>
        {mobileText}
      </span>
      <style jsx>{`
        .desktop-text { display: inherit; }
        .mobile-text { display: none; }
        @media (max-width: 500px) {
          .desktop-text { display: none; }
          .mobile-text { 
            display: inherit; 
            fillWidth: true;
            // font-size: 1.2rem; /* Adjust as needed for mobile */
            // line-height: 1.5; /* Adjust for better readability */
            /* align everything to center */
            text-align: center !important;
            align-items: center !important;
            justify-content: center !important;
            // color: var(--once-ui-text-color); /* Use your theme's text color */
          }
        }
      `}</style>
    </>
  );
}