function IslamicPattern() {

  var delta = function () {
    return 0;
  }

  var theta = function () {
    return Math.PI/3;
  }

  var offsetToPos = function (o) {
    return o;
  }

  var rows = 10;
  var cols = 20;

  var shape = [];
  var offsets = [];
  var conn = [];

  var minX, maxX, minY, maxY;

  /**
   *   p[0] _____ p[1]
   *       /_/∧\_\
   *      /   |   \
   *p[5] /\ angle /\ p[2]
   *     \/       \/
   *      \__   __/ <--- delta
   *       \_\_/_/
   *  p[4]      p[3]
   *
   * the inside edges are output by fill with
   *    border: p
   *    theta:  function (p) { return degreesToRadians(60); }
   *    delta:  function (p) { return 0.3; }
   *    connections: [1,2,3,4,5,0]
   *
   * - border is a list of points forming the polygon border.
   * - theta is a function giving the angle between the edges at the contact point
   * - delta is a function giving the width of the gap between edges at the contact
   *   point
   * - connections is an array of indices; one for each edge, conn[i] = j then the
   *     connection coming out of edge i should connect to edge j.
   *
   * delta and theta's inputs should be scaled similarly to p
   * delta's outputs should be scaled similarly to p
   * theta's outputs should be in [0, π]
   */
  function fill(p, offset, theta, delta, connections) {
    var N = p.length;
  
    var endpoints = [];
    for (var i = 0; i < N; i++) {
      /*           |<-delta->|
       * x---------x---------x----------x
       * p[i]   e[i][0]   e[i][1]    p[i+1]
       */
      var p0 = p[i], p1 = p[(i+1)%N];
  
      var center = add(smult(.5, p0), smult(.5, p1));
  
      var diff = sub(p1,p0);
      var dist = Math.sqrt(dot(diff,diff));
      var unit = smult(delta(offset,center)/(dist*2), diff);
  
      endpoints.push([sub(center, unit), add(center,unit)]);
    }
  
    var result = [];
    for (var i = 0; i < N; i++) {
      var e0 = endpoints[i][1], e1 = endpoints[connections[i]][0];
      var p0 = p[(i+1)%N],      p1 = p[connections[i]];
  
      /*         ?          |
       *         o----------x e1
       *        /        \θ1|
       *       /\         \ |
       *      /θ0\          x p1
       *  ___x______x     
       *    e0      p0
       */
  
      var d0 = rotate(sub(p0,e0),  theta(offset, e0)),
  	d1 = rotate(sub(p1,e1), -theta(offset, e1));
  
      result.push(e0);
      result.push(intersect(e0,d0,e1,d1));
      result.push(e1);
    }
  
    return result;
  }
  
  /******************************************************************************/
  /******************************************************************************/
  /******************************************************************************/
  
  var line = d3.svg.line()
    .x(getX)
    .y(getY)
    .interpolate("linear-closed")
  ;
  
  function pointsOf(offset) {
    return line(shape.map(function (p) { return add(p, offsetToPos(offset)); }));
  }

  function wrap(f) {
    var xscale = d3.scale.linear().domain([minX,maxX]).range([0,1]);
    var yscale = d3.scale.linear().domain([minY,maxY]).range([0,1]);

    return function(o,p) { return f(o[0],o[1],xscale(p[0]),yscale(p[1])); };
  }

  function fillPointsOf(offset) {
    var p = shape.map(function(p) { return add(p,offsetToPos(offset)); });
    var f = fill(p, offset, wrap(theta), wrap(delta), conn);
  
    return line(f);
  }
  
  /* draw the pattern ***********************************************************/
  
  function result(svg) {
    minX = d3.min(shape, getX) + d3.min(positions, getX);
    maxX = d3.max(shape, getX) + d3.max(positions, getX);
    minY = d3.min(shape, getY) + d3.min(positions, getY);
    maxY = d3.max(shape, getY) + d3.max(positions, getY);

    var xfactor = svg.attr('width' )/(maxX - minX);
    var yfactor = svg.attr('height')/(maxY - minY);
    var factor  = xfactor < yfactor ? xfactor : yfactor;

    var area  = svg.selectAll('g').data([0]);
    
    area.enter().append('g');
  
    area
      .attr('transform', 'scale(' + factor + ') '
  		   + 'translate(' + (-minX+.1) + ',' + (-minY+.1) + ')')
    ;
    
    var path = area.selectAll('path').data(offsets);

    path.enter().append("path")
      .attr("class", "fill")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", "0.02")
    ;
    path.attr("d", fillPointsOf);

    path.enter().append("path")
      .attr("class", "structure")
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", "0.02")
      .attr("d", pointsOf)
    ;
    
    
    d3.select("#download")
      .attr("href", svgAsLink(d3.select("svg").node()))
    ;
  }

  /* Getters and setters ******************************************************/

  result.delta = function(newDelta) {
    delta = newDelta;
    return result;
  }

  result.theta = function(newTheta) {
    theta = newTheta;
    return result;
  }

  result.rows = function(r) {
    rows = r;
    return result;
  }

  result.cols = function(r) {
    cols = r;
    return result;
  }

  result.shape = function(s) {
    shape = s;
    return result;
  }

  result.offsets = function(o) {
    offsets = o;
    return result;
  }

  result.offsetToPos = function(f) {
    offsetToPos = f;
    return result;
  }

  result.connections = function(c) {
    conn = c;
    return result;
  }

  return result;
}
