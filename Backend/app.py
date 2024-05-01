import datetime
import json
import os
import time
import concurrent.futures
# from sklearn.externals import joblib
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, Request, UploadFile, File, Form, HTTPException, status, Security, APIRouter, Depends
from fastapi.responses import JSONResponse, ORJSONResponse
from fastapi_azure_auth.user import User
from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings

import pymongo
from pytz import timezone
import json
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd


executor = ThreadPoolExecutor(2)
from pandas.api.types import CategoricalDtype

from tensorflow.keras.models import load_model

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization, Activation, Conv1D, MaxPooling1D, Flatten, LSTM, Bidirectional, Reshape
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import LearningRateScheduler
from tensorflow.keras.callbacks import ModelCheckpoint
from fastapi_azure_auth import MultiTenantAzureAuthorizationCodeBearer


from controllers.database import (
    Date_info,
    checkDBData,
    checkSpDay,
    convert_datetime_timezone,
    getDiff,
    getIMDWeatherData,
    getLoadData,
    getMae,
    getNAvgLoad,
    getNMae,
    getNAvgWeather,
    getTataWeatherData,
    insertData,
    insertDiffData,
    # insertData2,
    insertMAE,
    insertTPWeatherData,
    # insertTPWeatherData2,
    log_collection
)
from controllers.ftp import getBlockFTP, getTodayBlocksFTP

# from contollers.ftp import getDataFromFTP
from controllers.heatmaps import LoadHeatMap, WeatherHeatMap
from helpers.constants import folder_dir
from helpers.mail import sendMail, sendMailWithoutPrediction
from helpers.utils import cleanOutliers
from typing import Optional

def daterange(start_date, end_date):
    for n in range(int((end_date - start_date).days)):
        yield start_date + datetime.timedelta(n)


if not os.path.exists(folder_dir):
    os.makedirs(folder_dir)


class Settings():
    BACKEND_CORS_ORIGINS = ['http://localhost:8007']
    OPENAPI_CLIENT_ID= '3e1abe11-28f1-42b1-acf8-83f73baa2ce6'
    APP_CLIENT_ID= '3e1abe11-28f1-42b1-acf8-83f73baa2ce6'

    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'
        case_sensitive = True

settings = Settings()

# LOAD MODELS
# loadForecast = load_model("models/ANN_v3_bestmodel.h5")
# 
loadForecast = joblib.load("models/Final_RFR_Load_Model.joblib")
loadForecast7 = joblib.load("models/Final_7_Day_Load_RFR_v1.joblib")
# loadForecast = joblib.load("models/v1.joblib")
# loadForecast.load_weights('models/ANN_v2_model_weights_epoch_27.h5')
# loadForecast.compile(loss='mean_squared_error', optimizer='adam', metrics=['mae'])

tempForecast = joblib.load("models/Final_RFR_Temp_Model.joblib")
# tempForecast = joblib.load("models/KNeighborsRegressor_temp_20231115235116.joblib")
rhForecast = joblib.load("models/Final_RFR_RH_Model.joblib")
# rhForecast = joblib.load("models/KNeighborsRegressor_rh_20231115235210.joblib")
# XScaler = joblib.load("models/XScaler42.sav")
# YScaler = joblib.load("models/YScaler42.sav")
# New RH Model - Previous 7 Days
# rhForecast_v2 = joblib.load("models/rh_model_v2.joblib")


def find_last_three_days(input_date_str):
    # Convert input date string to datetime object
    input_date = datetime.datetime.strptime(input_date_str, '%Y-%m-%d')- datetime.timedelta(days=1)
    # print(input_date)
    # Initialize last_three_days as an empty list
    last_three_days = []

    # Fetch the last three days before the input date
    for i in range(1, 4):  # Start from 1 to exclude the input date
        last_three_days.append(input_date - datetime.timedelta(days=i))

    return last_three_days[::-1]  # Reverse the list to maintain chronological order


def find_last_14_days(input_date_str):
    # Convert input date string to datetime object
    input_date = datetime.datetime.strptime(input_date_str, '%Y-%m-%d')- datetime.timedelta(days=1)
    # print(input_date)
    # Initialize last_three_days as an empty list
    last_14_days = []

    # Fetch the last three days before the input date
    for i in range(1, 15):  # Start from 1 to exclude the input date
        last_14_days.append(input_date - datetime.timedelta(days=i))

    return last_14_days[::-1]  # Reverse the list to maintain chronological order

def genMae(DATE, ip, requestDateTime):
    dateToFetch = datetime.datetime.strptime(DATE, "%Y-%m-%d")
    nextDay = datetime.datetime.strptime(DATE, "%Y-%m-%d") + datetime.timedelta(days=1)
    result, getBlocks, cData = daa(
        dateToFetch.strftime("%Y-%m-%d"), nextDay.strftime("%Y-%m-%d")
    )
    spDay=checkSpDay(DATE)
    # print(spDay)
    resultF, predictionDF = getPredict2DAYSData(DATE, spDay)
    # resultF, predictionDF = getPredict2DAYSData(DATE, "1")
    # print(resultF)
    if result:
        # print("Generating MAE")
        predictionDF["Actual_wdLoad"] = getBlocks["wdLoad"]
        predictionDF["Actual_temp"] = getBlocks["temp"]
        predictionDF["Actual_rh"] = getBlocks["rh"]

        # print(predictionDF.head())

        predictionDF["error_wdLoad"] = abs(
            predictionDF["Actual_wdLoad"].astype(float).values
            - predictionDF["wdLoad"].astype(float).values
        )

        predictionDF["error_temp"] = abs(
            predictionDF["Actual_temp"].astype(float).values
            - predictionDF["temp"].astype(float).values
        )

        predictionDF["error_rh"] = abs(
            predictionDF["Actual_rh"].astype(float).values
            - predictionDF["rh"].astype(float).values
        )

        mae_load = (
            (
                predictionDF["error_wdLoad"].values
                / predictionDF["Actual_wdLoad"].astype(float).values
            )
            * 100
        ).mean()
        mae_temp = (
            (
                predictionDF["error_temp"].values
                / predictionDF["Actual_temp"].astype(float).values
            )
            * 100
        ).mean()
        mae_rh = (
            (
                predictionDF["error_rh"].values
                / predictionDF["Actual_rh"].astype(float).values
            )
            * 100
        ).mean()

        maeDict = {
            "date": DATE,
            "mae_wdLoad": str(mae_load),
            "mae_temp": str(mae_temp),
            "mae_rh": str(mae_rh),
        }
        # print(maeDict)
        insertMAE(maeDict,DATE)
        # print("After Insert")
        # dataRecordsERROR.insert_one(maeDict)
        # dataRecordsERROR.update_many({}, [{"$set": {"date": {"$toDate": "$date"}}}])
        # sendMail(maeDict, ip, requestDateTime)
        # try:
        #     sendMail(maeDict, ip, requestDateTime)
        # except Exception as e: print(e)       
    else:
        print("Prediction Data not available!")
        # sendMailWithoutPrediction(DATE, ip, requestDateTime)
        # try:
        #     sendMailWithoutPrediction(DATE, ip, requestDateTime)
        # except Exception as e: print(e)

    return True


def getWeatherData(datefrom, dateto):
    resultWeatherYest, yestWeatherData, cYestWeatherData = getIMDWeatherData(
        datefrom, dateto
    )
    if not resultWeatherYest:
        resultWeatherYest, yestWeatherData, cYestWeatherData = getTataWeatherData(
            datefrom, dateto
        )
    return resultWeatherYest, yestWeatherData, cYestWeatherData


