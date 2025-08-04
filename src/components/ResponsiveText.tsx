"use client";

import { ReactNode } from "react";
import { Text } from "@/once-ui/components";

interface ResponsiveTextProps {
  desktopText: ReactNode;
  mobileText: ReactNode;
}

export const ResponsiveText = ({ desktopText, mobileText }: ResponsiveTextProps) => {
  return (
    <>
      <span className="desktop-text">{desktopText}</span>
      <span className="mobile-text">{mobileText}</span>
      <style jsx>{`
        .desktop-text { display: inherit; }
        .mobile-text { display: none; }
        @media (max-width: 768px) {
          .desktop-text { display: none; }
          .mobile-text { 
            display: inherit; 
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