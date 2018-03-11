import Point from './point';
import {distance, middlePoint} from './utils';

const FLATNESS_FACTOR = 1.001;

function isCubicBezierFlat(p0, p1, p2, p3) {
    return (distance(p0, p1) + distance(p1, p2) + distance(p2, p3)) <= FLATNESS_FACTOR * distance(p0, p3);
}

function isQuadraticBezierFlat(p0, p1, p2) {
    return (distance(p0, p1) + distance(p1, p2)) <= FLATNESS_FACTOR * distance(p0, p2);
}

function discretizeCubicBezier(p0, p1, p2, p3) {
    if (isCubicBezierFlat(p0, p1, p2, p3)) {
        return [new Point(p0.x, p0.y), new Point(p3.x, p3.y)];
    }

    let points = [];
    const p01 = middlePoint(p0, p1);
    const p12 = middlePoint(p1, p2);
    const p23 = middlePoint(p2, p3);

    const p012 = middlePoint(p01, p12);
    const p123 = middlePoint(p12, p23);
    const p0123 = middlePoint(p012, p123);

    points = points.concat(discretizeCubicBezier(p0, p01, p012, p0123));
    points = points.concat(discretizeCubicBezier(p0123, p123, p23, p3));

    return points;
}

function discretizeQuadraticBezier(p0, p1, p2) {
    if (isQuadraticBezierFlat(p0, p1, p2)) {
        return [new Point(p0.x, p0.y), new Point(p2.x, p2.y)];
    }

    let points = [];
    const p01 = middlePoint(p0, p1);
    const p12 = middlePoint(p1, p2);
    const p012 = middlePoint(p01, p12);

    points = points.concat(discretizeQuadraticBezier(p0, p01, p012));
    points = points.concat(discretizeQuadraticBezier(p012, p12, p2));

    return points;
}

export {
    discretizeCubicBezier,
    discretizeQuadraticBezier
};
