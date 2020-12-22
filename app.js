require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const movieData= require('./movies-data.json')


console.log(process.env.API_TOKEN)

const app = express();

//Question- difference between dev and common?
app.use(morgan('dev'));
app.use(cors())
app.use(helmet())


app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization')
  const apiToken = process.env.API_TOKEN
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  next()
})


app.get('/movie', (req,res)=>{

    const {genre ="", country="", average_vote= ""} = req.query

    //string to float
    const averageVoteNumber= parseInt(average_vote)

    //query param string trim/lowercase setup
    const countryQueryParam = country.toLowerCase().trim();

    //lower/trim string then uppercase first letter == movie data store format
    const genreLowerTrim = genre.toLowerCase().trim();
    let genreQueryParam= genreLowerTrim.charAt(0).toUpperCase()+genreLowerTrim.slice(1);

    const possibleCountries = ['canada',               
    'france', 'germany', 'great britain','hungary',
    'italy', 'israel', 'italy', 'spain',
    'japan', 'united states', 'china'];

    const possibleGenres = {};
    movieData.map( movie => {
        possibleGenres[movie.genre] = true
          
    });

    console.log(possibleGenres);
    let data = movieData

    // unhappy case: genre query param
    if(genre && !possibleGenres[genreQueryParam]){
            return res
                .status(404)
                .send('Please select a genre such as Action, Adventure, Comedy, Thriller')
    }
    else if (genre){
       data = data.filter(movie => movie.genre.toLowerCase() == genreQueryParam.toLowerCase())
    }
    

    // unhappy case: country query param
    if(country && !possibleCountries.includes(countryQueryParam)){
            console.log(country);
            return res
                .status(404)
                .send('Please select available country such as United States, Italy, France, Great Britain')
    }
    else if(country){
        data = data.filter( movie => movie.country.toLowerCase() == countryQueryParam.toLowerCase())
    }


    // unhappy case: average vote
    if(average_vote && Number.isNaN(averageVoteNumber)){
            return res
                .status(404)
                .send('average vote must be a number')           
    }

    else if(average_vote){
        data = data.filter(movie => movie.avg_vote >= averageVoteNumber )
    }

    //happy basic response: no optional query params
        return res.json(data)
    
})


module.exports = app