import DefaultTheme from 'vitepress/theme'
import './style.css'
import TryIt from './components/TryIt.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Global komponentlar
    app.component('TryIt', TryIt)
  }
}
