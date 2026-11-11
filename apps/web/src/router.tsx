import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";

const rootRoute = createRootRoute({ component: Outlet });

// Technical-only route: proves router wiring before product screens exist.
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <h1>Atmos</h1>,
});

export const routeTree = rootRoute.addChildren([indexRoute]);

export const createAppRouter = (history?: Parameters<typeof createRouter>[0]["history"]) =>
  createRouter({ routeTree, history });

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
