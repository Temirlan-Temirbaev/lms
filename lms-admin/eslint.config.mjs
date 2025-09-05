import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import i18next from "eslint-plugin-i18next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      i18next,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-img-element": "warn",
      "jsx-a11y/alt-text": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react/display-name": "warn",
      "prefer-const": "warn",
      // i18next rules to detect hardcoded strings
      "i18next/no-literal-string": ["warn", {
        "markupOnly": true,
        "ignoreAttribute": ["className", "style", "key", "id", "data-testid", "aria-label", "role", "type", "name", "value", "placeholder", "alt", "src", "href", "target", "rel"]
      }],
    },
  },
];

export default eslintConfig;
