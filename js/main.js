/*******************************************************************************
 * set up the UI, handle interaction
 */

require.config({
  paths: { "jquery" : "lib/jquery"
         , "jquery-ui" : "lib/jquery-ui"
         },
});

require(["lib/d3","export-svg","pattern","params","shapes","jquery-ui"],
function(d3,svgAsLink,IslamicPattern,Params,Shapes,jqi) {

/******************************************************************************/

var pattern = IslamicPattern();
var params  = new Params(['shape', 'rows', 'cols', 's1', 's2', 'delta', 'theta','style'],'load','save');

function update() {
  pattern.shape(Shapes[params.shape]);

  tiles = [];
  for (var i = 0; i < params.rows; i++)
    for (var j = 0; j < params.cols; j++)
      tiles.push([i,j]);
  pattern.tiles(tiles);

  pattern.delta(new Function('tile','x','y',params.delta));
  pattern.theta(new Function('tile','x','y',params.theta));

  document.getElementById('svg-style').innerHTML = params.style;

  d3.select("#drawing").call(pattern);
  d3.select("#download").attr("href", svgAsLink(d3.select("#drawing").node()))

  d3.select("#s1value").text(d3.select('#s1').node().value);
  d3.select("#s2value").text(d3.select('#s2').node().value);
}

params.onchange(update);
update();

$(function() {
  console.log('foo');
  $( '#controls' ).tabs();
  $( '#save' ).unbind('click');
  $( '#load' ).unbind('click');
});

});


