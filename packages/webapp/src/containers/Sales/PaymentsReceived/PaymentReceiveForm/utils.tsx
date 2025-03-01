// @ts-nocheck
import React from 'react';
import moment from 'moment';
import intl from 'react-intl-universal';
import { omit, pick, first, sumBy } from 'lodash';
import { useFormikContext } from 'formik';
import { Intent } from '@blueprintjs/core';
import { AppToaster } from '@/components';
import { usePaymentReceiveFormContext } from './PaymentReceiveFormProvider';
import {
  defaultFastFieldShouldUpdate,
  transformToForm,
  safeSumBy,
  orderingLinesIndexes,
  formattedAmount,
} from '@/utils';
import { useCurrentOrganization } from '@/hooks/state';
import {
  transformAttachmentsToForm,
  transformAttachmentsToRequest,
} from '@/containers/Attachments/utils';

// Default payment receive entry.
export const defaultPaymentReceiveEntry = {
  index: '',
  payment_amount: '',
  invoice_id: '',
  invoice_no: '',
  due_amount: '',
  date: '',
  amount: '',
  currency_code: '',
};

// Form initial values.
export const defaultPaymentReceive = {
  customer_id: '',
  deposit_account_id: '',
  payment_date: moment(new Date()).format('YYYY-MM-DD'),
  reference_no: '',
  payment_receive_no: '',
  // Holds the payment number that entered manually only.
  payment_receive_no_manually: '',
  statement: '',
  amount: '',
  currency_code: '',
  branch_id: '',
  exchange_rate: 1,
  entries: [],
  attachments: [],
};

export const defaultRequestPaymentEntry = {
  index: '',
  payment_amount: '',
  invoice_id: '',
};

export const defaultRequestPayment = {
  customer_id: '',
  deposit_account_id: '',
  payment_date: '',
  payment_receive_no: '',
  branch_id: '',
  statement: '',
  entries: [],
};

/**
 * Transformes the edit payment receive to initial values of the form.
 */
export const transformToEditForm = (paymentReceive, paymentReceiveEntries) => ({
  ...transformToForm(paymentReceive, defaultPaymentReceive),
  entries: [
    ...paymentReceiveEntries.map((paymentReceiveEntry) => ({
      ...transformToForm(paymentReceiveEntry, defaultPaymentReceiveEntry),
      payment_amount: paymentReceiveEntry.payment_amount || '',
    })),
  ],
  attachments: transformAttachmentsToForm(paymentReceive),
});

/**
 * Transformes the given invoices to the new page receivable entries.
 */
export const transformInvoicesNewPageEntries = (invoices) => [
  ...invoices.map((invoice, index) => ({
    index: index + 1,
    invoice_id: invoice.id,
    entry_type: 'invoice',
    due_amount: invoice.due_amount,
    date: invoice.invoice_date,
    amount: invoice.balance,
    currency_code: invoice.currency_code,
    payment_amount: '',
    invoice_no: invoice.invoice_no,
    branch_id: invoice.branch_id,
    total_payment_amount: invoice.payment_amount,
  })),
];

export const transformEntriesToEditForm = (receivableEntries) => [
  ...transformInvoicesNewPageEntries([...(receivableEntries || [])]),
];

export const clearAllPaymentEntries = (entries) => [
  ...entries.map((entry) => ({ ...entry, payment_amount: 0 })),
];

export const amountPaymentEntries = (amount, entries) => {
  let total = amount;

  return entries.map((item) => {
    const diff = Math.min(item.due_amount, total);
    total -= Math.max(diff, 0);

    return {
      ...item,
      payment_amount: diff,
    };
  });
};

export const fullAmountPaymentEntries = (entries) => {
  return entries.map((item) => ({
    ...item,
    payment_amount: item.due_amount,
  }));
};

/**
 * Detarmines the customers fast-field should update.
 */
export const customersFieldShouldUpdate = (newProps, oldProps) => {
  return (
    newProps.shouldUpdateDeps.items !== oldProps.shouldUpdateDeps.items ||
    defaultFastFieldShouldUpdate(newProps, oldProps)
  );
};

/**
 * Detarmines the accounts fast-field should update.
 */
export const accountsFieldShouldUpdate = (newProps, oldProps) => {
  return (
    newProps.items !== oldProps.items ||
    defaultFastFieldShouldUpdate(newProps, oldProps)
  );
};

/**
 * Tranformes form values to request.
 */
