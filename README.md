# gcd-blog

This blog post was built by using NodeJS, ExpressJS, Handlebars, MongoDB, Semantic-UI.

It provides the following functionality:

1. User registration:
    - Login page
    - Logout page/functionality
    - Signup page
2. Creating a new blog post
3. Editing an existing blog post
4. Deleting an existing blog post
4. Making sure the user is logged in before creating, editing, or deleting a blog post
5. A home page with the 10 latest blog posts
6. A contact menu item

## How to run

From the root of the project run it as: 

```bash
./bin/www
```

## Code organisation

```
├── app.js
├── bin
│  ├── install-dependencies.sh
│  └── www
├── config
│  ├── database.js
│  └── passport.js
├── mongodb-backup
│  ├── blogs.json
│  ├── test
│  │  ├── blogs.bson
│  │  ├── blogs.metadata.json
│  │  ├── users.bson
│  │  └── users.metadata.json
│  └── users.json
├── package-lock.json
├── package.json
├── public
│  ├── images
│  │  └── favicon.ico
│  ├── javascripts
│  └── stylesheets
│     └── style.css
├── README.md
├── routes
│  └── routes.js
└── views
   ├── edit.handlebars
   ├── layouts
   │  └── main.handlebars
   ├── list.handlebars
   ├── login.handlebars
   ├── new.handlebars
   ├── partials
   │  ├── footer.handlebars
   │  └── header.handlebars
   ├── show.handlebars
   └── signup.handlebars
```

The UI design is built by using Semantic-UI from https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css and this CSS file is included in the views/layouts/main.handlebars file.

## Installation

All development and tests have been done on macOS Catalina v10.15.4. Therefore this instructions are mainly for macOS but it can easily be altered for any other operating system.

The version of MongoDB used is 4.2 and NodeJS is 13.12.0. ./bin/install-dependencies.sh file can be used all the dependencies or they all can be done manually as follows:

1. Install MongoDB:
   - brew tap mongodb/brew
   - brew install mongodb-community@4.2
2. Start MongoDB:
   - brew services start mongodb-community@4.2
3. Install NodeJS
   - brew install nodejs
4. Install all NodeJS libraris required for this blog:
   - npm install bcrypt-nodejs@0.0.3
   - npm install body-parser@^1.19.0
   - npm install connect-flash@^0.1.1
   - npm install cookie-parser@~1.4.4
   - npm install debug@~2.6.9
   - npm install express@~4.16.1
   - npm install express-handlebars@^3.1.0
   - npm install express-session@^1.17.0
   - npm install express-validator@^5.3.1
   - npm install hbs@^4.1.1
   - npm install http-errors@~1.6.3
   - npm install mongo@^0.1.0
   - npm install mongoose@^5.9.7
   - npm install morgan@~1.9.1
   - npm install passport@^0.4.1
   - npm install passport-local@^1.0.0 

5. Restore MongoDB backup:
   - mongorestore ./mongodb-backup
   
   **Note1:** MongoDB keeps its backup in binary .bson files. You need only the ./mongodb-backup/test foldeer to restore. "test" is the name of the database. The blogs.json and users.json files are provided for information purposes only and the binary files are not user-friendly to read.

   **Note2:** It is not required to restore the MongoDB database. If it is not restored it will start fresh and users can start to register and post blog posts.