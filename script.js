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



//select the container that holds all cart items.
const cartItem = document.querySelector("#cart-items");

//listen for clicks anywhere the cart
cartItem.addEventListener("click", function (event) {

    //get the index of the product whose button was clicked 
    const index = event.target.dataset.index;

    //if the clicked button has the "plus" class..
    if (event.target.classList.contains("plus")) {

        //increase that product's quantity by 1
        cart[index].quantity++;

    }

    //if the clicked button has the "minus" class..
    if (event.target.classList.contains("minus")) {

        //decrease that product's quantity by 1
        cart[index].quantity--;

        //if the quantity reaches 0...
        if (cart[index].quantity === 0) {

            //remove that product from the cart
            cart.splice(index, 1);
        }

    }

    //if the clicked button has the "removed-cart" class...
    if (event.target.classList.contains("remove-cart")) {

        //remove that product from the cart
        cart.splice(index, 1);

    }
    //save the update cart to localStorage
    saveCart()

    //redisplay the updated cart
    displayCart();
    //update the cart count.
    updateCartCount()

});


//calculate the total cost in the cart and display it on the page
function updateTotal() {

    //find the HTML element where the total price will be displayed.
    const cartTotal = document.querySelector("#cart-total");

    //start the total at 0
    let total = 0;

    //loop through every product in the cart.
    cart.forEach(function (item) {

        //calculate the item's price and add itt to the overall total
        total += item.price * item.quantity;

    });

    //display the total on the webpage and format the number with commas
    cartTotal.textContent = total.toLocaleString();
}


//count the total number of products in the cart and display that number next to the cart icon/button
function updateCartCount() {

    //find the html element where the cart count is displayed
    const cartCount = document.querySelector("#cart-count");

    //start the count at 0
    let count = 0;

    //loop thru every product in the cart.
    cart.forEach(function (item) {

        //add each product's quantity to the total count.
        count += item.quantity;

    });

    //display the final count on the webpage
    cartCount.textContent = count;

}

//find the checkout button.
const checkoutBtn = document.querySelector("#checkout-btn");
//find the checkout form
const checkoutForm = document.querySelector("#checkout-form");

//listen for a click on the checkout button
checkoutBtn.addEventListener("click", function () {

    //check if the cart is empty
    if (cart.length === 0) {

        //Tell the user to add a product first.
        alert("Your cart is empty. Add a product first.");

        //stop the function
        return;
    }

    //show the checkout form
    checkoutForm.classList.add("active");

});

//select the place order button
const placeOrder = document.querySelector("#place-order");

//listen for a click on the place order button
placeOrder.addEventListener("click", function () {

    //get the customer's name,phone, and location from the inputs.
    const name = document.querySelector("#customer-name").value;
    const phone = document.querySelector("#customer-phone").value;
    const location = document.querySelector("#customer-location").value;

    //check if any of the fields are empty
    if (!name || !phone || !location) {
        //tell the user to fill in all the fields.
        alert("Please fill in all the fields.");

        //stop the function
        return;
    }

    //show a confirmation message
    alert(`Thank you ${name}! Your order has been placed.`);

    //empty the cart after placing the order
    cart = [];

    //update the cart display
    displayCart();

    //update the cart display
    updateCartCount();

    //hide the checkout form
    checkoutForm.classList.remove("active");

});

//display the cart when the page loads
displayCart()
//update the  cart count when the page loads
updateCartCount()


//select the hamburger menu button.
const hamburger = document.querySelector("#hamburger");
//select the navigation links
const navLinks = document.querySelector(".nav-links");

//listen for a click on the hamburger button
hamburger.addEventListener("click", () => {
    //toggle the active class on the hamburger
    hamburger.classList.toggle("active");
    //toggle the active class on the navigation menu.
    navLinks.classList.toggle("active")
});