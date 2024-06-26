import errno
import ftplib
import os
import sys
import time

server = "14.139.127.77"
user = "usrsafar"
password = "RCsafar#2020"
source = "/"
destination = "/Users/parthmaniar/Documents/GitHub/IMDMUMBAI-API/csv/"
interval = 0.05

ftp = ftplib.FTP(server)
ftp.login(user, password)


def downloadFiles(path, destination):
    try:
        ftp.cwd(path)
        os.chdir(destination)
        mkdir_p(destination[0 : len(destination) - 1] + path)
        print("Created: " + destination[0 : len(destination) - 1] + path)
    except OSError:
        pass
    except ftplib.error_perm:
        print("Error: could not change to " + path)
        sys.exit("Ending Application")

    filelist = ftp.nlst()

    for file in filelist:
        time.sleep(interval)
        try:
            ftp.cwd(path + file + "/")
            downloadFiles(path + file + "/", destination)
        except ftplib.error_perm:
            os.chdir(destination[0 : len(destination) - 1] + path)

            try:
                ftp.retrbinary(
                    "RETR " + file,
                    open(os.path.join(destination + path, file), "wb").write,
                )
                print("Downloaded: " + file)
            except Exception():
                print("Error: File could not be downloaded " + file)
    return


def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as exc:
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise


downloadFiles(source, destination)
