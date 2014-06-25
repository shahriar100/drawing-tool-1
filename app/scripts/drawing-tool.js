var Tool = require('scripts/tool')

// Constructor function.
function DrawingTool (selector) {
  // Implement me!
  console.log("Drawing Tool created");
  this.canvas = new fabric.Canvas(selector);
  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.selectable = false;
  fabric.Object.prototype.perPixelTargetFind = true;
  fabric.Group.prototype.selectable = true;
  fabric.Line.prototype.strokeWidth = 10;
  fabric.Line.prototype.stroke = "green";
  fabric.Rect.prototype.fill = "rgba(100,200,200,0.5)";

  this.getCanvas = function(){ return this.canvas; }

  // //adding sample shapes
  // var rect3 = new fabric.Rect({
  //   width: 200, height: 100, left: 500, top: 150, angle: 45,
  //   fill: 'rgba(0,0,200,0.5)'
  // });
  // this.canvas.add(rect3);
  //
  // var ttt = new fabric.Line([0,0,100,100], {});
  // this.canvas.add(ttt);

  var self = this;

  // Tools & implementation
  var selectionTool = new Tool("Selection Tool", "select");
  selectionTool.activate = function(){
    console.log("items are now selectable");
    this.setSelectable(true);
  }
  selectionTool.deactivate = function(){
    console.log("items are no longer selectable");
    this.setSelectable(false);
  }
  selectionTool.setSelectable = function(selectable){
    self.canvas.selection = selectable;
    var items = self.canvas.getObjects();
    for (var i = items.length - 1; i >= 0; i--) {
      items[i].selectable = selectable;
    };
  }

  // TODO: refactor this core code to handle all different shapes
  //       maybe with a "shape tool" prototype
  // TODO: fix line editing (endpoints, disable selection/scaling)
  var lineTool = new Tool("Line Tool", "line");
  lineTool.activate = function(){
    var moved = false;
    var tempNewLine;
    var x1, y1, x2, y2;
    // on mouse down, start drawing line
    self.canvas.on("mouse:down", function(options){
      x1 = options.e.offsetX;
      y1 = options.e.offsetY;
      tempNewLine = new fabric.Line([x1, y1, x1, y1], {});
      tempNewLine.selectable = false;
      self.canvas.add(tempNewLine);
    })
    // on mouse move, update line and re-render the canvas
    self.canvas.on("mouse:move", function(options){
      if (tempNewLine === undefined) return;
      console.log("Moved");
      if (!moved){ moved = true; } // movement has clearly occured
      x2 = options.e.offsetX;
      y2 = options.e.offsetY;
      tempNewLine.set('x2', x2);
      tempNewLine.set('y2', y2);
      self.canvas.renderAll(false);
    })
    // on mouse up, check if a line was drawn or a click
    self.canvas.on("mouse:up", function(options){
      tempNewLine.stroke = "black";
      self.canvas.remove(tempNewLine);
      // QUESTION: is the distance function overkill?
      if (moved && dist(x1, y1, x2, y2) > 3) {// successful line draw
        self.canvas.renderAll(false);
        var newLine = new fabric.Line([x1, y1, x2, y2],{});
        self.canvas.add(newLine);
        console.log("line constructed");
      } else { // click (no line drawn) - move back to select tool
        self.chooseTool("select");
      }
      tempNewLine = undefined;
      moved = false;
    })
  }
  lineTool.deactivate = function(){
    self.canvas.off('mouse:up');
    self.canvas.off('mouse:down');
    self.canvas.off('mouse:move');
  }

  var rectangleTool = new Tool("Rectangle Tool", "rect");
  rectangleTool.activate = function(){
    var moved = false;
    var tempNewRect;
    var x1, y1, x2, y2;
    // on mouse down, start drawing rect
    self.canvas.on("mouse:down", function(options){
      x1 = options.e.offsetX;
      y1 = options.e.offsetY;
      tempNewRect = new fabric.Rect({
        top: y1,
        left: x1,
        width: 0,
        height: 0
      });
      tempNewRect.selectable = false;
      self.canvas.add(tempNewRect);
    })
    // on mouse move, update rect and re-render the canvas
    self.canvas.on("mouse:move", function(options){
      if (tempNewRect === undefined) return;
      console.log("Moved");
      if (!moved){ moved = true; } // movement has clearly occured
      x2 = options.e.offsetX;
      y2 = options.e.offsetY;
      tempNewRect.width = x2 - x1;
      tempNewRect.height = y2 - y1;
      self.canvas.renderAll(false);
    })
    // on mouse up, check if a Rect was drawn or a click
    self.canvas.on("mouse:up", function(options){
      self.canvas.remove(tempNewRect);
      if (moved && dist(x1, y1, x2, y2) > 3) {// successful Rect draw
        self.canvas.renderAll(false);
        if (tempNewRect.width < 0){
          x1 = x1 + tempNewRect.width;
          tempNewRect.width = -tempNewRect.width;
        }
        if (tempNewRect.height < 0){
          y1 = y1 + tempNewRect.height;
          tempNewRect.height = -tempNewRect.height;
        }
        var newRect = new fabric.Rect({
          top: y1,
          left: x1,
          width: tempNewRect.width,
          height: tempNewRect.height
        });
        self.canvas.add(newRect);
        console.log("Rect constructed");
      } else { // click (no Rect drawn) - move back to select tool
        self.chooseTool("select");
      }
      tempNewRect = undefined;
      moved = false;
    })
  }
  rectangleTool.deactivate = function(){
    self.canvas.off('mouse:up');
    self.canvas.off('mouse:down');
    self.canvas.off('mouse:move');
  }
  // var ellipseTool = new EllipseTool();
  // var squareTool = new SquareTool();
  // var circleTool = new CircleTool();

  this.tools = {
    "select": selectionTool,
    "line": lineTool,
    "rect": rectangleTool
  }

  this.currentTool;
  this.chooseTool("select");

  $('.btn').click(function(){
    var id = $(this).find("input").val();
    console.log("ui detected a click on " + id);
    self.chooseTool(id);
  });

  $("#canvas-container").click(function(){
    self.chooseTool("select");
  });

  console.log("drawing tool constructor finished");
}

DrawingTool.prototype.chooseTool = function(toolSelector) {
  console.warn("lolololol");


  // TODO: update HTML elements to reflect tool change (might be needed for selection)
  // TODO: implement a stop if same tool is already selected?
  var newTool = this.tools[toolSelector];
  if (newTool === undefined){
    console.warn("Warning! Could not find tool with selector \"" + toolSelector
    + "\"\nExiting tool chooser.");
    return;
  }

  try {
    console.log("Choosing " + newTool.name + " over " + this.currentTool.name);
    this.currentTool.setActive(false);
    var oldTool = this.currentTool;
  } catch (err) {
    console.log("Choosing " + newTool.name);
  }
  newTool.setActive(true);
  this.currentTool = newTool;

  // $('#' + toolSelector).find("input").prop('checked',true);
  // $('#' + toolSelector).button();

  return oldTool;
}

DrawingTool.prototype.check = function() {
  var shapes = this.canvas.getObjects();
  for (var i = 0; i < shapes.length; i++) {
    console.log(shapes[i].selectable + " " + shapes[i]);
  }
}

function dist (x1, y1, x2, y2){
  var dx2 = Math.pow(x1 - x2, 2),
      dy2 = Math.pow(y1 - y2, 2);
  return Math.sqrt(dx2 + dy2);
}

module.exports = DrawingTool;
