# How To Use
After firing up your own MongoDB server, run `tsc` to compile the code, then `node dist/main.js` to run the script which converts the data from `data/individual-plans.csv` into your Mongo server.

If a heap memory exception is thrown, add the `--max-out-space-size="larger memory in megabytes"` flag to `node` command.

# Tasks to Complete

## EHR Processing
- Extract data from an EHR system
- Understand authentication system required to access data with an API
- Format data into fields (for future front-end displays)

## Benefit Sheet Processing
- Use Healthcare.gov api to extract benefit sheet content
- If functionality not available, manually pull sheets and extract information based on table placement

