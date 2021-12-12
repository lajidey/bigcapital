import React from 'react';
import moment from 'moment';
import { Intent } from '@blueprintjs/core';
import { Formik } from 'formik';
import intl from 'react-intl-universal';

import '../../../style/pages/TransactionsLocking/TransactionsLockingDialog.scss';

import { AppToaster } from 'components';
import { CreateLockingTransactionsFormSchema } from './LockingTransactionsForm.schema';

import { useLockingTransactionsContext } from './LockingTransactionsFormProvider';
import LockingTransactionsFormContent from './LockingTransactionsFormContent';

import withDialogActions from 'containers/Dialog/withDialogActions';
import { compose } from 'utils';

const defaultInitialValues = {
  module: 'all',
  lock_to_date: moment(new Date()).format('YYYY-MM-DD'),
  reason: '',
};

/**
 * Locking Transactions Form.
 */
function LockingTransactionsForm({
  // #withDialogActions
  closeDialog,
}) {
  const { dialogName, createLockingTransactionMutate } =
    useLockingTransactionsContext();

  // Initial form values.
  const initialValues = {
    ...defaultInitialValues,
  };

  // Handles the form submit.
  const handleFormSubmit = (values, { setSubmitting, setErrors }) => {
    setSubmitting(true);

    // Handle request response success.
    const onSuccess = (response) => {
      AppToaster.show({
        message: intl.get('locking_transactions.dialog.success_message'),
        intent: Intent.SUCCESS,
      });
      closeDialog(dialogName);
    };

    // Handle request response errors.
    const onError = ({
      response: {
        data: { errors },
      },
    }) => {
      setSubmitting(false);
    };

    createLockingTransactionMutate(values).then(onSuccess).catch(onError);
  };

  return (
    <Formik
      validationSchema={CreateLockingTransactionsFormSchema}
      initialValues={initialValues}
      onSubmit={handleFormSubmit}
      component={LockingTransactionsFormContent}
    />
  );
}
export default compose(withDialogActions)(LockingTransactionsForm);
