/**
 * input: a DOM node containing an SVG image
 * output: an href containing the serialized SVG.  For example:
 *   document.getElementById("link").href = svgAsLink(svg);
 */

define([], function () { return function (svg) {
  //get svg source.
  var serializer = new XMLSerializer();
  var source = serializer.serializeToString(svg);

  //add name spaces.
  if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  //add xml declaration
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

  // TODO: add computed CSS

  //convert svg source to URI data scheme.
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);
};

});

