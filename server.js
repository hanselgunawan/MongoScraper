var cheerio = require("cheerio");
var request = require("request");
var mongojs = require("mongojs");
var express = require("express");

var databaseUrl = "new_york_times";
var collections = ["news"];

var app = express();

app.use(express.static("public"));

var db = mongojs(databaseUrl, collections);

db.on("error", function(error) {
    console.log("Database Error:", error);
});

app.get("/", function(req, res) {
    res.send("Hello world");
});

app.get("/all", function(req, res) {
    db.news.find({}, function(error, found) {
        // Log any errors if the server encounters one
        if (error) {
            console.log(error);
        }
        // Otherwise, send the result of this query to the browser
        else {
            res.json(found);
        }
    });
});

app.get("/scrape", function(req, res) {
    request("https://www.nytimes.com/section/technology?action=click&contentCollection=media&region=navbar&module=collectionsnav&pagetype=sectionfront&pgtype=sectionfront", function(error, response, html) {

        var $ = cheerio.load(html);

        var results = [];
        var limit = 0;

        $(".story-meta").each(function(i, element) {

            var title = $(element).children(".headline").text().replace("\n", "").replace("                    ", "").replace("                ", "");
            var desc = $(element).children(".summary").text();

            db.news.insert({
                title: title,
                desc: desc,
                saved: false
            });
            limit++;
            if(limit === 20) return false;
        });

        // Log the results once you've looped through each of the elements found with cheerio
        res.send("Scrape Complete");
    });
});

// Set the app to listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
});