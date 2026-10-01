import { toast } from "sonner";
import { errorMessage } from "./api";

/** An `onError` handler for mutations: says what the API said, or the fallback when it gave no reason. */
export function notifyError(fallback: string) {
  return (error: unknown) => {
    toast.error(errorMessage(error, fallback));
  };
}
