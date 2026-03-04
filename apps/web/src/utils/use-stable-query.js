import { useQuery, } from "@tanstack/react-query";
import { useRef } from "react";
const ERROR_THRESHOLD = 3;
/**
 * Wrapper around useQuery that preserves the last settled state while refetching,
 * and requires multiple consecutive errors before surfacing an error state.
 */
export function useStableQuery(options) {
    const result = useQuery(options);
    const stableResult = useRef(result);
    const consecutiveErrors = useRef(0);
    if (!result.isFetching) {
        if (result.isError) {
            consecutiveErrors.current++;
            if (consecutiveErrors.current >= ERROR_THRESHOLD) {
                stableResult.current = result;
            }
        }
        else {
            consecutiveErrors.current = 0;
            stableResult.current = result;
        }
    }
    return result.isFetching
        ? { ...stableResult.current, isFetching: true }
        : stableResult.current;
}
