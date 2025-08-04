"use client";

import { DebugControls } from "@/components";
import { useDebug } from "./DebugProvider";

export function ConditionalDebugControls() {
    const { debug } = useDebug();

    return debug ? <DebugControls /> : null;
}
