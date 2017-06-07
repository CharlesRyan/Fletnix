(function(){
getReq("/env.json").then(function(e){
    setVars(JSON.parse(e.target.responseText));
    }, function(e){
    console.log(e);   
    });

function getReq(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = resolve;
        xhr.onerror = reject;
        xhr.send();
    });
}

function envVars(data){
    var root_url, img_url, v3auth;
    return {
        set_root_url: function(data){
            root_url = data;
        },
        set_img_url: function(data){
            img_url = data;
        },
        set_v3auth: function(data){
            v3auth = data;
        },
        get_root_url: function(){
            return root_url;
        },
        get_img_url: function(){
            return img_url;
        },
        get_v3auth: function(){
            return v3auth;
        }
    }
}

var myVars;

function setVars(envs){
    myVars = envVars(envs);
    
    myVars.set_root_url(envs.root_url);
    myVars.set_img_url(envs.img_url);
    myVars.set_v3auth(envs.v3auth);
    
    var topRatedMovies = myVars.get_root_url() + "movie/top_rated?language=en-US&page=1&adult=false&api_key=" + myVars.get_v3auth();

    var popularMovies = myVars.get_root_url(); + "movie/popular?language=en-US&page=1&adult=false&api_key=" + myVars.get_v3auth();

    if(!localStorage.getItem('topRated')){
        getReq(topRatedMovies).then(function(e){
            topRated(JSON.parse(e.target.responseText));
            }, function(e){
            console.log(e);   
            });
        } else {
        topRated(localStorage.getItem('topRated'));
    }
     pageSetup();
}


function topRated(top){
    if(typeof top === "object"){
        localStorage.setItem("topRated", JSON.stringify(top));
    }else if(typeof top === "string"){
        top = JSON.parse(top);
    }
    
    var randomMovie = Math.floor(Math.random() * top.results.length);
    var topMovie = top.results[randomMovie];
    
    var featured = document.querySelector('.featured'),
        poster = document.querySelector('.featured .poster'),
        title = document.querySelector('.featured .title');
    
    featured.style.backgroundImage = "linear-gradient(to right, hsla(0, 0%, 0%, .85) 35%, hsla(0, 0%, 0%, 0.0) 50%), url(../img/nav-shadow.png), " + `url( ${myVars.get_img_url()}original${topMovie.backdrop_path} )`;
    poster.src = `${myVars.get_img_url()}w342${topMovie.poster_path}`;
    title.innerHTML = `${topMovie.original_title}`;
    
    getMovies(top.results);
}

function getMovies(movies){
    var swiperWrapper = document.querySelector('.swiper-wrapper');
    
    if(typeof movies === "object"){
        localStorage.setItem('popularMovies', movies);
    } else if(typeof movies === "string") {
        movies = JSON.parse(movies);
    }
    
    for(let i=0; i < movies.length; i++){
        var figure = document.createElement("figure");
        figure.innerHTML = `
                <figcaption>
                    <div class="thumbMeta">
                        <h1>${movies[i].original_title}</h1>
                        <div><progress max="100" value="20"></progress> <span>23 of 151m</span></div>
                    </div>
                    <div class="thumbRate">
                        <button><i class="fa fa-thumbs-o-up"></i></button> <button><i class="fa fa-thumbs-o-down"></i></button> <button><i class="fa fa-plus"></i></button>
                    </div>
                </figcaption>`;    
        
        figure.classList.add("swiper-slide");
        figure.dataset.id = movies[i].id;
        figure.style.backgroundImage = `url( ${myVars.get_img_url()}w500${movies[i].backdrop_path} )`;
        swiperWrapper.append(figure);
        
        figure.addEventListener('click', function(){
            getMovieDetail(movies[i]);
        });
    }
    
    setupSwipers();
}

