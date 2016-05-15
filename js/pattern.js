function IslamicPattern() {

  /** configuration parameters */

  var delta = function (tile,x,y) { return 0; };
  var theta = function (tile,x,y) { return Math.PI/3; };

  var shape = {
    shapes: [], conns: [], position: function(tile) { return [0,0]; }
  };

  var tiles  = [];

  /** computed constants */

  var bb = [[0,1], [0,1]]; /* [[minX, maxX], [minY, maxY]] */
  var scaleX, scaleY;

  function resize() {
    /** find bounding box */
    var shapePoints = d3.merge(shape.shapes);
    var shapeX = d3.extent(shapePoints, getX);
    var shapeY = d3.extent(shapePoints, getY);

    var positions = tiles.map(shape.position);
    var posX = d3.extent(positions, getX);
    var posY = d3.extent(positions, getY);

    bb = [add(shapeX,posX), add(shapeY,posY)];
    scaleX = d3.scale.linear().domain(bb[0]).range([0,1]);
    scaleY = d3.scale.linear().domain(bb[0]).range([0,1]);
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
  function fill(tileset, tile) {
    var p           = shape.shapes[tile];
    var connections = shape.conns[tile];

    var N = p.length;

    var endpoints = [];
    for (var i = 0; i < N; i++) {
      /*           ┌──delta──┐
       * x─────────x─────────x──────────x
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

  var cycle = d3.svg.line()
    .x(getX)
    .y(getY)
    .interpolate("linear-closed")
  ;

  function result(svg) {

    /*
     * var     datum  dom
     * area    0      <g transform="...scale...">
     * tileset tileid   <g class="tileset" transform="...translate...">
     * tile    shapenum   <g class="tile">
     *                      <path class="structure" style="..."/>
     * pattern              <g class="pattern">
     *                        <path/> <path/> ... </g> </g>
     *                    <g class="tile"> ... </g>
     *                    <g class="tile"> ... </g> </g>
     *                  <g class="tileset" transform="...translate...">
     *                  <g class="tileset" transform="...translate...">
     */

    resize();
    var xfactor = svg.attr('width' )/(bb[0][1] - bb[0][0]);
    var yfactor = svg.attr('height')/(bb[1][1] - bb[1][0]);
    var factor  = xfactor < yfactor ? xfactor : yfactor;

    var area  = svg.selectAll('g').data([0]);
    area.exit().remove();
    area.enter().append('g');
    area.attr('transform', 'scale(' + factor + ') '
            + 'translate(' + (-bb[0][0]) + ',' + (-bb[1][0]) + ')')
    ;

    var tileset = area.selectAll('g.tileset').data(tiles);
    tileset.exit().remove();
    tileset.enter().append('g').attr('class','tileset');
    tileset
      .attr('transform', function (t) {
        var p = shape.position(t);
        return 'translate(' + p[0] + ',' + p[1] + ')';
      })
    ;

    var tile = tileset.selectAll('g.tile').data(d3.range(shape.shapes.length));
    tile.exit().remove();
    var newtile = tile.enter().append('g').attr('class','tile');
    newtile.append('path')
      .attr('class','structure')
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", "0.02")
    ;
    newtile.append('g')
      .attr('class','pattern')
    ;

    tile.select("path.structure")
      .attr("d", function (i) { return cycle(shape.shapes[i]); })
    ;

    var pattern = tile.select("g.pattern").selectAll("path").data(function(i) {
      return fill(d3.select(this.parentNode.parentNode.parentNode).datum(), i);
    });
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

  result.shape = function(newShape) {
    shape = newShape;
    return result;
  }

  result.tiles = function(newTiles) {
    tiles = newTiles;
    return result;
  }

  return result;
}
