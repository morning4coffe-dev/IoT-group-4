import { useEffect, useState } from "react";
import { fetchReadings } from "../api/measurements.js";

export function useMeasurements() {
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchReadings()
      .then((nextReadings) => {
        if (isMounted) setReadings(nextReadings);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { readings, isLoading };
}
