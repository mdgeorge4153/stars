
/**
 * usage:
 *   params = new Params(['p1', 'p2', ...], 'upload', 'download');
 *     - upload should be the id of a file input
 *     - download should be the id of a link
 *     - p1, p2, ... should be ids of inputs
 *
 *   params is an object containing:
 *     - fields p1, p2, ...
 *     - an onchange(f) function that registers a callback that is called when
 *       the fields change
 *
 *   the 'download' link will be updated with a link to a downloadable json file
 */

define([], function() { return function(params, loadButtonId, storeLinkId) {

  var callbacks = [];
  var obj = this;

  function update() {
    for (var i in params)
      obj[params[i]] = document.getElementById(params[i]).value;

    for (var i in callbacks)
      callbacks[i](this);
  }

  this.onchange = function (f) {
    callbacks.push(f);
  }

  function encode() {
    var storeLink  = document.getElementById(storeLinkId);
    var data = encodeURIComponent(JSON.stringify(obj,params,2));
    storeLink.href = "data:application/json;charset=utf-8," + data;
  };

  this.onchange(encode);

  document.getElementById(loadButtonId).addEventListener('change',function(event) {
    var file = event.target.files[0];
    if (file == undefined) return;

    var reader = new FileReader();
    reader.onload = function (e) {
      var input = JSON.parse(e.target.result);
      for (var i in params)
        if (input[params[i]])
          document.getElementById(params[i]).value = input[params[i]];

      update();
    };

    reader.readAsText(file)
  });

  for (var i in params)
    document.getElementById(params[i]).addEventListener('change',update);

  update();
}

});

/*
** vim: ts=2 sw=2 ai et
*/
