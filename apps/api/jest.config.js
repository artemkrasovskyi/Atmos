export default {
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.json", diagnostics: false }],
  },
  testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/test/**/*.spec.ts"],
};
