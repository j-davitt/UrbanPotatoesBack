'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Movie = require('./models/movie');
const Moviereview =require('./models/moviereview')
const User = require('./models/user');
mongoose.connect(process.env.DB_URL);
const axios = require('axios');
const verifyUser = require('./auth');


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Mongoose is connected');
});

const app = express();

// middleware
app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 3002;

app.get('/test', (request, response) => {
  response.send('test request received');
});




// app.get('/user', handleGetUser);

// app.get('/user', getUser);
app.put('/user/:id', updateUser);


app.get('/moviereview', getMovieReviews);
app.get('/movies', getMovies);
app.get('/getPopular', getPopular);
app.get('/getNow', getNow);
app.get('/movies/:id', getMoviesByTitle);

app.delete('/movies/:movieID', deleteMovies);

app.post('/movies/:id', postMovies);

app.put('/movies/:movieID', updateMovies);

async function getMovieReviews(request, response, next) {
  try {
    // let allMovies = await Movie.find({});
    let url = `https://api.nytimes.com/svc/movies/v2/reviews/all.json?offset=20&order=by-publication-date&api-key=${process.env.MOVIE_REVIEW_KEY}`;

    let reviewsFromAxios = await axios.get(url);
    let movieReviews = reviewsFromAxios.data.results;

    response.status(200).send(movieReviews);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}



app.use(verifyUser);
app.post('/user', postUser);

async function updateUser(request, response, next) {
  try {
    let id = request.params.id;
    let data = request.body;
    let options = { new: true, overwrite: true };

    const updateUser = await User.findByIdAndUpdate(id, data, options);

    response.status(200).send(updateUser);
  } catch (error) {
    next(error);
  }
}

async function postUser(request, response, next) {
  try {
    let email = request.user.email;
    const foundUser = await User.find({ email });

    console.log(foundUser);
    if (foundUser.length) {
      response.status(200).send(foundUser[0]);
    } else {
      let createdMovie = await User.create({...request.body, email: request.user.email});
      response.status(200).send(createdMovie);
    }
  } catch (error) {
    next(error);
  }
}

async function getMoviesByTitle(request, response, next) {
  try {
    let title = request.params.title;
    const foundMovies = await Movie.find({ title });
    response.status(200).send(foundMovies);
  } catch (error) {
    next(error);
  }
}

async function updateMovies(request, response, next) {
  try {
    let id = request.params.movieID;
    let data = request.body;
    let options = { new: true, overwrite: true };

    const updateMovies = await Movie.findByIdAndUpdate(id, data, options);

    response.status(200).send(updateMovies);
  } catch (error) {
    next(error);
  }
}

//add logic to search database
async function postMovies(request, response, next) {
  try {
    let id = +request.params.id;
    const foundMovie = await Movie.find({ movieId:id });

    console.log(foundMovie);
    if (foundMovie.length) {
      response.status(200).send(foundMovie[0]);
    } else {
      let createdMovie = await Movie.create(request.body);
      console.log(createdMovie);
    response.status(200).send(createdMovie);
    }
  } catch (error) {
    next(error);
  }
}

async function deleteMovies(request, response, next) {

  try {
    let id = request.params.movieID;

    await Movie.findByIdAndDelete(id);

    response.status(200).send('Movie Deleted');
  } catch (error) {
    next(error);
  }
}

async function getMovies(request, response, next) {
  try {
    // let allMovies = await Movie.find({});
    let searchQuery = request.query.searchQuery;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${searchQuery}&language=en-US&page=1&include_adult=false`;

    let moviesFromAxios = await axios.get(url);
    let movieArray = moviesFromAxios.data.results;
    let movieResult = movieArray.map((movie) => new MovieParser(movie));

    response.status(200).send(movieResult);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

async function handleGetUser(req, res) {
  ///
  try {
    const userFromDb = await User.find({ email: req.user.email });
    res.status(200).send(userFromDb);
  } catch (e) {
    console.error(e);
    res.status(500).send("server error");
  }
}

async function getPopular(request, response, next) {
  try {
    let url = `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.MOVIE_API_KEY}&language=en-US&page=1&adult=false`;

    let moviesFromAxios = await axios.get(url);
    let movieArray = moviesFromAxios.data.results;
    let movieResult = movieArray.map((movie) => new MovieParser(movie));

    response.status(200).send(movieResult);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}
async function getNow(request, response, next) {
  try {
    let url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.MOVIE_API_KEY}&language=en-US&page=1&adult=false`;

    let moviesFromAxios = await axios.get(url);
    let movieArray = moviesFromAxios.data.results;
    let movieResult = movieArray.map((movie) => new MovieParser(movie));

    response.status(200).send(movieResult);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

class MovieParser {
  constructor(movieObj) {
    this.movieId = movieObj.id;
    this.title = movieObj.title;
    this.description = movieObj.overview;
    this.poster = movieObj.poster_path;
    this.video = movieObj.video;
    this.comment = [];
  }
}

app.get('*', (request, response) => {
  response.status(404).send('Not Available');
});

app.use((error, request, response, next) => {
  response.status(500).send(error.message);
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));
