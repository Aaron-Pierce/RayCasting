function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    background(33);
    document.body.addEventListener("keydown", function(e){
        if(e.keyCode === 70){
            rayCount = ((rayCount >= 1000) ? ((rayCount >= 2000) ? (rayCount >= 5000 ? (200) : 5000) : 2000) : 1000);
        }
    })
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

function withinBounds(x, y, bxl = 0, bxr = window.innerWidth, byl = 0, byr = window.innerHeight) {
    return bxl <= x && x <= bxr && byl <= y && y <= byr;
}

let building = [];


let ws = [];
function mouseClicked() {
    building.push(mouseX);
    building.push(mouseY);
    if (building.length == 4) {
        ws.push(building);
        building = [];
    }
}


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

    let rayLength = Math.max(window.innerWidth, window.innerHeight);
    stroke(255);
    strokeWeight(3);

    for (let a = 0; a <= rayCount; a++) {
         //this allows us to skip the first ray's drawing for the purposes of finding most significant 
         //rays (rays at edges of walls), but we come back to it at index 360 % 360
        i = a % rayCount;

        let theta = i * 2 * PI / rayCount; //compute how many degrees are between each ray to create a full circle

        let xComponent = cos(theta);
        let yComponent = sin(theta);

        //compute endpoint of ray
        let x = mouseX + xComponent * rayLength; 
        let y = mouseY + yComponent * rayLength;

        //initialise to huge value so that everything is smaller
        let minIntersection = Infinity;
        let vI = []; //point of intersection, vectorIntersection
        let vC = null; //wall collided with, vectorCollided
        for (let w of walls) { //we look at every wall for every vector
            //calculate point of intersection
            let itsct = vIntersect([mouseX, mouseY, x, y], w); 
            if (itsct != null) { //if the intersection lies on either ray
                let dis = distance(mouseX, mouseY, itsct[0], itsct[1]); //find the length of the ray just cast
                if (dis < minIntersection) { //if it's the min length, we want that one.
                    //there's a world where two walls are lined up, and a ray might "look" at the back before the front
                    //effectively passing right through the nearer intersection, so we keep track of the minimum distanced intersection
                    minIntersection = dis;
                    vI = itsct;
                    vC = w;
                }
            }
        }

        
        if (a != 0) { //skip the first vector so that our most significant calculations aren't messed up
            if (vI.length != 0) { //if there was a collision
                line(mouseX, mouseY, vI[0], vI[1]); //draw a line from mouse to collision point
                stroke(255, 255, 255); //reset the color
            } else {
                //if no collision, draw full length of ray
                line(mouseX, mouseY, mouseX + xComponent * 2000, mouseY + yComponent * 2000)
                stroke(255, 255, 255);
            }
        }
        stroke(255, 255, 255);

        //set our last collided wall to either null,
        //for no collision, or the wall we hit, so that
        //if the next vector doesn't also have the same
        //collision, we call it a most significant vector,
        //one who changed from their neighbor
        lastCollidedWall = vC;
    }

    //reset the most recent line every frame, so it doesn't hold over
    mostRecentCollidedLine = [];

    //draw the walls
    for (let w of walls) {
        stroke(255, 100, 100);
        strokeWeight(5);
        line(w[0], w[1], w[2], w[3]);
    }
    stroke(255, 255, 255);
    strokeWeight(1);

}