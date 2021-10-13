# TigerGraph D3.js Visualization

## Overview

In this project, we'll be visualising the TigerGraph COVID-19 starter kit using d3.js

## Get Started with TigerGraph Cloud

To learn a little about TigerGraph Cloud and how to get started, check out [this blog](https://www.tigergraph.com/blog/getting-started-with-tigergraph-3-0/) and [this video](https://www.youtube.com/watch?v=NtNW2e8MfCQ).

## Files
* `cred.py` (the renamed version of `cred_example.py`) will contain your credentials for TG Cloud
* `index.html` is the primary file you will be running
* `index.py` contains the FastAPI that `main.js` will be interacting with
* `main.js` creates the charts using D3 to display on `index.html`
* `queries.py` contains the additional queries `index.py` will be calling.

## Create the Dashboard

1. Create a new solution of the COVID-19 starter kit on TigerGraph Cloud
2. Load the data and install the queries
3. Update `cred_example.py` with your TigerGraph credentials and rename it to `cred.py`
4. Create a virtual environment with `python3 -m venv venv` and activate it with `source venv/bin/activate`. Install the libraries with `pip install -r requirements.txt`.
5. Run `python3 queries.py` to install additional queries to your solution
6. Start the FastAPI with `uvicorn index:app --reload`
3. Open `index.html` to view the dashboard!

