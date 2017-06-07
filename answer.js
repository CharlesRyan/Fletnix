(function(){

    getReq('/env.json', setVars);


    function getReq(url, cb){
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.onload = function(){
            if(req.readyState === 4 && req.status === 200){
                cb(JSON.parse(req.responseText));
            }else{
                console.log('error', req.statusText);
            }
        };
        req.send(null);
    }

    function envVars(data){
        var root_url, img_url, v3auth, v4auth, example;
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
        myVars = envVars();
        myVars.set_root_url(envs.root_url);
        myVars.set_img_url(envs.img_url);
        myVars.set_v3auth(envs.v3auth);

        var popularMovies = myVars.get_root_url() + 'movie/popular?language=en-US&adult=false&page=1&api_key=' + myVars.get_v3auth();
        var topRatedMovies = myVars.get_root_url() + 'movie/top_rated?language=en-US&adult=false&page=1&api_key=' + myVars.get_v3auth();

        if(!localStorage.getItem('popularMovies')){
            getReq(popularMovies, getMovies);
        }else{
            getMovies(localStorage.getItem('popularMovies'));
        }

        if(!localStorage.getItem('topRated')){
            getReq(topRatedMovies, topRated);
        }else{
            topRated(localStorage.getItem('topRated'));
        }

        pageSetup();
    }

    function topRated(top){
        if(typeof top === 'object'){
            localStorage.setItem('topRated', JSON.stringify(top));
        }
        if(typeof top === 'string'){
            top = JSON.parse(top);
        }
        var randMovie = Math.floor(Math.random() * top.results.length);
        var movie = top.results[randMovie];
        console.log(movie);

        var featured = document.querySelector('.featured'),
            poster = document.querySelector('.featured .poster'),
            title = document.querySelector('.featured .title');

        featured.style.backgroundImage = `linear-gradient(to right, hsla(0, 0%, 0%, .85) 35%, hsla(0, 0%, 0%, 0) 50%), url(../img/nav-shadow.png), url(${myVars.get_img_url()}original${movie.backdrop_path})`;
        poster.src = `${myVars.get_img_url()}w342${movie.poster_path}`;
        title.innerHTML = `${movie.original_title}`;
    }

    function getMovies(movies){
        if(typeof movies === 'object'){
            localStorage.setItem('popularMovies', JSON.stringify(movies));
        }
        if(typeof movies === 'string'){
            movies = JSON.parse(movies);
        }

        var movieWrapper = document.querySelector('.swiper-wrapper');
        movieWrapper.innerHTML = '';
        movies.results.forEach(function(ele){
            var movieThumb = document.createElement('figure');
            var thumbHTML = `
                <figcaption>
                    <div class="thumbMeta">
                        <h1>${ele.title}</h1>
                        <div><progress max="100" value="80"></progress> <span>23 of 151m</span></div>
                    </div>
                    <div class="thumbRate">
                        <button><i class="fa fa-thumbs-o-up"></i></button> <button><i class="fa fa-thumbs-o-down"></i></button> <button><i class="fa fa-plus"></i></button>
                    </div>
                </figcaption>`;
            movieThumb.innerHTML = thumbHTML;
            movieThumb.className = 'swiper-slide';
            movieThumb.dataset.id = ele.id;
            movieThumb.style.backgroundImage = 'url('+myVars.get_img_url()+'w780'+ele.backdrop_path+')';
            movieWrapper.appendChild(movieThumb);
        });

        setupSwipers();
    }

    function getMovieDetail(movie){
        console.log(movie);
        var movieDetail = document.getElementById('detail');
        var releaseDate = movie.release_date.split('-')[0];

        var detail = `
        <div>
            <h1>${movie.title}</h1>
            <p><small>${movie.tagline}</small></p>
            <div class="activeInfo"><span>83% Match</span> <span>${releaseDate}</span> <span>PG-13</span> <span>2h 31m</span></div>
            <div class="activeMeta"><progress max="100" value="80"></progress> <span>23 of 151m</span></div>
            <p>${movie.overview}</p>
            <div class="activeRate"><button><i class="fa fa-plus"></i></button> MY LIST <button><i class="fa fa-thumbs-o-up"></i></button> <button><i class="fa fa-thumbs-o-down"></i></button></div>
        </div>
        <button class="selectionPlay"><i class="fa fa-play"></i></button>
        <button class="selectionClose"><i class="fa fa-times"></i></button>`;

        movieDetail.style.backgroundImage = `linear-gradient(to right, hsla(0, 0%, 0%, .85) 35%, hsla(0, 0%, 0%, 0) 50%), url(../img/nav-shadow.png), url(${myVars.get_img_url()}original${movie.backdrop_path})`;

        movieDetail.className = 'active';
        movieDetail.innerHTML = detail;


        document.querySelector('#detail .selectionClose').addEventListener('click', function(){
            movieDetail.innerHTML = '';
            movieDetail.className = '';
            console.log(movieDetail);
        });
    }

    function pageSetup(){
        var searchForm = document.querySelector('form'),
            search = document.querySelector('form input[type="search"]'),
            searchSubmit = document.querySelector('form input[type="submit"]');

        searchForm.addEventListener('submit', function(evt){
            evt.preventDefault();
            var userSearch = search.value;
            search.value = '';
            searchForm.className = '';

            var url = myVars.get_root_url()+'search/movie?api_key='+myVars.get_v3auth()+'&language=en-US&page=1&query='+userSearch;
            getReq(url, getMovies);
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

        allSwipers.childNodes.forEach(function(e){
            e.addEventListener('mouseenter', function(){
                hoverIntent = setTimeout(function(){
                    e.classList.add('hovered');
                    if(e.previousElementSibling){
                        e.previousElementSibling.classList.add('prev-hovered');
                    }
                    if(e.nextElementSibling){
                        e.nextElementSibling.classList.add('next-hovered');
                    }
                }, 450);
            });
            e.addEventListener('mouseleave', function(){
                clearTimeout(hoverIntent);
                e.classList.remove('hovered');
                if(e.previousElementSibling){
                    e.previousElementSibling.classList.remove('prev-hovered');
                }
                if(e.nextElementSibling){
                    e.nextElementSibling.classList.remove('next-hovered');
                }
            });
            e.addEventListener('click', function(){
                var movieDetail = myVars.get_root_url() + 'movie/' + this.dataset.id + '?language=en-US&adult=false&api_key=' + myVars.get_v3auth();
                getReq(movieDetail, getMovieDetail);
            });
        });

        mySwiper.update(true);
    }

}());