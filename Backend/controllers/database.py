import datetime
import json

import pandas as pd
import pymongo
import pytz
from helpers.utils import cleanOutliers

host = "tatapower.bosgsf9.mongodb.net"
password = "tatapower"
user = "parth"
client = pymongo.MongoClient(
    "mongodb+srv://"
    + user
    + ":"
    + password
    + "@"
    + host
    + "/test?retryWrites=true&w=majority"
)


db = client.Data

dataRecordsERROR = db.errors
loadDataRecords = db.Load3
IMDDataRecords = db.Weather3
TPDataRecords = db.Weather3
log_collection = db.logs
Diff = db.Difference
Date_info = db.Daytype_Info


def convert_datetime_timezone(dt, tz1, tz2):
    tz1 = pytz.timezone(tz1)
    tz2 = pytz.timezone(tz2)

    dt = datetime.datetime.strptime(dt, "%Y-%m-%d %H:%M:%S")
    dt = tz1.localize(dt)
    dt = dt.astimezone(tz2)
    # dt = dt.strptime("%Y-%m-%d %H:%M:%S")

    return dt


def checkDBData(date_from, date_to):
    # Convert input date strings to datetime objects
    start_date = datetime.datetime.strptime(date_from, "%Y-%m-%d")
    end_date = datetime.datetime.strptime(date_to, "%Y-%m-%d")

    # Convert datetime objects to UTC timezone
    start_date_utc = convert_datetime_timezone(str(start_date), "Asia/Calcutta", "UTC")
    end_date_utc = convert_datetime_timezone(str(end_date), "Asia/Calcutta", "UTC")

    records_df = pd.DataFrame(
        list(
            loadDataRecords.find(
                {"datetime": {"$gte": start_date_utc, "$lt": end_date_utc}}
            ).sort("datetime", 1)
        )
    )
    # print(records_df)

    # If there are records, delete them from the database
    if len(records_df)>1:
        # print('decords')
        # print(records_df)
        result = loadDataRecords.delete_many({"datetime": {"$gte": start_date_utc, "$lt": end_date_utc}})
    return True

def checkTPWeatherDBData(datefrom, dateto):
      # Convert input date strings to datetime objects
    start_date = datetime.datetime.strptime(datefrom, "%Y-%m-%d")
    end_date = datetime.datetime.strptime(dateto, "%Y-%m-%d")

    # Convert datetime objects to UTC timezone
    start_date_utc = convert_datetime_timezone(str(start_date), "Asia/Calcutta", "UTC")
    end_date_utc = convert_datetime_timezone(str(end_date), "Asia/Calcutta", "UTC")
    
    records_df = pd.DataFrame(
        list(
            TPDataRecords.find(
                {"datetime": {"$gte": start_date_utc, "$lt": end_date_utc}}
            ).sort("datetime", 1)
        )
    )
    
    # print("checkTPWeatherDBData")
    # print(records_df)

    if len(records_df)>1:
        result = TPDataRecords.delete_many({"datetime": {"$gte": start_date_utc, "$lt": end_date_utc}})
    return True

def checkError(DATE):
    # print("Insider check error")
    # Convert input date strings to datetime objects
    date = datetime.datetime.strptime(DATE, "%Y-%m-%d")
    # print(date)
    records_df = pd.DataFrame(
        list(
            dataRecordsERROR.find(
                {"date": {"$eq": date}}
            ).sort("date", 1)
        )
    )
    # print(records_df)
    if len(records_df)>=1:
        result = dataRecordsERROR.delete_many({"date": {"$eq": date}})
    return True

def insertTPWeatherData(DATE, dataFile, ip, requestDateTime):
    dateToCheck = datetime.datetime.strptime(DATE, "%Y-%m-%d")
    nextDay = datetime.datetime.strptime(DATE, "%Y-%m-%d") + datetime.timedelta(days=1)
    cData = checkTPWeatherDBData(
        dateToCheck.strftime("%Y-%m-%d"), nextDay.strftime("%Y-%m-%d")
    )
    if cData:
        num_blocks = len(dataFile)  # Get the number of blocks in dataFile

        d = pd.DataFrame()
        d["datetime"] = pd.date_range(
            dateToCheck.strftime("%Y-%m-%d"), nextDay.strftime("%Y-%m-%d"), freq="15min"
        )[:num_blocks]  # Generate datetime blocks equal to the number of available blocks

        d["temp"] = dataFile["temp"]
        d["rh"] = dataFile["rh"]
        d["datetime"] -= pd.Timedelta("05:30:00")  # Convert datetime to UTC
        d["rh"] = d["rh"].astype(str)
        d["temp"] = d["temp"].astype(str)

        # Insert data into the database
        TPDataRecords.insert_many(json.loads(d.T.to_json()).values())
        
        # Update datetime field to BSON date format in the database
        TPDataRecords.update_many(
            {}, [{"$set": {"datetime": {"$toDate": "$datetime"}}}]
        )
        return True
    else:
        print("DATA present")
        return False