def daa(datefrom, dateto):
    startdate = datetime.datetime.strptime(datefrom, "%Y-%m-%d")
    enddate = datetime.datetime.strptime(dateto, "%Y-%m-%d")
    startdate = convert_datetime_timezone(str(startdate), "Asia/Calcutta", "UTC")
    enddate = convert_datetime_timezone(str(enddate), "Asia/Calcutta", "UTC")
    resultLoad, LoadData, cLoadData = getLoadData(datefrom, dateto)
    # recordsDf = pd.DataFrame(list(dataRecords.find(
    #     {'datetime': {'$gte': startdate, '$lt': enddate}}).sort('datetime', 1)))
    resultWeather, WeatherData, cWeatherData = getWeatherData(datefrom, dateto)

    if (cWeatherData > 0) & (cLoadData > 0):
        recordsDf = LoadData
        recordsDf["temp"] = WeatherData["temp"]
        recordsDf["rh"] = WeatherData["rh"]

        # print(recordsDf.head())
        recordsDf["block"] = recordsDf.index + 1
        # recordsDf = recordsDf.set_index('datetime')
        recordsDf.datetime = pd.to_datetime(recordsDf.datetime)
        recordsDf["datetime"] = recordsDf["datetime"].dt.strftime("%Y-%m-%d %H:%M:%S")
        return (
            True,
            recordsDf[["datetime", "wdLoad", "temp", "rh", "block"]],
            len(recordsDf),
        )
    else:
        return False, [], 0


def prepare_weather_dataset(df):
    X_weather = []
    for j in range(96):
        # Extract features from previous days (96 readings for each day)
        for k in range(3):
            features = df.iloc[j+(k*96)][['wdLoad', 'temp', 'rh', 'day_type', 'day', 'block', 'hour', 'week_month', 'week_year', 'month']].values.flatten()
            X_weather.extend(features)
    return np.array(X_weather)

def prepare_load_dataset(date, df, TempPredictions, RHPredictions, special_day):
    # Convert date string to datetime object
    dateto = datetime.datetime.strptime(date, "%Y-%m-%d")
    dateto_str = dateto.strftime("%Y-%m-%d")

    datefrom = (dateto - datetime.timedelta(days=1)).strftime("%Y-%m-%d")

    # Fetch load data for the specified date range
    resultLoad, LoadData, cLoadData = getLoadData(datefrom, dateto_str)
    
    # If there are load data available for today
    if cLoadData > 0:
        # Extract load data from the first day of the three-day window
        date_minus_two_days = (dateto - datetime.timedelta(days=4)).date()
        # Filter rows where datetime date matches the date_minus_two_days
        first_day_load_data_index = df.index[df['datetime'].dt.date == date_minus_two_days]

        # Check if any rows match the filter condition
        if not first_day_load_data_index.empty:
            # Update the corresponding blocks in first_day_load_data with the values from LoadData
            df.loc[first_day_load_data_index[:cLoadData], 'wdLoad'] = LoadData['wdLoad'].values[:cLoadData]

    # Prepare input features for the load prediction model
    X_load = []
    for j in range(96):
        # Extract features from previous days (96 readings for each day)
        for k in range(3):
            features = df.iloc[j + (k * 96)][['wdLoad', 'temp', 'rh', 'day_type', 'day', 'block', 'hour', 'week_month', 'week_year', 'month']].values.flatten()
            X_load.extend(features)
        X_load.append(RHPredictions[0][j])
        X_load.append(TempPredictions[0][j])
        
    X_load = np.array(X_load)
    
    # Reshape the input array to match the original shape (96, 32)
    X_load = X_load.reshape(96, 32)

    # Update 'day' values based on the special day type
    if special_day == 'Holiday':
        day_indices = [4, 14, 24]
        new_day_values = [2, 3, 4]
        # Update 'day' values
        for i, day_indexx in enumerate(day_indices):
            X_load[:, day_indexx] = new_day_values[i]
    elif special_day == 'Medium Load Day':
        day_indices = [4, 14, 24]
        new_day_values = [1, 2, 3]
        # Update 'day' values
        for i, day_indexx in enumerate(day_indices):
            X_load[:, day_indexx] = new_day_values[i]
            
    return X_load


def prepare_load_dataset_7(df):
    X_load = []
    for j in range(96):
        # Extract features from previous days (96 readings for each day)
        for k in range(14):
            features = df.iloc[j+(k*96)][['wdLoad', 'temp', 'rh', 'day_type', 'day', 'block', 'hour', 'week_month', 'week_year', 'month']].values.flatten()
            X_load.extend(features)
            
    X_load = np.array(X_load)
    return X_load


