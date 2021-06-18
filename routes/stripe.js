const stripe = require('stripe')(process.env.STRIPE_SECRET);
const router = require('express').Router();

router.get('/test-payment-view' , async (req,res)=>{

    res.render('test-payment' , {layout:'index'});

});

router.post('/create-payment-intent' , async (req,res)=>{
    
    res.set('content-type', 'text/html')

    const {order} = req.body;

    //test
    const calculateOrderAmount = order =>{
        return 100;
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount:calculateOrderAmount(order),
        currency:'eur'
    });

    // console.log(paymentIntent);

    res.send({
        clientSecret: paymentIntent.client_secret
    });

})

module.exports = router;