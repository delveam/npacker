class CanvasNode {
    constructor(x, y, w, h, img=null, name="", trimW=0, trimH=0) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.img = img;
        this.name = name;
        this.trimW = trimW;
        this.trimH = trimH;
    }

    get area() {
        return this.width * this.height;
    }
}

class Canvas {
    constructor(w, h, opts) {
        this.width = w;
        this.height = h;
        this.nodes = [
            new CanvasNode(opts.border, opts.border, w - opts.border, h - opts.border),
            new CanvasNode(0, 0, w, border),
            new CanvasNode(0, 0, border, h)
        ];
        this.clean();
    }

    clean() {
        this.nodes = this.nodes.filter(n => n.area != 0);
    }

    push(id) {
    }
}