def getPredict2DAYSData(date, special_day):
    dateToPredict = datetime.datetime.strptime(date, "%Y-%m-%d")
    selected_dates = find_last_three_days(date)
    column_names = ['datetime', 'wdLoad', 'temp', 'rh', 'day_type', 'day', 'block', 'hour', 'week_month', 'week_year', 'month']
    # print(selected_dates)
    # Initialize lists to store predictions
    TempPredictions = []
    RHPredictions = []
    LoadPredictions = []
    
    # Initialize an empty DataFrame to store the values for each timestamp
    all_values_df = pd.DataFrame(columns=column_names)

    # Iterate through selected dates
    for selected_date in selected_dates:
        # Fetch load and weather data
        load_result, load_data, c_load_data = getLoadData(
            selected_date.strftime("%Y-%m-%d"),
            (selected_date + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        )
        weather_result, weather_data, c_weather_data = getWeatherData(
            selected_date.strftime("%Y-%m-%d"),
            (selected_date + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        )

        if not load_data.empty and not weather_data.empty:
            combined_data = pd.merge(load_data, weather_data, on='datetime', how='inner')
            combined_data['datetime'] = pd.to_datetime(combined_data['datetime']).dt.tz_localize('UTC').dt.tz_convert('Asia/Kolkata')
            combined_data['day'] = combined_data['datetime'].dt.dayofweek
            combined_data['day'] = (combined_data['day']) % 7
            combined_data['day_type'] = combined_data['day'].apply(lambda x: 1 if x == 5 else (2 if x == 6 else 0))
            combined_data['block'] = range(1, 97)  # 'block' values from 1 to 96
            combined_data['hour'] = combined_data['datetime'].dt.hour
            combined_data['week_month'] = combined_data['datetime'].dt.isocalendar().week % 4
            combined_data['week_year'] = combined_data['datetime'].dt.isocalendar().week
            combined_data['month'] = combined_data['datetime'].dt.month
            
            # Convert 'wdLoad', 'temp', and 'rh' columns to numeric type
            combined_data['wdLoad'] = pd.to_numeric(combined_data['wdLoad'], errors='coerce').round(2)
            combined_data['temp'] = pd.to_numeric(combined_data['temp'], errors='coerce').round(3)
            combined_data['rh'] = pd.to_numeric(combined_data['rh'], errors='coerce').round(3)

            # Convert 'day_type', 'day', 'block', 'hour', 'week_month', 'week_year', and 'month' to integer
            int_columns = ['day_type', 'day', 'block', 'hour', 'week_month', 'week_year', 'month']
            for col in int_columns:
                combined_data[col] = pd.to_numeric(combined_data[col], errors='coerce').astype('Int64')

            # Concatenate combined_data with all_values_df
            all_values_df = pd.concat([all_values_df, combined_data], ignore_index=True)
        else:
             return False, []


    # Prepare input for Temp and RH models
    X_weather = prepare_weather_dataset(all_values_df)
    # Make predictions using Temp and RH models
    temp_predictions = tempForecast.predict(X_weather.reshape(1, -1))
    rh_predictions = rhForecast.predict(X_weather.reshape(1, -1))
    
    # Store predictions
    TempPredictions.extend(temp_predictions)
    RHPredictions.extend(rh_predictions)
    
    load_input = prepare_load_dataset(date,all_values_df,TempPredictions,RHPredictions,special_day)
    # print(special_day)
    # Make prediction using Load model
    load_predictions = loadForecast.predict(load_input.reshape(1, -1))
    LoadPredictions.extend(load_predictions)
    # Combine predictions into DataFrame
    ResultDf = pd.DataFrame({
        "temp": TempPredictions[0],
        "rh": RHPredictions[0],
        "wdLoad": LoadPredictions[0]
    })
    # Generate datetime index for the predictions
    ResultDf["datetime"] = pd.date_range(
        dateToPredict.strftime("%Y-%m-%d"),
        (dateToPredict + datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
        freq="15min",
    )[:96]
    ResultDf["datetime"] = ResultDf["datetime"].dt.strftime("%Y-%m-%d %H:%M:%S")
    return True, ResultDf


# def getoldPredict2DAYSData(date, specialDay):
#     dateToPredict = datetime.datetime.strptime(date, "%Y-%m-%d")
#     selected_dates = find_last_three_days(date)
#     value_order = ['temp', 'rh', 'wdLoad', 'block', 'hour', 'week_month', 'week_year', 'month']

#     # Initialize an empty list to store the values for each timestamp
#     all_values_list = []

#     # Iterate through the selected dates
#     for selected_date in selected_dates:
#         # Get load data for the current day
#         load_result, load_data, c_load_data = getLoadData(
#             selected_date.strftime("%Y-%m-%d"), (selected_date + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
#         )
#         # Get weather data for the current day
#         weather_result, weather_data, c_weather_data = getWeatherData(
#             selected_date.strftime("%Y-%m-%d"), (selected_date + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
#         )
        
#         if not load_data.empty and not weather_data.empty:
#             combined_data = pd.merge(load_data, weather_data, on='datetime', how='inner')
#             combined_data['datetime'] = pd.to_datetime(combined_data['datetime']).dt.tz_localize('UTC').dt.tz_convert('Asia/Kolkata')
#             combined_data['block'] = range(1, 97)  # 'block' values from 1 to 96
#             combined_data['hour'] = combined_data['datetime'].dt.hour
#             combined_data['week_month'] = combined_data['datetime'].dt.week % 4  # Assuming 4 weeks in a month
#             combined_data['week_year'] = combined_data['datetime'].dt.week
#             combined_data['month'] = combined_data['datetime'].dt.month
            
#             timestamp_values = combined_data[value_order].values.astype(float)

#             all_values_list.extend(timestamp_values)
#         else:
#              return False, []


#     yesterday = datetime.datetime.strptime(date, "%Y-%m-%d") - datetime.timedelta(
#         days=1
#     )
#     TwoDaysBack = datetime.datetime.strptime(date, "%Y-%m-%d") - datetime.timedelta(
#         days=2
#     )
#     nextDay = datetime.datetime.strptime(date, "%Y-%m-%d") + datetime.timedelta(days=1)

#     resultWeatherYest, yestWeatherData, cYestWeatherData = getWeatherData(
#         TwoDaysBack.strftime("%Y-%m-%d"), yesterday.strftime("%Y-%m-%d")
#     )

#     lastWeekday = datetime.datetime.strptime(date, "%Y-%m-%d") - datetime.timedelta(
#         days=7
#     )
#     lastWeekdayB = lastWeekday + datetime.timedelta(days=1)

#     resultWeatherLastWeek, lastWeekWeatherData, cLastWeekWeatherData = getWeatherData(
#         lastWeekday.strftime("%Y-%m-%d"), lastWeekdayB.strftime("%Y-%m-%d")
#     )
#     WeatherX = pd.DataFrame(
#         {
#             "block": range(1, 97),
#             "temp_672": lastWeekWeatherData.temp.values,
#             "temp_192": yestWeatherData.temp.values,
#             "rh_672": lastWeekWeatherData.rh.values,
#             "rh_192": yestWeatherData.rh.values,
#             "Month": dateToPredict.month,
#             "DayOfWeek": dateToPredict.weekday(),
#         }
#     )

#     WeatherX.Month = WeatherX.Month.astype(
#         CategoricalDtype(categories=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
#     )
#     WeatherX.DayOfWeek = WeatherX.DayOfWeek.astype(
#         CategoricalDtype(categories=[0, 1, 2, 3, 4, 5, 6])
#     )
#     WeatherX['Month'] = WeatherX['Month'].apply(lambda x: f"{x:02d}")
#     WeatherX = pd.get_dummies(WeatherX, columns=["Month"])
#     WeatherX = pd.get_dummies(WeatherX, columns=["DayOfWeek"])

#     TempPredictions = tempForecast.predict(WeatherX)
#     RHPredictions = rhForecast.predict(WeatherX)

#     all_values_list.append(RHPredictions)
#     all_values_list.append(TempPredictions)
    
#     loadX = np.concatenate([np.array([float(value) for value in timestamp]) for timestamp in all_values_list])
#     LoadPred = loadForecast.predict(loadX.reshape(1, -1))
#     ResultDf = pd.DataFrame(
#         {"temp": TempPredictions, "rh": RHPredictions, "wdLoad": LoadPred[0]}
#     )

#     ResultDf["datetime"] = pd.date_range(
#         dateToPredict.strftime("%Y-%m-%d"),
#         nextDay.strftime("%Y-%m-%d"),
#         freq="15min",
#     )[:96]
#     ResultDf["datetime"] = ResultDf["datetime"].dt.strftime("%Y-%m-%d %H:%M:%S")


#     return True, ResultDf


# def getPredict2DAYSData22(date, specialDay):
#     dateToPredict = datetime.datetime.strptime(date, "%Y-%m-%d")
#     yesterday = datetime.datetime.strptime(date, "%Y-%m-%d") - datetime.timedelta(
#         days=1
#     )
#     TwoDaysBack = datetime.datetime.strptime(date, "%Y-%m-%d") - datetime.timedelta(
#         days=2
#     )
#     nextDay = datetime.datetime.strptime(date, "%Y-%m-%d") + datetime.timedelta(days=1)

#     resultLoadYest, yestLoadData, cYestLoadData = getLoadData(
#         TwoDaysBack.strftime("%Y-%m-%d"), yesterday.strftime("%Y-%m-%d")
#     )

#     resultWeatherYest, yestWeatherData, cYestWeatherData = getWeatherData(
#         TwoDaysBack.strftime("%Y-%m-%d"), yesterday.strftime("%Y-%m-%d")
#     )

#     lastWeekday = datetime.datetime.strptime(date, "%Y-%m-%d") - datetime.timedelta(
#         days=7
#     )
#     lastWeekdayB = lastWeekday + datetime.timedelta(days=1)

#     resultLoadLastWeek, lastWeekLoadData, cLastWeekLoadData = getLoadData(
#         lastWeekday.strftime("%Y-%m-%d"), lastWeekdayB.strftime("%Y-%m-%d")
#     )
#     resultWeatherLastWeek, lastWeekWeatherData, cLastWeekWeatherData = getWeatherData(
#         lastWeekday.strftime("%Y-%m-%d"), lastWeekdayB.strftime("%Y-%m-%d")
#     )

#     oneDayBack = datetime.datetime.strptime(date, "%Y-%m-%d") - datetime.timedelta(days=1)
#     twoDayBack = datetime.datetime.strptime(date, "%Y-%m-%d") - datetime.timedelta(days=2)
#     threeDayBack = datetime.datetime.strptime(date, "%Y-%m-%d") - datetime.timedelta(days=3)
#     fourDayBack = datetime.datetime.strptime(date, "%Y-%m-%d") - datetime.timedelta(days=4)
#     fiveDayBack = datetime.datetime.strptime(date, "%Y-%m-%d") - datetime.timedelta(days=5)
#     sixDayBack = datetime.datetime.strptime(date, "%Y-%m-%d") - datetime.timedelta(days=6)
#     sevenDayBack = datetime.datetime.strptime(date, "%Y-%m-%d") - datetime.timedelta(days=7)
#     eightDayBack = datetime.datetime.strptime(date, "%Y-%m-%d") - datetime.timedelta(days=8)

#     resultWeatheroneDayBack, oneDayBacktWeatherData, coneDayBacktWeatherData = getWeatherData(
#         twoDayBack.strftime("%Y-%m-%d"), oneDayBack.strftime("%Y-%m-%d")
#     )
#     resultWeathertwoDayBack, twoDayBacktWeatherData, ctwoDayBacktWeatherData = getWeatherData(
#         threeDayBack.strftime("%Y-%m-%d"), twoDayBack.strftime("%Y-%m-%d")
#     )
#     resultWeatherthreeDayBack, threeDayBacktWeatherData, cthreeDayBacktWeatherData = getWeatherData(
#         fourDayBack.strftime("%Y-%m-%d"), threeDayBack.strftime("%Y-%m-%d")
#     )
#     resultWeatherfourDayBack, fourDayBacktWeatherData, cfourDayBacktWeatherData = getWeatherData(
#         fiveDayBack.strftime("%Y-%m-%d"), fourDayBack.strftime("%Y-%m-%d")
#     )
#     resultWeatherfiveDayBack, fiveDayBacktWeatherData, cfiveDayBacktWeatherData = getWeatherData(
#         sixDayBack.strftime("%Y-%m-%d"), fiveDayBack.strftime("%Y-%m-%d")
#     )
#     resultWeathersixDayBack, sixDayBacktWeatherData, csixDayBacktWeatherData = getWeatherData(
#         sevenDayBack.strftime("%Y-%m-%d"), sixDayBack.strftime("%Y-%m-%d")
#     )
#     resultWeathersevenDayBack, sevenDayBacktWeatherData, csevenDayBacktWeatherData = getWeatherData(
#         eightDayBack.strftime("%Y-%m-%d"), sevenDayBack.strftime("%Y-%m-%d")
#     )
    
#     print(resultWeathersevenDayBack)

#     if (
#         (cYestLoadData > 0)
#         & (cYestWeatherData > 0)
#         & (cLastWeekLoadData > 0)
#         & (cLastWeekWeatherData > 0)
#     ):
#         # xData = pd.concat([yestData, lastWeekdayData])
#         # Weather Prediction
#         WeatherX = pd.DataFrame(
#             {
#                 "block": range(1, 97),
#                 "temp_672": lastWeekWeatherData.temp.values,
#                 "temp_192": yestWeatherData.temp.values,
#                 "rh_672": lastWeekWeatherData.rh.values,
#                 "rh_192": yestWeatherData.rh.values,
#                 "Month": dateToPredict.month,
#                 "DayOfWeek": dateToPredict.weekday(),
#             }
#         )

#         # New RH Model Input Dataframe
#         rhX = pd.DataFrame(
#             {
#                 "block": range(1, 97),
#                 "month": dateToPredict.month,
#                 "day": dateToPredict.weekday(),
#                 "rh_1": oneDayBacktWeatherData.rh.values,
#                 "rh_2": twoDayBacktWeatherData.rh.values,
#                 "rh_3": threeDayBacktWeatherData.rh.values,
#                 "rh_4": fourDayBacktWeatherData.rh.values,
#                 "rh_5": fiveDayBacktWeatherData.rh.values,
#                 "rh_6": sixDayBacktWeatherData.rh.values,
#                 "rh_7": sevenDayBacktWeatherData.rh.values
#             }
#         )

#         WeatherX.Month = WeatherX.Month.astype(
#             CategoricalDtype(categories=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
#         )
#         WeatherX.DayOfWeek = WeatherX.DayOfWeek.astype(
#             CategoricalDtype(categories=[0, 1, 2, 3, 4, 5, 6])
#         )
#         WeatherX['Month'] = WeatherX['Month'].apply(lambda x: f"{x:02d}")
#         WeatherX = pd.get_dummies(WeatherX, columns=["Month"])
#         WeatherX = pd.get_dummies(WeatherX, columns=["DayOfWeek"])

#         TempPredictions = tempForecast.predict(WeatherX)
#         RHPredictions = rhForecast.predict(WeatherX)

#         # RHPredictions = rhForecast_v2.predict(rhX)

#         # print(WeatherPredictions)
#         # block,month,specialday,weekday,hour
#         timeData = [1, dateToPredict.month, int(specialDay), dateToPredict.weekday(), 0]

#         xToPred = [timeData]
#         xToPred.append(yestLoadData.wdLoad.values[::-1])  # YESTERDAY LOAD
#         xToPred.append(lastWeekLoadData.wdLoad.values[::-1])  # LASTWWEK LOAD
#         xToPred.append(yestWeatherData.temp.values[::-1])  # YESTERDAY TEMP
#         xToPred.append(lastWeekWeatherData.temp.values[::-1])  # LASTWWEK TEMP
#         xToPred.append(yestWeatherData.rh.values[::-1])  # YESTERDAY RH
#         xToPred.append(lastWeekWeatherData.rh.values[::-1])  # LASTWWEK RH
#         xToPred.append(TempPredictions[::-1])  # TEMP PREDICTIONS
#         xToPred.append(RHPredictions[::-1])  # RH PREDICTIONS

#         xToPredDF = pd.DataFrame(np.concatenate(xToPred).ravel().reshape(1, 773))
#         # print(xToPredDF)

#         loadX = XScaler.transform(xToPredDF)
#         LoadPred = loadForecast.predict(loadX, batch_size=1)
        
#         # loadX = XScaler.transform(np.concatenate(xToPred).ravel().reshape(-1, 1))
#         # LoadPred = loadForecast.predict(loadX.reshape(1, 773), batch_size=1)

#         LoadPred = YScaler.inverse_transform(LoadPred)
#         ResultDf = pd.DataFrame(
#             {"temp": TempPredictions, "rh": RHPredictions, "wdLoad": LoadPred[0]}
#         )
        
#         # print(LoadPred)

#         ResultDf["datetime"] = pd.date_range(
#             dateToPredict.strftime("%Y-%m-%d"),
#             nextDay.strftime("%Y-%m-%d"),
#             freq="15min",
#         )[:96]
#         ResultDf["datetime"] = ResultDf["datetime"].dt.strftime("%Y-%m-%d %H:%M:%S")

#         # return True,ResultDf.to_json(orient='records')
#         return True, ResultDf
#     else:
#         return False, []


def getPredict7DAYSData(date):
    dateToPredict = datetime.datetime.strptime(date, "%Y-%m-%d")
    selected_dates = find_last_14_days(date)
    column_names = ['datetime', 'wdLoad', 'temp', 'rh', 'day_type', 'day', 'block', 'hour', 'week_month', 'week_year', 'month']
    # print(selected_dates)
    # Initialize lists to store predictions
    LoadPredictions = []
    
    # Initialize an empty DataFrame to store the values for each timestamp
    all_values_df = pd.DataFrame(columns=column_names)

    # Iterate through selected dates
    for selected_date in selected_dates:
        # Fetch load and weather data
        load_result, load_data, c_load_data = getLoadData(
            selected_date.strftime("%Y-%m-%d"),
            (selected_date + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        )
        weather_result, weather_data, c_weather_data = getWeatherData(
            selected_date.strftime("%Y-%m-%d"),
            (selected_date + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        )

        if not load_data.empty and not weather_data.empty:
            combined_data = pd.merge(load_data, weather_data, on='datetime', how='inner')
            combined_data['datetime'] = pd.to_datetime(combined_data['datetime']).dt.tz_localize('UTC').dt.tz_convert('Asia/Kolkata')
            combined_data['day'] = combined_data['datetime'].dt.dayofweek
            combined_data['day'] = (combined_data['day']) % 7
            combined_data['day_type'] = combined_data['day'].apply(lambda x: 1 if x == 5 else (2 if x == 6 else 0))
            combined_data['block'] = range(1, 97)  # 'block' values from 1 to 96
            combined_data['hour'] = combined_data['datetime'].dt.hour
            combined_data['week_month'] = combined_data['datetime'].dt.isocalendar().week % 4
            combined_data['week_year'] = combined_data['datetime'].dt.isocalendar().week
            combined_data['month'] = combined_data['datetime'].dt.month
            
            # Convert 'wdLoad', 'temp', and 'rh' columns to numeric type
            combined_data['wdLoad'] = pd.to_numeric(combined_data['wdLoad'], errors='coerce').round(2)
            combined_data['temp'] = pd.to_numeric(combined_data['temp'], errors='coerce').round(3)
            combined_data['rh'] = pd.to_numeric(combined_data['rh'], errors='coerce').round(3)

            # Convert 'day_type', 'day', 'block', 'hour', 'week_month', 'week_year', and 'month' to integer
            int_columns = ['day_type', 'day', 'block', 'hour', 'week_month', 'week_year', 'month']
            for col in int_columns:
                combined_data[col] = pd.to_numeric(combined_data[col], errors='coerce').astype('Int64')

            # Concatenate combined_data with all_values_df
            all_values_df = pd.concat([all_values_df, combined_data], ignore_index=True)
        else:
             return False, []
    load_input7 = prepare_load_dataset_7(all_values_df)
    # Make prediction using Load model
    load_predictions = loadForecast7.predict(load_input7.reshape(1, -1))
    load_predictions = load_predictions.reshape(-1, 96)
    LoadPredictions.extend(load_predictions)
    # Combine predictions into DataFrame
    ResultDf = pd.DataFrame()

    for i in range(len(load_predictions)):
        date_str = (dateToPredict + datetime.timedelta(days=i)).strftime("%Y-%m-%d")
        predictions = load_predictions[i]
        temp_df = pd.DataFrame({"wdLoad": predictions})
        temp_df["datetime"] = pd.date_range(
            date_str,
            periods=96,
            freq="15min",
        ).strftime("%Y-%m-%d %H:%M:%S")
        ResultDf = pd.concat([ResultDf, temp_df])

    return True, ResultDf


app = FastAPI(
    title="Tata Power - API",
    version="3",
    description="Made By Parth Maniar",
    swagger_ui_oauth2_redirect_url='/oauth2-redirect',
    swagger_ui_init_oauth={
        'usePkceWithAuthorizationCodeGrant': True,
        'clientId': settings.OPENAPI_CLIENT_ID,
    },
)


azure_scheme = MultiTenantAzureAuthorizationCodeBearer(
    app_client_id=settings.APP_CLIENT_ID,
    scopes={
        f'api://{settings.APP_CLIENT_ID}/user_impersonation': 'user_impersonation',
    },
    validate_iss=False
)


origins = [
    "*",
    "https://loadforecast.parthmaniar.tech"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# def convert_datetime_timezone(datetime_str, from_tz, to_tz):
#     from_tz = timezone(from_tz)
#     to_tz = timezone(to_tz)
#     datetime_obj = datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S")
#     datetime_obj = from_tz.localize(datetime_obj)
#     datetime_obj = datetime_obj.astimezone(to_tz)
#     return datetime_obj.strftime("%Y-%m-%d %H:%M:%S")


@app.on_event('startup')
async def load_config() -> None:
    """
    Load OpenID config on startup.
    """
    await azure_scheme.openid_config.load_config()
    
@app.get("/hellow")
async def root():
    return {"message": "Hello World"}

@app.get("/getMAE/{n}")
async def get_mae(request: Request, n: int):
    ip = request.client.host
    print(f"IP={ip}")
    now = datetime.datetime.now() + datetime.timedelta(hours=5, minutes=30)
    print(now.strftime("%H:%M:%S"))

    recordsMae = pd.DataFrame(list(getNMae(n)))
    recordsMae["date"] = recordsMae["date"].dt.strftime("%Y-%m-%d")

    try:
        getBlocks = recordsMae[
            ["date", "mae_wdLoad", "mae_temp", "mae_rh"]
        ].to_json(orient="records")
        return ORJSONResponse(
            {
                "maes": json.loads(getBlocks),
                "requestDateTime": now,
                "ip": ip,
                "success": True,
            }
        )
    except KeyError as e:
        print(e)
        return JSONResponse(
            {
                "message": "Invalid Date or Block.",
                "errorCode": 101,
                "success": False,
            }
        )


@app.get("/getDiffData/{DATE}")
async def get_diff_data(
    request: Request,
    DATE: str,
):
    ip = request.client.host
    now = datetime.datetime.now() + datetime.timedelta(hours=5, minutes=30)
    try:
        getBlocks = getDiff(DATE)
        
        # print(getBlocks)
        return ORJSONResponse(
            {
                "data": getBlocks,
                "requestDateTime": now,
                "ip": ip,
                "success": True,
            }
        )
    except KeyError as e:
        print(e)
        return JSONResponse(
            {
                "message": "Invalid Date or Block.",
                "errorCode": 101,
                "success": False,
            }
        )
    
    
@app.get("/getUploadDetails/{n}")
async def get_logs(
    request: Request,
    n: int,
    user: dict = Depends(azure_scheme),
):
    ip = request.client.host
    now = datetime.datetime.now() + datetime.timedelta(hours=5, minutes=30 )
    try:
        # Retrieve the last n logs, excluding _id field
        logs_cursor = log_collection.find({}, {"_id": 0}).sort("timestamp", pymongo.DESCENDING).limit(n)
        logs = list(logs_cursor)
        return (
            {
                "data": logs,
                "ip": ip,
                "requestDateTime": now,
                "success": True,
            }
        )
    except Exception as e:
        print(e)
        return JSONResponse(
            {
                "message": "Invalid Date or Block.",
                "errorCode": 101,
                "success": False,
            }
        )
        
        
@app.get("/getDayType/{D}")
async def get_Day_Type(request: Request,D:str):
    #  Day_Type = datetime.datetime.strptime(daytype, "%Y-%m-%d")
    try:
    # Query MongoDB to retrieve the 'dayType' for the specific date
        specific_date_data_cursor = Date_info.find(
            {
                "date": D,
            },
            {
                "_id": 0,
                "dayType": 1
            }
        )
        
        spDay = []

        # Iterate over the cursor and append results to spDay list
        for record in specific_date_data_cursor:
            spDay.append(record)
        print(spDay)
        return spDay
    except Exception as e:
        return {"error": str(e)}


@app.post("/getAvgData")
async def getAvgData(
    request: Request,
    n:int= Form(...),
):
    try:
        ip = request.client.host
        print(f"IP={ip}")

        now = datetime.datetime.now() + datetime.timedelta(hours=5, minutes=30)
        # print(now.strftime("%H:%M:%S"))

        # Retrieve aggregated averages
        load_aggregate = getNAvgLoad(n)
        weather_aggregate = getNAvgWeather(n)
        
        # Extract averages from aggregation results
        load_result = next(load_aggregate, None)
        weather_result = next(weather_aggregate, None)
        
        if load_result is None or weather_result is None:
            raise HTTPException(status_code=404, detail="No data available")

        avg_wdLoad = round(load_result.get('avg_wdLoad'), 2)
        avg_temp = round(weather_result.get('avg_temp'), 2)
        avg_rh = round(weather_result.get('avg_rh'), 2)

        return JSONResponse(
            {
                "average_stats": {
                    "wdLoad": avg_wdLoad,
                    "temp": avg_temp,
                    "rh": avg_rh
                },
                "requestDateTime": now.strftime("%H:%M:%S"),
                "ip": ip,
                "success": True,
            }
        )
    except Exception as e:
        print(e)
        return JSONResponse(
            {
                "message": "Error occurred while calculating averages.",
                "errorCode": 500,
                "success": False,
            }
        )
        
        
@app.post("/UploadDifferences")
async def upload_difference(
    request: Request,
    FILE: UploadFile = File(...),
    DATE: str = Form(...),
):
    ip = request.client.host
    now = datetime.datetime.now() + datetime.timedelta(hours=5, minutes=30)

    try:
        # Read the contents of the uploaded file
        contents = await FILE.read()
        filePath = f"data/files/{DATE}.xlsx"
        # Write the contents to a file
        with open(filePath, "wb") as f:
            f.write(contents)
        
        # Read the Excel file into a pandas DataFrame
        data = pd.read_excel(filePath)
        # with open("Dummy_Diff.json", "r") as file:
        #     data = json.load(file)

        print(f"IP={ip} DATE={DATE} DATA-LENGTH={len(data)}")
        
        if len(data) == 96:  
            insertNow = insertDiffData(DATE, data, ip, now)  
            if insertNow:
                return JSONResponse(
                    status_code=status.HTTP_200_OK,
                    content={
                        "date": DATE,
                        "message": "Data added successfully!",
                        "requestDateTime": now.strftime("%Y-%m-%d %H:%M:%S"),  # Convert now to string
                        "ip": ip,
                        "success": True,
                    }
                )
            else:
                raise Exception("Data already present!")
        else:
            raise Exception("Data not valid")
    except FileNotFoundError:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "File not found.", "errorCode": 404, "success": False}
        )
    except json.JSONDecodeError as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Invalid JSON format.", "errorCode": 400, "success": False}
        )
    except Exception as error:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": str(error), "errorCode": 500, "success": False}
        )
        
   
@app.post("/getLoadHeatMap")
async def get_weather_heatmap(request: Request, YEAR: str = Form(...)):
    ip = request.client.host
    now = datetime.datetime.now() + datetime.timedelta(hours=5, minutes=30)
    
    now_str = now.strftime("%Y-%m-%d %H:%M:%S")
    try:
        blocks = LoadHeatMap(int(YEAR))
        # print(blocks)
        return JSONResponse(
            {
                "data": blocks,
                "requestDateTime": now_str,
                "ip": ip,
                "success": True,
            }
        )
    except Exception as e:
        print(e)
        return JSONResponse(
            {
                "message": "Invalid Year Data.",
                "errorCode": 101,
                "success": False,
            }
        )


@app.post("/getWeatherHeatMap")
async def get_weather_heatmap(request: Request, YEAR: str = Form(...)):
    ip = request.client.host
    now = datetime.datetime.now() + datetime.timedelta(hours=5, minutes=30)
    
    now_str = now.strftime("%Y-%m-%d %H:%M:%S")
    
    try:
        blocks = WeatherHeatMap(int(YEAR))
        # print(blocks)
        return JSONResponse(
            {
                "data": blocks,
                "requestDateTime": now_str,
                "ip": ip,
                "success": True,
            }
        )
    except Exception as e:
        print(e)
        return JSONResponse(
            {
                "message": "Invalid Year Data.",
                "errorCode": 101,
                "success": False,
            }
        )


@app.post("/getMAERange")
async def get_mae_range(
    request: Request,
    FROM: str = Form(...),
    TO: str = Form(...),
):
    # print("Inside Function")
    ip = request.client.host
    now = datetime.datetime.now()

    try:
        records_mae = getMae(FROM, TO)
        records_mae["date"] = records_mae["date"].dt.strftime("%Y-%m-%d")

        get_blocks = records_mae[["date", "mae_wdLoad", "mae_temp", "mae_rh"]].to_dict(orient="records")
        
        records_mae["mae_wdLoad"] = pd.to_numeric(records_mae["mae_wdLoad"], errors="coerce").round(5)
        records_mae["mae_temp"] = pd.to_numeric(records_mae["mae_temp"], errors="coerce").round(5)
        records_mae["mae_rh"] = pd.to_numeric(records_mae["mae_rh"], errors="coerce").round(5)

        avg_mae_wdLoad = round(records_mae["mae_wdLoad"].mean(), 2)
        avg_mae_temp = round(records_mae["mae_temp"].mean(), 2)
        avg_mae_rh = round(records_mae["mae_rh"].mean(), 2)

        
        return ORJSONResponse(
            {
                "maes": get_blocks,
                "average_maes": {
                    "mae_wdLoad": avg_mae_wdLoad,
                    "mae_temp": avg_mae_temp,
                    "mae_rh": avg_mae_rh
                },
                "requestDateTime": now,
                "ip": ip,
                "success": True,
            }
        )
    except Exception as error:
        print(error)
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=
            {"message": str(error), "errorCode": 400, "success": False}
        )
        
        
ALLOWED_EXTENSIONS = {'xlsx', 'csv'}

@app.post("/uploadLoadData")
async def insert_load_data(
    request: Request,
    FILE: UploadFile = File(...),
    DATE: str = Form(...),
    user: dict = Depends(azure_scheme),
):
    ip = request.client.host
    now = datetime.datetime.now() + datetime.timedelta(hours=5, minutes=30)
    today = (datetime.datetime.now()).strftime("%Y-%m-%d")
    formatted_timestamp = now.strftime("%Y-%m-%d_%H-%M-%S")  # Format timestamp without disallowed characters

    try:
        contents = await FILE.read()
        file_ext = os.path.splitext(FILE.filename)[1].lower()
        if file_ext[1:] not in ALLOWED_EXTENSIONS:
            raise Exception("Unsupported file format. Only .xlsx and .csv files are allowed.")

        # Convert CSV to Excel if necessary
        if file_ext == '.csv':
            temp_file_path = f"data/files/temperory_{DATE}_{formatted_timestamp}.csv"
            with open(temp_file_path, "wb") as buffer:
                buffer.write(contents)
            data = pd.read_csv(temp_file_path)
            file_path = f"data/files/{DATE}_{formatted_timestamp}.xlsx"
            data.to_excel(file_path, index=False)
            os.remove(temp_file_path)
        else:
            file_path = f"data/files/{DATE}_{formatted_timestamp}.xlsx"
            with open(file_path, "wb") as buffer:
                buffer.write(contents)
        
        data = pd.read_excel(file_path)
        print(f"IP={ip} DATE={DATE} DATA-LENGTH={len(data)}")
        data1 = cleanOutliers(data['wdLoad'].tolist())
        data['wdLoad'] = pd.DataFrame(data1)
        if DATE == today and len(data) != 96:
            insertNow = insertData(DATE, data, ip, now)
            if insertNow:
                return ORJSONResponse(
                    {
                        "date": DATE,
                        "message": "Data added successfully!",
                        "requestDateTime": now,
                        "ip": ip,
                        "success": True,
                    }
                )
            else:
                raise Exception("Data already present!")
        elif len(data) == 96:
            insertNow = insertData(DATE, data, ip, now)
            if insertNow:
                genMae(DATE, ip, now)
                log_entry = {
                    "name": user.name,
                    "email": user.preferred_username,
                    "file_type": "load",
                    "file_name": str(FILE.filename),
                    "file_date": DATE,
                    "timestamp": now,
                    "ip": ip,
                }
                log_collection.insert_one(log_entry)
                return ORJSONResponse(
                    {
                        "date": DATE,
                        "message": "Data added successfully!",
                        "requestDateTime": now,
                        "ip": ip,
                        "success": True,
                    }
                )
            else:
                raise Exception("Data already present!")
        else:
            raise Exception("Data not valid")
    except KeyError as e:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Invalid Date or File.", "errorCode": 101, "success": False}
        )
    except Exception as error:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": str(error), "errorCode": 400, "success": False}
        )
        

