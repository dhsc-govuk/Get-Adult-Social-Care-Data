// Shared validation for custom comparator groups, used by both the builder
// UI (client) and the comparator_groups API routes (server). The server-side
// checks are authoritative - never trust the client.

export const GROUP_NAME_MAX_LENGTH = 60;
export const MAX_GROUPS_PER_USER = 50;

// Letters, digits, spaces and basic punctuation only - part of the
// defence-in-depth against injection via the group name. The allowlist
// inherently rejects control characters.
export const GROUP_NAME_PATTERN = /^[a-zA-Z0-9 \-'&(),]+$/;

export const validateGroupName = (
  name: string,
  existingNames: string[]
): string | undefined => {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Enter a name for this comparator group';
  }
  if (trimmed.length > GROUP_NAME_MAX_LENGTH) {
    return `The group name must be ${GROUP_NAME_MAX_LENGTH} characters or fewer`;
  }
  if (!GROUP_NAME_PATTERN.test(trimmed)) {
    return 'The group name must only include letters, numbers, spaces and basic punctuation';
  }
  if (
    existingNames.some(
      (existing) => existing.trim().toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    return 'A comparator group with this name already exists';
  }
  return undefined;
};
