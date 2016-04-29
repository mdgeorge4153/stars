/** Hexagon tiling ************************************************************/

var c = Math.cos(Math.PI/3), s = Math.sin(Math.PI/3);

/** offsets of the form [r,c] */
function hexPoints(o) {
  /*       /
   *    1 /|            (0,2s)___(1,2s)        .  .    .  .
   *     / | sin 60   (-c,s) /   \  (1+c, s)  .    .  .    .
   *    /__|                 \___/             o  .    o  .
   *   cos 60              (0,0) (1,0)        .    o  .
   *                                           o  .    o  .
   */
  
  var shape = [[0,0], [1,0], [1+c, s], [1, 2*s], [0, 2*s], [-c,s]];

  var x = o[1]*(1 + c);
  var y = o[0]*2*s + (o[1] % 2 == 1 ? s : 0);

  return translate(shape, [x,y]);
}

function hexConn(o) {
  return [2,3,4,5,0,1];
}

function hexBB(n_rows,n_cols) {
  // width: 1 ↦ c + (1 + c),  2 ↦ c + 2(1+c),   3 ↦ c + 3(1+c)
  // height: 1 ↦ 3s,  2 ↦ 5s,  3 ↦ 7s
  return {x: -c, y: 0, width: c + n_cols*(1 + c), height: s*(1 + 2*n_rows)};
}

/** Octagon tiling ************************************************************/

function is_square(o) {
  return (o[0] + o[1])%2 == 0;
}

function octPoints(o) { 
  /*            _ 
   *       ._ /.  \.   square: (0,0)      oct: (0,1)
   *       |_|     |   oct:    (1,0)   square: (1,1)
   *      /.  \._ /.   if sum even: square; sum odd: octagon
   *     |     |_|
   *      \._ /.  \.
   */

  var s = Math.sqrt(2);

  var x = (1 + s)*o[0];
  var y = (1 + s)*o[1];

  var shape = is_square(o)         ?
    [[0,0], [0,-1], [1,-1], [1,0]] :
    [[-s,0], [-s,-1], [0,-s-1], [1,-s-1], [1+s,-1], [1+s,0], [1,s], [0,s]];

  return translate(shape,[x,y]);
}

function octConn(o) {
  if (is_square(o))
    return [1,2,3,0];
  else
    return [3,4,5,6,7,0,1,2];
}


