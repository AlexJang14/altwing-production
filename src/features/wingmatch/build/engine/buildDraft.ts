import {readJSON} from '../../../../lib/storage';
export function readBuildDraft(key:string) {
  const raw=readJSON<Record<string,unknown> | null>(key,null);
  const text=(name:string)=>typeof raw?.[name]==='string'?raw[name] as string:'';
  return {stageIndex:typeof raw?.stageIndex==='number'&&Number.isInteger(raw.stageIndex)?Math.max(0,Math.min(6,raw.stageIndex)):0,prediction:text('prediction'),experiment:text('experiment'),comparison:text('comparison'),revision:text('revision'),defense:text('defense')};
}
