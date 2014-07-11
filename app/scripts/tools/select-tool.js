var inherit = require('scripts/inherit');
var Tool    = require('scripts/tool');

var BASIC_SELECTION_PROPERTIES = {
  cornerSize: fabric.isTouchSupported ? 22 : 12,
  transparentCorners: false
};

function SelectionTool(name, selector, drawTool) {
  Tool.call(this, name, selector, drawTool);

  this.canvas.on("object:selected", function (opt) {
    opt.target.set(BASIC_SELECTION_PROPERTIES);
  });

  this.setLabel('S');
}

inherit(SelectionTool, Tool);

SelectionTool.prototype.activate = function () {
  SelectionTool.super.activate.call(this);
  this.setSelectable(true);
  // if (this.deleteTool) { this.deleteTool.show(); }
};

SelectionTool.prototype.deactivate = function () {
  SelectionTool.super.deactivate.call(this);
  this.setSelectable(false);
  this.canvas.deactivateAllWithDispatch();
  // if (this.deleteTool) { this.deleteTool.hide(); }
};

SelectionTool.prototype.setSelectable = function (selectable) {
  this.canvas.selection = selectable;
  var items = this.canvas.getObjects();
  for (var i = items.length - 1; i >= 0; i--) {
    items[i].selectable = selectable;
  }
  // might be needed?
  // fabric.Group.prototype.selectable = selectable;
};

module.exports = SelectionTool;