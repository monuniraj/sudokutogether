const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', '@codetrix-studio', 'capacitor-google-auth', 'android', 'build.gradle');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  let changed = false;

  if (content.includes('jcenter()')) {
    content = content.replace(/jcenter\(\)/g, 'mavenCentral()');
    changed = true;
    console.log('[patch-google-auth] Replaced deprecated jcenter() with mavenCentral()');
  }

  if (content.includes("proguard-android.txt")) {
    content = content.replace("proguard-android.txt", "proguard-android-optimize.txt");
    changed = true;
    console.log('[patch-google-auth] Replaced deprecated proguard-android.txt with proguard-android-optimize.txt');
  }

  if (changed) {
    fs.writeFileSync(targetFile, content, 'utf8');
  }
}
