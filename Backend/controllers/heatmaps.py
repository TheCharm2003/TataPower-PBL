import datetime

import pandas as pd
import numpy as np

from controllers.database import IMDDataRecords, TPDataRecords, loadDataRecords , log_collection
import pymongo

def LoadHeatMap(year=None):
    loadRecords = loadDataRecords.aggregate([
        {"$group": {
            "_id": {
                "day": {"$dayOfMonth": {"$add": ["$datetime", 5.5 * 60 * 60 * 1000]}},
                "month": {"$month": {"$add": ["$datetime", 5.5 * 60 * 60 * 1000]}},
                "year": {"$year": {"$add": ["$datetime", 5.5 * 60 * 60 * 1000]}}
            },
            "count": {"$sum": 1}  # Counting the number of records for each date
        }},
        {"$match": {"count": {"$eq": 96}}},  # Filter to include only dates with 96 records
        {"$sort": {"_id": 1}},
    ])
    
    loadRDF = pd.DataFrame(list(loadRecords))["_id"].apply(pd.Series)
    loadRDF["date"] = pd.to_datetime(loadRDF[["year", "month", "day"]])
    loadRDF["count"] = 1  # Setting count to 1 for dates with 96 records
    loadRDF = loadRDF.set_index("date")
    
    now = datetime.datetime.now()
    resDF = pd.DataFrame({"date": pd.date_range("2018-01-01", now.strftime("%Y-%m-%d"), freq="1D")})
    resDF["count"] = 0
    resDF = resDF.set_index("date")
    resDF.update(loadRDF)
    resDF.reset_index(inplace=True)
    resDF["date"] = resDF["date"].dt.strftime("%Y-%m-%d")

    if year is not None:
        resDF = resDF[resDF['date'].str.startswith(str(year))]

    # Retrieve latest log data for each file_date
    pipeline = [
        {"$match": {"file_type": "load"}},
        {"$sort": {"timestamp": -1}},
        {"$group": {"_id": "$file_date", "latest_log": {"$first": "$$ROOT"}}}
    ]
    logs_cursor = log_collection.aggregate(pipeline)
    log_data = list(logs_cursor)
    
    if log_data:
        log_df = pd.DataFrame(log_data)
        merged_df = pd.merge(resDF, log_df, left_on='date', right_on='_id', how='left')
        merged_df['name'] = merged_df['latest_log'].apply(lambda x: x['name'] if isinstance(x, dict) else np.nan)
        merged_df['email'] = merged_df['latest_log'].apply(lambda x: x['email'] if isinstance(x, dict) else np.nan)
        merged_df = merged_df[['date', 'count', 'name', 'email']]
        merged_df = merged_df.astype(str)
        return merged_df.to_dict("records")
    
    resDF['name'] = float('nan')
    resDF['email'] = float('nan')
    resDF['name'] = resDF['name'].astype(str)
    resDF['email'] = resDF['email'].astype(str)

    return resDF.to_dict("records")

def WeatherHeatMap(year=None):
    # Aggregate IMDDataRecords to count records for each date
    IMDRecords = IMDDataRecords.aggregate([
        {
            "$group": {
                "_id": {
                    "day": {"$dayOfMonth": {"$add": ["$datetime", 5.5 * 60 * 60 * 1000]}},
                    "month": {"$month": {"$add": ["$datetime", 5.5 * 60 * 60 * 1000]}},
                    "year": {"$year": {"$add": ["$datetime", 5.5 * 60 * 60 * 1000]}}
                },
                "count": {"$sum": 1}  # Counting the number of records for each date
            }
        },
        {"$match": {"count": {"$eq": 96}}},  # Filter to include only dates with 96 records
        {"$sort": {"_id": 1}},
    ])

    # Create DataFrame from IMDRecords and set count to 1 for dates with 96 records
    IMDRDF = pd.DataFrame(list(IMDRecords))["_id"].apply(pd.Series)
    IMDRDF["date"] = pd.to_datetime(IMDRDF[["year", "month", "day"]])
    IMDRDF["count"] = 1  # Setting count to 1 for dates with 96 records
    IMDRDF = IMDRDF.set_index("date")

    # Aggregate TPDataRecords to count records for each date
    TPRecords = TPDataRecords.aggregate([
        {
            "$group": {
                "_id": {
                    "day": {"$dayOfMonth": {"$add": ["$datetime", 5.5 * 60 * 60 * 1000]}},
                    "month": {"$month": {"$add": ["$datetime", 5.5 * 60 * 60 * 1000]}},
                    "year": {"$year": {"$add": ["$datetime", 5.5 * 60 * 60 * 1000]}}
                },
                "count": {"$sum": 1}  # Counting the number of records for each date
            }
        },
        {"$match": {"count": {"$eq": 96}}},  # Filter to include only dates with 96 records
        {"$sort": {"_id": 1}},
    ])

    # Create DataFrame from TPRecords and set count to 1 for dates with 96 records
    TPRDF = pd.DataFrame(list(TPRecords))["_id"].apply(pd.Series)
    TPRDF["date"] = pd.to_datetime(TPRDF[["year", "month", "day"]])
    TPRDF["count"] = 1  # Setting count to 1 for dates with 96 records
    TPRDF = TPRDF.set_index("date")

    # Create DataFrame for date range from 2018-01-01 to current date
    now = datetime.datetime.now()
    resDF = pd.DataFrame({"date": pd.date_range("2018-01-01", now.strftime("%Y-%m-%d"), freq="1D")})
    resDF["count"] = 0
    resDF = resDF.set_index("date")

    # Update resDF with counts from IMDRDF and TPRDF
    resDF.update(IMDRDF)
    resDF.update(TPRDF)
    resDF.reset_index(inplace=True)
    resDF["date"] = resDF["date"].dt.strftime("%Y-%m-%d")

    # Filter by year if provided
    if year is not None:
        resDF = resDF[resDF['date'].str.startswith(str(year))]

    # Retrieve log data and merge with resDF
    logs_cursor = log_collection.aggregate([
        {"$match": {"file_type": "Weather"}},
        {"$sort": {"timestamp": -1}},
        {"$group": {
            "_id": "$file_date",
            "name": {"$first": "$name"},
            "email": {"$first": "$email"}
        }}
    ])

    log_data = list(logs_cursor)

    if log_data:
        log_df = pd.DataFrame(log_data)
        merged_df = pd.merge(resDF, log_df, left_on='date', right_on='_id', how='left')
        merged_df = merged_df[['date', 'count', 'name', 'email']]
        merged_df = merged_df.astype(str)
        return merged_df.to_dict("records")

    # If no 'file_type' is "Weather" or log_data is empty, return default result
    resDF['name'] = float('nan')
    resDF['email'] = float('nan')
    resDF['name'] = resDF['name'].astype(str)
    resDF['email'] = resDF['email'].astype(str)

    return resDF.to_dict("records")