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
    res.redirect("/all");
});

app.get("/all", function(req, res) {
    db.news.find().sort({$natural:-1}, function(error, found) {
        var allArticlesObj = {
            articles: found
        };
        console.log(allArticlesObj);
        res.render("home", allArticlesObj);
    });
});

app.get("/addNotes/:id", function(req, res) {
    db.comments.find({newsId:req.params.id}, function(error, found) {
        var notesObj = {
            id: req.params.id,
            notes: found
        };
        console.log(notesObj);
        res.send(notesObj);
    });
});

app.post("/insertNotes", function(req, res) {
    var id = req.query.id;
    var notes = req.query.notes;
    db.comments.insert({newsId:id, notes: notes}, function(error, found) {
        res.send("Insert Success!" + notes);
    });
});

app.post("/removeNotes/:id", function(req, res) {
    var ObjectId = mongojs.ObjectID;
    db.comments.remove({_id:ObjectId(req.params.id)}, function(error, found) {
        res.send("Remove Success!");
    });
});

app.post("/deleteArticle/:id", function(req, res) {
    var ObjectId = mongojs.ObjectID;
    db.news.findAndModify({query:{_id:ObjectId(req.params.id)}, update:{$set:{saved: false}}}, function(error, found) {
        res.send("Delete Article - Success!");
    });
});

app.post("/saveArticle/:id", function(req, res) {
    var ObjectId = mongojs.ObjectID;
    db.news.findAndModify({query:{_id:ObjectId(req.params.id)}, update:{$set:{saved: true}}}, function(error, found) {
        res.send("Save Article - Success!");
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
        var getTitle = "";
        $(".story-meta").each(function(i, element) {
            getTitle = $(element).children(".headline").text().replace("\n", "").replace("                    ", "").replace("                ", "");
            return false;
        });
        db.news.findOne({title:getTitle}, function(error, found) {
            if(!found)
            {
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
                res.send("Scrape Complete");
            }
        });
    });
});

// Set the app to listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
});