# def insertTPWeatherData2(DATE, temp, rh, ip, requestDateTime):
#     dateToCheck = datetime.datetime.strptime(DATE, "%Y-%m-%d")
#     nextDay = datetime.datetime.strptime(DATE, "%Y-%m-%d") + datetime.timedelta(days=1)
#     cData = checkTPWeatherDBData(
#         dateToCheck.strftime("%Y-%m-%d"), nextDay.strftime("%Y-%m-%d")
#     )
#     # cData = True
#     if cData:
#         d = pd.DataFrame()
#         d["datetime"] = pd.date_range(
#             dateToCheck.strftime("%Y-%m-%d"), nextDay.strftime("%Y-%m-%d"), freq="15min"
#         )[:96]
#         d["temp"] = temp
#         d["rh"] = rh
#         d.datetime = d.datetime - pd.Timedelta("05:30:00")
#         d.rh = d.rh.astype(str)
#         d.temp = d.temp.astype(str)

#         print(d.head(1))
#         print(d.tail(1))
#         # TPDataRecords.insert_many(json.loads(d.T.to_json()).values())
        

#         # TPDataRecords.update_many(
#         #     {}, [{"$set": {"datetime": {"$toDate": "$datetime"}}}]
#         # )
#         return True
#     else:
#         print("DATA present")
#         return False


def insertData(DATE, dataFile, ip, requestDateTime):
    dateToCheck = datetime.datetime.strptime(DATE, "%Y-%m-%d")
    nextDay = dateToCheck + datetime.timedelta(days=1)
    cData = checkDBData(dateToCheck.strftime("%Y-%m-%d"), nextDay.strftime("%Y-%m-%d"))
    # cData = True
    if cData:
        # Count the number of wdLoad blocks in dataFile
        num_blocks = len(dataFile)

        # Create a DataFrame with datetime and wdLoad columns
        d = pd.DataFrame(columns=["datetime", "wdLoad"])

        # If there are blocks in dataFile
        if num_blocks > 0:
            # Create datetime range for the number of blocks
            d["datetime"] = pd.date_range(dateToCheck, periods=num_blocks, freq="15min")
            
            # Convert datetime to UTC
            d["datetime"] -= pd.Timedelta("05:30:00")
            
            # Convert wdLoad to string
            d["wdLoad"] = dataFile["wdLoad"].astype(str)
        
        # Convert DataFrame to JSON format
        data_json = d.to_dict(orient="records")

        # Insert data into the database
        loadDataRecords.insert_many(data_json)

        # Update datetime field to BSON date format in the database
        loadDataRecords.update_many({}, [{"$set": {"datetime": {"$toDate": "$datetime"}}}])

        return True
    else:
        print("DATA present")
        return False


# def insertData2(DATE, dataArray, ip, requestDateTime):
#     print("InsertData2")
#     dateToCheck = datetime.datetime.strptime(DATE, "%Y-%m-%d")
#     nextDay = datetime.datetime.strptime(DATE, "%Y-%m-%d") + datetime.timedelta(days=1)
#     cData = checkDBData(dateToCheck.strftime("%Y-%m-%d"), nextDay.strftime("%Y-%m-%d"))
#     # cData = True
#     print("db checked")
#     if cData:
#         cleanArray = cleanOutliers(dataArray)
#         print("cleaned")
#         # cleanArray = dataArray
#         d = pd.DataFrame()
#         d["datetime"] = pd.date_range(
#             dateToCheck.strftime("%Y-%m-%d"), nextDay.strftime("%Y-%m-%d"), freq="15min"
#         )[:96]
#         d["wdLoad"] = cleanArray
#         d.datetime = d.datetime - pd.Timedelta("05:30:00")
#         d.wdLoad = d.wdLoad.astype(str)
#         print(d.head(1))
#         print(d.tail(1))
#         loadDataRecords.insert_many(json.loads(d.T.to_json()).values())
#         loadDataRecords.update_many(
#             {}, [{"$set": {"datetime": {"$toDate": "$datetime"}}}]
#         )
        
