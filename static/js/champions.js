queue()
    .defer(d3.json, "/match_data")
    .await(makeGraphs);


function makeGraphs(error, crucible_results) {
    if (error) {
        console.error("Error on receiving dataset:", error.statusText);
        throw error;
    }

    crucible_results.forEach(function (d) {
        d["year"] = +d["year"];
        d["winner_score"] = +d["winner_score"];
        d["loser_score"] = +d["loser_score"];
    });

    //Crossfilter instances
    var ndx = crossfilter(crucible_results);

    // Defining dimensions
    var finalRound = ndx.dimension(function (d) {
        return d["round"];
    });
    var finalOutcome = ndx.dimension(function (d) {
        return d["player_1_result"];
    });
    var finalWinner = ndx.dimension(function (d) {
    	return d["winner"];
    });
    var winnerNat = ndx.dimension(function (d) {
    	return d["winner_nat"];
    });
    var winnerGap = ndx.dimension(function (d) {
    	return d["margin"];
    });
    var finalLoser = ndx.dimension(function (d) {
    	return d["loser"];
    });
    var finalYear = ndx.dimension(function (d) {
    	return d["year"];
    });

    // Filtering the data for finals only
    var finalFilter = finalRound.filter("The Final");
    var duplicateFinalFilter = finalOutcome.filter("W");

    // Setting color scales for pie charts
    var blockSlices = d3.scale.ordinal().range(["#000000", "#ff6666", "#0000ff", "#663300", "#006600", "#ffff00", "#ee0000", "#ffffff"]);
    var shadeSlices = d3.scale.ordinal().range(["rgb(100,50,0)", "rgb(105,56,7)", "rgb(110,62,14)", "rgb(115,68,21)", "rgb(120,74,28)", "rgb(125,80,35)", "rgb(130,86,42)", "rgb(135,92,49)", "rgb(140,98,56)", "rgb(145,104,63)", "rgb(150,110,70)", "rgb(155,116,77)", "rgb(160,122,84)", "rgb(165,128,91)", "rgb(170,134,98)", "rgb(175,140,105)", "rgb(180,146,112)", "rgb(185,152,119)", "rgb(190,158,126)", "rgb(195,164,133)", "rgb(200,170,140"]);

    // Grouping the data - count
    var allFinals = ndx.groupAll();
    var champions = finalWinner.group();
    var winningCountry = winnerNat.group();
    var winningMargin = winnerGap.group();
    var runnersUp = finalLoser.group();

    // Charts
    var tournaments = dc.numberDisplay("#totalTournaments");
    var winnerList = dc.rowChart("#winnersRow");
    var winnersByCountry = dc.pieChart("#winningCountry");
    var winnersByMargin = dc.pieChart("#winningMargin");
    var runnerUpList = dc.rowChart("#runnerUpRow");
    var finalResults = dc.dataTable("#winnersTable");

    tournaments
    	.formatNumber(d3.format("d"))
    	.valueAccessor(function (d) {
            return d;
        })
        .group(allFinals);

    winnerList
    	.ordinalColors(["#996600"])
    	.dimension(finalWinner)
    	.group(champions)
    	.width(250)
    	.height(250)
    	.rowsCap(6)
    	.ordering(function(d) { return -d.value; })
    	.elasticX(true);

    runnerUpList
    	.ordinalColors(["#996600"])
    	.dimension(finalLoser)
    	.group(runnersUp)
    	.width(250)
    	.height(300)
    	.rowsCap(11)
    	.ordering(function(d) { return -d.value; })
    	.elasticX(true);

    winnersByCountry
    	.height(200)
    	.radius(100)
    	.innerRadius(20)
    	.dimension(winnerNat)
    	.group(winningCountry)
    	.ordering(function(d) { return -d.value; })
    	.colors(blockSlices);

    winnersByMargin
    	.height(200)
    	.radius(100)
    	.innerRadius(20)
    	.dimension(winnerGap)
    	.group(winningMargin)
    	.colors(shadeSlices);

    finalResults
    	.dimension(finalYear)
    	.group(function (d) {
       		return d.year;
   		})
   		.size(Infinity)
   		.columns([
   			function (d) {
       			return d.year;
   			},
   			function (d) {
       			return d.winner;
   			},
   			function (d) {
       			return "<img class='flagIcon' src='static/img/" + d.winner_nat.toLowerCase() + ".png' alt=" + d.winner_nat + " />";
   			},
   			function (d) {
       			return d.winner_score;
   			},
   			function (d) {
       			return "-";
   			},
   			function (d) {
       			return d.loser_score;
   			},
   			function (d) {
       			return "<img class='flagIcon' src='static/img/" + d.loser_nat.toLowerCase() + ".png' alt=" + d.loser_nat + " />";
   			},
   			function (d) {
       			return d.loser;
   			}
   		])

    dc.renderAll();
}