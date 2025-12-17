export function assertIsNode(e: EventTarget | null): asserts e is Node {
    if (!e || !("nodeType" in e)) {
        throw new Error(`Node expected`);
    }
}

export function isDragEvent(e: Event): e is DragEvent {
    return e.type === "drag";
}