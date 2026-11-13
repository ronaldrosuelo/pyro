# Shop website + phone admin app

Customers open `index.html`. You manage items from `admin.html` (also your Android app).

## 1. Supabase (database, photos)
1. Create a free project at supabase.com.
2. SQL Editor: paste all of `supabase.sql` and run it.
3. Project Settings > API: copy the Project URL and the anon public key into `config.js`.
4. Also set your shop name and Messenger username in `config.js` (the part after m.me/).

## 2. Vercel
Push this folder to GitHub, then Vercel > Add New Project > import it (no build settings needed).
Or run `npx vercel` inside the folder. Your site: `https://your-site.vercel.app`, admin at `/admin.html`.
Send the main link to buyers on Messenger.

## 3. Android APK
Needs Node.js and Android Studio.
```
npm init -y
npm i @capacitor/core @capacitor/cli @capacitor/android
```
Edit `capacitor.config.json`: replace the URL with your Vercel admin link. Then:
```
npx cap add android
npx cap sync
npx cap open android
```
In Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s). Install the APK on your phone.
The app loads your live site, so website updates show up without rebuilding the APK.

Tip: you can also open `/admin.html` in Chrome and use "Add to Home screen" as a quick test.
