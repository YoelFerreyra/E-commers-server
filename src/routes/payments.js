const { Router } = require("express");
const router = Router();
const axios = require("axios");
const { PRODUCTION, CORS_URL, LOCAL_BACK, URL_DEPLOY, ACCES_TOKEN } = process.env;

const urlRequest = PRODUCTION ? URL_DEPLOY : LOCAL_BACK

router.post("/", async (req, res) => {
  const { items, email, user_id } = req.body;

  try {
    const orden = (await axios.post(`${urlRequest}/order`, { user_id, email, items })).data;
    const result = await createPayment(items, orden.id);
    res.send(result);
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).send({ error: error.message });
  }
});

router.get("/success/:id", async (req, res) => {

  const {id} = req.params;

  try {
    await axios.put(`${urlRequest}/order/${id}`, {order: "realizada"})
    res.redirect(PRODUCTION ? "http://localhost:3000/" : CORS_URL);
  } catch (error) {
    res.send({ error: error.message });
  }
});

router.get("/failure/:id", async(req, res) => {

  const {id} = req.params;

  try {
    await axios.put(`${urlRequest}/order/${id}`, {order: "cancelada"})
    res.redirect(PRODUCTION ? "http://localhost:3000/" : CORS_URL);
  } catch (error) {
    res.send({ error: error.message });
  }
});

router.get("/pending/:id", async (req, res) => {

  const {id} = req.params;

  try {
    await axios.put(`${urlRequest}/order/${id}`, {order: "pendiente"})
    res.redirect(PRODUCTION ? "http://localhost:3000/" : CORS_URL);
  } catch (error) {
    res.send({ error: error.message });
  }
});

async function createPayment(item, id) {
  const url = "https://api.mercadopago.com/checkout/preferences";
  const body = {
    items: item,
    back_urls: {
      failure: `${urlRequest}/payments/failure/${id}`,
      pending: `${urlRequest}/payments/pending/${id}`,
      success: `${urlRequest}/payments/success/${id}`,
    }
  };
  const payment = await axios.post(url, body, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCES_TOKEN}`,
    },
  });

    const result = [
      payment.data.init_point,
      payment.data.id,
      payment.data.items.map((e) => {
      return e;
      }),
    ];
    return result;
}

module.exports = router;
