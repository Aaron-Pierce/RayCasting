function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    background(33);
}

function randX() {
    return Math.floor(Math.random() * window.innerWidth);
}

function randY() {
    return Math.floor(Math.random() * window.innerHeight);
}

function randWall() {
    let randx1 = randX();
    let randy1 = randY();
    let randx2 = randX();
    let randy2 = randY();

    return [Math.min(randx1, randx2), Math.min(randy1, randy2), Math.max(randx1, randx2), Math.max(randy1, randy2)];
}

let walls = [
    randWall(),
    randWall(),
    randWall(),
    randWall(),
]


function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function slope(x1, y1, x2, y2) {
    return (y2 - y1) / (x2 - x1);
}

function slopeOfWall(wall) {
    return slope(wall[0], wall[1], wall[2], wall[3]);
}

function length(w) {
    return distance(w[0], w[1], w[2], w[3]);
}

Array.prototype.equals = function (arr2) {
    if (this.length != arr2.length) return false;
    for (let i = 0; i < this.length; i++) {
        if (this[i] != arr2[i]) return false;
    }
    return true;
}

let mostRecentCollidedLine = [];

function collides(x, y) {
    let threshold = 5;
    for (let w of walls) {
        // console.log(w, ":");
        let dy = (w[3] - w[1]) / length(w);
        let dx = (w[2] - w[0]) / length(w);
        // console.log(dy, dx, dy/dx, slopeOfWall(w));
        // let yMultiple = Math.abs((y - w[1]) % dy) < 1;
        // let yMultiple = false;
        // let xMultiple = Math.abs((x - w[0]) % dx) < 1;
        // console.log(yMultiple, xMultiple);
        // let xMultiple = true;
        // console.log(yMultiple, xMultiple);
        // console.log(slopeOfWall(w) * (x - w[0]), (y-w[1]));
        if (w[0] <= x && x <= w[2] && w[1] <= y && y <= w[3]) {
            if (Math.abs(dy * (x - w[0]) - dx * (y - w[1])) < 1) {
                mostRecentCollidedLine = w;
                return true;
            }
        }
    }
    return false;
}

function pointOnLine(p1, v1) {
    let vxl, vxr;
    if (v1[0] > v1[2]) {
        vxl = v1[2];
        vxr = v1[0]
    } else {
        vxl = v1[0]
        vxr = v1[2];
    }
    if (v1[1] > v1[3]) {
        vyl = v1[3];
        vyr = v1[1]
    } else {
        vyl = v1[1]
        vyr = v1[3];
    }

    if (vxl <= p1[0] && p1[0] <= vxr) {
        if (vyl <= p1[1] && p1[1] <= vyr) {
            return true;
        }
    }
    return false;
}

function vIntersect(v1, v2) {
    let p1 = [v1[0], v1[1]];
    let m1 = slopeOfWall(v1);
    let p2 = [v2[0], v2[1]];
    let m2 = slopeOfWall(v2);
    if (m1 == m2) {
        return null;
    }

    if (m1 === Infinity || m1 === -Infinity || isNaN(m1) || m1 > 50000) {
        // console.log("inf");
        let itsct = [p1[0], m2 * (p1[0] - p2[0]) + p2[1]];
        if (!pointOnLine(itsct, v1) || !pointOnLine(itsct, v2)) return null;
        return itsct;
    } else if (m1 === Infinity || m1 === -Infinity || isNaN(m1) || m2 > 50000) {
        // console.log("inf");
        let itsct = [p2[0], m1 * (p2[0] - p1[0]) + p1[1]];
        if (!pointOnLine(itsct, v1) || !pointOnLine(itsct, v2)) return null;
        return itsct;
    } else {
        let xAtItsct = (p2[1] - p1[1] + (m1 * p1[0]) - (m2 * p2[0])) / (m1 - m2);
        let yAtItsct = m1 * (xAtItsct - p1[0]) + p1[1];
        // console.log((m1 - m2));
        if (!pointOnLine([xAtItsct, yAtItsct], v1) || !pointOnLine([xAtItsct, yAtItsct], v2)) return null;
        return [xAtItsct, yAtItsct];
    }

}

function collidesLine(xm, ym, sm) {
    for (let w of walls) {
        let xAtIntersect = ((slopeOfWall(w) * w[0]) - (sm * xm) - w[1] + ym) / (slopeOfWall(w) - sm);
        // console.log(xAtIntersect)
        if (w[0] <= xAtIntersect && xAtIntersect <= w[2]) {
            return xAtIntersect;
        }
    }
    return null;
}

function withinBounds(x, y, bxl = 0, bxr = window.innerWidth, byl = 0, byr = window.innerHeight) {
    return bxl <= x && x <= bxr && byl <= y && y <= byr;
}

let building = [];

function mouseClicked() {
    building.push(mouseX);
    building.push(mouseY);
    if (building.length == 4) {
        ws.push(building);
        building = [];
    }
}

let ws = [];

function fn(){
    alert("submit");
}

function change(e){
    console.log(e)
    // alert(e.value);
    e.background = "#000";
}

let rayCount = 50;
let rayWeight = 3;
function draw() {
    frameRate(60);
    background(33);
    ellipseMode("CENTER");

    stroke(255);
    // ellipse(mouseX, mouseY, 5);

    let rayLength = 250;
    stroke(255);
    strokeWeight(3);

    let collidedLast = -1;
    let lastCollidedWall = [];
    for (let a = 0; a <= rayCount; a++) {
        i = a % rayCount;
        let theta = i * 2 * PI / rayCount;
        // console.log(theta);
        let xComponent = cos(theta);
        let yComponent = sin(theta);
        let x = mouseX + xComponent * 2000;
        let y = mouseY + yComponent * 2000;


        let minIntersection = Infinity;
        let vI = [];
        let vC = null;
        let collided = false;
        for (let w of walls) {
            let itsct = vIntersect([mouseX, mouseY, x, y], w);
            if (itsct != null) {
                let dis = distance(mouseX, mouseY, itsct[0], itsct[1]);
                if (dis < minIntersection) {
                    minIntersection = dis;
                    vI = itsct;
                    vC = w;
                }
            }
        }

        if (a != 0) {
            if (vI.length != 0) {
                // if (vC != lastCollidedWall)
                line(mouseX, mouseY, vI[0], vI[1]);
                stroke(255, 255, 255);
            } else {
                // if (vC != lastCollidedWall)
                line(mouseX, mouseY, mouseX + xComponent * 2000, mouseY + yComponent * 2000)
                stroke(255, 255, 255);
            }
        }
        stroke(255, 255, 255);

        lastCollidedWall = vC;
        // if (withinBounds(x, y)) collided = true;
        // // if(mouseY == y) console.log(collided != collidedLast, !lastCollidedWall.equals(mostRecentCollidedLine));
        // if (a != 0 && (collided != collidedLast || !lastCollidedWall.equals(mostRecentCollidedLine))) {
        //     stroke(100, 255, 100);
        // } else {
        //     stroke(100, 100, 100);
        // }
        // line(mouseX, mouseY, x, y);
        // collidedLast = collided;
        // lastCollidedWall = mostRecentCollidedLine;
    }

    mostRecentCollidedLine = [];

    for (let w of walls) {
        stroke(255, 100, 100);
        strokeWeight(5);
        line(w[0], w[1], w[2], w[3]);
    }
    stroke(255, 255, 255);
    strokeWeight(1);

}