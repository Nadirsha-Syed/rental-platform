/**
 * Asynchronously injects the script into the document body
 * to prevent loading delays on core application paths.
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Main Service Handler to execute the secure three-way checkout handshake.
 * @param {number} amount - The rental transaction item cost (in INR)
 * @param {string} rentalName - Title of the product item being rented
 * @param {Object} userDetails - Metadata for billing pre-fills
 * @param {Function} onSuccessCallback - State updates execution block upon verified payment
 */
export const executeRentalPayment = async (amount, rentalName, userDetails = {}, onSuccessCallback) => {
  try {
    // 1. Initialize script validation
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("Failed to connect to the payment gateway module. Please check your internet connection.");
      return;
    }

    // 2. Fetch secure Order ID ledger instance from Render backend server
    const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    if (!orderResponse.ok) {
      throw new Error("Backend order initialization pipeline rejected.");
    }
    
    const order = await orderResponse.json();

    // 3. Configure layout interface configurations
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "RentalHub",
      description: `Booking reservation for ${rentalName}`,
      order_id: order.id,
      
      handler: async function (response) {
        try {
          // 4. Dispatch cryptographic validation check to backend
          const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id, // Safely maps order id context
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: userDetails.bookingId, // Link verified payment callback context to Booking ID
            }),
          });

          const verificationResult = await verifyResponse.json();

          if (verifyResponse.ok && verificationResult.success) {
            alert("Payment processed and verified successfully!");
            if (onSuccessCallback) {
              onSuccessCallback(verificationResult);
            }
          } else {
            alert(`Verification failed: ${verificationResult.message || "Invalid signature structure."}`);
          }
        } catch (verifyError) {
          console.error("Cryptographic verification route failure:", verifyError);
          alert("Server validation error encountered post-checkout.");
        }
      },
      prefill: {
        name: userDetails.name || "Nadirsha Syed",
        email: userDetails.email || "nadirshasyed835@gmail.com",
        contact: userDetails.phone || "917780000000",
      },
      theme: {
        color: "#2563eb", // Primary blue workspace branding layout
      },
      modal: {
        ondismiss: function () {
          console.log("Checkout transaction sequence abandoned by user.");
        }
      }
    };

    // 5. Open checkout panel
    const razorpayModalInstance = new window.Razorpay(options);
    razorpayModalInstance.open();

  } catch (error) {
    console.error("Razorpay workflow pipeline crashed:", error);
    alert("Unable to initialize checkout process at this time.");
  }
};