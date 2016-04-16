var smult = function (s, v)   { return [s * v[0], s * v[1]]; }
var add   = function (v1, v2) { return [v1[0] + v2[0], v1[1] + v2[1]]; }
var sub   = function (v1, v2) { return add(smult(-1,v2), v1); }
var dot   = function (v1, v2) { return v1[0] * v2[0] + v1[1] * v2[1]; }
var sdiv  = function (v, s)   { return smult(1/s, v); }

/*        x (result)
 *       /
 *      /θ)
 *     x_____x
 *           v
 */
function rotate (v, theta) {
  return [Math.cos(theta)*v[0] - Math.sin(theta)*v[1],
          Math.sin(theta)*v[0] + Math.cos(theta)*v[1]];
}


/** returns the intersection between the lines e0 + s*d0 and e1 + t*d1 */
function intersect (e0, d0, e1, d1) {
  /* we know e0 + t*d0 = e1 + s*d1.  We solve for s. 
   * we start by letting E = e0 - e1.
   */

  var E = sub(e0, e1);

  /* then E = s*d1 - t*d0.  In other words,
   *
   * ⎛ Ex ⎞   ⎛ d1x  -d0x ⎞   ⎛ s ⎞
   * ⎜    ⎟ = ⎜           ⎟ * ⎜   ⎟
   * ⎝ Ey ⎠   ⎝ d1y  -d0y ⎠   ⎝ t ⎠
   *
   * thus
   *
   * ⎛ s ⎞   1   ⎛ -d0y  d0x ⎞   ⎛ Ex ⎞
   * ⎜   ⎟ = - * ⎜           ⎟ * ⎜    ⎟  where D is the determinant
   * ⎝ t ⎠   D   ⎝ -d1y  d1x ⎠   ⎝ Ey ⎠
   *
   */

  var D = d0[0]*d1[1] - d0[1]*d1[0];

  var s = dot([-d0[1], d0[0]], E) / D;
  var t = dot([-d1[1], d1[0]], E) / D;

  /* Now we can use s to find the point */
  return add(e0, smult(s, d0));
}

