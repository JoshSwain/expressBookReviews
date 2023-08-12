const express = require('express');
let books = require("./booksdb.js");
//let isValid = require("./auth_users.js").isValid;
//let users = require("./auth_users.js").users;

//Authentication start
const jwt = require('jsonwebtoken');
const session = require('express-session')

let users = []

const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

const app = express();

app.use(session({
  secret: "fingerpint",
  resave: true,
  saveUninitialized: true
}));

app.use(express.json());

// app.use("/friends", function auth(req,res,next){
//    if(req.session.authorization) {
//        token = req.session.authorization['accessToken'];
//        jwt.verify(token, "access",(err,user)=>{
//            if(!err){
//                req.user = user;
//                next();
//            }
//            else{
//                return res.status(403).json({message: "User not authenticated"})
//            }
//         });
//     } else {
//         return res.status(403).json({message: "User not logged in"})
//     }
// });

app.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

app.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
app.get('/', (req, res) => {
  const getBooksPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(JSON.stringify(books, null, 4));
    }, 10);
  });

  getBooksPromise
    .then((booksData) => {
      res.send(booksData);
    })
    .catch((error) => {
      res.status(500).json({ message: 'An error occurred while fetching books' });
    });
});


// app.get('/',function (req, res) {
//   res.send(JSON.stringify(books,null,4));
// });

// Get book details based on ISBN


app.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const getisbnBooksPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books[isbn]);
    }, 10);
  });

  getisbnBooksPromise
    .then((booksisbnData) => {
      res.send(booksisbnData);
    })
    .catch((error) => {
      res.status(500).json({ message: 'An error occurred while fetching books' });
    });
});




// app.get('/isbn/:isbn',function (req, res) {
  
//   const isbn = req.params.isbn;
//   res.send(books[isbn])
//  });
  
// Get book details based on author

app.get('/author/:author', (req, res) => {
  const authorName = req.params.author;
  const authorBooks = Object.values(books).filter(book => book.author === authorName);
  const getauthorBooksPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(authorBooks);
    }, 10);
  });

  getauthorBooksPromise
    .then((booksauthorData) => {
      res.send(booksauthorData);
    })
    .catch((error) => {
      res.status(500).json({ message: 'An error occurred while fetching books' });
    });
});


// app.get('/author/:author', function (req, res) {
//   const authorName = req.params.author;

//   const authorBooks = Object.values(books).filter(book => book.author === authorName);

//   if (authorBooks.length === 0) {
//     res.status(404).send('Author not found');
//   } else {
//     res.json(authorBooks);
//   }
// });

// Get all books based on title



app.get('/title/:title', (req, res) => {
  const bookTitle = req.params.title;
  const titledBook = Object.values(books).filter(book => book.title === bookTitle);
  const gettitleBooksPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(titledBook);
    }, 10);
  });

  gettitleBooksPromise
    .then((bookstitleData) => {
      res.send(bookstitleData);
    })
    .catch((error) => {
      res.status(500).json({ message: 'An error occurred while fetching books' });
    });
});

// app.get('/title/:title',function (req, res) {
//   const bookTitle = req.params.title;

//   const titledBook = Object.values(books).filter(book => book.title === bookTitle);

//   if (bookTitle.length === 0) {
//     res.status(404).send('Title not found');
//   } else {
//     res.json(titledBook)};
// });

//  Get book review
app.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn])
});

//Update book review

app.put('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  let book = books[isbn]
  if (book) { //Check is friend exists
      let reviews = req.body.reviews;
      //Add similarly for firstName
      //Add similarly for lastName

      //if DOB the DOB has been changed, update the DOB 
      if(reviews) {
          book["reviews"] = reviews
      }
      books[isbn]=book;
      res.send(`book with isbn ${isbn} updated.`);
  }
  else{
      res.send("Unable to find friend!");
  }
});

app.delete("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let book = books[isbn]
  if (book){
      delete books[isbn]
  }
  res.send(`Book with isbn  ${isbn} deleted.`);
});

let bookPromise = new Promise((resolve,reject) => {
  setTimeout(() => {

    resolve(JSON.stringify(books,null,4))
  },10)})





module.exports.general = app;
