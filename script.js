document.addEventListener('DOMContentLoaded', () => {
    /* ----------------------------------------------------- */
    /* NAVIGATION & UI LOGIC */
    /* ----------------------------------------------------- */

    // Mobile Menu Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = navToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close Mobile Menu on Link Click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (link.id !== 'cart-btn') { // Don't close if cart button clicked
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            navbar.style.padding = '10px 0';
        } else {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
            navbar.style.padding = '20px 0';
        }
    });

    // Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.animate-up, .animate-right, .animate-left');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load


    /* ----------------------------------------------------- */
    /* SHOPPING CART LOGIC */
    /* ----------------------------------------------------- */

    // DOM Elements
    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total-price');
    const cartCountElement = document.querySelector('.cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping');
    const checkoutModal = document.getElementById('checkout-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');

    // State
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Functions

    // Update Cart UI
    function updateCartUI() {
        // Update Badge
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCountElement.textContent = totalItems;

        // Update List
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Seu carrinho está vazio.</p>';
            cartTotalElement.textContent = 'R$ 0,00';
            return;
        }

        // No logic for price calculation needed anymore
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span>Quantidade: ${item.quantity}</span>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn minus" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn plus" data-id="${item.id}">+</button>
                <button class="remove-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
            cartItemsContainer.appendChild(cartItem);
        });

        cartTotalElement.textContent = `Sob Consulta`;

        // Add Event Listeners to dynamic buttons
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                changeQuantity(id, 1);
            });
        });

        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                changeQuantity(id, -1);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Traverse up to find button if icon clicked
                const target = e.target.closest('button');
                const id = target.getAttribute('data-id');
                removeFromCart(id);
            });
        });

        saveCart();
    }

    // Add Item
    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                // Price removed from object
                quantity: 1
            });
        }

        updateCartUI();
        openCart();

        // Optional: Toast notification (simple alert for now or custom)
        // alert('Produto adicionado ao carrinho!');
    }

    // Remove Item
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }

    // Change Quantity
    function changeQuantity(id, delta) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                updateCartUI();
            }
        }
    }

    // Save to LocalStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Sidebar Interactions
    function openCart() {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
    }

    function closeCart() {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('active');
    }

    // Modal Interactions
    function openCheckout() {
        if (cart.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }
        closeCart();
        checkoutModal.classList.add('active');
        modalOverlay.classList.add('active');
    }

    function closeCheckout() {
        checkoutModal.classList.remove('active');
        modalOverlay.classList.remove('active');
    }

    // Format Currency
    function formatCurrency(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Event Listeners
    cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });

    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    checkoutBtn.addEventListener('click', openCheckout);
    continueShoppingBtn.addEventListener('click', closeCart);
    closeModalBtn.addEventListener('click', closeCheckout);
    modalOverlay.addEventListener('click', closeCheckout);

    // Add to Cart Buttons logic
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const product = {
                id: card.getAttribute('data-id'),
                name: card.getAttribute('data-name'),
                price: card.getAttribute('data-price')
            };
            addToCart(product);
        });
    });

    // Form Submission (WhatsApp)
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const city = document.getElementById('city').value;
        const obs = document.getElementById('observation').value;

        let message = `*Olá! Gostaria de fazer um orçamento:*\n\n`;
        message += `*PRODUTOS:*\n`;

        cart.forEach(item => {
            message += `- ${item.quantity}x ${item.name}\n`;
        });

        message += `\n*DADOS DO CLIENTE:*\n`;
        message += `Nome: ${name}\n`;
        message += `Telefone: ${phone}\n`;
        message += `Email: ${email}\n`;
        message += `Cidade: ${city}\n`;
        if (obs) message += `Obs: ${obs}`;

        const phoneNumber = "5511999272632"; // Updated WhatsApp number
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        // Clear cart and redirect
        cart = [];
        saveCart();
        updateCartUI();
        closeCheckout();

        window.open(whatsappUrl, '_blank');
    });

    // Init
    updateCartUI();

    // Smooth Scroll for Anchor Links (Safari/Older browsers fallback)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
