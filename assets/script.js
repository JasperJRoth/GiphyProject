var searches = [];
var activeSearch = 0;
var favorites = [];


function addSearch(s){
    var searchTerm = s.trim();

    var foundMatch = false;
    searches.forEach(function(search){
        if(search.query === searchTerm){
            foundMatch = true;
            M.toast({html: "Search already exists."});
        }
    });
    if(typeof searchTerm !== "string" || foundMatch){
        M.toast({html: "Search Failed!"});
        return;
    }else if(searchTerm.length < 3){
        M.toast({html: "Search needs to be at least three characters!"});
        return;
    }
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
                id: gif.id,
                rating: gif.rating,
                url: gif.images.fixed_width.url,
                url_still: gif.images.fixed_width_still.url
            });
        });

        searches.push(searchData);

        displaySearchButtons();
        displayActiveSearch();
    });
}

function findFavsFromIds(){
    if(favorites.length <= 0){
        M.toast({html: "You have no favorites!"});
        return;
    }

    var ids = "";

    favorites.forEach(function(fav, i){
        if(i < favorites.length - 1){
            ids += fav + ",";
        }else{
            ids += fav;
        }
    });

    $.get("https://api.giphy.com/v1/gifs", {
        api_key: "sMQhK0RPCZwuJqlW37ePtdQv4oWc3a62",
        ids: ids
    }).then(function(response){
        var gifs = [];

        response.data.forEach(function(gif){
            gifs.push({
                id: gif.id,
                rating: gif.rating,
                url: gif.images.fixed_width.url,
                url_still: gif.images.fixed_width_still.url
            });
        });

        showFavs(gifs);
    });
}

function displaySearchButtons(){
    if(activeSearch <= 0){
        $("#searchContainer").html($(`<li class="disabled"><a><i class="material-icons">chevron_left</i></a></li>`));
    }else{
        $("#searchContainer").html($(`<li class="waves-effect"><a onclick="moveActiveSearchLeft()"><i class="material-icons">chevron_left</i></a></li>`));
    }

    searches.forEach(function(search, i){
        var searchElem = $(`<a>${search.query}</a>`);

        searchElem.data("query", search.query);

        searchElem.on("click", function(){
            var searchIndex;
            var thisElem = $(this);

            searches.forEach(function(search, i){
                if(search.query === thisElem.data("query")){
                    searchIndex = i;
                }
            });
            if(!isNaN(searchIndex)){
                activeSearch = searchIndex;
            }else{
                throw new Error("Could not find search corresponding to button.");
            }
            
            displaySearchButtons();
            displayActiveSearch();
        });

        if(i === activeSearch){
            $("#searchContainer").append($(`<li class="active">`).append(searchElem));
        }else{
            $("#searchContainer").append($(`<li class="waves-effect">`).append(searchElem));
        }
    });

    if(activeSearch >= searches.length - 1){
        $("#searchContainer").append($(`<li class="disabled"><a><i class="material-icons">chevron_right</i></a></li>`));
    }else{
        $("#searchContainer").append($(`<li class="waves-effect"><a onclick="moveActiveSearchRight()"><i class="material-icons">chevron_right</i></a></li>`));
    }
}

function moveActiveSearchRight(){
    if(activeSearch < searches.length - 1){
        activeSearch += 1;
        displaySearchButtons();
        displayActiveSearch();
    }
}

function moveActiveSearchLeft(){
    if(activeSearch > 0){
        activeSearch -= 1;
        displaySearchButtons();
        displayActiveSearch();
    }
}

