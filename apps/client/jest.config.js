const nextJest = require("next/jest");

// dir apunta a esta app (no a la raíz del monorepo): next/jest lee el
// next.config.js y tsconfig.json de apps/client, así que el mapeo real de
// "@/*" -> "./*" se resuelve automáticamente, sin necesidad de un
// moduleNameMapper manual (que además apuntaría al lugar equivocado si se
// hardcodea, ya que este proyecto no tiene una carpeta src/).
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  // next/jest transpila imports normales vía SWC (por eso "@/lib/cn" resuelve
  // dentro de un componente), pero NO lee tsconfig "paths" para el resolver
  // propio de Jest -- por eso jest.mock("@/...") fallaba sin esto.
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],
};

module.exports = createJestConfig(customJestConfig);
