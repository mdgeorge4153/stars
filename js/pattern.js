function IslamicPattern() {

  /** configuration parameters */

  var delta = function (tile,x,y) { return 0; };
  var theta = function (tile,x,y) { return Math.PI/3; };

  var points = function(tile) { return tile;  };
  var conns  = function(tile) { return []; };
  var tiles  = [];

  /** bounding box */
  var bb = {x: 0, y: 0, width: 0, height: 0};

  /** computed constants */

  var scaleX, scaleY;

  function update() {
    scaleX = d3.scale.linear().domain([bb.x, bb.x + bb.width ]).range([0,1]);
    scaleY = d3.scale.linear().domain([bb.y, bb.y + bb.height]).range([0,1]);
  }

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
  function fill(tile) {
    var p           = points(tile);
    var connections = conns(tile);

    var N = p.length;

    var endpoints = [];
    for (var i = 0; i < N; i++) {
      /*           |<-delta->|
       * x---------x---------x----------x
       * p[i]   e[i][0]   e[i][1]    p[i+1]
       */
      var p0 = p[i], p1 = p[(i+1)%N];

      var center = add(smult(.5, p0), smult(.5, p1));

      var diff  = sub(p1,p0);
      var dist  = Math.sqrt(dot(diff,diff));
      var d     = delta(tile, scaleX(center[0]), scaleY(center[1]));
      var unit  = smult(d/(dist*2), diff);

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

      var d0 = rotate(sub(p0,e0),  theta(tile, scaleX(e0[0]), scaleY(e0[1]))),
          d1 = rotate(sub(p1,e1), -theta(tile, scaleY(e1[0]), scaleX(e1[1])));

      result.push([p0,e0,intersect(e0,d0,e1,d1),e1]);
    }

    return result;
  }

  /* draw the pattern ***********************************************************/

  function result(svg) {

    var xfactor = svg.attr('width' )/bb.width;
    var yfactor = svg.attr('height')/bb.height;
    var factor  = xfactor < yfactor ? xfactor : yfactor;

    var area  = svg.selectAll('g').data([0]);
    area.exit().remove();

    area.enter().append('g');

    area
      .attr('transform', 'scale(' + factor + ') '
          + 'translate(' + (-bb.x) + ',' + (-bb.y) + ')')
    ;

    var tile = area.selectAll('g.tile').data(tiles);
    tile.exit().remove();

    var g = tile.enter().append("g")
      .attr("class", "tile")
    ;

    g.append("path")
      .attr("class", "structure")
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", "0.02")
    ;

    var cycle = d3.svg.line()
      .x(getX)
      .y(getY)
      .interpolate("linear-closed")
    ;

    tile.select("path.structure")
      .attr("d", function (tile) { return cycle(points(tile)) })
    ;

    g.append("g")
      .attr("class", "pattern")
    ;

    var pattern = tile.select("g.pattern").selectAll("path").data(fill);
    pattern.exit().remove();

    pattern.enter().append("path")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", "0.02")
    ;

    var line = d3.svg.line().x(getX).y(getY).interpolate('linear');
    pattern
      .attr("d", line)
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

  result.points = function(newPoints) {
    points = newPoints;
    return result;
  }

  result.connections = function(newConns) {
    conns = newConns;
    return result;
  }

  result.tiles = function(newTiles) {
    tiles = newTiles;
    return result;
  }

  result.boundingBox = function(newBB) {
    bb = newBB;
    update();
    return result;
  }

  return result;
}
