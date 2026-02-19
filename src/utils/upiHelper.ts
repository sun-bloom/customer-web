/**
 * UPI Helper utility for generating deep links
 */

interface UPIDetails {
    vpa: string;
    name: string;
    amount?: string;
    transactionId?: string;
    note?: string;
}

/**
 * Generates a UPI deep link for mobile apps
 * Format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&tr=TRANSACTION_ID&tn=NOTE&cu=INR
 */
export function generateUPILink({ vpa, name, amount, transactionId, note }: UPIDetails): string {
    const params = new URLSearchParams({
        pa: vpa,
        pn: name,
        cu: 'INR'
    });

    if (amount) params.append('am', amount);
    if (transactionId) params.append('tr', transactionId);
    if (note) params.append('tn', note);

    return `upi://pay?${params.toString()}`;
}

/**
 * Generates a Google Pay specific link
 */
export function generateGPayLink(details: UPIDetails): string {
    // GPay usually handles standard UPI links well, but sometimes needs specific intent
    return generateUPILink(details);
}

/**
 * Generates a WhatsApp message link for order confirmation
 */
export function generateWhatsAppLink(phoneNumber: string, message: string): string {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
