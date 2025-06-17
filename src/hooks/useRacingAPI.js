import { useState, useEffect } from "react";

// Import the Racing API class
import { RacingFootballData } from "../utils/footballAPIData";

export const useRacingAPI = () => {
  const [racingAPI, setRacingAPI] = useState(null);

  useEffect(() => {
    // Initialize the API
    const api = new RacingFootballData();
    setRacingAPI(api);
  }, []);

  return { racingAPI };
};
