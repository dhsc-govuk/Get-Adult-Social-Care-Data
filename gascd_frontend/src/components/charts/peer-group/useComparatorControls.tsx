'use client';
import React, { useState } from 'react';
import AnalyticsService from '@/services/analytics/analyticsService';
import ComparatorGroupSelect from './ComparatorGroupSelect';
import ComparatorGroupBuilder from './ComparatorGroupBuilder';
import { useComparatorGroups } from './useComparatorGroups';
import { useAllLocalAuthorities } from './useAllLocalAuthorities';
import { NHS_PEER_GROUP_AVERAGE_LABEL } from './constants';
import { ComparatorSelection } from './types';

/**
 * The comparison group choice for a page: one selection shared by every
 * section, with a control (and its custom group builder) that can be shown in
 * any tab.
 */
export function useComparatorControls({
  laCode,
  metricPage,
  // Lays the control out as a row, so extra controls can sit beside it
  row = false,
}: {
  laCode: string | undefined;
  metricPage: string;
  row?: boolean;
}) {
  const {
    groups,
    selection,
    setSelection,
    saveGroup,
    updateGroup,
    deleteGroup,
  } = useComparatorGroups();
  // Which comparator control has its builder panel open, and whether it is
  // editing an existing group (by id) or creating a new one
  const [builderState, setBuilderState] = useState<{
    idPrefix: string;
    editingGroupId?: string;
  } | null>(null);
  const [builderError, setBuilderError] = useState<string | null>(null);
  const { authorities, error: authoritiesError } = useAllLocalAuthorities(
    builderState !== null
  );

  const selectedGroup =
    selection.kind === 'custom'
      ? groups.find((group) => group.id === selection.groupId)
      : undefined;
  const comparatorLabel = selectedGroup
    ? (selectedGroup.comparisonLabel ?? selectedGroup.name)
    : undefined;
  const comparatorAverageLabel = selectedGroup
    ? (selectedGroup.averageLabel ?? `${selectedGroup.name} (average)`)
    : NHS_PEER_GROUP_AVERAGE_LABEL;

  const handleComparatorChange = (newSelection: ComparatorSelection) => {
    setSelection(newSelection);
    setBuilderState(null);
    setBuilderError(null);
    AnalyticsService.trackComparatorChange(newSelection.kind, metricPage);
  };

  const handleGroupSave = async (group: {
    name: string;
    laCodes: string[];
  }) => {
    setBuilderError(null);
    try {
      if (builderState?.editingGroupId) {
        await updateGroup(builderState.editingGroupId, group);
        AnalyticsService.trackComparatorGroupEdit(group.laCodes.length);
      } else {
        await saveGroup(group);
        AnalyticsService.trackComparatorGroupSave(group.laCodes.length);
        AnalyticsService.trackComparatorChange('custom', metricPage);
      }
      setBuilderState(null);
    } catch (error) {
      // Keep the builder open so nothing the user entered is lost
      setBuilderError(
        error instanceof Error
          ? error.message
          : 'Your comparator group could not be saved. Try again.'
      );
    }
  };

  const handleGroupDelete = async () => {
    setBuilderError(null);
    try {
      if (builderState?.editingGroupId) {
        await deleteGroup(builderState.editingGroupId);
        AnalyticsService.trackComparatorGroupDelete();
      }
      setBuilderState(null);
    } catch (error) {
      setBuilderError(
        error instanceof Error
          ? error.message
          : 'The comparator group could not be deleted. Try again.'
      );
    }
  };

  const handleEditToggle = (idPrefix: string) => {
    if (selection.kind !== 'custom') return;
    setBuilderError(null);
    setBuilderState((current) =>
      current?.idPrefix === idPrefix && current.editingGroupId
        ? null
        : { idPrefix, editingGroupId: selection.groupId }
    );
  };

  const renderComparatorControl = (
    idPrefix: string,
    extraControl?: React.ReactNode
  ) => {
    const builderOpenHere = builderState?.idPrefix === idPrefix;
    const editingGroup = builderOpenHere
      ? groups.find((group) => group.id === builderState?.editingGroupId)
      : undefined;

    const select = (
      <ComparatorGroupSelect
        idPrefix={idPrefix}
        selection={selection}
        groups={groups}
        onChange={handleComparatorChange}
        onCreateNew={() => setBuilderState({ idPrefix })}
        onEdit={() => handleEditToggle(idPrefix)}
        builderMode={
          builderOpenHere ? (editingGroup ? 'edit' : 'create') : null
        }
      />
    );

    return (
      <>
        {row ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              columnGap: '1.5rem',
              alignItems: 'flex-start',
            }}
          >
            {select}
            {extraControl}
          </div>
        ) : (
          select
        )}
        {builderOpenHere && (
          <ComparatorGroupBuilder
            // Remount when switching between create and edit so the form
            // state is reinitialised from the right group
            key={editingGroup?.id ?? 'create'}
            idPrefix={idPrefix}
            allAuthorities={authorities}
            authoritiesError={authoritiesError}
            ownLaCode={laCode}
            existingNames={groups
              .filter((group) => group.id !== editingGroup?.id)
              .map((group) => group.name)}
            onSave={handleGroupSave}
            onCancel={() => {
              setBuilderState(null);
              setBuilderError(null);
            }}
            mode={editingGroup ? 'edit' : 'create'}
            initialName={editingGroup?.name}
            initialCodes={editingGroup?.laCodes}
            onDelete={editingGroup ? handleGroupDelete : undefined}
            serverError={builderError ?? undefined}
          />
        )}
      </>
    );
  };

  return {
    groups,
    selection,
    comparatorLabel,
    comparatorAverageLabel,
    renderComparatorControl,
  };
}

export type ComparatorControls = ReturnType<typeof useComparatorControls>;