# @app.post("/uploadLoadDataString")
# async def insert_load_data_string(
#     request: Request,
#     WDLOAD: str = Form(...),
#     date: str = Form(...),
# ):
#     ip = request.client.host
#     now = datetime.datetime.now() + datetime.timedelta(hours=5, minutes=30)

#     try:
#         dataString = WDLOAD
#         data = dataString.split(",")
#         print(f"IP={ip} WDLOAD={WDLOAD} DATA-LENGTH={len(data)}")
        
#         if len(data) == 96:
#             insertNow, d = insertData2(date, data, ip, now)
#             if insertNow:
#                 genMae(date, ip, now)
#                 return ORJSONResponse(
#                     {
#                         "date": date,
#                         "message": "Data will be added!",
#                         "requestDateTime": now,
#                         "ip": ip,
#                         "success": True,
#                     }
#                 )
#             else:
#                 raise Exception("Data already present !!!")
#         else:
#             raise Exception("Data not valid !!!")
#     except KeyError as e:
#       return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST,content=
#             {"message": "Invalid Date or File.", "errorCode": 101, "success": False}
#         )
#     except Exception as error:
#         return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST,content=
#             {"message": str(error), "errorCode": 400, "success": False}
#         )
        

@app.post("/uploadWeatherData")
async def insert_weather_data(
    request: Request,
    FILE: UploadFile = File(...),
    DATE: str = Form(...),
    user: dict = Depends(azure_scheme),
):
    ip = request.client.host
    now = datetime.datetime.now() + datetime.timedelta(hours=5, minutes=30)
    today = (datetime.datetime.now()).strftime("%Y-%m-%d")
    formatted_timestamp = now.strftime("%Y-%m-%d_%H-%M-%S")  # Format timestamp without disallowed characters

    try:
        contents = await FILE.read()
        file_ext = os.path.splitext(FILE.filename)[1].lower()
        if file_ext[1:] not in ALLOWED_EXTENSIONS:
            raise Exception("Unsupported file format. Only .xlsx and .csv files are allowed.")

        # Convert CSV to Excel if necessary
        if file_ext == '.csv':
            temp_file_path = f"data/filesw/temperory_{DATE}_{formatted_timestamp}.csv"
            with open(temp_file_path, "wb") as buffer:
                buffer.write(contents)
            data = pd.read_csv(temp_file_path)
            file_path = f"data/filesw/{DATE}_{formatted_timestamp}.xlsx"
            data.to_excel(file_path, index=False)
            os.remove(temp_file_path)
        else:
            file_path = f"data/filesw/{DATE}_{formatted_timestamp}.xlsx"
            with open(file_path, "wb") as buffer:
                buffer.write(contents)
        
        data = pd.read_excel(file_path)
        print(f"IP={ip} DATE={DATE} DATA-LENGTH={len(data)}")
        data1 = cleanOutliers(data['temp'].tolist())
        data['temp'] = pd.DataFrame(data1)
        data1 = cleanOutliers(data['rh'].tolist())
        data['rh'] = pd.DataFrame(data1)
        if DATE == today and len(data) != 96:
            insertNow = insertTPWeatherData(DATE, data, ip, now)
            if insertNow:
                return ORJSONResponse(
                    {
                        "date": DATE,
                        "message": "Data added successfully!",
                        "requestDateTime": now,
                        "ip": ip,
                        "success": True,
                    }
                )
            else:
                raise Exception("Data already present!")
        elif len(data) == 96:
            insertNow = insertTPWeatherData(DATE, data, ip, now)
            if insertNow:
                genMae(DATE, ip, now)
                log_entry = {
                    "name": user.name,
                    "email": user.preferred_username,
                    "file_type": "Weather",
                    "file_name": str(FILE.filename),
                    "file_date": DATE,
                    "timestamp": now,
                    "ip": ip,
                }
                log_collection.insert_one(log_entry)
                return ORJSONResponse(
                    {
                        "date": DATE,
                        "message": "Data added successfully!",
                        "requestDateTime": now,
                        "ip": ip,
                        "success": True,
                    }
                )
            else:
                raise Exception("Data already present!")
        else:
            raise Exception("Data not valid")
    except KeyError as e:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Invalid Date or File.", "errorCode": 101, "success": False}
        )
    except Exception as error:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": str(error), "errorCode": 400, "success": False}
        )


