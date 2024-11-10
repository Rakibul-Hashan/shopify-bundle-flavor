document.addEventListener("DOMContentLoaded", function () {
    const variants = document.querySelectorAll(".dly-variant");
    const addToCartButton = document.querySelector(".dly-add-to-cart-btn");
    const addButtons = document.querySelectorAll(".dly-add-btn");
    const subtotalDisplay = document.querySelector(".dly-cart-subtotal");
    const savingDisplay = document.querySelector(".dly-cart-saving");

    let requiredAddOnCount = 0;
    let totalQuantityAdded = 0;
    let selectedProducts = [];
    const currencySymbol = "₱"; // Assuming PHP currency; adjust if needed

    // Update Add to Cart button text and state
    const updateAddToCartButton = () => {
        const remainingItems = requiredAddOnCount - totalQuantityAdded;
        addToCartButton.textContent = remainingItems <= 0 
            ? "ADD TO CART" 
            : `SELECT ${remainingItems} MORE BAG${remainingItems > 1 ? "S" : ""}`;
        
        addToCartButton.classList.toggle("disabled", remainingItems > 0);
        addToCartButton.classList.toggle("enabled", remainingItems <= 0);
        addToCartButton.disabled = remainingItems > 0;
    };

    // Update subtotal and savings based on selected products
    const updateCartSummary = () => {
        let subtotal = 0;
        let totalSaving = 0;

        selectedProducts.forEach(({ price, customDiscount, quantity }) => {
            const discountAmount = (price * customDiscount) / 100; // Calculate discount
            subtotal += (price - discountAmount) * quantity; // Apply discount to subtotal
            totalSaving += discountAmount * quantity; // Accumulate total savings
        });

        // Display subtotal and savings
        subtotalDisplay.textContent = `${currencySymbol} ${subtotal.toFixed(2)}`;
        savingDisplay.textContent = `${currencySymbol} ${totalSaving.toFixed(2)}`;
    };

    // Set initial variant and minimum required selection
    const setInitialVariant = () => {
        const firstVariant = variants[0];
        if (firstVariant) {
            firstVariant.classList.add("selected");
            requiredAddOnCount = parseInt(firstVariant.getAttribute("data-item-id"), 10);
            updateAddToCartButton();
            updateCartSummary();
        }
    };

    // Handle variant selection click
    variants.forEach(variant => {
        variant.addEventListener("click", function () {
            // Clear all previous selections
            variants.forEach(v => v.classList.remove("selected"));
            variant.classList.add("selected");

            requiredAddOnCount = parseInt(variant.getAttribute("data-item-id"), 10);

            // Reset total quantity and selected products
            totalQuantityAdded = 0;
            selectedProducts = [];
            updateAddToCartButton();
            updateCartSummary();

            // Reset all quantity controls and show "Add +" button
            document.querySelectorAll(".dly-quantity-control").forEach(control => {
                control.style.display = "none";
                control.previousElementSibling.style.display = "inline-block";
                control.querySelector(".dly-quantity-number").textContent = "1";
            });
        });
    });

    // Handle "Add +" button click to add product to selection
    addButtons.forEach(button => {
        button.addEventListener("click", function () {
            const parentItem = button.closest(".dly-item");
            const variantId = parentItem.getAttribute("data-item-variant-id");
            const price = parseFloat(parentItem.getAttribute("data-item-price"));
            const selectedVariant = document.querySelector(".dly-variant.selected");
            const customDiscount = selectedVariant ? parseInt(selectedVariant.getAttribute("data-custom-discount")) || 0 : 0;

            if (isNaN(price)) return;

            const quantityControl = button.nextElementSibling;
            const quantityNumber = quantityControl.querySelector(".dly-quantity-number");

            button.style.display = "none";
            quantityControl.style.display = "flex";
            quantityNumber.textContent = "1";

            // Add product to selectedProducts array if it doesn't already exist
            const existingProduct = selectedProducts.find(item => item.id === variantId);
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                selectedProducts.push({ id: variantId, price, customDiscount, quantity: 1 });
            }

            totalQuantityAdded += 1;
            updateAddToCartButton();
            updateCartSummary();
        });
    });

    // Handle quantity adjustments for each product
    document.querySelectorAll(".dly-quantity-control").forEach(control => {
        const minusButton = control.querySelector(".dly-quantity-btn:first-child");
        const plusButton = control.querySelector(".dly-quantity-btn:last-child");
        const quantityNumber = control.querySelector(".dly-quantity-number");

        minusButton.addEventListener("click", function () {
            let quantity = parseInt(quantityNumber.textContent);
            if (quantity > 1) {
                quantity -= 1;
                quantityNumber.textContent = quantity;
                totalQuantityAdded -= 1;

                const variantId = control.closest(".dly-item").getAttribute("data-item-variant-id");
                const product = selectedProducts.find(item => item.id === variantId);
                if (product) product.quantity = quantity;

                updateAddToCartButton();
                updateCartSummary();
            } else if (quantity === 1) {
                // Hide quantity controls, show "Add +" button, and remove product
                control.style.display = "none";
                control.previousElementSibling.style.display = "inline-block";
                quantityNumber.textContent = "1";

                const variantId = control.closest(".dly-item").getAttribute("data-item-variant-id");
                selectedProducts = selectedProducts.filter(item => item.id !== variantId);
                totalQuantityAdded -= 1;

                updateAddToCartButton();
                updateCartSummary();
            }
        });

        plusButton.addEventListener("click", function () {
            let quantity = parseInt(quantityNumber.textContent);
            quantity += 1;
            quantityNumber.textContent = quantity;
            totalQuantityAdded += 1;

            const variantId = control.closest(".dly-item").getAttribute("data-item-variant-id");
            const product = selectedProducts.find(item => item.id === variantId);
            if (product) product.quantity = quantity;

            updateAddToCartButton();
            updateCartSummary();
        });
    });

    // Add selected products to cart on Add to Cart button click
    addToCartButton.addEventListener("click", function () {
        if (totalQuantityAdded >= requiredAddOnCount) {
            const items = selectedProducts.map(product => ({
                id: product.id,
                quantity: product.quantity
            }));

            fetch('/cart/add.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to add products to cart');
                return response.json();
            })
            .then(data => {
                console.log("Products added to cart:", data);
                window.location.href = '/cart'; // Redirect to cart page
            })
            .catch(error => console.error("Error:", error));
        }
    });

    setInitialVariant();
});
