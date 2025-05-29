'use client';
// this custom component is created (by likhith U) to make cursor mask to work only in /root page
import { Background } from "@/once-ui/components";
import { effects } from "@/app/resources";
import { usePathname } from 'next/navigation';
import { opacity, SpacingToken } from "@/once-ui/types";

export function BackgroundEffects() {
  const pathname = usePathname();
  const listofPaths =['/']
  //   const isMaskEnabled = pathname === '/';
  const isMaskEnabled = listofPaths.includes(pathname);

  return (
    <Background
              position="fixed"
              mask={{
                x: effects.mask.x,
                y: effects.mask.y,
                radius: effects.mask.radius,
                cursor: isMaskEnabled
                // cursor: effects.mask.cursor
              }}
              gradient={{
                display: effects.gradient.display,
                opacity: effects.gradient.opacity as opacity,
                x: effects.gradient.x,
                y: effects.gradient.y,
                width: effects.gradient.width,
                height: effects.gradient.height,
                tilt: effects.gradient.tilt,
                colorStart: effects.gradient.colorStart,
                colorEnd: effects.gradient.colorEnd,
              }}
              dots={{
                display: effects.dots.display,
                opacity: effects.dots.opacity as opacity,
                size: effects.dots.size as SpacingToken,
                color: effects.dots.color,
              }}
              grid={{
                display: effects.grid.display,
                opacity: effects.grid.opacity as opacity,
                color: effects.grid.color,
                width: effects.grid.width,
                height: effects.grid.height,
              }}
              lines={{
                display: effects.lines.display,
                opacity: effects.lines.opacity as opacity,
                size: effects.lines.size as SpacingToken,
                thickness: effects.lines.thickness,
                angle: effects.lines.angle,
                color: effects.lines.color,
              }}
            />
  );
}