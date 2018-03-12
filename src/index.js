const {parseSVG, makeAbsolute} = require('svg-path-parser');
const arcToBezier = require('svg-arc-to-cubic-bezier/dist/svg-points-to-cubic-bezier');
const Point = require('./point');
const {discretizeCubicBezier, discretizeQuadraticBezier} = require('./bezier');

function splitToCommands(path) {
    const commands = parseSVG(path);
    makeAbsolute(commands);
    return commands;
}

function discretizeCommand(command, prevCommand) {
    switch (command.code) {
        case 'M':
        case 'L':
        case 'H':
        case 'V':
        case 'Z':
            return [new Point(command.x, command.y)];
        case 'C':
            return discretizeCubicBezier(
                new Point(command.x0, command.y0),
                new Point(command.x1, command.y1),
                new Point(command.x2, command.y2),
                new Point(command.x, command.y)
            );
        case 'S':
            if (prevCommand.code === 'S' || prevCommand.code === 'C') {
                return discretizeCubicBezier(
                    new Point(command.x0, command.y0),
                    new Point(2 * command.x0 - prevCommand.x2, 2 * command.y0 - prevCommand.y2),
                    new Point(command.x2, command.y2),
                    new Point(command.x, command.y)
                );
            }

            return discretizeQuadraticBezier(
                new Point(command.x0, command.y0),
                new Point(command.x2, command.y2),
                new Point(command.x, command.y)
            );
        case 'Q':
            return discretizeQuadraticBezier(
                new Point(command.x0, command.y0),
                new Point(command.x1, command.y1),
                new Point(command.x, command.y)
            );
        case 'T':
            if (prevCommand.code === 'Q' || prevCommand.code === 'T') {
                return discretizeQuadraticBezier(
                    new Point(command.x0, command.y0),
                    new Point(2 * command.x0 - (prevCommand.x1 || prevCommand.x), 2 * command.y0 - (prevCommand.y1 || prevCommand.y)),
                    new Point(command.x, command.y)
                );
            }

            return [new Point(command.x, command.y)];
        case 'A':
            return arcToBezier({
                px: command.x0,
                py: command.y0,
                cx: command.x,
                cy: command.y,
                rx: command.rx,
                ry: command.ry,
                xAxisRotation: command.xAxisRotation,
                largeArcFlag: command.largeArc,
                sweepFlag: command.sweep
            }).reduce((points, curve) => {
                const start = points[points.length - 1];
                return points.concat(discretizeCubicBezier(
                    new Point(start.x, start.y),
                    new Point(curve.x1, curve.y1),
                    new Point(curve.x2, curve.y2),
                    new Point(curve.x, curve.y)
                ));
            }, [new Point(command.x0, command.y0)]);
        default:
            console.log(`Discretize SVG Path: Unsupported command ${command.code}`);
            return [];
    }
}

function discretizePath(path) {
    const commands = splitToCommands(path);
    return commands
        .reduce((points, command, index) => {
            return points.concat(discretizeCommand(command, commands[index - 1]));
        }, [])
        .map((p) => p.toArray());
}

module.exports = discretizePath;