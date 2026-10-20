import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { cloudflare } from '@cloudflare/vite-plugin';
import { sites } from './build/sites-vite-plugin';
process.env.CLOUDFLARE_CF_FETCH_ENABLED='false';
process.env.WRANGLER_SEND_METRICS='false';
export default defineConfig({plugins:[svelte(),sites({mockAuth:false}),cloudflare({viteEnvironment:{name:'server'},inspectorPort:false,configPath:'wrangler.jsonc'})]});