#         return True,d
#     else:
#         print("DATA present")
#         return False,[]



def getLoadData(datefrom, dateto):
    startdate = datetime.datetime.strptime(datefrom, "%Y-%m-%d")
    enddate = datetime.datetime.strptime(dateto, "%Y-%m-%d")
    startdate = convert_datetime_timezone(str(startdate), "Asia/Calcutta", "UTC")
    enddate = convert_datetime_timezone(str(enddate), "Asia/Calcutta", "UTC")
    recordsDf = pd.DataFrame(
        list(
            loadDataRecords.find(
                {"datetime": {"$gte": startdate, "$lt": enddate}}
            ).sort("datetime", 1)
        )
    )
    # print(recordsDf)
    if len(recordsDf) > 0:
        recordsDf["block"] = recordsDf.index + 1
        recordsDf.datetime = pd.to_datetime(recordsDf.datetime)
        recordsDf["datetime"] = recordsDf["datetime"].dt.strftime("%Y-%m-%d %H:%M:%S")
        return True, recordsDf[["datetime", "wdLoad"]], len(recordsDf)
    else:
        return False, recordsDf, len(recordsDf)


def getIMDWeatherData(datefrom, dateto):
    startdate = datetime.datetime.strptime(datefrom, "%Y-%m-%d")
    enddate = datetime.datetime.strptime(dateto, "%Y-%m-%d")
    startdate = convert_datetime_timezone(str(startdate), "Asia/Calcutta", "UTC")
    enddate = convert_datetime_timezone(str(enddate), "Asia/Calcutta", "UTC")
    recordsDf = pd.DataFrame(
        list(
            IMDDataRecords.find({"datetime": {"$gte": startdate, "$lt": enddate}}).sort(
                "datetime", 1
            )
        )
    )

    if len(recordsDf) > 0:
        recordsDf["block"] = recordsDf.index + 1
        recordsDf.datetime = pd.to_datetime(recordsDf.datetime)
        recordsDf["datetime"] = recordsDf["datetime"].dt.strftime("%Y-%m-%d %H:%M:%S")
        return True, recordsDf[["datetime", "temp", "rh"]], len(recordsDf)
    else:
        return False, recordsDf, len(recordsDf)


def getTataWeatherData(datefrom, dateto):
    startdate = datetime.datetime.strptime(datefrom, "%Y-%m-%d")
    enddate = datetime.datetime.strptime(dateto, "%Y-%m-%d")
    startdate = convert_datetime_timezone(str(startdate), "Asia/Calcutta", "UTC")
    enddate = convert_datetime_timezone(str(enddate), "Asia/Calcutta", "UTC")
    recordsDf = pd.DataFrame(
        list(
            TPDataRecords.find({"datetime": {"$gte": startdate, "$lt": enddate}}).sort(
                "datetime", 1
            )
        )
    )
    # print('weather - ',startdate, enddate)
    # print(recordsDf)

    if len(recordsDf) > 0:
        recordsDf["block"] = recordsDf.index + 1
        recordsDf.datetime = pd.to_datetime(recordsDf.datetime)
        recordsDf["datetime"] = recordsDf["datetime"].dt.strftime("%Y-%m-%d %H:%M:%S")
        return True, recordsDf[["datetime", "temp", "rh"]], len(recordsDf)
    else:
        return False, recordsDf, len(recordsDf)



def getMae(datefrom, dateto):
    startdate = datetime.datetime.strptime(datefrom, "%Y-%m-%d")
    enddate = datetime.datetime.strptime(dateto, "%Y-%m-%d")
    recordsMae = pd.DataFrame(
        list(
            dataRecordsERROR.find({"date": {"$gte": startdate, "$lte": enddate}}).sort(
                "date", 1
            )
        )
    )
    return recordsMae


def getNMae(n):
    return dataRecordsERROR.find({}).sort("date", -1).limit(n)

