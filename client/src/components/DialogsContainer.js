import React from 'react';

import AccountFormDialog from 'containers/Dialogs/AccountFormDialog';
import InviteUserDialog from 'containers/Dialogs/InviteUserDialog';
import ItemCategoryDialog from 'containers/Dialogs/ItemCategoryDialog';
import CurrencyFormDialog from 'containers/Dialogs/CurrencyFormDialog';
import ExchangeRateFormDialog from 'containers/Dialogs/ExchangeRateFormDialog';
import JournalNumberDialog from 'containers/Dialogs/JournalNumberDialog';
import PaymentReceiveNumberDialog from 'containers/Dialogs/PaymentReceiveNumberDialog';
import EstimateNumberDialog from 'containers/Dialogs/EstimateNumberDialog';
import ReceiptNumberDialog from 'containers/Dialogs/ReceiptNumberDialog';
import InvoiceNumberDialog from 'containers/Dialogs/InvoiceNumberDialog';
import InventoryAdjustmentDialog from 'containers/Dialogs/InventoryAdjustmentFormDialog';
import PaymentViaVoucherDialog from 'containers/Dialogs/PaymentViaVoucherDialog';

/**
 * Dialogs container.
 */
export default function DialogsContainer() {
  return (
    <div>
      {/* <AccountFormDialog dialogName={'account-form'} /> */}
      <JournalNumberDialog dialogName={'journal-number-form'} />
      <PaymentReceiveNumberDialog dialogName={'payment-receive-number-form'} />
      <EstimateNumberDialog dialogName={'estimate-number-form'} />
      <ReceiptNumberDialog dialogName={'receipt-number-form'} />
      <InvoiceNumberDialog dialogName={'invoice-number-form'} />
      <CurrencyFormDialog dialogName={'currency-form'} />
      <InviteUserDialog dialogName={'invite-user'} />
      <ExchangeRateFormDialog dialogName={'exchangeRate-form'} />
      <ItemCategoryDialog dialogName={'item-category-form'} />
      <InventoryAdjustmentDialog dialogName={'inventory-adjustment'} />
      <PaymentViaVoucherDialog dialogName={'payment-via-voucher'} />
    </div>
  );
}