# @app.post("/uploadWeatherDataString")
# async def insert_weather_data_string(
#     request: Request,
#     date: str = Form(...),
#     temp: str = Form(...),
#     rh: str = Form(...),
# ):
#     ip = request.client.host
#     now = datetime.datetime.now() + datetime.timedelta(hours=5, minutes=30)

#     try:
#         temp_values = temp.split(",")
#         rh_values = rh.split(",")
#         print(f"IP={ip} DATE={date} TEMP-LENGTH={len(temp_values)}  RH-LENGTH={len(rh_values)}")
#         if (len(temp_values) == 96) and (len(rh_values) == 96):
#             insertNow = insertTPWeatherData2(date, temp_values, rh_values, ip, now)
#             if insertNow:
#                 return ORJSONResponse(
#                     {
#                         "date": date,
#                         "message": "Data added successfully!",
#                         "requestDateTime": now,
#                         "ip": ip,
#                         "success": True,
#                     }
#                 )
#             else:
#                 raise Exception("Data already present!")
#         else:
#             raise Exception("Data not valid")
#     except KeyError as e:
#         raise HTTPException(
#             status_code=400,
#             detail="Invalid Date or File.",
#             # headers={"errorCode": 101, "success": False},
#         )
#     except Exception as error:
#         raise HTTPException(
#             status_code=400,
#             detail=str(error),
#             # headers={"errorCode": 400, "success": False},
#         )

