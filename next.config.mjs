import mdx from "@next/mdx";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["next-mdx-remote"],
  turbopack: {
    // ...
  },
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      // new URL('https://green-wall.leoku.dev/api/og/share/likhith-ts?start=2025&theme=Midnight'),
      new URL('https://repository-images.githubusercontent.com/786079491/**'),
    ],
  },
  experimental: {
    // webVitals: true
  },
  swcMinify: false,
  
};

export default withMDX(nextConfig);
