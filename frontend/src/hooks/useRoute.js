import { useEffect, useState } from "react";

const routes = {
  dashboard: "/",
  readings: "/readings",
};

function getCurrentRoute() {
  if (window.location.pathname === routes.readings || new URLSearchParams(window.location.search).get("view") === "all") {
    return "readings";
  }

  return "dashboard";
}

export function useRoute() {
  const [route, setRoute] = useState(getCurrentRoute);

  useEffect(() => {
    const handlePopState = () => setRoute(getCurrentRoute());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(nextRoute) {
    const path = routes[nextRoute] || routes.dashboard;
    window.history.pushState({}, "", path);
    setRoute(nextRoute);
  }

  return { route, navigate };
}
