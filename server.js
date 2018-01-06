var cheerio = require("cheerio");
var request = require("request");

request("https://www.nytimes.com/section/technology?action=click&contentCollection=media&region=navbar&module=collectionsnav&pagetype=sectionfront&pgtype=sectionfront", function(error, response, html) {

  var $ = cheerio.load(html);

  var results = [];
  var limit = 0;

  $(".story-meta").each(function(i, element) {

    var title = $(element).children(".headline").text().replace("\n", "").replace("                    ", "").replace("                ", "");
    var desc = $(element).children(".summary").text();

    results.push({
      title: title,
      desc: desc
    });
    limit++;
    if(limit === 20) return false;
  });

  // Log the results once you've looped through each of the elements found with cheerio
  console.log(results);
});
