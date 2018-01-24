const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { username: req.cookies["login"] };
  res.end("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["login"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["login"] };
  res.render("urls_new", templateVars);
});


app.post("/urls/:id/delete", (req, res) => {
  let urlLine = req.params.id;
  let templateVars = { username: req.cookies["login"] };
  //conosle.log to check id
  // console.log(req.params);
  delete urlDatabase[urlLine];
  res.redirect("/urls");
});
app.post("/urls", (req, res) => {
  const key = generateRandomString();
  let templateVars = { username: req.cookies["login"] };
  urlDatabase[key] = req.body.longURL;
  res.redirect("/urls/" + key);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {shortURL: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["login"] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let templateVars = { username: req.cookies["login"] };
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let templateVars = { username: req.cookies["login"] };
  let longURL = urlDatabase[req.params.shortURL];
  // console.log(req.params);
  res.redirect(longURL);
});
app.post("/login", (req, res) => {
  let templateVars = { username: req.cookies["login"] };
  res.cookie('login', req.body.login);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});