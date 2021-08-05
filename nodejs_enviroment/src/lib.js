function rotate(point, anchor, theta){
    let s = Math.sin(theta);
    let c = Math.cos(theta)

    point.x -= anchor.x;
    point.y -= anchor.y;

    let xnew = point.x * c - point.y * s;
    let ynew = point.x * s + point.y * c;

    point.x = xnew + anchor.x;
    point.y = ynew + anchor.y;
    return point;

}

function dotProduct(vertex1, vertex2) {
    return  (vertex1.x * vertex2.x) + (vertex1.y * vertex2.y);
}

function calcDistance(vertex1, vertex2 = null) {
    if(vertex2 === null)
        return Math.sqrt(vertex1.x**2+vertex1.y**2);
    return Math.sqrt((vertex1.x-vertex2.x)**2 + (vertex1.y-vertex2.y)**2)
}

export {
    calcDistance,
    dotProduct,
    rotate
}