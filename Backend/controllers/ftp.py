import datetime
import ftplib
import json

import numpy as np
import pandas as pd
from helpers.constants import LOCATIONS, PARAMS, name, password, server, user

from controllers.database import IMDDataRecords


def getDataFromFTP(DATE):
    try:
        ftp = ftplib.FTP(server)
        ftp.login(user, password)
        previousFile = datetime.datetime.strptime(
            DATE, "%Y-%m-%d"
        ) - datetime.timedelta(days=1)

        FILENAME = (
            datetime.datetime.strptime(DATE, "%Y-%m-%d").strftime("%d%m%Y")
            + "weather.csv"
        )
        FILENAME2 = previousFile.strftime("%d%m%Y") + "weather.csv"

        with open("../data/csv/" + FILENAME, "wb") as fp:
            ftp.retrbinary(f"RETR {FILENAME}", fp.write)
        with open("../data/csv/" + FILENAME2, "wb") as fp2:
            ftp.retrbinary(f"RETR {FILENAME2}", fp2.write)
        ftp.quit()
        frames = []
        f1 = pd.read_csv(
            "../data/csv/" + FILENAME,
            sep=";",
            engine="python",
            usecols=range(0, 151),
            parse_dates=["Date"],
            skiprows=[0, 1, 2, 3],
            names=name,
        )
        f2 = pd.read_csv(
            "../data/csv/" + FILENAME2,
            sep=";",
            engine="python",
            usecols=range(0, 151),
            parse_dates=["Date"],
            skiprows=[0, 1, 2, 3],
            names=name,
        )
        frames.append(f2)
        frames.append(f1)
        data = pd.concat(frames, ignore_index=True)
        data["TIME"] = [d.time() for d in data["Date"]]
        data["Date"] = [d.strftime("%m/%d/%Y %H:%M:%S") for d in data["Date"]]
        data.index += 1
        columns = {key: [] for key in PARAMS}
        for param in PARAMS:
            for loc in LOCATIONS:
                columns[param].append(param + "_" + loc)
        for param in PARAMS:
            data[param] = data[columns[param]].apply(
                lambda x: np.array(x[x != "Invalid"]).astype(float).mean(), axis=1
            )
        d = data.drop(
            list(cname for column in columns.values() for cname in column), axis=1
        )
        d = d.sort_values(by="Date")
        d = d.set_index("Date", drop=True)
        d = d.set_index(pd.to_datetime(d.index))
        d = d[datetime.datetime.strptime(DATE, "%Y-%m-%d").strftime("%Y-%m-%d")]
        d["datetime"] = d.index
        d.datetime = d.datetime - pd.Timedelta("05:30:00")
        d.reset_index(drop=True, inplace=True)
        print(IMDDataRecords.find({DATE}))
        IMDDataRecords.insert_many(json.loads(d.T.to_json()).values())
        IMDDataRecords.update_many(
            {}, [{"$set": {"datetime": {"$toDate": "$datetime"}}}]
        )
        return True
    except Exception:
        return False, []


