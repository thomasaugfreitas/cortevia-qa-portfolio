# Cortevia | QA Portfolio

Cortevia helps independent barbershops manage appointments, subscriptions, and loyalty rewards. This repository contains a runnable QA sample adapted from the subscription coverage rule I exercised in REG-CLI-001.

## Run the sample

From the repository root, run the following command with Node.js 24. No dependency installation is required.

```sh
node --test test/paid-coverage.test.mjs
```

The tests use fictitious records in an in-memory SQLite database. They check that a paid invoice grants coverage within its billing period and that missing, refunded, expired, or Sandbox payments do not grant production coverage.

The sample exercises the coverage decision at the database level. For the broader checkout and browser regression, see the [Cortevia QA case study and evidence](https://cortevia-portfolio-qa.sandy-birch-8958.chatgpt.site/).

Thomas Freitas prepared the project and QA documentation with support from Codex.
