/**
 * Standalone Node.js Order Management Tool
 * This script demonstrates the "Node.js" implementation of the frontend order logic.
 * It uses the native fetch API available in Node.js 18+.
 */

const API_BASE = 'http://localhost:5000/api';
const DEMO_USER = {
    email: 'demo@example.com',
    password: 'demo123'
};

async function orderTool() {
    console.log('-------------------------------------------');
    console.log('🛒 ShopZilla Node.js Order Tool');
    console.log('-------------------------------------------\n');

    try {
        // 1. Authenticate (Login)
        console.log('🔑 Authenticating...');
        const loginRes = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(DEMO_USER)
        });

        if (!loginRes.ok) throw new Error('Authentication failed. Make sure the server is running.');
        const { token, user } = await loginRes.json();
        console.log(`✅ Logged in as: ${user.name}\n`);

        // 2. Fetch Orders
        console.log('📋 Fetching Orders...');
        const ordersRes = await fetch(`${API_BASE}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!ordersRes.ok) throw new Error('Failed to fetch orders.');
        const orders = await ordersRes.json();

        if (orders.length === 0) {
            console.log('ℹ️ No orders found for this user.');
            return;
        }

        console.log(`✨ Found ${orders.length} orders:\n`);

        // 3. Display Orders List
        orders.forEach(order => {
            console.log(`Order ID: #${order.id}`);
            console.log(`Date:     ${new Date(order.createdAt).toLocaleDateString()}`);
            console.log(`Total:    ₹${order.total.toLocaleString('en-IN')}`);
            console.log(`Status:   [ ${order.status} ]`);
            console.log('-------------------------------------------');
        });

        // 4. Fetch Details for the first order as an example
        const firstOrder = orders[0];
        console.log(`\n🔍 Details for Order #${firstOrder.id}:`);

        const detailRes = await fetch(`${API_BASE}/orders/${firstOrder.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const detail = await detailRes.json();

        console.log(`📍 Shipping: ${detail.shippingAddress}`);
        console.log(`💳 Payment:  ${detail.paymentMethod}`);
        console.log('📦 Items:');
        detail.items.forEach(item => {
            console.log(`   - ${item.product.name} (x${item.quantity}) - ₹${(item.product.price * item.quantity).toLocaleString('en-IN')}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Tip: Run "npm run server" in another terminal before running this script.');
    }
}

orderTool();
