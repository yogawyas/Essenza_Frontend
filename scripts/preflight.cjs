const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
require('./verify-assets.cjs');
const sdk=process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');
const java=spawnSync('java',['-version'],{encoding:'utf8',windowsHide:true});
const results={node:process.version,java_found:java.status===0,sdk_path:sdk,
  sdk_found:fs.existsSync(path.join(sdk,'platforms','android-36')),
  ndk_found:fs.existsSync(path.join(sdk,'ndk','27.1.12297006')),
  adb_found:fs.existsSync(path.join(sdk,'platform-tools','adb.exe')),
  native_runtime_note:'ONNX Runtime 1.19.0 on React Native 0.86 requires device validation.'};
console.log(JSON.stringify(results,null,2));
if (!results.java_found || !results.sdk_found || !results.ndk_found || !results.adb_found) process.exitCode=1;
