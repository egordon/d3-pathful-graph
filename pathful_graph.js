window.d$3 = {};

var MID_X = 500, START_X = 100, END_Y = 200


// initial import data from guranteed rate
GRAPH_DATA = 
{"lastNodeId": 10, "nodes": [
    {"label": "https://www.guaranteedrate.com/assumptions", "id": 0, "reflexive": true}, 
    {"label": "https://www.guaranteedrate.com/home-loans", "id": 1, "reflexive": true, "fixed": true, "x":500, "y" : 10}, 
    {"label": "https://www.guaranteedrate.com/buying-home", "id": 2, "reflexive": true}, {"label": "https://www.guaranteedrate.com/", "id": 3, "reflexive": true}, {"label": "https://www.guaranteedrate.com/refinance", "id": 4, "reflexive": true}, {"label": "https://www.guaranteedrate.com/mortgage-calculators", "id": 5, "reflexive": true}, {"label": "exit", "id": 6, "reflexive": true}, {"label": "http://www.guaranteedrate.com/", "id": 7, "reflexive": true}, {"label": "https://www.guaranteedrate.com/home-loans/*-year-fixed-rate-mortgage", "id": 8, "reflexive": true}, {"label": "https://www.guaranteedrate.com/loanoptions", "id": 9, "reflexive": true}, 
    {"label": "https://www.guaranteedrate.com/mortgage-rates", "id": 10, "reflexive": true, "fixed" : true, "x":500, "y": 800}
    ]};

NODE_DATA = GRAPH_DATA['nodes'];
EDGE_DATA = 
    [{"source": NODE_DATA[0], "right": true, "target": NODE_DATA[9], "left": false}, {"source": NODE_DATA[0], "right": true, "target": NODE_DATA[10], "left": false}, {"source": NODE_DATA[1], "right": true, "target": NODE_DATA[9], "left": false}, {"source": NODE_DATA[2], "right": true, "target": NODE_DATA[9], "left": false}, {"source": NODE_DATA[2], "right": true, "target": NODE_DATA[10], "left": false}, {"source": NODE_DATA[3], "right": true, "target": NODE_DATA[9], "left": false}, {"source": NODE_DATA[3], "right": true, "target": NODE_DATA[10], "left": false}, {"source": NODE_DATA[4], "right": true, "target": NODE_DATA[10], "left": false}, {"source": NODE_DATA[5], "right": true, "target": NODE_DATA[9], "left": false}, {"source": NODE_DATA[7], "right": true, "target": NODE_DATA[9], "left": false}, {"source": NODE_DATA[7], "right": true, "target": NODE_DATA[10], "left": false}, {"source": NODE_DATA[8], "right": true, "target": NODE_DATA[9], "left": false}, {"source": NODE_DATA[8], "right": true, "target": NODE_DATA[10], "left": false}, {"source": NODE_DATA[9], "right": true, "target": NODE_DATA[0], "left": false}, {"source": NODE_DATA[9], "right": true, "target": NODE_DATA[3], "left": false}, {"source": NODE_DATA[9], "right": true, "target": NODE_DATA[6], "left": false}, {"source": NODE_DATA[9], "right": true, "target": NODE_DATA[7], "left": false}, {"source": NODE_DATA[9], "right": true, "target": NODE_DATA[10], "left": false}, {"source": NODE_DATA[10], "right": true, "target": NODE_DATA[3], "left": false}, {"source": NODE_DATA[10], "right": true, "target": NODE_DATA[9], "left": false}];



