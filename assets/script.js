
/*$.get("https://api.giphy.com/v1/gifs/random", {
    api_key: "sMQhK0RPCZwuJqlW37ePtdQv4oWc3a62",
    rating: "g"
}).then(function(response){
    var imageUrl = response.data.images.original.url;

    placeRandomImage(imageUrl);
});*/

var searches = [];


function addSearch(searchTerm){
    $.get("https://api.giphy.com/v1/gifs/search", {
        api_key: "sMQhK0RPCZwuJqlW37ePtdQv4oWc3a62",
        rating: "g",
        lang: "en",
        limit: 50,
        q: searchTerm
    }).then(function(response){
        var searchData = {};

        searchData.query = searchTerm;
        searchData.gifs = [];
        
        response.data.forEach(gif => {
            searchData.gifs.push({
                url: gif.images.fixed_width.url,
                url_still: gif.images.fixed_width_still.url
            });
        });
        
        var button = $(`<button class="searchButton">${searchTerm}</button>`);

        button.data("index", searches.length);

        button.on("click", function(event){
            clearGifs();
            displaySearch($(event.target).data("index"));
        });

        $("#searchContainer").append(button);

        searches.push(searchData);
    });
}

function displaySearch(index){
    searches[index].gifs.forEach(function(gif){
        var gifElem = $(`<img class="gif" src="${gif.url_still}">`);

        gifElem.data("url", gif.url);
        gifElem.data("url_still", gif.url_still)

        gifElem.mouseenter(function(event){
            $(event.target).attr("src", $(event.target).data("url"));
        });

        gifElem.mouseleave(function(event){
            $(event.target).attr("src", $(event.target).data("url_still"));
        });

        $("#gifContainer").append(gifElem);
    });
}

function clearGifs(){
    $(".gif").remove();
}

$(document).ready(function(){
    $("#searchButton").on("click", function(){
        addSearch($("#searchInput").val());
        $("#searchInput").val("");
    });

    $("#searchInput").keypress(function(event){
        if(event.key === "Enter"){
            addSearch($("#searchInput").val());
            $("#searchInput").val("");
        }
        
    });
    
    addSearch("parrot");
});