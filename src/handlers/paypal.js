require('dotenv').config(); // Ensure environment variables are loaded

const axios = require('axios');

async function generateAccessToken() {
    const baseUrl = process.env.PAYPAL_BASE_URL;
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;

    console.log("Base URL:", baseUrl);
    console.log("Client ID:", clientId ? "Present" : "Missing");
    console.log("Client Secret:", clientSecret ? "Present" : "Missing");

    try {
        const response = await axios({
            url: `${baseUrl}/v1/oauth2/token`,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
                username: clientId,
                password: clientSecret
            },
            data: 'grant_type=client_credentials'
        });
        console.log(response.data);
        return response.data.access_token
    } catch (error) {
        console.error('Error generating access token:', error)
    }
}

exports.createOrder = async (description, value) => {
    const accessToken = await generateAccessToken();
    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + "/v2/checkout/orders",
        method: "post",
        headers: { // Corrected from header to headers
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken,
        },
        data: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    items: [
                        {
                            name: 'Donation',
                            description: description,
                            quantity: 1,
                            unit_amount: { // Corrected from unit_ammount to unit_amount
                                currency_code: 'EUR',
                                value: value
                            }
                        }
                    ],
                    amount: {
                        currency_code: 'EUR',
                        value: value.toString(),
                        breakdown: {
                            item_total: {
                                currency_code: 'EUR',
                                value: value
                            }
                        }
                    }
                }
            ],
            application_context: {
                return_url: process.env.BASE_URL + "/validateDonation",
                cancel_url: process.env.BASE_URL + "/cancelDonation",
                shipping_preference:"NO_SHIPPING",
                user_action:'PAY_NOW',
                brand_name:'Ensemble Autrement'
            },
        })
    });

    console.log(response.data);
    return response.data.links.find(link=>link.rel==='approve').href
}

exports.createPayout = async (amount, currency) => {
    const accessToken = await generateAccessToken();
    
    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + "/v1/payments/payouts",
        method: "post",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken,
        },
        data: JSON.stringify({
            sender_batch_header: {
                sender_batch_id: `batch_${new Date().getTime()}`,
                email_subject: "Transfer received",
                email_message: "The requested amount has been transferred to you"
            },
            items: [
                {
                    recipient_type: "EMAIL",
                    amount: {
                        value: amount,
                        currency: currency
                    },
                    receiver: process.env.PAYPAL_INTERN_EMAIL,
                    note: "Use it well !",
                    sender_item_id: `item_${new Date().getTime()}`
                }
            ]
        })
    });

    console.log(response.data);
    return response.data;
}

exports.capturePayment=async(orderId)=>{
    const accessToken=await generateAccessToken()

    const response=await axios({
        url:process.env.PAYPAL_BASE_URL + '/v2/checkout/orders/'+orderId+'/capture',
        method:'post',
        headers: { // Corrected from header to headers
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken,
        },
    })
    return response.data
}


// this.createOrder('Test Donation', '10.00').then(result=>console.log(result))
