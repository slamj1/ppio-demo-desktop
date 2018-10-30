import Vue from 'vue'
import { Button, Input, Alert } from 'element-ui'
import '@/assets/css/element-theme.scss'
import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'

locale.use(lang)

Vue.use(Button)
Vue.use(Input)
Vue.use(Alert)
