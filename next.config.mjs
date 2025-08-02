import mdx from "@next/mdx";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["next-mdx-remote"],
  // turbopack: {
  //   // ...
  // },
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      new URL('https://avatars.githubusercontent.com/u/'),
      new URL('https://udemy-certificate.s3.amazonaws.com/image/'),
    ],
  },
  // experimental: {
  //   // webVitals: true
  // },
  // swcMinify: false,
  
};

export default withMDX(nextConfig);
