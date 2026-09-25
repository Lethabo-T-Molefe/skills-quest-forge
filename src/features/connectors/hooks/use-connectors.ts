import { useSuspenseQuery } from "@tanstack/react-query";
import { connectorsQuery } from "../api/connectors";

export function useConnectors() {
  return useSuspenseQuery(connectorsQuery()).data;
}
