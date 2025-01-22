import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "src/app/extensions/whatsapp-actions.js",
  output: {
    file: "src/app/extensions/bundle.js",
    format: "cjs",
  },
  plugins: [
    resolve(),
    commonjs(),
    json(),
    babel({
      babelHelpers: "bundled",
      presets: ["@babel/preset-react"], // Ensures JSX transpilation
      extensions: [".js", ".jsx"],
      include: ["src/**"], // Include your source directory
    }),
  ],
};