def insertMAE(maeDict,DATE):
    print("Inside insert")
    checkErrorR = checkError(DATE)
    print(checkErrorR)
    if checkErrorR:
        dataRecordsERROR.insert_one(maeDict)
        dataRecordsERROR.update_many({}, [{"$set": {"date": {"$toDate": "$date"}}}])
    
def getNAvgLoad(n):
    return loadDataRecords.aggregate([
        {"$sort": {"datetime": -1}},  # Sort by datetime in descending order
        {"$limit": n},  # Limit to last n records
        {
            "$group": {
                "_id": None,
                "avg_wdLoad": {"$avg": {"$toDouble": "$wdLoad"}}  # Convert wdLoad to double
            }
        }  
    ])

def getNAvgWeather(n):
    return IMDDataRecords.aggregate([
        {"$sort": {"datetime": -1}},  # Sort by datetime in descending order
        {"$limit": n},  # Limit to last n records
        {
            "$group": {
                "_id": None,
                "avg_temp": {"$avg": {"$toDouble": "$temp"}},  # Convert temp to double
                "avg_rh": {"$avg": {"$toDouble": "$rh"}}  # Convert rh to double
            }
        }  
    ])

def getDiff(datefrom):
    startdate = datetime.datetime.strptime(datefrom, "%Y-%m-%d")
    # startdate += timedelta(hours=5, minutes=30)
    enddate = startdate + datetime.timedelta(days=1)
    # Convert startdate and enddate to UTC
    startdate = convert_datetime_timezone(str(startdate), "Asia/Calcutta", "UTC")
    enddate = convert_datetime_timezone(str(enddate), "Asia/Calcutta", "UTC")
    difference_data_cursor = Diff.find({"datetime": {"$gte": startdate, "$lte": enddate}}).sort("datetime", 1).limit(96)

    difference_data = []
    
    for record in difference_data_cursor:
        record['_id'] = str(record['_id'])
        difference_data.append(record)

    if(len(difference_data)<96):
        difference_data = []

    return difference_data

def insertDiffData(DATE, dataFile, ip, requestDateTime):
    dateToCheck = datetime.datetime.strptime(DATE, "%Y-%m-%d")
    nextDay = dateToCheck + datetime.timedelta(days=1)
    cData = checkDiffData(dateToCheck.strftime("%Y-%m-%d"), nextDay.strftime("%Y-%m-%d"))
    if cData:
        d = pd.DataFrame(dataFile)  # Convert list of dictionaries to DataFrame
        d["datetime"] = pd.date_range(
            dateToCheck.strftime("%Y-%m-%d"), nextDay.strftime("%Y-%m-%d"), freq="15min"
        )[:96]
        d.datetime = d.datetime - datetime.timedelta(hours=5, minutes=30)  # Adjusting datetime
        d.difference = d.difference.astype(str)
        Diff.insert_many(json.loads(d.T.to_json()).values())
        Diff.update_many(
            {}, [{"$set": {"datetime": {"$toDate": "$datetime"}}}]
        )
        return True
    else:
        print("DATA present")
        return False
    
def checkDiffData(date_from, date_to):
    # Convert input date strings to datetime objects
    start_date = datetime.datetime.strptime(date_from, "%Y-%m-%d")
    end_date = datetime.datetime.strptime(date_to, "%Y-%m-%d")

    # Convert datetime objects to UTC timezone
    start_date = convert_datetime_timezone(str(start_date), "Asia/Calcutta", "UTC")
    end_date = convert_datetime_timezone(str(end_date), "Asia/Calcutta", "UTC")

    records_df = pd.DataFrame(
        list(
            Diff.find(
                {"datetime": {"$gte": start_date, "$lt": end_date}}
            ).sort("datetime", 1)
        )
    )
    # print(records_df)

    # If there are records, delete them from the database
    if len(records_df)>1:
        # print('decords')
        # print(records_df)
        result = Diff.delete_many({"datetime": {"$gte": start_date, "$lt": end_date}})
    return True
def checkSpDay(datefrom):
    startdate = datetime.datetime.strptime(datefrom, "%Y-%m-%d")

    # Query MongoDB to retrieve the 'dayType' for the specific date
    specific_date_data = Date_info.find_one(
        {"date": datefrom},
        {"_id": 0, "dayType": 1}
    )
    spDay = specific_date_data['dayType'] if specific_date_data else "Normal Day"
    return spDay