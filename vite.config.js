import { defineConfig, loadEnv, ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { VantResolver } from '@vant/auto-import-resolver';



// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 获取命令行参数，判断是否为构建命令
  const isBuild = command === 'build';
  // 获取根目录
  const root = process.cwd();

  // 动态加载环境变量
  let env;
  if (!isBuild) {
    // 如果不是构建命令，从命令行参数中获取mode或默认值
    const modeArgIndex = process.argv.indexOf('--mode');
    const modeValue = modeArgIndex !== -1 ? process.argv[modeArgIndex + 1] : mode;
    env = loadEnv(modeValue, root);
  } else {
    // 构建命令时直接使用mode
    env = loadEnv(mode, root);
  }
  return {
    base: './',
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver(), VantResolver()], // 合并ElementPlus和Vant的resolver
      }),
      Components({
        resolvers: [ElementPlusResolver(), VantResolver()], // 同样在这里合并
      }),
    ],
    resolve: {
      alias: {
        '@': '/src',
        "assets": "/assets"
      }
    },
    build: {
      minify: 'terser',
      outDir: env.VITE_OUT_DIR || 'dist',
      sourcemap: env.VITE_SOURCEMAP === 'true' ? 'inline' : false,
      // brotliSize: false,
      terserOptions: {
        compress: {
          drop_debugger: env.VITE_DROP_DEBUGGER === 'true',
          drop_console: env.VITE_DROP_CONSOLE === 'true'
        }
      },
      rollupOptions: {
        output: {
          // 将环境变量VCONSOLE_ENABLED注入到客户端代码中
          define: {
            '__VCONSOLE_ENABLED__': JSON.stringify(env.VCONSOLE_ENABLED),
          },
        },
      },
    },
    server: {
      port: 5173,
      hmr: {
        overlay: false
      },
      host: '0.0.0.0',
      open: true
    },
  }
})