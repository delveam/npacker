import { ImageData } from "./image.js";

class CanvasNode {
  private readonly x: number;
  private readonly y: number;
  private readonly width: number;
  private readonly height: number;
  img: ImageData;

  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    img = null as ImageData
  ) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.img = img;
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

  clean() {
    this.nodes = this.nodes.filter((n) => n.area != 0);
  }

  push(idata: ImageData) {}
}