@app.post("/getDateDaytype")
async def get_date_daytype(
    request: Request ,
    DATE: str=Form(...),
    DAY_TYPE:  Optional [str]=Form(None),
    user: dict = Depends(azure_scheme),
):
    ip = request.client.host
    now = datetime.datetime.now() + datetime.timedelta(hours=5, minutes=30)

    try:
        # Check if the date already exists in the database
        # existing_date = Date_info.find_one({"date": DATE})
        # if existing_date:
        #     return ORJSONResponse(
        #         {
        #             "message": f"The date {DATE} is already added.",
        #             "requestDateTime": now,
        #             "ip": ip,
        #             "success": False,
        #         },
        #         # status_code=200, // what to do
        #     )
        # OVERWRITE
        # Check if the date already exists in the database
        existing_date = Date_info.find_one({"date": DATE})
        if existing_date:
            # If the date exists, update the day type
            result = Date_info.update_one(
                {"date": DATE},
                {"$set": {"dayType": DAY_TYPE, "timestamp": now}},
            )
            print("Day_Type updated for existing date")
            genMae(DATE,ip,DATE)
            # print("MAE generated")
            return ORJSONResponse(
                {
                    "message": f"Day_Type updated for existing date {DATE}",
                    "requestDateTime": now,
                    "ip": ip,
                    "success": True,
                },
                status_code=200,
            )
        
        data = {
            "name":user.name,
            "email": user.preferred_username,
            "date" : DATE,
            "dayType":DAY_TYPE,
            "timestamp": now,
            "ip":ip,
        }
        
        result = Date_info.insert_one(data)
        genMae(DATE,ip,DATE)
        # print("MAE generated")
        inserted_id = str(result.inserted_id)
        data["_id"] = inserted_id
        print("New entry added to DB")
       
        return ORJSONResponse(
                    {
                        "Data": data ,
                        "message": "Data added successfully!",
                        "requestDateTime": now,
                        "ip": ip,
                        "success": True,
                    },
                    status_code= 200,
                )
    
    except Exception as e:
        return ORJSONResponse(
            {
                "message": f"An error occurred: {str(e)}",
                "requestDateTime": now,
                "ip": ip,
                "success": False,
            },
            status_code=500,
        )

