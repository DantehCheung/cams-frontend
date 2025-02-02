import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(
    {
       // 配置 JSX 运行时
       jsxRuntime: 'automatic', 
       // 让插件处理 .js 文件中的 JSX
       include: [/\.jsx?$/, /\.tsx?$/]
    }
  )],
  
})