function getMovieDetail(movie){
    const target = document.getElementById('detail');
    target.classList.add("active");
    const year = movie.release_date.substring(0, 4);
    target.innerHTML = `
            <div>
                <h1>${movie.original_title}</h1>
                <p><small>${movie.title}</small></p>
                <div class="activeInfo"><span>83% Match</span> <span>${year}</span> <span>PG-13</span> <span>2h 31m</span></div>
                <div class="activeMeta"><progress max="100" value="20"></progress> <span>23 of 151m</span></div>
                <p>${movie.overview}</p>
                <div class="activeRate"><button><i class="fa fa-plus"></i></button> MY LIST <button><i class="fa fa-thumbs-o-up"></i></button> <button><i class="fa fa-thumbs-o-down"></i></button></div>
            </div>
            <button class="selectionPlay"><i class="fa fa-play"></i></button>
            <button class="selectionClose"><i class="fa fa-times"></i></button>`
    var less = document.querySelector('button.selectionClose');
    target.style.backgroundImage = "linear-gradient(to right, hsla(0, 0%, 0%, .85) 35%, hsla(0, 0%, 0%, 0.0) 50%), url(../img/nav-shadow.png), " + `url( ${myVars.get_img_url()}original${movie.backdrop_path} )`;
    less.addEventListener('click', function(e){
        target.innerHTML = '';
        target.classList.remove("active");
    })
}

function pageSetup(){
    var searchForm = document.querySelector('form'),
        search = document.querySelector('form input[type="search"]'),
        searchSubmit = document.querySelector('form input[type="submit"]');

    searchForm.addEventListener('submit', function(evt){
        evt.preventDefault();
        search.value = '';
        searchForm.className = '';
    });

    searchForm.addEventListener('click', function(evt){
        evt.preventDefault();
        searchForm.className = 'searchOpen';
    });
}

var mySwiper = new Swiper ('.swiper-container', {
    // Options
    direction: 'horizontal',
    loop: false,
    width: 250,
    height: 150,
    spaceBetween: 4,
    speed: 500,
    slidesPerView: 'auto',
    slidesPerGroup: 4,
    slidesOffsetBefore: 56,
    slidesOffsetAfter: 56,
    grabCursor: true,
    breakpoints: {
        640: {slidesPerGroup: 1},
        976: {slidesPerGroup: 2}
    },
    CSSWidthAndHeight: true,
    // Navigation arrows
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev'
});

var hoverIntent;

function setupSwipers(){
    var allSwipers = document.querySelector('.swiper-wrapper');
    var hoverIntent;
    allSwipers.childNodes.forEach(function(e){
        e.addEventListener('mouseenter', function(){
            hoverIntent = setTimeout(function(){
            e.classList.add('hovered');
            if(e.previousSibling.nodeName === 'FIGURE'){
                e.previousSibling.classList.add("prev-hovered");
            }
            if(e.nextSibling){
                e.nextSibling.classList.add("next-hovered");
            }
          }, 500);
        });

        e.addEventListener('mouseleave', function(){
            clearTimeout(hoverIntent);
            e.classList.remove('hovered');
            if(e.previousSibling.nodeName === 'FIGURE'){
                e.previousSibling.classList.remove("prev-hovered");
            }
            if(e.nextSibling){
                e.nextSibling.classList.remove("next-hovered");
            }
        }); 
        
        // getMovieDetail happens when slider is populated to conserve API calls
    });

    mySwiper.update(true);
}

// create users

var newUser = document.querySelector('#newUser');
var newUserForm = document.querySelector('#userForm');
var formDiv = document.querySelector('#userForm div');

newUser.addEventListener("click", function(){
  newUserForm.classList.toggle('hidden');
  newUserForm.reset(); 
});

var newUserBtn = document.querySelector('nav form input[type="submit"]');
newUserBtn.addEventListener('click', function(e){
  e.preventDefault();

  createUser(formDiv.children);

  newUserForm.classList.toggle('hidden');
  newUserForm.reset();
});

function createUser(obj){
    if(obj[0].value && obj[1].value){
        alert(`Hello, ${obj[0].value} ${obj[1].value}. Due to arbitrary company policy you have been denied user status.`);
    } else {
        alert("finish the form!");
    }
}
})();