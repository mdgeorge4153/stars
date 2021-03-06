
define(['vec','lib/d3'], function(vec,d3) {

function IslamicPattern() {

  /** configuration parameters */

  var delta = function (tileset,tile,x,y) { return 0; };
  var theta = function (tileset,tile,x,y) { return Math.PI/3; };

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
    var shapeX = d3.extent(shapePoints, vec.getX);
    var shapeY = d3.extent(shapePoints, vec.getY);

    var positions = tiles.map(shape.position);
    var posX = d3.extent(positions, vec.getX);
    var posY = d3.extent(positions, vec.getY);

    bb = [vec.add(shapeX,posX), vec.add(shapeY,posY)];
    scaleX = d3.scale.linear().domain(bb[0]).range([0,1]);
    scaleY = d3.scale.linear().domain(bb[0]).range([0,1]);
  }

  /****************************************************************************/

  /**
   * tileset: the id of the tileset
   * tile: an integer, the nth shape in the tileset
   *
   * returns an array of lines filling the nth tile.
   * coordinates are relative to the tile
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

      var center = vec.add(vec.smult(.5, p0), vec.smult(.5, p1));
      var absCenter = vec.add(center, shape.position(tileset));

      var diff  = vec.sub(p1,p0);
      var dist  = Math.sqrt(vec.dot(diff,diff));
      var d     = delta(tileset, tile, scaleX(absCenter[0]), scaleY(absCenter[1]));
      var unit  = vec.smult(d/(dist*2), diff);

      endpoints.push([vec.sub(center, unit), vec.add(center,unit)]);
    }

    var result = [];
    for (var i = 0; i < N; i++) {
      var e0 = endpoints[i][1], e1 = endpoints[connections[i]][0];
      var p0 = p[(i+1)%N],      p1 = p[connections[i]];

      /*         ?          │
       *         o──────────x e1
       *        ╱        ╲θ1│
       *       ╱╲         ╲ │
       *      ╱θ0╲          x p1
       *  ───x──────x
       *    e0      p0
       */

      var absE0 = vec.add(e0, shape.position(tileset));
      var absE1 = vec.add(e1, shape.position(tileset));
      var d0 = vec.rotate(vec.sub(p0,e0),  theta(tileset, tile, scaleX(absE0[0]), scaleY(absE0[1]))),
          d1 = vec.rotate(vec.sub(p1,e1), -theta(tileset, tile, scaleY(absE1[0]), scaleX(absE1[1])));

      result.push([e0,vec.intersect(e0,d0,e1,d1),e1]);
    }

    return result;
  }

  /* draw the pattern ***********************************************************/

  var cycle = d3.svg.line()
    .x(vec.getX)
    .y(vec.getY)
    .interpolate("linear-closed")
  ;

  var line = d3.svg.line()
    .x(vec.getX)
    .y(vec.getY)
    .interpolate('linear')
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
    pattern.enter().append("path");

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

return IslamicPattern;

});

/*
** vim: ts=2 sw=2 ai et
*/
