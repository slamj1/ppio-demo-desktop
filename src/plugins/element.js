import Vue from 'vue'
import {
  Container,
  Main,
  Button,
  ButtonGroup,
  Header,
  Aside,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Menu,
  MenuItem,
  Progress,
  Row,
  Col,
  Input,
  Alert,
  Steps,
  Step,
  Select,
  Option,
  RadioGroup,
  Radio,
  Table,
  TableColumn,
  Badge,
  Popover,
  Notification,
  Loading,
} from 'element-ui'
import '@/assets/css/element-theme.scss'
import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'

locale.use(lang)

Vue.use(Container)
Vue.use(Main)
Vue.use(Button)
Vue.use(ButtonGroup)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Progress)
Vue.use(Row)
Vue.use(Col)
Vue.use(Input)
Vue.use(Alert)
Vue.use(Steps)
Vue.use(Step)
Vue.use(Select)
Vue.use(Option)
Vue.use(RadioGroup)
Vue.use(Radio)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Badge)
Vue.use(Popover)
Vue.use(Loading)

Vue.prototype.$notify = Notification
Vue.prototype.$loading = Loading.service
