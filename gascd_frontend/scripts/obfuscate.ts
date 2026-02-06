/**
 * Redacts strings to just initials for names and email components.
 */
export function redactUserInfo(value: string): string {
  const trimmed = value.trim();

  // Handle Emails: john.doe@gmail.com -> j****@g****.c**
  if (trimmed.includes('@')) {
    const [local, domainPart] = trimmed.split('@');
    const domainDots = domainPart.split('.');

    const maskedLocal = `${local[0]}****`;
    const maskedDomain = domainDots.map((part) => `${part[0]}****`).join('.');

    return `${maskedLocal}@${maskedDomain}`;
  }

  // Handle Names: John Doe -> J. D.
  return trimmed
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => `${word[0].toUpperCase()}.`)
    .join(' ');
}