def getTodayBlocksFTP(DATE):
    ftp = ftplib.FTP(server)
    ftp.login(user, password)
    previousFile = datetime.datetime.strptime(DATE, "%d-%m-%Y") - datetime.timedelta(
        days=1
    )

    FILENAME = (
        datetime.datetime.strptime(DATE, "%d-%m-%Y").strftime("%d%m%Y") + "weather.csv"
    )
    FILENAME2 = previousFile.strftime("%d%m%Y") + "weather.csv"

    with open("../data/csv/" + FILENAME, "wb") as fp:
        ftp.retrbinary(f"RETR {FILENAME}", fp.write)
    with open("../data/csv/" + FILENAME2, "wb") as fp2:
        ftp.retrbinary(f"RETR {FILENAME2}", fp2.write)
    ftp.quit()
    frames = []
    f1 = pd.read_csv(
        "../data/csv/" + FILENAME,
        sep=";",
        engine="python",
        usecols=range(0, 151),
        parse_dates=["Date"],
        skiprows=[0, 1, 2, 3],
        names=name,
    )
    f2 = pd.read_csv(
        "../data/csv/" + FILENAME2,
        sep=";",
        engine="python",
        usecols=range(0, 151),
        parse_dates=["Date"],
        skiprows=[0, 1, 2, 3],
        names=name,
    )
    frames.append(f2)
    frames.append(f1)
    data = pd.concat(frames, ignore_index=True)
    data["TIME"] = [d.time() for d in data["Date"]]
    data["datetime"] = [d.strftime("%Y-%m-%d %H:%M:%S") for d in data["Date"]]
    data.index += 1
    columns = {key: [] for key in PARAMS}
    for param in PARAMS:
        for loc in LOCATIONS:
            columns[param].append(param + "_" + loc)
    for param in PARAMS:
        data[param] = data[columns[param]].apply(
            lambda x: np.array(x[x != "Invalid"]).astype(float).mean(), axis=1
        )
    d = data.drop(
        list(cname for column in columns.values() for cname in column), axis=1
    )
    d = d.sort_values(by="datetime")
    d = d.set_index("datetime", drop=False)
    d = d.set_index(pd.DatetimeIndex(d.index))
    # d['datetime'] = d.index.dt.strftime("%Y-%m-%d %H:%M:%S")
    d = d[datetime.datetime.strptime(DATE, "%d-%m-%Y").strftime("%Y-%m-%d")]
    return d[["datetime", "TIME", "HUM", "RG", "TEMP", "WD", "WS"]].to_json(
        orient="records"
    )


def getBlockFTP(DATE, BLOCK):
    ftp = ftplib.FTP(server)
    ftp.login(user, password)
    previousFile = datetime.datetime.strptime(DATE, "%d-%m-%Y") - datetime.timedelta(
        days=1
    )

    FILENAME = (
        datetime.datetime.strptime(DATE, "%d-%m-%Y").strftime("%d%m%Y") + "weather.csv"
    )
    FILENAME2 = previousFile.strftime("%d%m%Y") + "weather.csv"
    with open("../data/csv/" + FILENAME, "wb") as fp:
        ftp.retrbinary(f"RETR {FILENAME}", fp.write)
    with open("../data/csv/" + FILENAME2, "wb") as fp2:
        ftp.retrbinary(f"RETR {FILENAME2}", fp2.write)
    ftp.quit()
    frames = []
    f1 = pd.read_csv(
        "../data/csv/" + FILENAME,
        sep=";",
        engine="python",
        usecols=range(0, 151),
        parse_dates=["Date"],
        skiprows=[0, 1, 2, 3],
        names=name,
    )
    f2 = pd.read_csv(
        "../data/csv/" + FILENAME2,
        sep=";",
        engine="python",
        usecols=range(0, 151),
        parse_dates=["Date"],
        skiprows=[0, 1, 2, 3],
        names=name,
    )
    frames.append(f2)
    frames.append(f1)

    data = pd.concat(frames, ignore_index=True)
    data["TIME"] = [d.time() for d in data["Date"]]
    data["Date"] = [d.strftime("%m/%d/%Y %H:%M:%S") for d in data["Date"]]
    # data.index += 1
    columns = {key: [] for key in PARAMS}
    for param in PARAMS:
        for loc in LOCATIONS:
            columns[param].append(param + "_" + loc)
    for param in PARAMS:
        data[param] = data[columns[param]].apply(
            lambda x: np.array(x[x != "Invalid"]).astype(float).mean(), axis=1
        )
    d = data.drop(
        list(cname for column in columns.values() for cname in column), axis=1
    )
    d = d.sort_values(by="Date")
    d = d.set_index("Date", drop=False)
    d = d.set_index(pd.DatetimeIndex(d.index))
    d = d[datetime.datetime.strptime(DATE, "%d-%m-%Y").strftime("%Y-%m-%d")]
    return d.iloc[[BLOCK - 1]].to_json(orient="records")
