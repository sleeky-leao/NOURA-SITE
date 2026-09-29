//search input code....when the product is typed in the search it filters the products searched for.
const searchInput = document.querySelector("#search-input");
const products = document.querySelectorAll(".product");

searchInput.addEventListener("input", inputTyped);

//this function checks whether the value it is typed in the input matches the product the display only the product typed..else it doesnt display if the value doesnt match.
function inputTyped(){
    const searchValue = searchInput.value.toLowerCase();

    products.forEach(function(product){
        const productName = product.dataset.name.toLowerCase();

        if(productName.includes(searchValue)){
            product.style.display = "";
        }else{
            product.style.display = "none"
        }
    })

}



const cartBtn = document.querySelector("#cart-btn");
const cartPanel = document.querySelector("#cart-panel");
const closeCart = document.querySelector("#close-cart");

cartBtn.addEventListener("click", function () {
    cartPanel.classList.add("active");
});

closeCart.addEventListener("click", function () {
    cartPanel.classList.remove("active");
});

let cart = JSON.parse(localStorage.getItem("nouraCart")) || [];

const addCartButtons = document.querySelectorAll(".add-cart");
addCartButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const product = button.closest(".product");

        const name = product.dataset.name;
        const price = Number(product.dataset.price);

        const existingProduct = cart.find(function (item) {
            return item.name === name;
        });

        if (existingProduct) {

            existingProduct.quantity++;

        } else {

            cart.push({
                name: name,
                price: price,
                quantity: 1
            });

        }
        saveCart()

        displayCart()
        updateCartCount()

    });

});

function displayCart() {

    const cartItems = document.querySelector("#cart-items");

    cartItems.innerHTML = "";

    if (cart.length === 0) {

    cartItems.innerHTML = `
        <div class="empty-cart">
            <p>🛒</p>
            <h3>Your cart is empty</h3>
            <p>Start shopping and add something you love.</p>
        </div>
    `;

    updateTotal();

    return;
}

    cart.forEach(function (item, index) {

        const cartItem = document.createElement("div");

        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `
            <div>
                <h3>${item.name}</h3>

                <p>
                    KSh ${item.price.toLocaleString()}
                </p>
            </div>

            <div class="quantity-controls">

                <button 
                    class="quantity-btn minus"
                    data-index="${index}">
                    −
                </button>

                <span>${item.quantity}</span>

                <button 
                    class="quantity-btn plus"
                    data-index="${index}">
                    +
                </button>

            </div>

            <button 
                class="remove-cart"
                data-index="${index}">
                Remove
            </button>
        `;

        cartItems.appendChild(cartItem);

    });

    updateTotal();
}
document.querySelector("#cart-items").addEventListener("click", function (event) {

    const index = event.target.dataset.index;

    if (event.target.classList.contains("plus")) {

        cart[index].quantity++;

    }

    if (event.target.classList.contains("minus")) {

        cart[index].quantity--;

        if (cart[index].quantity === 0) {
            cart.splice(index, 1);
        }

    }

    if (event.target.classList.contains("remove-cart")) {

        cart.splice(index, 1);

    }
    saveCart()

    displayCart();
    updateCartCount()

});

function updateTotal() {

    const cartTotal = document.querySelector("#cart-total");

    let total = 0;

    cart.forEach(function (item) {

        total += item.price * item.quantity;

    });

    cartTotal.textContent = total.toLocaleString();
}

function updateCartCount() {

    const cartCount = document.querySelector("#cart-count");

    let count = 0;

    cart.forEach(function (item) {

        count += item.quantity;

    });

    cartCount.textContent = count;

}

const checkoutBtn = document.querySelector("#checkout-btn");
const checkoutForm = document.querySelector("#checkout-form");

checkoutBtn.addEventListener("click", function () {

    if (cart.length === 0) {
        alert("Your cart is empty. Add a product first.");
        return;
    }

    checkoutForm.classList.add("active");

});
const placeOrder = document.querySelector("#place-order");

placeOrder.addEventListener("click", function () {

    const name = document.querySelector("#customer-name").value;
    const phone = document.querySelector("#customer-phone").value;
    const location = document.querySelector("#customer-location").value;

    if (!name || !phone || !location) {
        alert("Please fill in all the fields.");
        return;
    }

    alert(`Thank you ${name}! Your order has been placed.`);

    cart = [];

    displayCart();
    updateCartCount();

    checkoutForm.classList.remove("active");

});
function saveCart() {
    localStorage.setItem("nouraCart", JSON.stringify(cart));
}
displayCart()
updateCartCount()

const hamburger = document.querySelector("#hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active")
});