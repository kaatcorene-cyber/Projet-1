import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Insert invocation of processDailyGains at the beginning of fetchData, or at least in useEffect
// In useEffect, we have `refreshUser(); ... fetchData();`
// We can just call processDailyGains() in useEffect before fetchData, but processDailyGains relies on `user` and `activeInvestments` length.
// Actually, processDailyGains fetches fresh investments. It relies on `user.id`.

let useE = `  useEffect(() => {
    refreshUser();

    // Apply cached data immediately if available
    if (investmentsCache) {
      const totalDaily = investmentsCache.reduce((acc, curr) => acc + Number(curr.daily_yield), 0);
      setDailyGain(totalDaily);
    }
    if (settingsCache) {
      applySettings(settingsCache);
    }

    if (user) {
      processDailyGains().then(() => fetchData());
    } else {
      fetchData();
    }

    // Setup polling for real-time like updates
    const intervalId = setInterval(() => {
      refreshUser();
      if (user) processDailyGains();
      fetchData();
    }, 15000);`; // Increase interval to limit DB load

let oldUseE = `  useEffect(() => {
    refreshUser();

    // Apply cached data immediately if available
    if (investmentsCache) {
      const totalDaily = investmentsCache.reduce((acc, curr) => acc + Number(curr.daily_yield), 0);
      setDailyGain(totalDaily);
    }
    if (settingsCache) {
      applySettings(settingsCache);
    }

    fetchData();

    // Setup polling for real-time like updates
    const intervalId = setInterval(() => {
      refreshUser();
      fetchData();
    }, 5000);`;

content = content.replace(oldUseE, useE);

fs.writeFileSync('src/pages/Dashboard.tsx', content);

