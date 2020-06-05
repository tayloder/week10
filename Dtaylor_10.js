var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var mysql = require('mysql');
var pool = mysql.createPool({
  host  : 'localhost',
  user  : 'student',
  password: 'default',
  database: 'student'
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 41286);

app.get('/',function(req,res,next){
  var context = {};
  pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = JSON.stringify(rows);
    res.render('home', context);
  });
});

app.get('/reset-table',function(req,res,next){
  var context = {};
  pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});

app.get('/submit-form',function(req,res,next){
  var context = {};
   pool.query("INSERT INTO workouts VALUES (?)", [req.query], function(err, result){
     if(err){
       next(err);
       return;
     }
     context.results = JSON.stringify(result);
     res.render('get-submit',context);
   });
 });

app.post('/submit-form', function(req,res,next){
  var queryParams = [];
  var context = {};
   pool.query("INSERT INTO workouts VALUES (?)", [req.query], function(err, result){
     if(err){
       next(err);
       return;
     }
     pool.query("INSERT INTO workouts VALUES (?)", [req.body], function(err, body){
       if(err){
         next(err);
         return;
       }
     context.queryResults = JSON.stringify(result);
     context.bodyResults = JSON.stringify(body);
     res.render('post-submit',context);
   });
 });

app.use(function(req,res){
 res.status(404);
 res.render('404');
});

app.use(function(err, req, res, next){
 console.error(err.stack);
 res.type('plain/text');
 res.status(500);
 res.render('500');
});

app.listen(app.get('port'), function(){
 console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
