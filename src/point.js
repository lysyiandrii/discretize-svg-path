class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toArray() {
        return [this.x, this.y];
    }

    isEqual(point) {
        return this.x === point.x && this.y === point.y
    }
}

module.exports = Point;