@app.post("/predictLoad")
async def predict_load(
    request: Request,
    DATE: str = Form(...),
    SPECIALDAY: str = Form(...),
):
    ip = request.client.host
    now = datetime.datetime.now()
    requestDateTime = convert_datetime_timezone(
        now.strftime("%Y-%m-%d %H:%M:%S"), "Asia/Calcutta", "UTC"
    )

    allowed_special_days = ['Normal Day', 'Medium Load Day', 'Holiday']
    if SPECIALDAY not in allowed_special_days:
        raise HTTPException(status_code=400, detail=f"Invalid value for SPECIALDAY.")

    try:
        result, getBlocks = getPredict2DAYSData(DATE, SPECIALDAY)
        getBlocks["wdLoad"] = pd.to_numeric(getBlocks["wdLoad"], errors="coerce")
        getBlocks["temp"] = pd.to_numeric(getBlocks["temp"], errors="coerce")
        getBlocks["rh"] = pd.to_numeric(getBlocks["rh"], errors="coerce")
        
        getBlocks["wdLoad"] = getBlocks["wdLoad"].round(2)
        getBlocks["temp"] = getBlocks["temp"].round(2)
        getBlocks["rh"] = getBlocks["rh"].round(2)
        
        if result:
            return ORJSONResponse(
                {
                    "date": DATE,
                    "blocks": json.loads(getBlocks.to_json(orient="records")),
                    "requestDateTime": requestDateTime,
                    "ip": ip,
                    "success": True,
                }
            )
        else:
            raise Exception("Data not available")
    except Exception as error:
         return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST,content=
            {"message": str(error), "errorCode": 400, "success": False}
        )
         
         
