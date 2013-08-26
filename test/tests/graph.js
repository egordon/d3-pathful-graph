//var assert = require("assert")


var ORIGINAL_PATHS_COUNT = 22;

describe('pathful graph', function(){

  before(function () {
    d$3.initialize(960, 500, "#graph_container");
  });

  describe('Initial render', function(){

    it('should be able to render initial graph', function(){
        
        assert.ok($("#graph_container > svg").length, "SVG rendered");
    });

    it('should render correct number of nodes, at correct place', function () {
        // render correct number of nodes
        // TODO: check node is at correct position
        //d$3.nodes();
        // ensure that it is fixed
        assert.equal($("#graph_container > svg circle").length, 11, "Correct number of nodes rendered");

        var node1 = $("#graph_container > svg circle:eq(1)").parent();

        // getting position of node 1
        assert.equal(node1.attr('transform'), 'translate(500,10)', 'assert transform value is true');
    });
  })

  describe('Adding node', function () {
      it('should be able to add nodes to the list', function () {
          d$3.AddNode(11);
          d$3.AddLink(1, 11, d$3.direction.right);

          // now making sure that we have the 11'th node
          var node11 = $("#graph_container > svg circle:eq(11)").parent();
          assert.equal(node11.text(), '11', 'node 11 was added');

          // need to check out if we have the edges defined on the graph
          var paths = $("#graph_container > svg path");
          assert.equal(paths.length, ORIGINAL_PATHS_COUNT+1, 'number of paths expected');
      });
  });

  describe('Clicking on node', function () {
      it('should be able to zoom to position', function () {

          // zoom into y axis node
          var svgRoot = $("#graph_container > svg");
          svgRoot.svgPanZoom(500+200,10-80,1.04);

          mxTrans = $("#viewport").attr('transform');
          console.log("Transform data: "+mxTrans);

          assert.equal(mxTrans, 'matrix(2.056227684020996,0,0,2.056227684020996,-739.3593788146973,73.93593788146973)', 'Recording transformation');
      });

      it ('should be able to zoom out', function () {

          // zoom into y axis node
          var svgRoot = $("#graph_container > svg");
          svgRoot.svgPanZoom(250,450,0.1, {'rebase':true});

          mxTrans = $("#viewport").attr('transform');
          console.log("Transform data - out: "+mxTrans);

          assert.equal(mxTrans, 'matrix(1.0717734098434448,0,0,1.0717734098434448,-17.943352460861206,-32.29803442955017)', 'Recording transformation');


      });
  });

  describe('should have animation', function () {
      var ANIMATION_DURATION = 1000;
      it ('Add Node should be able to add with animation', function (done) {
          setTimeout(function () {
              d$3.SetOptions({ 'animation_duration' : ANIMATION_DURATION });
              d$3.AddNode(12);
              d$3.AddLink(1, 12, d$3.direction.right);

              var node12 = $("#graph_container > svg circle:eq(11)").parent();
              var original_position = node12.attr('transform');
              
              setTimeout(function () {
                  var new_position = node12.attr('transform');
                  console.log("Position: "+original_position+" -> "+new_position);
                  assert.notEqual(new_position, original_position, "node have moved");
                  done();
              },500);

              // translate(412.16160939779314,144.99950072666584)
          }, 1000);
      });

      it ('Add panning to allow zoom', function (done) {
          setTimeout(function () {
              // zoom into y axis node
              var svgRoot = $("#graph_container > svg");
              svgRoot.svgPanZoom(500,10,1.2, {
                  'rebase' : true  , 'animation' : ANIMATION_DURATION 
              });
              
              // now check for the duration to see what is the transform
              var vport = $("#viewport");
              var original_position = vport.attr('transform');
              
              setTimeout(function () {
                  var new_position = vport.attr('transform');
                  console.log("Position: "+original_position+" -> "+new_position);
                  assert.notEqual(new_position, original_position, "node have moved");
                  done();
              },500);

              // translate(412.16160939779314,144.99950072666584)
          }, 1000);
      });


  });

  describe('select node callback', function () {

      it('should be able to select node', function () {

          var clicked = false;

          // Note: ideal way to specify function is to use
          //   d$3.addSelectCallback(funciton (...) {  ... });
          // 2 advantage is that it abstract the internal callback and allow 
          //  
          //specify via function instead of selected node

          d$3.OnNodeSelect = function(node, ele) {
              console.log('select '+node);
              clicked = true;
          };

          //var node1 = $("#graph_container > svg circle:eq(1)");
          //node1.click();

          d$3.SelectNode(1);

          assert.ok(clicked, "Node was clicked");

      });

  });

  describe('should display information', function () {
      /*
         //XXX: let's decide later
      it('should be able to display popup', function () {
          d$3.ShowNodePopup(11,
              'This is a node information',
              'This si beaufiful',
              'http://wiki.imagej.net/images/c/c0/Test_of_PNG-screenshot_tutorial-1.png'
              );

          // assert node info is shown
          d$3.HideNodePopup(11);
      });
      */

      it('should be able to display info on nodes', function (done) {
          d$3.ShowNodeInfo();
          assert.ok($(".nodedetail").length>5, "engouth detail shown");
          
          // only for asethtic, run with a slight delay
          setTimeout(function() {
              d$3.HideNodeInfo();
              assert.ok($(".nodedetail").length==0, "detail hidden");
              done();
          },1000);
      });


      it('should be able to display info on edges', function (done) {
          d$3.ShowEdgeInfo('edge data');
          assert.ok($(".edgedetail").length>5, "engouth detail shown");
          
          // only for asethtic, run with a slight delay
          setTimeout(function() {
              d$3.HideEdgeInfo();
              assert.ok($(".edgedetail").length==0, "detail hidden");
              done();
          },500);
      });

      /*
      it('should associate call with zoom level', function () {
          var svgRoot = $("#graph_container > svg");
          svgRoot.associateZoomLevel(1.2, {
              'in' : [d$3.ShowNodeInfo, d$3.ShowEdgeInfo],
              'out' : [d$3.HideNodeInfo, d$3.HideEdgeInfo]
          });
          svgRoot.svgPanZoom(500,10,1.2, {
              'animation' : ANIMATION_DURATION 
          });

          assert.fail('Fail', 'to be implemented - Task 2');
      });
      */
  });

  /*

  describe('Pathful integration', function () {

      it ('should have display whole path with different information on path', function () {
          $pathful.DisplayGraph(
              '#graph_container',
              GRAPH_DATA
          );

          // data shoudl be displayed
      });

      it ('should be able to zoom in and display information', function () {
          // zoom in and provide context with particular node
          //  1. should add / remove nodes
          //  2. should show extra information about graphs / nodes
          $pathful.zoomIn( 'node1' );
      });
  });
  */

})