$(document).ready(function() {

  "use strict";

  var initialized = false;
  var manualSelect = true;

  /**
    target: css div container for the target
    */
  d$3.initialize = function(width, height, target, options) {
      if(initialized) return;
      else initialized = true;

      target = target || 'body';

      window.svgWidth = width;
      window.svgHeight = height;

      options = options || {};

      // choose if we allow anmiation
      var doTick = !options['animation'];
      var animation_duration = options['animation_duration'];

      // set up SVG for D3
      // unless: NO_COLOR 
      //var colors = d3.scale.category10();

      var vis = d3.select(target)

        .append("svg")
          .attr("width", width)
          .attr("height", height);

        var svg = vis.append('g')
         .attr('id', 'viewport');
        /*
          .attr("pointer-events", "all")
        .append('svg:g')
          .call(d3.behavior.zoom().on("zoom", rescale))
        .append('svg:g');


        function rescale() {
              var trans = d3.event.translate;
              var scale = d3.event.scale;

              window.circle.attr("transform",
                  "translate(" + trans + ")"
                      + " scale(" + scale + ")");
          }
      */
      // set up initial nodes and links
      //  - nodes are known by 'id', not by index in array.
      //  - reflexive edges are indicated on the node (as a bold black circle).
      //  - links are always source < target; edge directions are set by 'left' and 'right'.
      var nodes = GRAPH_DATA['nodes'],
        lastNodeId = GRAPH_DATA['lastNodeId'],
        links = EDGE_DATA;

      // init D3 force layout
      var force = d3.layout.force()
          .nodes(nodes)
          .links(links)
          .size([width, height])
          .linkDistance(150)
          .charge(-500)
          .on('tick', tick);

      // define arrow markers for graph links
      svg.append('svg:defs').append('svg:marker')
          .attr('id', 'end-arrow')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 6)
          .attr('markerWidth', 3)
          .attr('markerHeight', 3)
          .attr('orient', 'auto')
        .append('svg:path')
          .attr('d', 'M0,-5L10,0L0,5');

      svg.append('svg:defs').append('svg:marker')
          .attr('id', 'start-arrow')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 4)
          .attr('markerWidth', 3)
          .attr('markerHeight', 3)
          .attr('orient', 'auto')
        .append('svg:path')
          .attr('d', 'M10,-5L0,0L10,5');

      // line displayed when dragging new nodes
      /*
      var drag_line = svg.append('svg:path')
        .attr('class', 'link dragline hidden')
        .attr('d', 'M0,0L0,0');
        */

      // handles to link and node element groups
      var path = svg.append('svg:g').selectAll('path'),
          circle = svg.append('svg:g').selectAll('g');

      // mouse event vars
      var selected_node = null,
          selected_link = null,
          mousedown_link = null,
          mousedown_node = null,
          mouseup_node = null;

      function resetMouseVars() {
        mousedown_node = null;
        mouseup_node = null;
        mousedown_link = null;
      }

      // update force layout (called automatically each iteration)
      function tick() {
        // draw directed edges with proper padding from node centers
        path.attr('d', function(d) {
          var deltaX = d.target.x - d.source.x,
              deltaY = d.target.y - d.source.y,
              dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
              normX = deltaX / dist,
              normY = deltaY / dist,
              sourcePadding = d.left ? 17 : 12,
              targetPadding = d.right ? 17 : 12,
              sourceX = d.source.x + (sourcePadding * normX),
              sourceY = d.source.y + (sourcePadding * normY),
              targetX = d.target.x - (targetPadding * normX),
              targetY = d.target.y - (targetPadding * normY);
          return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
        });

        circle.attr('transform', function(d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        });
      }

      // update graph (called when needed)
      function restart() {
        // path (link) group
        path = path.data(links);

        // update existing links
        path.classed('selected', function(d) { return d === selected_link; })
          .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
          .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


        // add new links
        path.enter().append('svg:path')
          .attr('class', 'link')
          .classed('selected', function(d) { return d === selected_link; })
          .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
          .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
          .on('mousedown', function(d) {
            if(d3.event.altKey || !manualSelect) return;

            // select link
            mousedown_link = d;
            if(mousedown_link === selected_link) selected_link = null;
            else selected_link = mousedown_link;
            selected_node = null;

            // Call User-defined click event if exists
            if(typeof(d$3.OnLinkSelect) != "undefined" && selected_link != null) d$3.OnLinkSelect(selected_link);
            if(typeof(d$3.OnLinkUnselect) != "undefined" && selected_link == null) d$3.OnLinkUnselect(mousedown_link);

            restart();
          });

        // remove old links
        path.exit().remove();


        // circle (node) group
        // NB: the function arg is crucial here! nodes are known by id, not by index!
        circle = circle.data(nodes, function(d) { return d.id; });

        // update existing nodes (reflexive & selected visual states)
        circle.selectAll('circle')
          // unless: NO_COLOR 
          //.style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
          .classed('reflexive', function(d) { return d.reflexive; });

        // add new nodes
        var g = circle.enter().append('svg:g');

        g.append('svg:circle')
          .attr('class', 'node')
          .attr('r', 20)
          // unless: NO_COLOR 
          //.style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
          // unless: NO_COLOR 
          //.style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
          .classed('reflexive', function(d) { return d.reflexive; })
          .on('mousedown', function(d) {
            if(d3.event.altKey || !manualSelect) return;

            // select node
            mousedown_node = d;
            if(mousedown_node === selected_node) selected_node = null;
            else selected_node = mousedown_node;
            selected_link = null;

            // Call User-defined click function, if exists
            // Call User-defined click event if exists
            if(typeof(d$3.OnNodeSelect) != "undefined" && selected_node != null) d$3.OnNodeSelect(selected_node);
            if(typeof(d$3.OnNodeUnselect) != "undefined" && selected_node == null) d$3.OnNodeUnselect(mousedown_node);

            /*
            // reposition drag line
            drag_line
              .style('marker-end', 'url(#end-arrow)')
              .classed('hidden', false)
              .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);
              */

            restart();
          });

        // show node IDs
        g.append('svg:text')
            .attr('x', 0)
            .attr('y', 4)
            .attr('class', 'id')
            .text(function(d) { return d.id; });

        // remove old nodes
        circle.exit().remove();

        // set the graph in motion... then stop it...
        if(doTick) {
          force.start();

          if (!animation_duration) {
              for(var i=0; i<100; i++) force.tick();
              force.stop();
          } else {
              var t0 = (new Date().getTime());
              var intervalTimer = setInterval(function () {
                  var t1 = (new Date().getTime());
                  force.tick();
                  
                  if ((t1-t0) > animation_duration) {
                      clearTimeout(intervalTimer);
                      force.stop();
                  }

              }, 200);

          }
          doTick = false;
        } else {
          force.tick();
        }
      }

      function mousedown() {
        // prevent I-bar on drag
        //d3.event.preventDefault();
        
        // because :active only works in WebKit?
        svg.classed('active', true);
      
      }


      function mouseup() {
        /*
        if(mousedown_node) {
          // hide drag line
          drag_line
            .classed('hidden', true)
            .style('marker-end', '');
        }*/

        // because :active only works in WebKit?
        svg.classed('active', false);

        // clear mouse event vars
        resetMouseVars();
      }

      function spliceLinksForNode(node) {
        var toSplice = links.filter(function(l) {
          return (l.source === node || l.target === node);
        });
        toSplice.map(function(l) {
          links.splice(links.indexOf(l), 1);
        });
      }

      // special dragging
      var node_drag = d3.behavior.drag()
              .on("dragstart", dragstart)
              .on("drag", dragmove)
              .on("dragend", dragend);

          function dragstart(d, i) {
          }

          function dragmove(d, i) {
            if(!d.fixed) {
              d.px += d3.event.dx;
              d.py += d3.event.dy;
              d.x += d3.event.dx;
              d.y += d3.event.dy; 
              tick(); // this is the key to make it work together with updating both px,py,x,y on d !
            }
          }

          function dragend(d, i) {
              tick();
          }

      // only respond once per keydown
      var lastKeyDown = -1;

      function keydown() {
        d3.event.preventDefault();

        if(lastKeyDown !== -1) return;
        lastKeyDown = d3.event.keyCode;

        // alt
        if(d3.event.keyCode === 18) {
          circle.call(node_drag);
          svg.classed('ctrl', true);
        }

        if(!selected_node && !selected_link) return;
        switch(d3.event.keyCode) {
          case 8: // backspace
          case 46: // delete
            if(manualSelect) {
              if(selected_node) {
                if(!selected_node.fixed) {
                  nodes.splice(nodes.indexOf(selected_node), 1);
                  spliceLinksForNode(selected_node);
                }
              } else if(selected_link) {
                links.splice(links.indexOf(selected_link), 1);
              }
              selected_link = null;
              selected_node = null;
              restart();
            }
            break;
        }
      }

      function keyup() {
        lastKeyDown = -1;

        // alt
        if(d3.event.keyCode === 18) {
          circle
            .on('mousedown.drag', null)
            .on('touchstart.drag', null);
          svg.classed('ctrl', false);
        }
      }

      // app starts here

      svg.on('mousedown', mousedown)
        .on('mouseup', mouseup);
      d3.select(window)
        .on('keydown', keydown)
        .on('keyup', keyup);
      restart();
      $('svg').svgPan('viewport');

      /////////////// Utility Functions //////////////////

      function currentTransform(startMatrix) {
        if(startMatrix.length != 2) return startMatrix;
        else {
          var transMatrix = svg[0][0].attributes.transform
          if(!transMatrix) return startMatrix;
          transMatrix = transMatrix.value.match(/[-\d\.]+/g);
          for(var i=0; i<transMatrix.length; i++) {
            transMatrix[i] = parseFloat(transMatrix[i]);
          }
          var retMatrix = Array(2);
          retMatrix[0] = (transMatrix[0] * startMatrix[0]) + (transMatrix[2] * startMatrix[1]) + transMatrix[4];
          retMatrix[1] = (transMatrix[1] * startMatrix[0]) + (transMatrix[3] * startMatrix[1]) + transMatrix[5];
          return retMatrix;
        }
      }

      d$3.ZoomHandler = function(zoom) {
        if(zoom < d$3.zoomSensitivity) {
          if(!d$3.zoomedIn && typeof(d$3.OnZoom) != "undefined") d$3.OnZoom();
          d$3.zoomedIn = true;
        }
        if(zoom >= d$3.zoomSensitivity) {
          if(d$3.zoomedIn && typeof(d$3.OnZoomOut) != "undefined") d$3.OnZoomOut();
          d$3.zoomedIn = false;
        }
      }
                var setCTM = function (matrix) {
                    var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";

                    svg[0][0].setAttribute("transform", s);
                }

      /////////////// BASIC API STARTS HERE! //////////////////

      d$3.SetOptions = function (options) {
          animation_duration = options['animation_duration'];
      };
      
      d$3.AddNode = function(nodeID, isFixed) {
        // insert new node at point
        var point = [Math.random() * svgWidth, Math.random() * svgHeight];

        var currentNode = $.grep(nodes, function(e){ return e.id == nodeID; });

        if(currentNode.length == 0) {

          var node = {id: ++lastNodeId, reflexive: false};
          node.x = point[0];
          node.y = point[1];
          node.fixed = isFixed;
          nodes.push(node);

          doTick = true;

          restart();
          return true;
        } else return false;
      }

      d$3.AddLink = function(sourceID, targetID, direction) {

        // Insert new link between two existing nodes

        var nodeStart = $.grep(nodes, function(e){ return e.id == sourceID; });
        var nodeEnd = $.grep(nodes, function(e){ return e.id == targetID; });
        var currentLink = $.grep(links, function(e) {
          return e.source.id == sourceID && e.target.id == targetID;
        });
        if(nodeStart.length > 0 && nodeEnd.length > 0 && currentLink.length == 0) {
          var left, right;
          switch(direction) {
            case d$3.direction.left:
              links.push({source: nodeStart[0], target: nodeEnd[0], left: true, right: false });
              break;
            case d$3.direction.right:
              links.push({source: nodeStart[0], target: nodeEnd[0], left: false, right: true });
              break;
            case d$3.direction.both:
              links.push({source: nodeStart[0], target: nodeEnd[0], left: true, right: true });
              break;
            default:
              return false;
          }
          doTick = true;
          restart();
          return true;
        } else return false;
      }

      d$3.SetLinkDireciton = function(sourceID, targetID, direction) {
        var currentLink = $.grep(links, function(e) {
          return e.source.id == sourceID && e.target.id == targetID;
        });
        if(currentLink.length > 0) {
          switch(direction) {
            case d$3.direction.left:
              currentLink[0].left = true;
              currentLink[0].right = false;
              break;
            case d$3.direction.right:
              currentLink[0].left = false;
              currentLink[0].right = true;
              break;
            case d$3.direction.both:
              currentLink[0].left = true;
              currentLink[0].right = true;
              break;
            default:
              return false;
          }
          restart();
          return true;
        } else return false;
      }

      d$3.Reorganize = function() {
        doTick = true;
        restart();
        return true;
      }

      d$3.SelectLink = function(sourceID, targetID) {
        var selectLink = $.grep(links, function(e) {
          return e.source.id == sourceID && e.target.id == targetID;
        });

        if(selectLink.length > 0) {
          d = selectLink[0];
          // select link
          mousedown_link = d;
          if(mousedown_link === selected_link) selected_link = null;
          else selected_link = mousedown_link;
          selected_node = null;
           // Call User-defined click event if exists
          if(typeof(d$3.OnLinkSelect) != "undefined" && selected_link != null) d$3.OnLinkSelect(selected_link);
          if(typeof(d$3.OnLinkUnselect) != "undefined" && selected_link == null) d$3.OnLinkUnselect(mousedown_link);
          restart();
          return true;
        } else return false;
      }

      d$3.SelectNode = function(nodeID) {
        var selectNode = $.grep(nodes, function(e){ return e.id == nodeID; });
        if(selectNode.length > 0) {
          var d = selectNode[0];
          // select node
          mousedown_node = d;
          if(mousedown_node === selected_node) selected_node = null;
          else selected_node = mousedown_node;
          selected_link = null;

          var circle_selected = d3.selectAll('circle').data([selected_node])[0][0];

          // Call User-defined click event if exists
          if(typeof(d$3.OnNodeSelect) != "undefined" && selected_node != null) {
            d$3.OnNodeSelect(selected_node, circle_selected);
          }
          if(typeof(d$3.OnNodeUnselect) != "undefined" && selected_node == null) {
            d$3.OnNodeUnselect(mousedown_node, circle_selected);
          }

          restart();
          return true;
        } else return false;
      }

      d$3.GetNodeObject = function(nodeID) {
        var selectNode = $.grep(nodes, function(e){ return e.id == nodeID; });
        if(selectNode.length > 0) {
          return selectNode[0];
        } else return undefined;
      }

      d$3.GetSelectedObject = function() {
        if(selected_link != null) return selected_link;
        else if(selected_node != null) return selected_node;
        else return null;
      }

      d$3.ToggleManualSelect = function(isEnabled) {
        manualSelect = isEnabled;
        return manualSelect;
      }

      d$3.ShowNodeInfo = function () {
          circle.append("svg:text")
                  .attr("class", "nodedetail")
                  .attr("dx", 15) //function(d) { debugger; return d.x; })
                  .attr("dy", 10) //function(d) { return d.y; })
                  .text(function(d) { return d.label; })
                  ;
      };

      d$3.HideNodeInfo = function () {
          $('.nodedetail').remove();
      };
      
      d$3.ShowEdgeInfo = function (info) {
          //http://stackoverflow.com/questions/8663844/add-text-label-onto-links-in-d3-force-directed-graph
          path.each(function (d) {
              svg.append('svg:text')
                  .attr("class", "edgedetail")
                  .attr("dx", (d.source.x+d.target.x) / 2)
                  .attr("dy", (d.source.y+d.target.y) / 2)
                  .text(info) //function(d) { return d.label; })
              ;
          });
      };
      d$3.HideEdgeInfo = function (nodeID1, nodeID2) {
          $('.edgedetail').remove();
      };
      d$3.Zoom = function(x, y, delta, options) {
        var evt = document.createEvent("MouseEvents");
        evt.initEvent('mousewheel', true, true);
        evt.wheelDelta = delta * 360.0;
        evt.posX = x;
        evt.posY = y;
        if(options['animated']) {
          var counter = 1;
          evt.wheelDelta = evt.wheelDelta / 100.0;
          var interval  =setInterval(function() {
            if(counter >= 100) clearInterval(interval);
            else {
              document.dispatchEvent(evt);
              counter++;
            }
          }, 1)
        }
        document.dispatchEvent(evt);
      }

      d$3.Pan = function(x, y) {
        setCTM(svg[0][0].getCTM().translate(x, y));
      }

      d$3.ZoomOnNode = function(nodeID) {
        // Get Center of SVG
        var centerPoint = new Object();
        centerPoint.x = svgWidth/2.0
        centerPoint.y = svgHeight/ 2.0;

        var panArr = Array(2);
        var panSpeed = 0.1;

        var interval = setInterval(function() {
          
          // Get Node's Position
          var posArr = d$3.GetNodePosition(nodeID);
          var distance = Math.sqrt(Math.pow(posArr[0] - centerPoint.x, 2) + Math.pow(posArr[1] - centerPoint.y, 2));
          if(d$3.zoomedIn && distance < 10.0) clearInterval(interval);
          
          // Zoom In
          if(!d$3.zoomedIn) {
            d$3.Zoom(posArr[0], posArr[1], 0.05, {'animated': false});
            panSpeed = 0.1;
          } else panSpeed = 1;

          // Move to correct position
          if(Math.abs(posArr[0] - centerPoint.x) < (3*panSpeed)) panArr[0] = 0;
          else if(posArr[0] < centerPoint.x) panArr[0] = panSpeed;
          else if(posArr[0] > centerPoint.x) panArr[0] = -panSpeed;
          if(Math.abs(posArr[1] - centerPoint.y) < (3*panSpeed)) panArr[1] = 0;
          else if(posArr[1] < centerPoint.y) panArr[1] = panSpeed;
          else if(posArr[1] > centerPoint.y) panArr[1] = -panSpeed;
          d$3.Pan(panArr[0], panArr[1]);
        },1);
      }

      d$3.GetNodePosition = function(nodeID) {

        var posArr = Array(2);
        posArr[0] = parseFloat(circle[0][nodeID].attributes.transform.value.match(/[-\d\.]+/g)[0]);
        posArr[1] = parseFloat(circle[0][nodeID].attributes.transform.value.match(/[-\d\.]+/g)[1]);
        return currentTransform(posArr);
      }

      ///////////////// Variables //////////////////
      d$3.direction = {left: 0, right: 1, both: 2};
      d$3.zoomSensitivity = 0.2;
      d$3.zoomedIn = false;
  }
});
