/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/playlists",
        permanent: true,
      },
    ];
  },
};
export default config;
