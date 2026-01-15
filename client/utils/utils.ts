export function assertIsNode(e: EventTarget | null): asserts e is Node {
    if (!e || !("nodeType" in e)) {
        throw new Error(`Node expected`);
    }
}

export function isDragEvent(e: Event): e is DragEvent {
    return e.type === "drag";
}

export function formatDateTime(date : string | undefined) {
    if (date) {
        return `${date.substring(5, 7)}/${date.substring(8, 10)}/${date.substring(0,4)}`;
    }

    return "";
}

export function hexToHSL(hex : string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (result) {
        const r = parseInt(result[1], 16)/255;
        const g = parseInt(result[2], 16)/255;
        const b = parseInt(result[3], 16)/255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max == min){
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            if (h) h /= 6;
        }

        if (h) h = Math.round(h*360);
        s = Math.round(s*100);
        l = Math.round(l*100);

        return { h, s, l };
    }
}