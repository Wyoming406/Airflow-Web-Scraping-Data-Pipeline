function graph(){

    // clean up
    document.getElementById('target').innerHTML = '';

    // ------------- GRAPHING -------------

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .html(function(d) { return '<span>' + d.word + '</span>' })
      .offset([-12, 0])

    var padding = 6,
        radius = d3.scale.log().range([15, 70]).domain([2, 82]),
        color = d3.scale.category10().domain([0, 15]);

    var nodes = [];
    var circle = [];
    var force;

    var svg = d3.select("div[id=target]").append("svg")
        .attr("width", 1920)
        .attr("height", 960)
        .attr("class", "vis")
      .append("g")

    svg.call(tip);

    for (var word in scores) {
      nodes.push({radius: radius(scores[word]), color: color(word.length), word: word, score: scores[word]});  
    }

    force = d3.layout.force()
      .nodes(nodes)
      .size([1024, 768])
      .gravity(0.01)
      .charge(-0.01)
      .on("tick", tick)
      .start();

    circle = svg.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", function(d) { return d.radius; })
      .style("fill", function(d) { return d.color; })  
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .call(force.drag);

    function tick(e) {
      circle
          .each(cluster(10 * e.alpha * e.alpha))
          .each(collide(.5))
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

    // Move d to be adjacent to the cluster node.
    function cluster(alpha) {
      var max = {};

      // Find the largest node for each cluster.
      nodes.forEach(function(d) {
        if (!(d.color in max) || (d.radius > max[d.color].radius)) {
          max[d.color] = d;
        }
      });

      return function(d) {
        var node = max[d.color],
            l,
            r,
            x,
            y,
            i = -1;

        if (node == d) return;

        x = d.x - node.x;
        y = d.y - node.y;
        l = Math.sqrt(x * x + y * y);
        r = d.radius + node.radius;
        if (l != r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          node.x += x;
          node.y += y;
        }
      };
    }

    // Resolves collisions between d and all other circles.
    function collide(alpha) {
      var quadtree = d3.geom.quadtree(nodes);
      return function(d) {
        var r = d.radius + radius.domain()[1] + padding,
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        quadtree.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== d)) {
            var x = d.x - quad.point.x,
                y = d.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
            if (l < r) {
              l = (l - r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2
              || x2 < nx1
              || y1 > ny2
              || y2 < ny1;
        });
      };
    }


}
