const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const PORT = process.env.PORT || 8080;


app.set("view engine", "ejs");
app.use(cookieSession({
  name: "session",
  keys: [process.env.user_id || "userName"]
}));

const urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

function urlsForUser(id) {
  let tempObject = {};
  Object.keys(urlDatabase).forEach(function(shortURLkey) {
    if (urlDatabase[shortURLkey]["userID"] === id) {
      tempObject[shortURLkey] = urlDatabase[shortURLkey];
    }
  });
  return tempObject;
}

function generateRandomString() {
  let text = "";
  const possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  for(let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

//allow to access POST request parameters
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  let templateVars = {
    users: req.session.user_id
  };
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    users: req.session.user_id,
    user: users[req.session.user_id]
  };
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    users: req.session.user_id,
    user: users[req.session.user_id]
  };
  res.render("registration", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id !== urlDatabase[req.params.id]["userID"]) {
    res.status(403).send("Error 403: unauthorized user");
    return;
  }
  let urlLine = req.params.id;
  let templateVars = {
    users: req.session.user_id,
    user: users[req.session.user_id]
  };
  delete urlDatabase[urlLine];
  res.redirect("/urls");
});

//route for editing
app.post("/urls/:id", (req, res) => {
  if (req.session.user_id !== urlDatabase[req.params.id]["userID"]) {
    res.status(403).send("Error 403: unauthorized user");
    return;
  }
  let templateVars = {
    users: req.session.user_id,
    user: users[req.session.user_id]
  };
  urlDatabase[req.params.id] = {
    url: req.body.longURL,
    userID: req.session.user_id
  };
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const key = generateRandomString();
  let templateVars = {
    users: req.session.user_id,
    user: users[req.session.user_id]
  };
  // urlDatabase[key] = req.body.longURL;
  urlDatabase[key] = {
    url: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect("/urls/" + key);
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("Error 403: Please login.");
    return;
  }
  if (req.session.user_id !== urlDatabase[req.params.id]["userID"]) {
    res.status(403).send("Error 403: unauthorized user");
    return;
  }
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]["url"],
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let templateVars = {
    users: req.session.user_id,
    user: users[req.session.user_id]
  };
  let longURL = urlDatabase[req.params.shortURL]["url"];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  let templateVars = {
    users: req.session.user_id,
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});


app.post("/login", (req, res) => {
  let userName;
  Object.keys(users).forEach(function(userKey) {
    if (users[userKey]["email"] === req.body.email
    && bcrypt.compareSync(req.body.password, users[userKey]["password"]) === true) {
    //below was code before hashing

      userName = users[userKey]["id"];
    }
  });
  if (!userName) {
    res.status(403).send("Invalid email or password");
  } else {
    req.session.user_id = userName;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/400", (req, res) => {
  res.render("400", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Invalid email or password");
    return;
  } else {
    const userID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    let newUser = {
      id: userID,
      email: req.body.email,
      password: hashedPassword
    };
    users[userID] = newUser;
    req.session.user_id = newUser.id;
    res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});