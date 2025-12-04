// mod.ts

// ---------- Factory & Fragment -----------

interface VNode {
    tag: string | Function | null;
    props: Record<string, any> | null;
    children: any;
}

// JSX Factory
export function CappaFactory(
    tag: Function | string,
    props: Record<string, any> | null,
    ...children: (VNode | string)[]
): VNode {
    return {
        tag,
        props,
        children,
    };
}

// Fragment as a function
export function CappaFragment({ children }: { children?: any }): VNode {
    return { tag: null, props: {}, children };
}

// ---------- Rendering -----------

const voidElements: Set<string> = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
]);

function escapeHtml(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderAttributes(props: Record<string, any> | null) {
    return props
        ? " " +
            Object.entries(props).filter(([_, v]) => v != null && v !== false)
                .map(([k, v]) => {
                    if (k === "className") return `class="${String(v)}"`;
                    if (typeof v === "boolean") return v ? k : `${k}="false"`;
                    return `${k}="${String(v)}"`;
                }).join(" ")
        : "";
}

// Render a VNode to a string
export function renderToString(node: Array<any> | VNode | any): string {
    if (node === null) {console.error("node is null???"); return "";}

    // If array, render each child
    if (Array.isArray(node)) {
        return node.map(renderToString).join("");
    }

    if (isVNode(node)) {
        return renderVNode(node);
    }

    return escapeHtml(String(node));
}

function isVNode(x: any): boolean {
    if (typeof x !== "object") return false;
    if (!("tag" in x && "props" in x && "children" in x)) return false;
    return true;
}

function renderVNode(node: VNode): string {
    const tag = node.tag;

    // VNode with tag === null (Fragment)
    if (tag === null) {
        return renderToString(node.children);
    }

    // Functional node
    if (typeof tag === "function") {
        const out = tag({ ...node.props, children: node.children });
        return renderToString(out);
    }

    // HTML element
    if (typeof tag === "string") {
        // Void element
        if (voidElements.has(tag)) {
            const attrs = renderAttributes(node.props);
            return `<${tag}${attrs}/>`;
        }

        const attrs = renderAttributes(node.props);
        const inner = renderToString(node.children);

        return `<${tag}${attrs}>${inner}</${tag}>`;
    }

    console.error("type of tag was not null, function or string!");
    return "";
}