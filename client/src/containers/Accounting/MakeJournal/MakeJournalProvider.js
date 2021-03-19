import React, { createContext, useState } from 'react';
import DashboardInsider from 'components/Dashboard/DashboardInsider';
import {
  useAccounts,
  useCustomers,
  useCurrencies,
  useJournal,
  useCreateJournal,
  useEditJournal,
  useSettings
} from 'hooks/query';

const MakeJournalFormContext = createContext();

/**
 * Make journal form provider.
 */
function MakeJournalProvider({ journalId, ...props }) {
  // Load the accounts list.
  const { data: accounts, isLoading: isAccountsLoading } = useAccounts();

  // Load the customers list.
  const {
    data: { customers },
    isLoading: isCustomersLoading,
  } = useCustomers();

  // Load the currencies list.
  const { data: currencies, isLoading: isCurrenciesLoading } = useCurrencies();

  // Load the details of the given manual journal.
  const { data: manualJournal, isLoading: isJournalLoading } = useJournal(
    journalId,
    {
      enabled: !!journalId,
    },
  );
  // Create and edit journal mutations.
  const { mutateAsync: createJournalMutate } = useCreateJournal();
  const { mutateAsync: editJournalMutate } = useEditJournal();

  // Loading the journal settings.
  const { isLoading: isSettingsLoading } = useSettings();

  // Submit form payload.
  const [submitPayload, setSubmitPayload] = useState({});

  const provider = {
    accounts,
    customers,
    currencies,
    manualJournal,

    createJournalMutate,
    editJournalMutate,

    isAccountsLoading,
    isCustomersLoading,
    isCurrenciesLoading,
    isJournalLoading,
    isSettingsLoading,

    isNewMode: !journalId,

    submitPayload,
    setSubmitPayload
  };

  return (
    <DashboardInsider
      loading={
        isJournalLoading ||
        isAccountsLoading ||
        isCurrenciesLoading ||
        isCustomersLoading || 
        isSettingsLoading
      }
      name={'make-journal-page'}
    >
      <MakeJournalFormContext.Provider value={provider} {...props} />
    </DashboardInsider>
  );
}

const useMakeJournalFormContext = () =>
  React.useContext(MakeJournalFormContext);

export { MakeJournalProvider, useMakeJournalFormContext };