export const transformFormToRequest = (form) => {
  // Filters entries that have no `invoice_id` and `payment_amount`.
  const entries = form.entries
    .filter((entry) => entry.invoice_id && entry.payment_amount)
    .map((entry) => ({
      ...pick(entry, Object.keys(defaultRequestPaymentEntry)),
    }));

  const attachments = transformAttachmentsToRequest(form);

  return {
    ...omit(form, ['payment_receive_no_manually', 'payment_receive_no']),
    // The `payment_receive_no_manually` will be presented just if the auto-increment
    // is disable, always both attributes hold the same value in manual mode.
    ...(form.payment_receive_no_manually && {
      payment_receive_no: form.payment_receive_no,
    }),
    entries: orderingLinesIndexes(entries),
    attachments,
  };
};

export const useSetPrimaryBranchToForm = () => {
  const { setFieldValue } = useFormikContext();
  const { branches, isBranchesSuccess } = usePaymentReceiveFormContext();

  React.useEffect(() => {
    if (isBranchesSuccess) {
      const primaryBranch = branches.find((b) => b.primary) || first(branches);

      if (primaryBranch) {
        setFieldValue('branch_id', primaryBranch.id);
      }
    }
  }, [isBranchesSuccess, setFieldValue, branches]);
};

/**
 * Transformes the response errors types.
 */
export const transformErrors = (errors, { setFieldError }) => {
  const getError = (errorType) => errors.find((e) => e.type === errorType);

  if (getError('PAYMENT_RECEIVE_NO_EXISTS')) {
    setFieldError(
      'payment_receive_no',
      intl.get('payment_number_is_not_unique'),
    );
  }
  if (getError('PAYMENT_RECEIVE_NO_REQUIRED')) {
    setFieldError(
      'payment_receive_no',
      intl.get('payment_received.field.error.payment_receive_no_required'),
    );
  }
  if (getError('PAYMENT_ACCOUNT_CURRENCY_INVALID')) {
    AppToaster.show({
      message: intl.get(
        'payment_Receive.error.payment_account_currency_invalid',
      ),
      intent: Intent.DANGER,
    });
  }
};

/**
 * Retreives the payment receive totals.
 */
export const usePaymentReceiveTotals = () => {
  const {
    values: { entries, currency_code: currencyCode },
  } = useFormikContext();

  // Retrieves the invoice entries total.
  const total = React.useMemo(
    () => sumBy(entries, 'payment_amount'),
    [entries],
  );

  // Retrieves the formatted total money.
  const formattedTotal = React.useMemo(
    () => formattedAmount(total, currencyCode),
    [total, currencyCode],
  );
  // Retrieves the formatted subtotal.
  const formattedSubtotal = React.useMemo(
    () => formattedAmount(total, currencyCode, { money: false }),
    [total, currencyCode],
  );

  return {
    total,
    formattedTotal,
    formattedSubtotal,
  };
};

export const usePaymentReceivedTotalAppliedAmount = () => {
  const {
    values: { entries },
  } = useFormikContext();

  // Retrieves the invoice entries total.
  return React.useMemo(() => sumBy(entries, 'payment_amount'), [entries]);
};

export const usePaymentReceivedTotalAmount = () => {
  const {
    values: { amount },
  } = useFormikContext();

  return amount;
};

export const usePaymentReceivedTotalExceededAmount = () => {
  const totalAmount = usePaymentReceivedTotalAmount();
  const totalApplied = usePaymentReceivedTotalAppliedAmount();

  return Math.abs(totalAmount - totalApplied);
};

/**
 * Detarmines whether the payment has foreign customer.
 * @returns {boolean}
 */
export const useEstimateIsForeignCustomer = () => {
  const { values } = useFormikContext();
  const currentOrganization = useCurrentOrganization();

  const isForeignCustomer = React.useMemo(
    () => values.currency_code !== currentOrganization.base_currency,
    [values.currency_code, currentOrganization.base_currency],
  );
  return isForeignCustomer;
};

export const resetFormState = ({ initialValues, values, resetForm }) => {
  resetForm({
    values: {
      // Reset the all values except the brand id.
      ...initialValues,
      brand_id: values.brand_id,
    },
  });
};

export const getExceededAmountFromValues = (values) => {
  const totalApplied = sumBy(values.entries, 'payment_amount');
  const totalAmount = values.amount;

  return totalAmount - totalApplied;
};