function displayActiveSearch(){
    var gifList = [];
    
    clearGifs();

    searches[activeSearch].gifs.forEach(function(gif){
        var gifWrapper = $(`<div class="col s12 m6 l4 xl3 card teal lighten-1 gifWrapper"></div>`);
        var gifElem = $(`<a><img class="card-content gifImg" src="${gif.url_still}"></a>`);
        var favBtn = $(`<a class="favBtn">`);

        gifElem.data("isStill", true);
        gifElem.data("url", gif.url);
        gifElem.data("url_still", gif.url_still);

        gifElem.on("click", function(){
            if($(this).data("isStill")){
                $(this).data("isStill", false);
                $(this).children("img").attr("src", $(this).data("url"))
            }else{
                $(this).data("isStill", true);
                $(this).children("img").attr("src", $(this).data("url_still"))
            }
        });

        if(favorites.includes(gif.id)){
            favBtn.html($(`<a class="btn-floating btn-large red lighten-2 favBtn"><i class="material-icons">favorite</i></a>`));
        }else{
            favBtn.html($(`<a class="btn-floating btn-large red lighten-2 favBtn"><i class="material-icons">favorite_border</i></a>`));
        }

        favBtn.data("id", gif.id);

        favBtn.on("click", function(){
            if(favorites.includes($(this).data("id"))){
                removeFav($(this).data("id"));
            }else{
                addFav($(this).data("id"));
            }
        });

        gifWrapper.append(gifElem);

        gifWrapper.append(favBtn);

        gifWrapper.append($(`<div class="section">`));
        gifWrapper.append($(`<div class="section">`));

        gifList.push(gifWrapper);
    });

    gifList.forEach(function(gif){
        $("#gifContainer").append(gif);
    });
}

function clearGifs(){
    $(".gifWrapper").remove();
}

function clearFavs(){
    favorites = [];
    localStorage.setItem("favorites", "");
    refreshFavs();
}

function addFav(id){
    if(!favorites.includes(id)){
        favorites.push(id);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        refreshFavs();
    }
}

function removeFav(id){
    favorites.splice(favorites.indexOf(id), 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    refreshFavs();
}

function refreshFavs(){
    $(".favBtn").each(function(){
        if(favorites.includes($(this).data("id"))){
            $(this).html($(`<a class="btn-floating btn-large red lighten-2 favBtn"><i class="material-icons">favorite</i></a>`));
        }else{
            $(this).html($(`<a class="btn-floating btn-large red lighten-2 favBtn"><i class="material-icons">favorite_border</i></a>`));
        }
    });
}

function showFavs(favGifs){
    var gifList = [];
    
    clearGifs();

    favGifs.forEach(function(gif){
        var gifWrapper = $(`<div class="col s12 m6 l4 xl3 card teal lighten-1 gifWrapper"></div>`);
        var gifElem = $(`<a><img class="card-content gifImg" src="${gif.url_still}"></a>`);
        var favBtn = $(`<a class="favBtn">`);

        gifElem.data("isStill", true);
        gifElem.data("url", gif.url);
        gifElem.data("url_still", gif.url_still);

        gifElem.on("click", function(){
            if($(this).data("isStill")){
                $(this).data("isStill", false);
                $(this).children("img").attr("src", $(this).data("url"))
            }else{
                $(this).data("isStill", true);
                $(this).children("img").attr("src", $(this).data("url_still"))
            }
        });

        if(favorites.includes(gif.id)){
            favBtn.html($(`<a class="btn-floating btn-large red lighten-2 favBtn"><i class="material-icons">favorite</i></a>`));
        }else{
            favBtn.html($(`<a class="btn-floating btn-large red lighten-2 favBtn"><i class="material-icons">favorite_border</i></a>`));
        }

        favBtn.data("id", gif.id);

        favBtn.on("click", function(){
            if(favorites.includes($(this).data("id"))){
                removeFav($(this).data("id"));
            }else{
                addFav($(this).data("id"));
            }
        });

        gifWrapper.append(gifElem);

        gifWrapper.append(favBtn);

        gifWrapper.append($(`<div class="section">`));
        gifWrapper.append($(`<div class="section">`));
        
        gifList.push(gifWrapper);
    });

    gifList.forEach(function(gif){
        $("#gifContainer").append(gif);
    });
}

function showResults(){
    clearGifs();
    displayActiveSearch();
}

$(document).ready(function(){
    if(localStorage.getItem("favorites")){
        favorites = JSON.parse(localStorage.getItem("favorites"));
    }

    $("#search_input").keydown(function(event){
        if(event.key === "Enter"){
            addSearch($("#search_input").val());
            $("#search_input").val("");
        }
    });

    M.toast({html: "Click on a gif to make it play!"});

    addSearch("parrot");
    addSearch("giraffe");
    addSearch("dog");
    addSearch("cat");
    addSearch("moose");
    addSearch("lizard");
});