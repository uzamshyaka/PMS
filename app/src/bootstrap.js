import axios from 'axios'

window.axios = axios

window.axios.defaults.baseURL = 'http://localhost:8081'
window.axios.defaults.withCredentials = true
window.axios.defaults.withXSRFToken = true
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
