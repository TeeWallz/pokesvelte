export function paginate({
    current,
    max,
}: {
    current: number;
    max: number;
    pageCount: number;
}): {
    current: number;
    prev: number | null;
    next: number | null;
    items: (string | number)[];
} {
    current = Math.max(1, current);
    let prev = current === 1 ? null : current - 1,
        next = current === max ? null : current + 1,
        items: (string | number)[] = [1];

    if (current === 1 && max === 1) return { current, prev, next, items };
    if (current > 4) items.push("…");

    let r = 1,
        r1 = current - r,
        r2 = current + r;

    for (let i = r1 > 2 ? r1 : 2; i <= Math.min(max, r2); i++) items.push(i);

    if (r2 + 1 < max) items.push("…");
    if (r2 < max) items.push(max);

    return { current, prev, next, items };
}
