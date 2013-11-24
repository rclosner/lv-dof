Development FastPass
======

## About

Learn more about the Development FastPass, developed for the City of Vegas, at the [Code for America apps page](http://www.codeforamerica.org/?cfa_app=development-fastpass).

## Installation

Development FastPass requires [Node.js](http://nodejs.org/).

Install application dependencies:

```
$ npm install
```

If updating your local repository from a previous version, make sure dependencies are updated.

```
$ npm update
```


## Environment

Set a default application environment:

```
$ export NODE_ENV=development
```

## Database

Set your database credentials:

```
$ export FP_DB_DEVELOPMENT_NAME= your database
$ export FP_DB_DEVELOPMENT_USER= your database username
$ export FP_DB_DEVELOPMENT_PASSWORD= your database password
```

Now that you've got the credentials in place, you can create and migrate the database:

```
$ npm run-script db-setup
```

*Note*: if you plan on working consistently on the application, it might make sense to add the database credentials to your shell configuration.

## Usage

Start the server:

```
$ npm start
```

Start the server in a different application environment:

```
$ (NODE_ENV=production npm start)
```

## Development

### Database Management Commands:

If you want to set up the database for the first time, you can use the setup command (creates the database and migrates it to the latest changeset):

```
$ npm run-script db-setup
```

Create the database (for the current environment):

```
$ npm run-script db-create
```

Drop the database (for the current environment):

```
$ npm run-script db-drop
```

Migrate the database (updates the database to the latest changeset):

```
$ npm run-script db-migrate
```

Rollback the database (undoes the last changeset enacted upon the database):

```
$ npm run-script db-rollback
```

To run any of these commands on an application environment other than the default, use the following format:

```
$ (NODE_ENV=test npm run-script db-migrate)
```

*Note*: For more information on the implementation of these commands, please reference the package.json file.
