function createList(data) {
    $("#news-list").append("<div class='row' style='padding:20px; border:1px solid black'>" +
        "<div class='col-lg-12'>" +
        "<div class='row'>" +
        "<div class='col-lg-9'>" +
        "<h2>"+data.title+"</h2>" +
        "</div>" +
        "<div class='col-lg-3' style='margin-top: 25px'>" +
        "<button class='btn btn-success' style='font-size: 18px'>Save Article</button>" +
        "</div>" +
        "</div>" +
        "<div class='row'>" +
        "<div class='col-lg-12'>" +
        "<p>"+data.desc+"</p>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>")
}

function emptyList(){
    $("#news-list").append("<div class='row' style='padding:20px'>" +
        "<div class='col-lg-12' style='text-align: center'>" +
        "<h3>No news to be shown</h3>" +
        "</div>" +
        "</div>");
}

// We'll be rewriting the table's data frequently, so let's make our code more DRY
// by writing a function that takes in data (JSON) and creates a table body
function displayNews(data) {
  // Add to the table here...
    if(data.length>0)
    {
        for(let i=0;i<data.length;i++)
        {
            createList(data[i]);
        }
    }
    else
    {
        emptyList();
    }
}

$("#myModal").modal("hide");

// $.getJSON("/all", function(data) {
//   // Call our function to generate a table body
//   $("#news-list").empty();
//   displayNews(data);
// });

$("#homeBtn").on("click", function () {
    $.getJSON("/all", function(data) {
        // Call our function to generate a table body
        $("#news-list").empty();
        displayNews(data);
    });
});

$("#scrapeBtn").on("click", function () {
    $("#myModal").modal("show");
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {
        console.log(data);
        setTimeout(function () {
            window.location = "/all";
        }, 1500);
    })
});

$("#savedArtBtn").on("click", function () {
    $.getJSON("/saved", function(data) {
        // Call our function to generate a table body
        $("#news-list").empty();
        displayNews(data);
    });
});