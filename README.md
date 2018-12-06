# REST API NodeJS Authentication with token JWT

Nodejs API with JWT Authentication.


## Installing

```
npm install
node app.js
```

## Available APIs

### User APIs


#### GET `/users`

No argument.

Returns all users in the database.


#### POST `/users`

To create a new user.

The body must have :

* `name`: The name
* `password`: The password
* `email`: The email


#### GET `/users/self`

Returns information from the current user.

Require authentication and following in header :

```json
{
  "Authorization": "Bearer " + {token jwt}
}
```

It returns the following :

```json
{
  "_id": {"id"},
  "name": {"name"},
  "email": {"email"},
  "superUser": {"superUser"},
}
```


#### GET `/users/:id`

Returns information of one user.

Require authentication and following in header :

```json
{
  "Authorization": "Bearer " + {token jwt}
}
```

It returns the following :

```json
{
  "_id": {id},
  "name": {name},
  "email": {email},
  "superUser": {superUser},
}
```


#### PATCH `/users/self`

To update its information.

Require authentication and following in header :

```json
{
  "Authorization": "Bearer " + {token jwt}
}
```

The body must have :

* `name`: new name
* `password`: new password
* `email`: new email


#### PATCH `/users/:id`

To update the information of a user.

Must be super user.
Require authentication and following in header :

```json
{
  "Authorization": "Bearer " + {token jwt}
}
```

The body must have :

* `name`: new name
* `password`: new password
* `email`: new email


#### POST `/api/login`

To connect to the application.

The body must have :

* `name`: name
* `password`: password

It returns the following :

```json
{
  "token": "Bearer " + {token jwt}
}
```


#### POST `/api/forgot`

To send a link to reset the password.

The body must have :

* `email`: email

It returns the following :

```json
{
  "token": {link}
}
```

The link expires after 1 hour.


#### GET `/api/reset/:token`

To reset the password.

It returns the following :

```json
{
  "password": {new password}
}
```
