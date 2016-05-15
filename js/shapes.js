/*
tiling:
  shapes:   list of polygons
  conns:    list of connection lists (one per poly)
  position: [r,c] -> [x,y]
*/

define(['vec','lib/d3'], function (vec,d3) {

var result = {}

function connections(n,k) {
  return d3.range(n).map(function (i) { return (i + k) % n; });
}

function interleave(a1,a2) {
  var result = new Array(a1.length + a2.length);

  for (var i in a1) {
    result[2*i] = a1[i];
    result[2*i+1] = a2[i];
  }

  return result;
}

/** Hexagon tiling ************************************************************/

function Hex() {

  /*
   *   (0,2s)   (1,2s)
   *         ∙ ∙                     ╱│
   * (-c,s) ∙   ∙ (1+c,s)        1  ╱ │ s
   *         ∘ ∙                   ╱__│
   *    (0,0)   (1,0)               c
   */

  var c = Math.cos(Math.PI/3), s = Math.sin(Math.PI/3);

  this.shapes = [[[0,0], [1,0], [1+c, s], [1, 2*s], [0, 2*s], [-c,s]]];

  this.conns  = [[2,3,4,5,0,1]];

  this.position = function (o) {
    var x = o[1]*(1 + c);
    var y = o[0]*2*s + (o[1] % 2 == 1 ? s : 0);
    return [x,y];
  }
}

result.hex = new Hex();

/** Octagon tiling ************************************************************/

function Oct() {

  var r2 = 1/Math.sqrt(2);

  /*
   *         (0,0) ∘0∙ (1,0)
   *        (0,-1) ∘1∙ (1,-1)                1╱ │ r2
   *  (-r2,-1-r2) ∙   ∙ (1+r2,-1-r2)          ──┘
   *  (-r2,-2-r2) ∙   ∙ (1+r2,-2-r2)          r2
   *   (0,-2-2*r2) ∙ ∙ (1,-2-2*r2)
   */

  this.shapes = [
    [[0,0], [0,-1], [1,-1], [1,0]],
    [[0,-1], [-r2,-1-r2], [-r2,-2-r2], [0,-2-2*r2], [1,-2-2*r2], [1+r2,-2-r2], [1+r2, -1-r2], [1,-1]]
  ];

  this.conns = [
    [2,3,0,1],
    [3,4,5,6,7,0,1,2],
  ];

  this.position = function(o) {
    var x = (1 + r2)*o[1];
    var y = (1 + r2)*(2*o[0] + (o[1] % 2 == 0 ? 1 : 0));
    return [x,y];
  }
}

result.oct = new Oct();

/** Dodecagon tiling **********************************************************/

function Dodec() {
  /*
   * y vals
   * ------
   * 1+2c+3s ─      ∙
   * 1+c+3s  ─        ∙ ∙
   * 1+2c+2s ─   ∙ ∘1                ╱│
   * 1+c+2s  ─ ∙     ∙   ∙       1  ╱ │ s
   * 1+c+s   ─∙       ∘2∙          ╱__│
   * c+s     ─∙       ∘3∙           c
   * c       ─ ∙     ∙   ∙          
   * 0       ─   ∘0∙      
   * c-s     ─        ∘4∙
   * -s      ─      ∘5    
   *          ││ │ ││││ ││
   * x vals   ││ │ ││││ ││      ∙ ∙       ∙ ∙
   * ------   ││ │ ││││ ││    ∙     ∙   ∙     ∙
   * -c-s    ─┘│ │ ││││ ││   ∙       ∙ ∙       ∙
   * -s      ──┘ │ ││││ ││   ∙    2(1+c+s)     ∙
   * 0       ────┘ ││││ ││    ∙ ┌─────────┐   ∙
   * 1       ──────┘│││ ││      ∘ ∙  ∙ ∙  ∘┐∙
   * 1+c     ───────┘││ ││         ∙     ∙ │
   * 1+s     ────────┘│ ││        ∙       ∙│1+2c+2s
   * 1+c+s   ─────────┘ ││        ∙       ∙│       
   * 2+c+s   ───────────┘│         ∙     ∙ │
   * 2+2c+s  ────────────┘           ∘ ∙  ∙┘
   */

  var c = Math.cos(Math.PI/3), s = Math.sin(Math.PI/3);

  this.shapes = [
    [[0,0],[1,0],[1+s,c],[1+c+s,c+s],
     [1+c+s,1+c+s], [1+s,1+c+2*s], [1,1+2*c+2*s], [0,1+2*c+2*s],
     [-s,1+c+2*s], [-c-s, 1+c+s], [-c-s,c+s], [-s,c]],
    [[1,1+2*c+2*s], [1+s,1+c+2*s], [1+c+s,1+c+3*s], [1+c,1+2*c+3*s]],
    [[1+c+s,1+c+s], [2+c+s,1+c+s], [2+2*c+s, 1+c+2*s],
     [2+c+s,1+c+3*s], [1+c+s,1+c+3*s], [1+s,1+c+2*s]],
    [[1+c+s,c+s], [2+c+s,c+s], [2+c+s,1+c+s], [1+c+s,1+c+s]],
    [[1+c+s,c-s], [2+c+s, c-s], [2+2*c+s,c],
     [2+c+s,c+s], [1+c+s,c+s], [1+s,c]],
    [[1+c,-s], [1+c+s,c-s], [1+s,c], [1,0]]
  ];

  this.conns = [
    connections(12,3),
    connections(4,1),
    connections(6,1),
    connections(4,1),
    connections(6,1),
    connections(4,1),
  ];

  this.position = function(o) {
    var x = (1+c+s)*(2*o[1] + (o[0] % 2 == 0 ? 0 : 1));
    var y = (1 + c + 3*s) * o[0];

    return [x,y];
  };
}

result.dodec  = new Dodec();

var dod = result.dodec;

result.ddodec = new Dodec();
result.ddodec.shapes = interleave(dod.shapes,dod.shapes);
result.ddodec.conns  = interleave(dod.conns,[
  connections(12,4),
  connections(4,2),
  connections(6,2),
  connections(4,2),
  connections(6,2),
  connections(4,2),
]);

/******************************************************************************/

return result;

});
