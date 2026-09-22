import fs from 'fs';

// Dashboard
let dashboard = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
dashboard = dashboard.replace(
  /const getVipLevel = \(investments\?: any\[\]\) => \{[\s\S]*?return 'VIP0';\n  \};/g,
  `const getVipLevel = (user: any) => {
    if (user?.role && user.role.startsWith('vip')) {
       return user.role.toUpperCase();
    }
    const investments = user?.investments;
    if (!investments || investments.length === 0) return 'VIP0';
    const maxInvest = Math.max(...investments.map((i: any) => Number(i.plan_amount) || 0));
    if (maxInvest >= 500000) return 'VIP5';
    if (maxInvest >= 200000) return 'VIP4';
    if (maxInvest >= 90000) return 'VIP3';
    if (maxInvest >= 40000) return 'VIP2';
    if (maxInvest >= 5000) return 'VIP1';
    return 'VIP0';
  };`
);

dashboard = dashboard.replace(/getVipLevel\(user\?\.investments\)/g, "getVipLevel(user)");
fs.writeFileSync('src/pages/Dashboard.tsx', dashboard);

// Admin
let admin = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
admin = admin.replace(
  /const getVipLevelForAdmin = \(investments\?: any\[\]\) => \{[\s\S]*?return 'VIP0';\n  \};/,
  `const getVipLevelForAdmin = (u: any) => {
    if (u?.role && u.role.startsWith('vip')) {
       return u.role.toUpperCase();
    }
    const investments = u?.investments;
    if (!investments || investments.length === 0) return 'VIP0';
    const maxInvest = Math.max(...investments.map((i: any) => Number(i.plan_amount) || 0));
    if (maxInvest >= 500000) return 'VIP5';
    if (maxInvest >= 200000) return 'VIP4';
    if (maxInvest >= 90000) return 'VIP3';
    if (maxInvest >= 40000) return 'VIP2';
    if (maxInvest >= 5000) return 'VIP1';
    return 'VIP0';
  };`
);

admin = admin.replace(/getVipLevelForAdmin\(u\.investments\)/g, "getVipLevelForAdmin(u)");
fs.writeFileSync('src/pages/Admin.tsx', admin);

console.log('Fixed VIP logic to respect role');
