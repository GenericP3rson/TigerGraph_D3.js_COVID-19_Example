
from typing import Optional  
from fastapi import FastAPI 
import pyTigerGraph as tg
import flat_table
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import cred

app = FastAPI()   

conn = tg.TigerGraphConnection(host=cred.SUBDOMAIN, graphname=cred.GRAPHNAME,
                               username=cred.TIGERGRAPH_USERNAME, password=cred.TIGERGRAPH_PASSWORD)
conn.apiToken = conn.getToken(conn.createSecret())

app.add_middleware( # Add middleware to get around CORS
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

@app.get("/") 
def read_root():
    '''
    '''
    return {"Hello": "World"}

@app.get("/ageDistribution")
def ageDistribution():
    try:
        res = conn.runInstalledQuery("ageDistribution")
        return {"res": res[0]["@@ageMap"]}
    except:
        return {"msg": "There's an error!"}

@app.get('/grabInfectionLocationDetails')
def grabInfectionLocationDetails():
    try:
        res = conn.runInstalledQuery("grabInfectionLocationDetails")
        return {"res": res[0]["@@information"]}
    except:
        return {"msg": "There's an error!"}

@app.get('/getWeatherStat')
def getWeatherStat():
    try:
        res = conn.getVertices("WeatherStat")
        return {"res": [i["attributes"] for i in res]}
    except:
        return {"msg": "There's an error!"}

