// next.config.js
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

const nextConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ["javascript", "typescript", "json", "css", "html"],
        })
      );

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
