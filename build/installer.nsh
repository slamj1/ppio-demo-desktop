!macro customInstall
  DetailPrint "Register ppio-demoV0.1.0 URI Handler"
  DeleteRegKey HKCR "ppio-demoV0.1.0"
  WriteRegStr HKCR "ppio-demoV0.1.0" "" "URL:ppio-demoV0.1.0"
  WriteRegStr HKCR "ppio-demoV0.1.0" "PPIO-Demo v0.1.0 SSO authentication Protocol" ""
  WriteRegStr HKCR "ppio-demoV0.1.0\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCR "ppio-demoV0.1.0\shell" "" ""
  WriteRegStr HKCR "ppio-demoV0.1.0\shell\Open" "" ""
  WriteRegStr HKCR "ppio-demoV0.1.0\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend
