# quiz-world
This project provides service endpoints for a quiz-world frontend application. This will be providing all the needed APIs for the client side consumption. All the available endpoints will be availabe to authenticated requests and will not be availabe to anyone.

##APIs
###Registration

```
Request: POST /register
Paylod: {
  email: "user_email@email.com",
  password: "Password1",
  confirmPassword: "Password1"
}

Response:
Successful: 201
{
  token: "token_string_for_authenticated_request",
  userID: "user_id_string"
}

Unsuccessful:
400 Bad request => Issue with payload (Email and password validation errors and mismatch passwords ...)
422 User already exists => Duplicate email

```

###Login

```
Request: POST /login
Paylod: {
  email: "user_email@email.com",
  password: "Password1",
  session: "session_key"
}

Response:
Successful: 200
{
  token: "token_string_for_authenticated_request",
  userID: "user_id_string"
}

Unsuccessful:
400 Bad request => Issue with payload (Email and password validation errors)
404 User not found => Email and passwords don't match
```

###Logout

```
Request: DELETE /login

Response:
200
```

###Users

```
*User has to be an Admin for this request

Request: GET /users
headers: {
  session-id: "token_string_for_authenticated_request"
}

Response:
Successful: 200
[
  {
    "_id": "5673b48811d8971f00648269"
    "email": "sam@test.com"
    "password": "$2a$08$N1HrGqqF19IrJLZ5VxpLteCHyqa9gyFmJZkKhf1twFccJqlMxYpNW"
    "updatedAt": "2015-12-18T07:23:50.882Z"
    "createdAt": "2015-12-18T07:23:50.882Z"
    "role": "admin"
  },
  {
    "_id": "5673b55611d8971f0064826b"
    "email": "jim@test.com"
    "password": "$2a$08$60WjY1GCIZAv60dbOs7uPOsGUJKopBRzpMyKIPcRXp0fNUYX0y6HG"
    "updatedAt": "2015-12-18T07:27:18.377Z"
    "createdAt": "2015-12-18T07:27:18.377Z"
    "role": "user"
  },
  {
    "_id": "5673b56511d8971f0064826c"
    "email": "ron@test.com"
    "password": "$2a$08$HNS9nCLKcWrmCfK5/pstSubKD1hxJFumhuVRknZ73.b1FIF0.DUXm"
    "updatedAt": "2015-12-18T07:27:32.939Z"
    "createdAt": "2015-12-18T07:27:32.939Z"
    "role": "user"
  }
]

Unsuccessful:
401 User not authorized => User with unauthanticated session or with out the proper role/right
```
###User

```
*User has to be an Admin or Self for this request

Request: GET /users/5673b48811d8971f00648269
headers: {
  session-id: "token_string_for_authenticated_request"
}

Response:
Successful: 200
{
  "_id": "5673b48811d8971f00648269"
  "email": "sam@test.com"
  "password": "$2a$08$N1HrGqqF19IrJLZ5VxpLteCHyqa9gyFmJZkKhf1twFccJqlMxYpNW"
  "updatedAt": "2015-12-18T07:23:50.882Z"
  "createdAt": "2015-12-18T07:23:50.882Z"
  "role": "admin"
}
Unsuccessful:
401 User not authorized => User with unauthanticated session or with out the proper role/right

Request: PUT /users/5673b48811d8971f00648269
headers: {
  session-id: "token_string_for_authenticated_request"
}
Paylod: *requires at least one value to be updated
{
  email: "the_new_email@test.com",
  password: "The_new_password1"
}

Response:
Successful: 201
{
  message: "User successfully updated."
}

Unsuccessful:
401 User not authorized => User with unauthanticated session or with out the proper role/right
404 User not found => User is not found
400 Bad request => Invalid email or password
422 Not created => Email is alreay taken

*User has to be an Admin for this request

Request: DELETE /users/5673b48811d8971f00648269
headers: {
  session-id: "token_string_for_authenticated_request"
}


Response:
Successful: 201
{
  message: "User successfully deleted."
}

Unsuccessful:
400 Invalid request => email is missing from payload 
404 Not found => User is not found
```
###Question

```
*User has to be an Admin for this request

Request: POST /questions
headers: {
  session-id: "token_string_for_authenticated_request"
}
Payload:
{
  question: "This is the first question?",
  options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
  difficulty: 1,
  type: "css"
}

Response:
Successful: 201
{
  message: "Question successfully added."
}

Unsuccessful:
401 User not authorized => User with unauthanticated session or with out the proper role/right
400 Bad request => Missing payload


Request: PUT /questions/5673b48811d8971f00648269
headers: {
  session-id: "token_string_for_authenticated_request"
}
Paylod: *requires at least one value to be updated
{
  question: "This is the first question?",
  options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
  difficulty: 1,
  type: "css"
}

Response:
Successful: 201
{
  message: "Question successfully updated."
}

Unsuccessful:
401 User not authorized => User with unauthanticated session or with out the proper role/right
404 Question not found => Question is not found
400 Bad request => Missing payload

*User has to be an Admin for this request

Request: DELETE /questions/5673b48811d8971f00648269
headers: {
  session-id: "token_string_for_authenticated_request"
}

Response:
Successful: 201
{
  message: "Question successfully deleted."
}

Unsuccessful:
400 Invalid request => id is missing from payload
404 Not found => Question is not found
```
###Questions
```
*User has to be an Admin for this request

Request: POST /questions/bulk
headers: {
  session-id: "token_string_for_authenticated_request"
}
Payload:
{
  questions: [{
      question: "This is the new first question?",
      options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
      difficulty: 1,
      type: "html"
    },
    {
      question: "This is the new second question?",
      options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
      difficulty: 1,
      type: "css"
    },
    {
      question: "This is the new third question?",
      options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
      difficulty: 1,
      type: "js"
    },
    {
      question: "This is the new question?",
      options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id."}, {option: "Event handler."}],
      difficulty: 1,
      type: "qa"
    }
  ]
}

Response:
Successful: 201
{
  success: {
    message: "Questions successfully added.",
    count: 3
  },
  faluire: {
    message: "Invalid format in paylod.",
    questions: [{
      question: "This is the new question?",
      options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id."}, {option: "Event handler."}],
      difficulty: 1,
      type: "qa"
    }]
  }
}

Unsuccessful:
401 User not authorized => User with unauthanticated session or with out the proper role/right
400 Bad request => Missing payload
```
