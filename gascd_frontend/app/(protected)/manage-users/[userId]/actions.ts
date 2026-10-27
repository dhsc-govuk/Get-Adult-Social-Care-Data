'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/permissions';
import {
  getChangeableUser,
  removeManagedUser,
  restoreManagedUser,
  updateManagedUser,
} from '@/lib/manageUsersServer';
import { validateInviteLocations, validateInviteName } from '@/lib/manageUsers';
import logger from '@/utils/logger';

export type EditFields = { name: string; locations: string[] };
export type EditResult = {
  errors: Partial<Record<keyof EditFields, string>>;
  error?: string;
};

const NO_PERMISSION = 'You do not have permission to change this user';
const SERVICE_ERROR =
  'Sorry, there is a problem with the service. Please try again later.';

const load = async (userId: string) => {
  const actor = await getCurrentUser();
  const changeable = actor
    ? await getChangeableUser(actor, String(userId))
    : null;
  return actor && changeable ? { actor, ...changeable } : null;
};

export async function updateUser(
  userId: string,
  fields: EditFields
): Promise<EditResult> {
  const loaded = await load(userId);
  if (!loaded || loaded.user.status === 'Removed') {
    return { errors: {}, error: NO_PERMISSION };
  }
  const input = {
    name: String(fields?.name ?? ''),
    locations: Array.isArray(fields?.locations)
      ? fields.locations.map(String)
      : [],
  };
  const errors = Object.fromEntries(
    Object.entries({
      name: validateInviteName(input.name),
      locations: validateInviteLocations(input.locations, loaded.context),
    }).filter(([, message]) => message)
  );
  if (Object.keys(errors).length > 0) return { errors };

  try {
    await updateManagedUser(
      { actor: loaded.actor, context: loaded.context, userId },
      input
    );
  } catch (error) {
    logger.error('Could not update user', {
      userid: loaded.actor.id,
      targetUserId: userId,
      error: (error as Error).message,
    });
    return { errors: {}, error: SERVICE_ERROR };
  }
  redirect(`/manage-users?done=updated&user=${userId}`);
}

const changeStatus = async (
  userId: string,
  allowed: (status: string) => boolean,
  change: typeof removeManagedUser,
  done: string
): Promise<{ error?: string }> => {
  const loaded = await load(userId);
  if (!loaded || !allowed(loaded.user.status)) return { error: NO_PERMISSION };
  try {
    await change({ actor: loaded.actor, context: loaded.context, userId });
  } catch (error) {
    logger.error(`Could not ${done} user`, {
      userid: loaded.actor.id,
      targetUserId: userId,
      error: (error as Error).message,
    });
    return { error: SERVICE_ERROR };
  }
  redirect(`/manage-users?done=${done}&user=${userId}`);
};

export async function removeUser(userId: string) {
  return changeStatus(
    userId,
    (status) => status !== 'Removed',
    removeManagedUser,
    'removed'
  );
}

export async function restoreUser(userId: string) {
  return changeStatus(
    userId,
    (status) => status === 'Removed',
    restoreManagedUser,
    'restored'
  );
}
