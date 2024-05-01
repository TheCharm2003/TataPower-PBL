import datetime
import smtplib
from datetime import date, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

sender_address = "Parth Maniar <parth.maniar@somaiya.edu>"
sender_pass = "nzuwagjwkaxkxhzj"
# receiver_address = ["parth.maniar@somaiya.edu", "trusha.biswas@tatapower.com"]
receiver_address = ["parth.maniar@somaiya.edu","trusha.biswas@tatapower.com","radhika.kotecha@somaiya.edu"]


def sendMail(maeDict, ip, requestDateTime):
    FDate = datetime.datetime.strptime(
        maeDict.get("date"), "%Y-%m-%d"
    ) + datetime.timedelta(days=2)
    mcontent = f"""
<html>
 <head></head>
  <body>
    <div>Dear Ma'am,</div>
<div>
	<br>
</div>
<div>Please find the details regarding the data of date <strong>{maeDict.get("date")}</strong> being uploaded through the IP: {ip} on {requestDateTime.strftime("%Y-%m-%d ")} at {requestDateTime.strftime("%H:%M:%S")}.</div>
<div>The MAEs are as follows:</div>
<br>
<div><strong>Load MAE</strong>: {round(float(maeDict.get("mae_wdLoad")),2)} %</div>
<div><strong>Temp MAE</strong>: {round(float(maeDict.get("mae_temp")),2)} %</div>
<div><strong>Humidity MAE</strong>: {round(float(maeDict.get("mae_rh")),2)} %</div>
<br>
<div>Load forecast for <strong>{FDate.strftime('%Y-%m-%d ')}</strong> is now available on&nbsp;<strong><a href="https://loadforecast.parthmaniar.tech/forecastLoad">https://loadforecast.parthmaniar.tech/forecastLoad</a></strong></div>
<div><br></div>
<div>Regards,</div>
<a href="https://parthmaniar.tech">Parth Maniar</a>

  </body></html>
  """
    for email in receiver_address:
        message = MIMEMultipart()
        message["From"] = sender_address
        message["To"] = email
        message[
            "Subject"
        ] = f'TataPower: WBSTLF - Details regarding data uploaded of {maeDict.get("date")}'
        message.attach(MIMEText(mcontent, "html"))
        session = smtplib.SMTP("smtp.gmail.com", 587)  # use gmail with port
        session.starttls()  # enable security
        session.login("parth.maniar@somaiya.edu", sender_pass)
        text = message.as_string()
        session.sendmail(sender_address, email, text)
        session.quit()
        print("Mail Sent: ", email)




def sendMailWithoutPrediction(date, ip, requestDateTime):
    mcontent = f"""
<html>
 <head></head>
  <body>
<div>Dear Ma'am,</div>
<div>
	<br>
</div>
<div>The data of date <strong>{date}</strong> is uploaded through the IP: {ip} on {requestDateTime.strftime("%Y-%m-%d ")} at {requestDateTime.strftime("%H:%M:%S")}.</div>
<div><br></div><div><a href="https://loadforecast.parthmaniar.tech/">https://loadforecast.parthmaniar.tech/</a><br></div><div><br></div>
<div>Regards,</div>
<a href="https://parthmaniar.tech">Parth Maniar</a>


  </body></html>
  """
    for email in receiver_address:
        message = MIMEMultipart()
        message["From"] = sender_address
        message["To"] = email
        message[
            "Subject"
        ] = f'TataPower: WBSTLF - Details regarding data uploaded of {date}'
        message.attach(MIMEText(mcontent, "html"))
        session = smtplib.SMTP("smtp.gmail.com", 587)  # use gmail with port
        session.starttls()  # enable security
        session.login("parth.maniar@somaiya.edu", sender_pass)
        text = message.as_string()
        session.sendmail(sender_address, email, text)
        session.quit()
        print("Mail Sent: ", email)
