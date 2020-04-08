const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function repositoryDoesNotExist(index) {
  return index < 0;
}

function repositoryNotFound(response) {
  return response.status(400).json({ error: 'Repository not found.' });
}

function findRepositoryIndex(id) {
  return repositories.findIndex(repository => repository.id === id);
}

function validateRepositoryExistence(request, response, next) {
  const { id } = request.params;
  const index = findRepositoryIndex(id);

  if (repositoryDoesNotExist(index)) {
    return repositoryNotFound(response);
  }

  return next();
}

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid repository ID.' });
  }

  return next();
}

app.use('/repositories/:id', validateRepositoryId, validateRepositoryExistence);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = { id: uuid(), title, url, techs, likes: 0 }

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const index = findRepositoryIndex(id);

  const repository = repositories[index];
  const repositoryUpdated = { id, title, url, techs, likes: repository['likes'] }

  repositories[index] = repositoryUpdated

  return response.json(repositoryUpdated);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const index = findRepositoryIndex(id);
  repositories.splice(index, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const index = findRepositoryIndex(id);

  repositories[index]['likes'] += 1;

  return response.json(repositories[index]);
});

module.exports = app;