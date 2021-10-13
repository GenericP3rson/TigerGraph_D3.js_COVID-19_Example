import pyTigerGraph as tg 
import cred 

conn = tg.TigerGraphConnection(host=cred.SUBDOMAIN, graphname=cred.GRAPHNAME,
                               username=cred.TIGERGRAPH_USERNAME, password=cred.TIGERGRAPH_PASSWORD)
conn.apiToken = conn.getToken(conn.createSecret())

# Create a query to grab the coordinates from the CASE_IN_CITY edge and other details about that infection location.
conn.gsql('''
USE GRAPH MyGraph

DROP QUERY grabInfectionLocationDetails

CREATE QUERY grabInfectionLocationDetails() FOR GRAPH MyGraph SYNTAX v2 {

  TYPEDEF TUPLE <FLOAT lat, FLOAT lon, STRING infcase, STRING province, UINT num_confirmed_cases, UINT population, FLOAT area> INFO;
  
  HeapAccum<INFO> (1000, num_confirmed_cases DESC, population DESC) @@information;
  
  Seed = {City.*};
  Res = SELECT tgt FROM Seed:c - (CASE_IN_CITY:e)- InfectionCase:i -(CASE_IN_PROVINCE:e2)-Province:tgt
        ACCUM @@information+=INFO(e.latitude, e.longitude, i.infection_case, tgt.province, i.confirmed, tgt.population, tgt.area);
  PRINT @@information;

}

INSTALL QUERY grabInfectionLocationDetails
''')