//search input code....when the product is typed in the search it filters the products searched for.
const searchInput = document.querySelector("#search-input");
const products = document.querySelectorAll(".product");

searchInput.addEventListener("input", inputTyped);

//this function checks whether the value  typed in the input matches the product, then display only the product typed..else it doesnt display if the value doesn't match.
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


//this code adds a class "active" to the cartPanel which is a div ..which controls the display of the opening and closing of  cartPanel when clicked as set in the css.
const cartBtn = document.querySelector("#cart-btn");
const cartPanel = document.querySelector("#cart-panel");
const closeCart = document.querySelector("#close-cart");

cartBtn.addEventListener("click", function () {
    cartPanel.classList.add("active");
});

closeCart.addEventListener("click", function () {
    cartPanel.classList.remove("active");
});


// we get the saved cart from localStorage.
//if there is no saved cart, start with an empty array
let cart = JSON.parse(localStorage.getItem("nouraCart")) || [];

//select all "Add to Cart buttons"
const addCartButtons = document.querySelectorAll(".add-cart");

//loop thru each Add to Cart button
addCartButtons.forEach(function (button) {

    //listen for a click on the button.
    button.addEventListener("click", function () {

        //find the product that contains the clicked button
        const product = button.closest(".product");

        //get the product name from the data-name attribute
        const name = product.dataset.name;

        //get the product price and convert it from a string to a number
        const price = Number(product.dataset.price);

        //check if the product already exist in the cart
        const existingProduct = cart.find(function (item) {
            return item.name === name;
        });

        //if the product exist, increase its quantity; otherwise, add it as a new product
        if (existingProduct) {

            existingProduct.quantity++;

        } else {

            cart.push({
                name: name,
                price: price,
                quantity: 1
            });

        }
        //save the updated cart to localStorage
        saveCart()

        //display the updated cart on the page
        displayCart()

        //update the number shown on the cart button
        updateCartCount()

    });

});

//saves the cart to the localStorage
function saveCart() {
    localStorage.setItem("nouraCart", JSON.stringify(cart));
}


//this function takes the products inside the cart array and display them on the webpage

function displayCart() {

    //find the HTML element where cart items will be displayed.
    const cartItems = document.querySelector("#cart-items");

    //clear the cart display before showing the updated cart
    cartItems.innerHTML = "";

    //check if the cart is empty
    if (cart.length === 0) {

        //display an empty-cart message
    cartItems.innerHTML = `
        <div class="empty-cart">
            <p>🛒</p>
            <h3>Your cart is empty</h3>
            <p>Start shopping and add something you love.</p>
        </div>
    `;

    //update the total price to 0
    updateTotal();

    //stop the function here because there are no product to display
    return;
}

//loop thru every product in the cart
    cart.forEach(function (item, index) {

        //create a new <div> element for the cart item
        const cartItem = document.createElement("div");

        //give the new div the "cart-item" class
        cartItem.classList.add("cart-item");

        //add the product information and buttons inside the div
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

        //Add the newly created cart to the webpage
        cartItems.appendChild(cartItem);

    });

    //calculate and display the updated cart total
    updateTotal();
}


const cartItem = document.querySelector("#cart-items");

cartItem.addEventListener("click", function (event) {

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

displayCart()
updateCartCount()

const hamburger = document.querySelector("#hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active")
});