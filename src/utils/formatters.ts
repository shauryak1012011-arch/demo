export function formatDate(isoStr?: string): string {
  if (!isoStr) return '--';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' IST';
  } catch {
    return isoStr;
  }
}

export function formatTimeOnly(isoStr?: string): string {
  if (!isoStr) return '--';
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return isoStr;
  }
}

export function getSeverityColor(sev: string): { bg: string; text: string; border: string; dot: string } {
  switch (sev?.toLowerCase()) {
    case 'red':
    case 'critical':
      return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500' };
    case 'orange':
    case 'elevated':
      return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-500' };
    case 'yellow':
    case 'warning':
    case 'moderate':
      return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-500' };
    case 'green':
    case 'normal':
    case 'low':
    default:
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500' };
  }
}

export function getHazardIconName(cat: string): string {
  switch (cat?.toLowerCase()) {
    case 'flood':
      return 'Waves';
    case 'earthquake':
    case 'vibration':
      return 'Activity';
    case 'landslide':
      return 'Mountain';
    case 'wildfire':
    case 'wildfire_smoke':
      return 'Flame';
    case 'severe_weather':
    case 'cyclone':
      return 'CloudLightning';
    case 'drought':
    case 'heatwave':
      return 'Sun';
    case 'tsunami':
      return 'LifeBuoy';
    default:
      return 'AlertTriangle';
  }
}
