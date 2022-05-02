/*
 * @Author: imsixn
 * @Date: 2022-04-26 10:16:40
 * @LastEditors: imsixn
 * @LastEditTime: 2022-04-29 22:16:10
 * @Description: file content
 */
import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css';
createApp(App).use(ElementPlus).use(store).mount('#app')
