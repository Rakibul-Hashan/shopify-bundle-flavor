document.addEventListener("DOMContentLoaded", function () {
    const variants = document.querySelectorAll(".dly-variant");
    const addToCartButton = document.querySelector(".dly-add-to-cart-btn");
    const addButtons = document.querySelectorAll(".dly-add-btn");
    let selectedVariant = null;
    let requiredAddOnCount = 0;
    let totalQuantityAdded = 0;

    // Function to update the "Add to Cart" button state
    function updateAddToCartButton() {
        if (totalQuantityAdded >= requiredAddOnCount) {
            addToCartButton.textContent = "ADD TO CART";
            addToCartButton.classList.remove("disabled");
            addToCartButton.classList.add("enabled");
            addToCartButton.disabled = false;
        } else {
            const remainingItems = requiredAddOnCount - totalQuantityAdded;
            addToCartButton.textContent = `SELECT ${remainingItems} MORE BAG${remainingItems > 1 ? 'S' : ''}`;
            addToCartButton.classList.add("disabled");
            addToCartButton.classList.remove("enabled");
            addToCartButton.disabled = true;
        }
    }

    // Handle variant selection
    variants.forEach((variant) => {
        variant.addEventListener("click", function () {
            // Remove 'selected' class from all variants
            variants.forEach((v) => v.classList.remove("selected"));
            // Add 'selected' class to the clicked variant
            variant.classList.add("selected");

            // Set the required add-on count based on selected variant
            selectedVariant = variant.getAttribute("data-variant");
            requiredAddOnCount = parseInt(selectedVariant); // 1 for 30 days, 2 for 60 days, etc.

            // Reset the total quantity added and update the button
            totalQuantityAdded = 0;
            updateAddToCartButton();
        });
    });

    // Handle "Add +" button for each product
    addButtons.forEach(button => {
        button.addEventListener("click", function () {
            // Hide the "Add +" button
            button.style.display = "none";

            // Show the quantity control section
            const quantityControl = button.nextElementSibling;
            quantityControl.style.display = "flex";

            // Set initial quantity to 1 when "Add +" is clicked
            const quantityNumber = quantityControl.querySelector(".dly-quantity-number");
            quantityNumber.textContent = "1";

            // Increase total quantity by 1 and update "Add to Cart" button state
            totalQuantityAdded += 1;
            updateAddToCartButton();
        });
    });

    // Handle quantity control for each product
    const quantityControls = document.querySelectorAll(".dly-quantity-control");

    quantityControls.forEach(control => {
        const minusButton = control.querySelector(".dly-quantity-btn:first-child");
        const plusButton = control.querySelector(".dly-quantity-btn:last-child");
        const quantityNumber = control.querySelector(".dly-quantity-number");
        const addButton = control.previousElementSibling; // Reference to the "Add +" button

        minusButton.addEventListener("click", function () {
            let quantity = parseInt(quantityNumber.textContent);
            if (quantity > 0) {
                quantity -= 1;
                quantityNumber.textContent = quantity;
                totalQuantityAdded -= 1; // Decrease the total quantity added
                updateAddToCartButton();
            }

            // If quantity is 0, hide the quantity control and show "Add +" button again
            if (quantity === 0) {
                control.style.display = "none";
                addButton.style.display = "inline-block";
            }
        });

        plusButton.addEventListener("click", function () {
            let quantity = parseInt(quantityNumber.textContent);
            quantity += 1;
            quantityNumber.textContent = quantity;
            totalQuantityAdded += 1; // Increase the total quantity added
            updateAddToCartButton();
        });
    });

    // Initial call to set the button state based on default values
    updateAddToCartButton();
});
