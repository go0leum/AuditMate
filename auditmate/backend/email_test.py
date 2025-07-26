import smtplib
from email.mime.text import MIMEText

# 메일 서버 설정 (예: Gmail SMTP)
smtp_server = "smtp.daum.net"
smtp_port = 465  # SSL 포트
sender_email = "junpyo@nexiasamduk.kr"
sender_password = "다음메일비밀번호"

receiver_email = "junpyo@daum.net"
subject = "테스트 메일"
body = "이것은 AuditMate에서 보낸 테스트 메일입니다."

# 메일 내용 작성
msg = MIMEText(body)
msg["Subject"] = subject
msg["From"] = sender_email
msg["To"] = receiver_email

# 메일 전송
try:
    server = smtplib.SMTP_SSL(smtp_server, smtp_port)
    server.login(sender_email, sender_password)
    server.sendmail(sender_email, receiver_email, msg.as_string())
    server.quit()
    print("메일이 성공적으로 전송되었습니다.")
except Exception as e:
    print("메일 전송 실패:", e)