import {mergeConfig} from 'vite';
import path from 'node:path';
import gold from './vite.gold-preview.config';
export default mergeConfig(gold,{root:path.resolve('preview/color-lab'),build:{outDir:path.resolve('.sites-runtime/color-lab-frame')}});
