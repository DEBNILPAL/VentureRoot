const fs = require('fs');
const path = require('path');

const localesDir = __dirname;
const enFile = path.join(localesDir, 'en.json');
const languages = ['bn', 'hi', 'mr', 'pa', 'ta', 'te'];

function auditLocales() {
  const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
  const enKeys = Object.keys(enData);
  console.log(`[Locale Audit] Base language (EN) has ${enKeys.length} keys.\n`);

  let allGood = true;
  languages.forEach((lang) => {
    const langFile = path.join(localesDir, `${lang}.json`);
    if (!fs.existsSync(langFile)) {
      console.error(`❌ [${lang.toUpperCase()}] File missing: ${langFile}`);
      allGood = false;
      return;
    }

    const langData = JSON.parse(fs.readFileSync(langFile, 'utf8'));
    const missingKeys = enKeys.filter((k) => !(k in langData));
    const extraKeys = Object.keys(langData).filter((k) => !(k in enData));

    if (missingKeys.length === 0 && extraKeys.length === 0) {
      console.log(`✅ [${lang.toUpperCase()}] 100% in sync (${Object.keys(langData).length} keys, 0 missing).`);
    } else {
      allGood = false;
      console.warn(`⚠️ [${lang.toUpperCase()}] Total: ${Object.keys(langData).length} keys.`);
      if (missingKeys.length > 0) console.warn(`   Missing (${missingKeys.length}):`, missingKeys);
      if (extraKeys.length > 0) console.warn(`   Extra in ${lang} (${extraKeys.length}):`, extraKeys);
    }
  });

  return allGood;
}

async function translateMissing() {
  let translate;
  try {
    translate = require('@iamtraction/google-translate');
  } catch (e) {
    console.error('Install @iamtraction/google-translate to use auto-translate.');
    return;
  }

  const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
  const keys = Object.keys(enData);

  for (const lang of languages) {
    const langFile = path.join(localesDir, `${lang}.json`);
    const langData = fs.existsSync(langFile) ? JSON.parse(fs.readFileSync(langFile, 'utf8')) : {};
    const missingKeys = keys.filter((k) => !langData[k]);

    if (missingKeys.length === 0) {
      console.log(`[${lang.toUpperCase()}] All keys already present.`);
      continue;
    }

    console.log(`[${lang.toUpperCase()}] Translating ${missingKeys.length} missing keys...`);
    const batchSize = 10;
    for (let i = 0; i < missingKeys.length; i += batchSize) {
      const batch = missingKeys.slice(i, i + batchSize);
      try {
        const results = await Promise.all(
          batch.map((k) =>
            translate(enData[k], { from: 'en', to: lang })
              .then((res) => res.text)
              .catch(() => enData[k])
          )
        );
        batch.forEach((k, idx) => {
          langData[k] = results[idx];
        });
        await new Promise((r) => setTimeout(r, 400));
      } catch (err) {
        console.error(`Error translating batch for ${lang}:`, err);
      }
    }

    fs.writeFileSync(langFile, JSON.stringify(langData, null, 2) + '\n', 'utf8');
    console.log(`Updated ${lang}.json with new translations.\n`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isTranslate = args.includes('--translate');

  const ok = auditLocales();
  if (isTranslate && !ok) {
    console.log('\nRunning translation for missing keys...');
    await translateMissing();
    auditLocales();
  }
}

main().catch(console.error);
