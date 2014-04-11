@echo off

set REGKEY="HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders"
set REGVAL=Personal
for /f "tokens=2,*" %%a in ('reg query %REGKEY% /v %REGVAL% ^| findstr %REGVAL%') do (
	set MyDocuments=%%b
)
ROBOCOPY . %MyDocuments%\Spotify\TempoWiki /PURGE
ROBOCOPY css %MyDocuments%\Spotify\TempoWiki\css /MIR
ROBOCOPY img %MyDocuments%\Spotify\TempoWiki\img /MIR
ROBOCOPY js %MyDocuments%\Spotify\TempoWiki\js /MIR
