!macro customInstall
  DetailPrint "Register ppio-demo URI Handler"
  DeleteRegKey HKCR "ppio-demo"
  WriteRegStr HKCR "ppio-demo" "" "URL:ppio-demo"
  WriteRegStr HKCR "ppio-demo" "URL Protocol" ""
  WriteRegStr HKCR "ppio-demo\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCR "ppio-demo\shell" "" ""
  WriteRegStr HKCR "ppio-demo\shell\Open" "" ""
  WriteRegStr HKCR "ppio-demo\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend