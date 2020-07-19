import IData from "./image.js";

class CanvasNode {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  idata: IData;

  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    idata = null as IData
  ) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.idata = idata;
  }

  get area() {
    return this.width * this.height;
  }
}

class Canvas {
  private readonly width: number;
  private readonly height: number;
  private nodes: CanvasNode[];

  constructor(w: number, h: number, border = 0) {
    this.width = w;
    this.height = h;
    this.nodes = [
      new CanvasNode(border, border, w - border, h - border),
      new CanvasNode(0, 0, w, border),
      new CanvasNode(0, 0, border, h),
    ];
    this.clean();
  }

  private removeNode(toRemove: CanvasNode) {
    for (let i = 0; i < this.nodes.length; i++) {
      if (toRemove == this.nodes[i]) {
        return this.nodes.splice(i, i);
      }
    }
  }

  clean() {
    this.nodes = this.nodes.filter((n) => n.area != 0);
    this.nodes.sort((a, b) => a.area - b.area);
  }

  push(idata: IData) {
    this.nodes.forEach(n => {
      let image = idata.img;
      if (n.idata == null && n.width >= image.getWidth() && n.height >= image.getHeight()) {
        let newNode = new CanvasNode(n.x, n.y, image.getWidth(), image.getHeight(), idata);
        let left = new CanvasNode(n.x + image.getWidth(), n.y, n.width - image.getWidth(), image.getHeight());
        let bot = new CanvasNode(n.x, n.y + image.getHeight(), n.width, n.height - image.getHeight());
        this.removeNode(n);
        this.nodes.push(newNode, left, bot);
        this.clean();
        return true;
      }
    });
    return false;
  }
}