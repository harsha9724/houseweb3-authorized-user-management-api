# Todo List API with Authentication

It is a user authenticated CURD operation rest API for todo list developed with express and using mongoDB database. Here user can register and login to perform various curd operations.

## How to run locally

clone the repo, go the project directory,```run npm  install``` to install the dependencies finally run ``` npm start ``` to start the server which will be running the port 5000.

The same server is hosted on cloud platform so that you can visit the link [Click Here](https://houseweb3-authorized-user-management-api.onrender.com). 

In order to test the API, I have documented the API using Swagger docs for testing you can [Click here](https://houseweb3-authorized-user-management-api.onrender.com/api-doc)

## Dockerization

Dockerfile and docker-compose.yml file will define the configuration to create docker containers

## CI/CD 

The file .github/workflows/main.yml is the CI/CD configuration file for the building the docker image to be hosted in the docker hub.
