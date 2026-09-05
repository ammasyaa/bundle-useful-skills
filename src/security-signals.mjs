const aliases=new Map();

function category(name,values) {
  for(const value of values) aliases.set(normalize(value),name);
}

category('authentication',['auth','authentication','login','oauth','openid-connect','oidc','sso','mfa','passkey','passkeys','biometric','biometrics','password','passwords','account-recovery','session','sessions']);
category('authorization',['authorization','permission','permissions','database-permissions','rbac','access-control','admin','privilege','privileges']);
category('secrets',['secret','secrets','token','tokens','api-key','api-keys','signing-key','signing-keys','certificate','certificates','credential','credentials']);
category('payments',['payment','payments','billing','checkout','refund','refunds','payout','payouts']);
category('personal-data',['pii','location','identity','health','biometric-data']);
category('uploads-events',['upload','uploads','webhook','webhooks','callback','callbacks','untrusted-files']);
category('data-protection',['row-level-security','rls','access-policy','access-policies','data-protection','destructive-data']);

const patterns=[
  ['authentication',/\b(oauth|openid(?:\s+connect)?|oidc|sso|mfa|passkeys?|biometric\s+(?:sign[ -]?in|login)|sign[ -]?in|log[ -]?in|account\s+recovery|passwords?|session\s+cookies?|user\s+credentials?)\b/i],
  ['authorization',/\b(rbac|role[- ]based\s+access|authori[sz]ation|access\s+controls?|database\s+permissions?|permission\s+(?:checks?|model|system)|admin\s+(?:access|account|role|permissions?|actions?|endpoint))\b/i],
  ['secrets',/\b(api\s+keys?|signing\s+keys?|client\s+secrets?|secret\s+(?:storage|rotation|value)|(?:access|auth|bearer|refresh)\s+tokens?|rotate\s+(?:keys?|tokens?|credentials?)|store\s+(?:keys?|tokens?|credentials?))\b/i],
  ['payments',/\b(payments?|billing|checkout|refunds?|payouts?)\b/i],
  ['personal-data',/\b(pii|personally\s+identifiable|identity\s+(?:data|verification)|health\s+(?:data|records?)|biometric\s+(?:data|records?)|(?:user|gps|geo)\s+location|geolocation|location\s+(?:data|permission|tracking))\b/i],
  ['uploads-events',/\b(file\s+uploads?|user[- ]supplied\s+files?|webhooks?|external\s+callbacks?)\b/i],
  ['data-protection',/\b(row[- ]level\s+security|\brls\b|database\s+(?:access|permissions?|policies)|access\s+policies|destructive\s+(?:data|migration)|data\s+protection)\b/i]
];

export function classifySecuritySignals({risks=[],description='',task}={}) {
  const categories=new Set();
  for(const risk of risks) {
    const categoryName=aliases.get(normalize(risk));
    if(!categoryName) throw new Error(`Unknown risk category: ${risk}`);
    categories.add(categoryName);
  }
  if(task==='security') categories.add('security-review');
  for(const [name,pattern] of patterns) if(pattern.test(description)) categories.add(name);
  return {sensitive:categories.size>0,categories:[...categories].sort()};
}

function normalize(value) {
  return String(value).trim().toLowerCase().replace(/[_\s]+/g,'-').replace(/-+/g,'-');
}
