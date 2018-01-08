var cheerio = require("cheerio");
var request = require("request");
var mongojs = require("mongojs");
var express = require("express");
var exphbs = require("express-handlebars");

var databaseUrl = "new_york_times";
var collections = ["news"];

var app = express();

app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var db = mongojs(databaseUrl, collections);

db.on("error", function(error) {
    console.log("Database Error:", error);
});

app.get("/", function(req, res) {
    db.news.find({}, function(error, found) {
        var allArticlesObj = {
            articles: found
        };
        console.log(allArticlesObj);
        res.render("home", allArticlesObj);
    });
});

app.get("/all", function(req, res) {
    db.news.find({}, function(error, found) {
        var allArticlesObj = {
            articles: found
        };
        console.log(allArticlesObj);
        res.render("home", allArticlesObj);
    });
});

app.get("/saved", function(req, res) {
    db.news.find({saved:true}, function(error, found) {
        var allArticlesObj = {
            articles: found
        };
        console.log(allArticlesObj);
        res.render("saved_articles", allArticlesObj);
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