@app.post("/predictLoad7")
async def predict_load7(
    request: Request,
    DATE: str = Form(...),
    # SPECIALDAY: str = Form(...),
):
    ip = request.client.host
    now = datetime.datetime.now()
    requestDateTime = convert_datetime_timezone(
        now.strftime("%Y-%m-%d %H:%M:%S"), "Asia/Calcutta", "UTC"
    )

    try:
        result, getBlocks = getPredict7DAYSData(DATE)
        getBlocks["wdLoad"] = pd.to_numeric(getBlocks["wdLoad"], errors="coerce")
        getBlocks["wdLoad"] = getBlocks["wdLoad"].round(2)
        getBlocks["datetime"] = pd.to_datetime(getBlocks["datetime"])

        if result:
            # Group the DataFrame by date
            grouped_data = getBlocks.groupby(getBlocks['datetime'].dt.strftime('%Y-%m-%d'))
            
            # Create a list to store the final JSON response
            response_data = []
            
            # Iterate over each group (date)
            for date, group in grouped_data:
                # Convert the group to a dictionary with string-formatted datetime and append it to the response_data list
                blocks = [{"wdLoad": wdLoad, "datetime": str(datetime)} for wdLoad, datetime in zip(group["wdLoad"], group["datetime"])]
                response_data.append({"date": date, "blocks": blocks})
            
            return ORJSONResponse(
                {
                    "response": response_data,
                    "requestDateTime": requestDateTime,
                    "ip": ip,
                    "success": True,
                }
            )
        else:
            raise Exception("Data not available")
    except Exception as error:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": str(error), "errorCode": 400, "success": False}
        )

user_data = [
    {"name": "Hemanshu", "email": "hemanshu.r@somaiya.edu", "password": "hemanshu@123"},
    {"name": "Uchit", "email": "uchit.c@somaiya.edu", "password": "password2"},
    {"name": "Chirayu", "email": "chirayu.a@somaiya.edu", "password": "password3"},
    {"name":"Jatin" ,"email":"jatin.s@somaiya.edu","password":"password4"}
]

async def authenticate_user(name: str, pwd: str) -> Optional[dict[str, str]]:
    for user in user_data:
        if user["email"] == name and user["password"] == pwd:
            return {"message": f"Welcome"}
    return None

@app.post("/userlogin")
async def root(request : Request , name: str= Form() , pwd : str = Form()):
    user_auth = await authenticate_user(name, pwd)
    if user_auth:
        return JSONResponse(content=user_auth)
    else:
        return JSONResponse(
            content=
            {"message": "Invalid credentials"}, 
            # status_code=401
            )

@app.post("/getData")
async def get_data(
    request: Request,
    DATE: str = Form(...),
):
    ip = request.client.host
    now = datetime.datetime.now()
    requestDateTime = convert_datetime_timezone(
        now.strftime("%Y-%m-%d %H:%M:%S"), "Asia/Calcutta", "UTC"
    )

    try:
        dateToFetch = datetime.datetime.strptime(DATE, "%Y-%m-%d")
        nextDay = dateToFetch + datetime.timedelta(days=1)
        result, getBlocks, cData = daa(
            dateToFetch.strftime("%Y-%m-%d"), nextDay.strftime("%Y-%m-%d")
        )
        
        getBlocks["wdLoad"] = pd.to_numeric(getBlocks["wdLoad"], errors="coerce").round(2)
        getBlocks["temp"] = pd.to_numeric(getBlocks["temp"], errors="coerce").round(2)
        getBlocks["rh"] = pd.to_numeric(getBlocks["rh"], errors="coerce").round(2)
        
        

        avg_wdLoad = getBlocks["wdLoad"].mean().round(2)
        avg_temp = getBlocks["temp"].mean().round(2)
        avg_rh = getBlocks["rh"].mean().round(2)
        
        if result:
            return ORJSONResponse(
                {
                    "date": DATE,
                    "blocks": json.loads(getBlocks.to_json(orient="records")),
                    "average_stats": {
                    "wdLoad": avg_wdLoad,
                    "temp": avg_temp,
                    "rh": avg_rh
                    },
                    "requestDateTime": requestDateTime,
                    "ip": ip,
                    "success": True,
                }
            )
        else:
            raise Exception("Data not available")
    except KeyError as e:
         return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST,content=
            {"message": "Invalid Date or Block.", "errorCode": 101, "success": False}
        )
    except Exception as error:
         return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST,content=
            {"message": str(error), "errorCode": 400, "success": False}
        )
        
        
# try:
#     sendMailWithoutPrediction('2021-02-18', "10.31.72.133", now)
# except Exception as e: print(e)
                  
# if __name__ == "__main__":
#     app.run(debug=True)

# genMae("2020-02-15", "10.31.72.133", now)



def process_date(date):
    try:
        now = datetime.datetime.now()
        # print(date.strftime("%Y-%m-%d"))
        genMae(date.strftime("%Y-%m-%d"), '127.0.0.1', now)
    except KeyError as e:
        print(e)
        print("FAIL - ", date.strftime("%Y-%m-%d"))

def main():
    start_date = "2018-08-01"
    end_date = "2023-12-27"

    date_range = pd.date_range(start=start_date, end=end_date)

    # Using concurrent.futures to parallelize the loop
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        executor.map(process_date, date_range)

if __name__ == "__main__":
    main()