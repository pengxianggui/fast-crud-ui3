import {fileURLToPath, URL} from 'node:url'

import path from 'path'
import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    const isLibrary = (mode === 'library')
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    return {
        server: {
            host: '0.0.0.0',
            port: 5173,
            proxy: {
                '/api': {
                    target: env.VITE_PROXY_URL,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, '')
                }
            }
        },
        plugins: [
            vue(),
            vueJsx(), // 支持使用jsx语法
            AutoImport({
                resolvers: [ElementPlusResolver({
                    importStyle: 'sass',
                    resolveIcons: true // 使用时可以不用 import
                })],
            }),
            // 使得无需手动引入element-plus组件，自动识别按需引入
            Components({
                resolvers: [ElementPlusResolver({
                    importStyle: 'sass',
                    resolveIcons: true // 打包包含组件
                })]
            }),
            // dts插件配置
            isLibrary && dts({
                entryRoot: 'packages', // 源码入口目录
                outputDir: 'lib', // 输出目录
                tsconfigPath: './tsconfig.json',
                cleanVueFileName: true, // 将.vue.d.ts 转换为 .d.ts
                // 如果你的包很大，可以开启 rollupTypes: true 把所有类型合并为一个文件（可选）
            })
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)), // 配置别名,简化导入时路径书写
                // vue: 'vue/dist/vue.esm.js' // Vue 2.7 的完整 ESM 构建
            }
        },
        build: isLibrary ? {
            // build.lib 配置为库模式, 用以描述打包组件
            lib: {
                entry: path.resolve(__dirname, 'packages/index.js'), // 组件库入口
                name: 'FastCrudUI', // 全局访问库时的名称
                fileName: (format) => `fast-crud-ui3.${format}.js`,
                formats: ['es', 'cjs', 'umd']  // 输出 ESM, CJS 和 UMD 格式
            },
            rollupOptions: {
                external: ['vue', /^element-plus(\/.*)?$/],
                output: {
                    globals: {
                        vue: 'Vue',
                        'element-plus': 'ElementPlus',
                    },
                    // === 关键：保持原来的目录结构，这样类型文件才能对应上 ===
                    preserveModules: false
                }
            },
            outDir: 'lib', // 指定输出目录为 lib
        } : {
            outDir: 'dist'
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: "modern-compiler",
                    // additionalData: `@use "sass:math";`, // 配置 Dart Sass 的现代写法
                    silenceDeprecations: ["legacy-js-api"] // 静默警告: Deprecation Warning: The legacy JS API is deprecated and will be removed in Dart Sass 2.0.0.
                }
            }
        }
    }
})
