# JanusGraph Server

Welcome to the documentation for your server built using Express.js and Gremlin as the database language. This README will provide you with essential information about setting up, configuring, and maintaining your server. Please follow the instructions below to ensure a smooth experience.

## Table of Contents

- [JanusGraph Server](#janusgraph-server)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Usage](#usage)
  - [API Endpoints](#api-endpoints)
  - [Database](#database)

## Getting Started

Before you begin, make sure you have a basic understanding of Express.js, Gremlin, and general server-side development concepts.

## Installation

1. Clone this repository to your local machine: `git clone https://gitlab.nome.fi/Andy/janusgraph_server.git`
2. Navigate to the project directory: `cd janusgraph_server`
3. Install the required dependencies: `npm install`

## Configuration

1. Rename `.env.example` to `.env` and provide the necessary configuration values, including your Gremlin database credentials and other environment-specific settings.

## Usage

To start the server locally, run the following command:

```bash
npm start
```

This will start the Express.js server and allow you to access it through your web browser or API client.

## API Endpoints

Route structure:

- **GET /vertex**: Fetch one vertex based on the given ID on the request body.
- **POST /vertex**: Create a new vertex in the Gremlin database.
- **PUT /vertex**: Update an existing vertex by ID.
- **DELETE /vertex**: Delete a vertex from the Gremlin database.

- **GET /edge**: Fetch one edge based on the given ID on the request body.
- **POST /edge**: Create a new edge in the Gremlin database.
- **DELETE /edge**: Delete an edge from the Gremlin database.

- **DELETE /clean**: Deletes all vertices that have no edges.
- **DELETE /drop**: Deletes all vertices and edges from the database.

## Database

Your server uses Gremlin as the database language. Make sure to handle database connections properly and follow best practices for querying and data manipulation.