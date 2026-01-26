// Checkout page functionality
document.addEventListener('DOMContentLoaded', function() {
  let cartItems = [];
  let subtotal = 0;
  let shippingCharge = 50; // Default shipping charge
  let totalAmount = 0;
  
  // Get all necessary data
  const productsData = JSON.parse(document.getElementById('products-data').textContent);
  const ordersData = JSON.parse(document.getElementById('orders-data').textContent);
  const deliverySettingsData = JSON.parse(document.getElementById('delivery-settings-data').textContent);
  const upiDetails = JSON.parse(document.getElementById('upi-details').textContent);
  
  // Load cart from localStorage
  function loadCart() {
    try {
      const cart = localStorage.getItem('cart');
      if (cart) {
        cartItems = JSON.parse(cart);
        updateCartDisplay();
        checkFreeShipping();
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }
  
  // Update cart display
  function updateCartDisplay() {
    const cartContainer = document.getElementById('checkout-cart-container');
    const emptyCart = document.getElementById('checkout-empty-cart');
    
    if (cartItems.length === 0) {
      cartContainer.classList.add('hidden');
      emptyCart.classList.remove('hidden');
      return;
    }
    
    cartContainer.classList.remove('hidden');
    emptyCart.classList.add('hidden');
    
    // Clear existing items
    const cartItemsContainer = document.getElementById('checkout-cart-items');
    cartItemsContainer.innerHTML = '';
    
    // Calculate totals and populate cart
    subtotal = 0;
    
    cartItems.forEach((item) => {
      // Find the product
      const product = productsData.products.find(p => p.id === item.productId);
      if (!product) return;
      
      // Find the variant
      const variant = product.variants.find(v => v.id === item.variantId);
      if (!variant) return;
      
      // Add to subtotal
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      
      // Create cart item element
      const cartItemElement = document.createElement('div');
      cartItemElement.className = 'flex items-center space-x-4 py-3 border-b';
      cartItemElement.innerHTML = `
        <div class="w-16 h-16 flex-shrink-0">
          <img src="${item.productImage}" alt="${item.productName}" class="w-full h-full object-cover rounded-md">
        </div>
        
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-medium text-gray-900 truncate">${item.productName}</h3>
          <p class="text-xs text-gray-500">${item.color} / ${item.pattern} × ${item.quantity}</p>
          <p class="text-sm font-medium text-gray-900">₹${itemTotal}</p>
        </div>
      `;
      
      cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Calculate totals
    totalAmount = subtotal + shippingCharge;
    
    // Update totals
    document.getElementById('checkout-subtotal').textContent = `₹${subtotal}`;
    document.getElementById('checkout-shipping').textContent = shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`;
    document.getElementById('checkout-total').textContent = `₹${totalAmount}`;
  }
  
  // Check if eligible for free shipping
  function checkFreeShipping() {
    if (subtotal >= 1500) {
      shippingCharge = 0;
      totalAmount = subtotal;
      
      document.getElementById('checkout-shipping').textContent = 'FREE';
      document.getElementById('checkout-total').textContent = `₹${totalAmount}`;
      
      document.getElementById('free-shipping-notice').classList.remove('hidden');
      document.getElementById('shipping-charge-notice').classList.add('hidden');
    } else {
      shippingCharge = 50;
      totalAmount = subtotal + shippingCharge;
      
      document.getElementById('checkout-shipping').textContent = `₹${shippingCharge}`;
      document.getElementById('checkout-total').textContent = `₹${totalAmount}`;
      
      document.getElementById('free-shipping-notice').classList.add('hidden');
      document.getElementById('shipping-charge-notice').classList.remove('hidden');
    }
  }
  
  // Check delivery availability based on pincode
  function checkPincode() {
    const pincode = document.getElementById('pincode').value;
    
    if (!pincode || pincode.length !== 6) {
      document.getElementById('pincode-status').innerHTML = '';
      document.getElementById('pincode-status').className = '';
      return;
    }
    
    // Check if pincode is in any of the regions
    let available = false;
    let charge = 0;
    let days = 0;
    
    const pincodeNum = parseInt(pincode);
    
    for (const region of deliverySettingsData.regions) {
      if (!region.isEnabled) continue;
      
      const start = parseInt(region.pincodeStart);
      const end = parseInt(region.pincodeEnd);
      
      if (pincodeNum >= start && pincodeNum <= end) {
        available = true;
        charge = region.deliveryCharge;
        days = region.estimatedDays;
        break;
      }
    }
    
    const statusElement = document.getElementById('pincode-status');
    
    if (available) {
      shippingCharge = charge;
      totalAmount = subtotal + shippingCharge;
      
      document.getElementById('checkout-shipping').textContent = shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`;
      document.getElementById('checkout-total').textContent = `₹${totalAmount}`;
      
      statusElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="inline-block h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg> Delivery available in ${days} days`;
      statusElement.className = 'text-green-600 text-sm mt-1';
    } else {
      statusElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="inline-block h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg> Delivery not available to this pincode`;
      statusElement.className = 'text-red-600 text-sm mt-1';
    }
  }
  
  // Generate order number
  function generateOrderNumber() {
    return ordersData.nextOrderNumber;
  }
  
  // Place order
  function placeOrder(e) {
    e.preventDefault();
    
    // Get form values
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const customerEmail = document.getElementById('customer-email').value;
    const deliveryAddress = document.getElementById('delivery-address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const pincode = document.getElementById('pincode').value;
    const paymentMethod = 'upi'; // Currently only UPI is supported
    
    // Validate form
    if (!customerName || !customerPhone || !customerEmail || !deliveryAddress || !city || !state || !pincode) {
      alert('Please fill in all the required fields');
      return;
    }
    
    // Create order object
    const order = {
      orderNumber: generateOrderNumber(),
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      city,
      state,
      pincode,
      items: cartItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        color: item.color,
        pattern: item.pattern,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      subtotal,
      shippingCharge,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      paymentScreenshot: '',
      upiTransactionId: '',
      paidAt: null,
      orderStatus: 'pending',
      trackingCarrier: '',
      trackingNumber: '',
      trackingUrl: '',
      shippedAt: null,
      deliveredAt: null,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save order to localStorage (in a real app, this would be saved to a database)
    let orders = [];
    try {
      const ordersJson = localStorage.getItem('orders');
      if (ordersJson) {
        orders = JSON.parse(ordersJson);
      }
    } catch (e) {
      console.error('Error reading orders from localStorage:', e);
    }
    
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Update next order number (in a real app, this would be updated in database)
    localStorage.setItem('nextOrderNumber', (parseInt(ordersData.nextOrderNumber) + 1).toString());
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Update cart badge if it exists
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
      cartBadge.textContent = '0';
    }
    
    // Store order details for confirmation page
    sessionStorage.setItem('lastOrder', JSON.stringify(order));
    
    // Redirect to order confirmation page
    window.location.href = `/order/${order.orderNumber}`;
  }
  
  // Initialize event listeners
  document.getElementById('pincode').addEventListener('blur', checkPincode);
  document.getElementById('checkout-form').addEventListener('submit', placeOrder);
  
  // Generate and display UPI QR code
  const upiQrCodeElement = document.getElementById('upi-qr-code');
  if (upiQrCodeElement) {
    upiQrCodeElement.src = upiDetails.qrCode;
  }
  
  const upiVpaElement = document.getElementById('upi-vpa');
  if (upiVpaElement) {
    upiVpaElement.textContent = upiDetails.vpa;
  }
  
  // Load cart on page load
  loadCart();
});