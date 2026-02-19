import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebaseConfig';

const INVOICES_STORAGE_PATH = 'invoices';

export const InvoiceStorageService = {
  /**
   * Uploads an invoice PDF to Firebase Storage
   * @param invoiceId - The invoice ID
   * @param pdfBlob - The PDF blob to upload
   * @returns The download URL of the uploaded PDF
   */
  uploadInvoicePDF: async (invoiceId: string, pdfBlob: Blob): Promise<string> => {
    try {
      const storageRef = ref(storage, `${INVOICES_STORAGE_PATH}/${invoiceId}.pdf`);
      await uploadBytes(storageRef, pdfBlob, {
        contentType: 'application/pdf',
      });
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Error uploading invoice PDF:', err);
      throw new Error(err.message || 'Failed to upload invoice PDF');
    }
  },

  /**
   * Deletes an invoice PDF from Firebase Storage
   * @param invoiceId - The invoice ID
   */
  deleteInvoicePDF: async (invoiceId: string): Promise<void> => {
    try {
      const storageRef = ref(storage, `${INVOICES_STORAGE_PATH}/${invoiceId}.pdf`);
      await deleteObject(storageRef);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Error deleting invoice PDF:', err);
      throw new Error(err.message || 'Failed to delete invoice PDF');
    }
  },
};
