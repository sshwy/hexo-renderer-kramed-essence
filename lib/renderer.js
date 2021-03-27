'use strict';

var kramed = require('kramed-essence');
var assign = require('object-assign');
var stripIndent = require('strip-indent');
var util = require('hexo-util');

var highlight = util.highlight;
var stripHTML = util.stripHTML;
var kramedRenderer = kramed.Renderer;

function Renderer() {
  kramedRenderer.apply(this);

  this._headingId = {};
}

require('util').inherits(Renderer, kramedRenderer);

// Add id attribute to headings
Renderer.prototype.heading = function(text, level) {
  var id = anchorId(stripHTML(text));
  var headingId = this._headingId;

  // Add a number after id if repeated
  if (headingId[id]) {
    id += '-' + headingId[id]++;
  } else {
    headingId[id] = 1;
  }
  // add headerlink
  return `<h${level}><a id="${id}" href="#${id}" class="headerlink" title="${stripHTML(text)}"></a>${text}</h${level}>`;
};

Renderer.prototype.reffn = function(refname) {
  return '<sup>' 
    + `<a id="reffn_${refname}" class="headerlink" title="${stripHTML(refname)}"></a>`
    + `<a href="#fn_${refname}">${refname}</a>`
    + '</sup>';
};

Renderer.prototype.footnote = function(refname, text) {
  return '<p>\n'
    + `<a id="fn_${refname}" class="headerlink" title="${stripHTML(refname)}"></a>`
    + '<sup>' + refname + '</sup>. '
    + text
    + '<a href="#reffn_' + refname + '" title="Jump back to footnote [' + refname + '] in the text."> &#8617;</a>\n'
    + '</p>\n';
};

// Add table-container div to set overflow-x: auto
Renderer.prototype.table = function(header, body) {
  return '<div class="table-container">\n'
    + '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n'
    + '</div>\n';
};

Renderer.prototype.codespan = function(text) {
  return '<code class="inline-code">' + text.replace(/\$/g,'&#36;') + '</code>';
};

function anchorId(str) {
  return util.slugize(str.trim());
}

kramed.setOptions({
  langPrefix: '',
  highlight: function(code, lang) {
    return highlight(stripIndent(code), {
      lang: lang,
      gutter: false,
      wrap: false
    });
  }
});

// Change inline math rule
function formatText(text) {
  // Fit kramed's rule: $$ + \1 + $$
  return text.replace(/`\$(.*?)\$`/g, '$$$$$1$$$$');
}

module.exports = function(data, options) {
  return kramed(formatText(data.text), assign({
    renderer: new Renderer()
  }, this.config.kramed, options));
};
