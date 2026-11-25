import {mergeConfig} from 'vite';
import path from 'node:path';
import standalone from './vite.color-lab.config';
export default mergeConfig(standalone,{root:path.resolve('preview/golden-horizon/review'),build:{outDir:path.resolve('.sites-runtime/golden-horizon-preview')}});
