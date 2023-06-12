import main from "../main";


export function random(limit, isInt=false) {
    const w = 32;
    const m = 2**w;
    const min = 0.01;
    const max = 0.99;
    const a = (Math.random() * (max - min) + min) * m;
    const r = new Date().getSeconds();
    
    const result = ((a*r + 1) % m) % limit;
    if (isInt) return Math.floor(result);
    return result;
}

export function reappearOnOtherSide(object) {
    const screenSize = getScreenSize();
    if (object.x > screenSize.x)
        object.x = 0;
    if (object.x < 0)
        object.x = screenSize.x;
    if (object.y > screenSize.y)
        object.y = 0;
    if (object.y < 0)
        object.y = screenSize.y;
}

export function getScreenSize() {
    return { x: main.config.width, y: main.config.height };
}
