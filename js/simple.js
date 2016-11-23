/*******************************************************************************
 * set up the UI, handle interaction
 */

require(["lib/d3", "pattern", "params", "shapes", "export-svg"],
function(d3, IslamicPattern, Params, Shapes, svgAsLink) {

var pattern = IslamicPattern();
var params  = new Params([
    'thetaTop', 'thetaBot', 'thetaLock', 'thetaSmooth',
    'deltaTop', 'deltaBot', 'deltaLock', 'deltaSmooth',
    'rows', 'cols', 'shape', 'structure'
  ], 'load', 'save');

document.params = params;

function interp(tileset, tile, x, y, top, bot, smooth) {
  if (smooth == "smooth") {
    var scaleY = d3.scale.linear().domain([0,1]).range([top,bot]);
    return scaleY(y);
  }
  else if (smooth == "symmetric") {
    var scaleY = d3.scale.linear().domain([0,params.rows]).range([top,bot]);
    return scaleY(tileset[0]);
  }
}

function delta(tileset, tile, x, y) {
  return interp(tileset, tile, x, y, params.deltaTop, params.deltaBot, params.deltaSmooth);
}

function theta(tileset, tile, x, y) {
  return interp(tileset, tile, x, y, params.thetaTop, params.thetaBot, params.thetaSmooth);
}

pattern.delta(delta);
pattern.theta(theta);

function update() {
  pattern.shape(Shapes[params.shape]);

  document.getElementById("deltaBot"     ).disabled = params.deltaLock;
  document.getElementById("deltaBotValue").disabled = params.deltaLock;

  document.getElementById("thetaBot"     ).disabled = params.thetaLock;
  document.getElementById("thetaBotValue").disabled = params.thetaLock;

  if (params.deltaLock) {
    document.getElementById("deltaBot").value = document.getElementById("deltaTop").value;
    params.deltaBot = params.deltaTop;
  }
  if (params.thetaLock) {
    document.getElementById("thetaBot").value = document.getElementById("thetaTop").value;
    params.thetaBot = params.thetaTop;
  }

  document.getElementById("deltaBotValue").value = new Number(params.deltaBot).toFixed(2);
  document.getElementById("deltaTopValue").value = new Number(params.deltaTop).toFixed(2);
  document.getElementById("thetaBotValue").value = new Number(params.thetaBot).toFixed(2);
  document.getElementById("thetaTopValue").value = new Number(params.thetaTop).toFixed(2);

  tiles = [];
  for (var i = 0; i < params.rows; i++)
    for (var j = 0; j < params.cols; j++)
      tiles.push([i,j]);
  pattern.tiles(tiles);

  d3.select("#drawing").call(pattern);

  d3.selectAll(".structure")
    .attr("style",params.structure ? "stroke:blue" : "stroke:none");

  d3.select("#download").attr("href", svgAsLink(d3.select("#drawing").node()));
}

params.onchange(update);
update();

});

/*
** vim: ts=2 sw=2 ai et
*/
