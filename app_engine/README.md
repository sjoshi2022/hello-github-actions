# Agero Chatbot

A chatbot to help user in road side assistance request on chat platform.

* Industry: `Travel Industry`
* ML Domain: `Dialogflow NLU`

## Problem Statement

Detailed parargraph on the problem statement - max one paragraph

## Solution

Detailed description of the solution - max one paragraph

## Technology

High level understanding of the technologies used in the solution

### Programming languages

* Node 10.18.0

### Infrastructure (training and Deployment)

* Google App Engine
* Dialogflow


## Setup
Step by step guide to setup the application

```bash
git clone https://gitlab.qdatalabs.com/applied-ai/agero/webhook.git
```

1. Install dependencies:

```bash

npm install
```

And nesessory configurtions to be changed for different environments

```yaml
ENVIRONMENT
  - GOOGLE_APPLICATION_CREDENTIALS: <PATH-TO-SERIVCE-ACCOUNT-FILE>
  - PROJECT_ID: <PROJECT-ID-OF-GCP-PROJECT>
```

Some Important points or warnings should be highlighted

> Take care that the service account key file is not commited and pushed to git

> Do not explain in-detail architecture and case studies here. Create wiki pages for that.

Also highlighting `some words` can be done in this manner.

## Training
Details for what kind os dataset is required for traiing

```
along with the code execution scripts
```

### Deployment
Details of what infrastructure is used to deploy the application along with the scripts to deploy the application with config

```bash
gcloud app deploy
```

## Testing
Detailed guide on how to run unit test cases 

```bash
npm run test
```
This should produce results in the following format

```
Ran 10/10 tests successfully. Test Successful
```