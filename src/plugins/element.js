import Vue from 'vue'
import {
  Container,
  Main,
  Button,
  Header,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Progress,
  Row,
  Col,
} from 'element-ui'
import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'

locale.use(lang)

Vue.use(Container)
Vue.use(Main)
Vue.use(Button)
Vue.use(Header)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Progress)
Vue.use(Row)
Vue.use(Col)
