export function validateActivationBudget(value) {
  const keys=['targetMin','targetMax','warnAbove','justifyAbove'];
  if(!keys.every(key=>Number.isInteger(value?.[key])&&value[key]>=0)) throw new Error('Invalid activation budget');
  if(!(value.targetMin<=value.targetMax&&value.targetMax<=value.warnAbove&&value.warnAbove<value.justifyAbove)) {
    throw new Error('Invalid activation budget ordering');
  }
  return value;
}
