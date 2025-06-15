'use strict';

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

function calcDiscountPrice(price, discount) {
    if (!discount) return price;

    const discountAmount = (price * discount) / 100;
    const result = price - discountAmount;

    return result.toFixed(2);
}

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
    async paymentOrder(ctx) {
        try {
            const { token, products, idUser, addressShipping } = ctx.request.body;

            console.log("📦 token:", token);
            console.log("📦 products:", products);
            console.log("📦 idUser:", idUser);
            console.log("📦 addressShipping:", addressShipping);

            // Validación básica
            if (!token || !token.id || !products || !idUser || !addressShipping) {
                return ctx.badRequest("Faltan datos obligatorios o token mal formado");
            }

            let totalPayment = 0;
            products.forEach((product) => {
                const priceTemp = calcDiscountPrice(product.price, product.discount);
                totalPayment += Number(priceTemp) * product.quantity;
            });

            // Crear el cargo en Stripe
            const charge = await stripe.charges.create({
                amount: Math.round(totalPayment * 100), // Stripe usa céntimos
                currency: "eur",
                source: token.id,
                description: `User ID: ${idUser}`,
            });

            const data = {
                products,
                user: idUser,
                totalPayment,
                idPayment: charge.id,
                addressShipping,
            };

            const model = strapi.contentTypes["api::order.order"];
            const validData = await strapi.entityValidator.validateEntityCreation(
                model,
                data
            );

            const entry = await strapi.db
                .query("api::order.order")
                .create({ data: validData });

            return entry;

        } catch (err) {
            console.error("💥 ERROR EN paymentOrder:", err);
            return ctx.internalServerError("Error al procesar el pago");
        }
    }
}));
