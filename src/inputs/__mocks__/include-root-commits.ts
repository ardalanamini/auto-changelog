import { jest } from "@jest/globals";

export const includeRootCommits = jest.fn(() => "false").mockName("includeRootCommits");
