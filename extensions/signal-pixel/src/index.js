import { register } from '@shopify/web-pixels-extension'

register(({ analytics, browser, init }) => {
  // Get shop information from init
  const shop = init?.data?.shop?.myshopifyDomain

  const getActiveExperiments = async () => {
    const activeExperiments = await browser.localStorage.getItem(
      'signal_active_experiments'
    )
    const data =
      typeof activeExperiments === 'string'
        ? JSON.parse(activeExperiments)
        : activeExperiments
    return data
  }

  // Function to get device type based on screen width
  function getDeviceType(width) {
    if (width <= 480) return 'mobile'
    if (width <= 1024) return 'tablet'
    return 'desktop'
  }

  // Function to check if a product is part of an active experiment
  async function isProductInExperiment(productId) {
    try {
      const activeExperiment = await browser.localStorage.getItem(
        'signal_active_experiments'
      )
      if (!activeExperiment) return false

      const { products } = JSON.parse(activeExperiment)
      return products?.some((p) => p.variantId === productId)
    } catch (error) {
      console.error('Error checking product in experiment:', error)
    }
    return false
  }

  async function getThemeExperiment() {
    try {
      const activeExperimentJSON = await browser.localStorage.getItem(
        'signal_active_experiments'
      )
      if (!activeExperimentJSON) return null
      const { theme } = JSON.parse(activeExperimentJSON)
      return theme
    } catch (error) {
      console.error('Error fetching experimentType:', error)
      return null
    }
  }

  // Function get experiment type
  async function getExperimentType(experimentId) {
    try {
      const activeExperimentJSON = await browser.localStorage.getItem(
        'signal_active_experiments'
      )
      if (!activeExperimentJSON) return null

      // If the value is stored as an object (some storage APIs auto-parse), handle that:
      const data =
        typeof activeExperimentJSON === 'string'
          ? JSON.parse(activeExperimentJSON)
          : activeExperimentJSON

      const experiments = data.experiments || []
      // console.log("experiment", experiments)
      const experiment = experiments.find((exp) => exp.id === experimentId)
      return experiment?.experimentType || null
    } catch (error) {
      console.error('Error fetching experimentType:', error)
      return null
    }
  }

  // Function to get experiment details for a product
  async function getExperimentDetails(productId) {
    try {
      const activeExperiment = await browser.localStorage.getItem(
        'signal_active_experiments'
      )
      if (!activeExperiment) return null

      const { products } = JSON.parse(activeExperiment)
      const product = products?.find((p) => p.variantId === productId)

      if (product) {
        return {
          experimentId: product.experimentId,
          testId: product.testId
        }
      }
    } catch (error) {
      console.error('Error getting experiment details:', error)
    }
    return null
  }

  // Function to get UTM parameters and referrer information
  async function getUTMParams() {
    const activeExperiment = await browser.localStorage.getItem(
      'signal_active_experiments'
    )
    if (!activeExperiment) return null

    const { utmParams } = JSON.parse(activeExperiment)
    return {
      utmSource: utmParams?.source || null,
      utmMedium: utmParams?.medium || null,
      utmCampaign: utmParams?.campaign || null,
      utmContent: utmParams?.content || null,
      utmTerm: utmParams?.term || null,
      referrer: utmParams?.referrer || null,
      landingPage: utmParams?.landingPage || null
    }
  }

  // Track view_collection event
  // analytics.subscribe('collection_viewed', async (event) => {
  //   const { clientId, timestamp, context, data } = event
  //   const payload = {
  //     eventName: 'view_collection',
  //     clientId,
  //     timestamp,
  //     collection_id: gidToId(data?.collection?.id),
  //     collection_title: data?.collection?.title,
  //     screen: context?.window?.screen,
  //     deviceType: getDeviceType(context?.window?.screen?.width),
  //     userAgent: context?.navigator?.userAgent,
  //     shop: context?.shop // Get shop from event context
  //   }
  //   sendEventToTracker(payload)
  // })

  const abandonmentTimers = {}

  function setAbandonmentTimer({
    key,
    eventName,
    payload,
    timeoutMs = 5 * 60 * 1000
  }) {
    // Clear existing timer for this key
    if (abandonmentTimers[key]?.timer) {
      clearTimeout(abandonmentTimers[key].timer)
    }

    // Cancel conflicting timers automatically
    if (key === 'checkout' && abandonmentTimers['cart']) {
      clearTimeout(abandonmentTimers['cart'].timer)
      delete abandonmentTimers['cart']
    }

    if (key === 'purchase') {
      Object.values(abandonmentTimers).forEach(({ timer }) =>
        clearTimeout(timer)
      )
      Object.keys(abandonmentTimers).forEach((k) => delete abandonmentTimers[k])
      return
    }

    // Set the timer
    const timer = setTimeout(() => {
      sendEventToTracker({ ...payload, eventName: `${eventName}_abandoned` })
      delete abandonmentTimers[key]
    }, timeoutMs)

    abandonmentTimers[key] = { timer, payload }
  }
  // get experiment context
  async function getExperimentContext(variantId) {
    const themeExperiment = await getThemeExperiment()
    const experimentId =
      themeExperiment && themeExperiment !== 'undefined'
        ? themeExperiment?.experimentId
        : null
    const experimentTypes = await getExperimentType(experimentId)
    const isInExperiment = variantId
      ? await isProductInExperiment(variantId)
      : false
    const experimentDetails = isInExperiment
      ? await getExperimentDetails(variantId)
      : null

    let experimentInfo = ''
    if (experimentTypes === 'theme_testing') {
      if (isInExperiment) {
        experimentInfo = `${experimentDetails?.experimentId}_${experimentDetails?.testId}, ${themeExperiment?.experimentId}_${themeExperiment?.testId}`
      } else {
        experimentInfo = `${themeExperiment?.experimentId}_${themeExperiment?.testId}`
      }
    } else if (isInExperiment) {
      experimentInfo = `${experimentDetails?.experimentId}_${experimentDetails?.testId}`
    }

    return {
      experimentInfo,
      themeExperiment,
      experimentTypes,
      experimentId
    }
  }

  function getDeviceMeta(context) {
    return {
      screen: context?.window?.screen,
      deviceType: getDeviceType(context?.window?.screen?.width),
      userAgent: context?.navigator?.userAgent
    }
  }

  // Initialize user session with Shopify's clientId
  analytics.subscribe('page_viewed', async (event) => {
    const { clientId, context, timestamp } = event
    const { document } = context
    try {
      const storedSession = await browser.localStorage.getItem(
        'signal_user_session'
      )

      let userSession = storedSession ? JSON.parse(storedSession) : null

      if (!userSession) {
        userSession = {
          clientId,
          firstVisit: new Date().toISOString(),
          lastVisit: new Date().toISOString(),
          visitCount: 1
        }
      } else {
        // Update last visit and increment visit count
        userSession.lastVisit = new Date().toISOString()
        userSession.visitCount = (userSession.visitCount || 0) + 1
      }

      await browser.localStorage.setItem(
        'signal_user_session',
        JSON.stringify(userSession)
      )
      const experimentData = await getActiveExperiments()
      const deviceType = getDeviceType(context?.window?.screen?.width)
      const { experiments } = experimentData
      const experimentInfo = experiments
        ?.map((exp) => `${exp.id}_${exp.testId}`)
        .join(',')
      console.log(document, 'document')
      const metaData = {
        pageName:
          document?.location?.pathname == '/'
            ? 'home'
            : document?.location?.pathname?.split('/')[1],
        pageUrl: document?.location?.href,
        pageReferrer: document?.referrer,
        pageTitle: document?.title
      }
      const payload = {
        eventName: 'page_viewed',
        clientId,
        timestamp,
        experiment_info: experimentInfo,
        metaData,
        pageName: metaData.pageName,
        deviceType,
        shop
      }
      sendEventToTracker(payload)
    } catch (error) {
      console.error('Error handling user session:', error)
    }
  })

  // build product event payload

  async function buildAndSendEventPayload({
    eventName,
    clientId,
    timestamp,
    context,
    variantId,
    productId,
    productTitle,
    variantTitle,
    quantity,
    price,
    currency,
    uniqueConstant,
    shop,
    getVariantDetails
  }) {
    const { experimentInfo } = await getExperimentContext(variantId)
    if (!experimentInfo) return

    const utmParams = await getUTMParams()
    const deviceMeta = getDeviceMeta(context)
    const customDetails = getVariantDetails ? await getVariantDetails() : {}

    const payload = {
      eventName,
      clientId,
      timestamp,
      productId,
      product_title: productTitle,
      variantId,
      variant_title: variantTitle || customDetails?.title,
      quantity,
      price: price || customDetails?.price,
      currency,
      experiment_info: experimentInfo,
      shop,
      ...utmParams,
      ...deviceMeta
    }

    if (uniqueConstant) {
      payload.metaData = { uniqueConstant }
    }

    sendEventToTracker(payload)

    // if (eventName === 'add_to_cart') {
    //   setAbandonmentTimer({
    //     key: 'cart',
    //     eventName: 'cart',
    //     payload,
    //     timeoutMs: 2 * 60 * 1000
    //   })
    // }
  }

  // build checkout events payload

  async function buildCheckoutPayload({ eventName, event, extraFields = {} }) {
    const { clientId, timestamp, context, data } = event
    const checkout = data.checkout
    const checkoutTotalPrice = checkout.totalPrice?.amount

    const allDiscountCodes = checkout.discountApplications
      ?.filter((d) => d.type === 'DISCOUNT_CODE')
      .map((d) => d.title)

    const utmParams = await getUTMParams()
    const deviceMeta = getDeviceMeta(context)

    for (const line of checkout.lineItems) {
      const variantId = line.variant?.id
      const { experimentInfo } = await getExperimentContext(variantId)

      // ✅ If this item is in an experiment, build and return the payload immediately
      if (experimentInfo) {
        const discountValue = line.discountAllocations?.[0]?.amount

        const item = {
          productId: line.variant.product?.id,
          variantId,
          quantity: line.quantity,
          title: line.title,
          price: line.variant.price?.amount,
          discount: discountValue,
          experiment_info: experimentInfo
        }

        return {
          eventName,
          clientId,
          timestamp,
          total_price: checkoutTotalPrice,
          currency: checkout.totalPrice?.currencyCode,
          discount_codes: allDiscountCodes,
          items: [item], // ✅ only one item
          shop,
          ...utmParams,
          ...deviceMeta,
          metaData: extraFields
        }
      }
    }

    // ❌ No experiment-linked item found
    return null
  }

  analytics.subscribe('product_viewed', async (event) => {
    const { clientId, timestamp, context, data } = event
    const variant = data?.productVariant

    await buildAndSendEventPayload({
      eventName: 'view_product',
      clientId,
      timestamp,
      context,
      variantId: variant?.id,
      productId: variant?.product?.id,
      productTitle: variant?.product?.title,
      price: variant?.price?.amount,
      shop
    })
  })

  analytics.subscribe('product_added_to_cart', async (event) => {
    const { clientId, timestamp, context, data } = event
    const cartLine = data?.cartLine
    const merch = cartLine?.merchandise

    await buildAndSendEventPayload({
      eventName: 'add_to_cart',
      clientId,
      timestamp,
      context,
      variantId: merch?.id,
      productId: merch?.product?.id,
      productTitle: merch?.product?.title,
      variantTitle: merch?.title,
      quantity: cartLine?.quantity,
      price: cartLine?.cost?.totalAmount?.amount,
      currency: cartLine?.cost?.totalAmount?.currencyCode,
      uniqueConstant: cartLine?.id,
      shop
    })
  })

  analytics.subscribe('product_removed_from_cart', async (event) => {
    const { clientId, timestamp, context, data } = event
    const cartLine = data?.cartLine
    const merch = cartLine?.merchandise

    await buildAndSendEventPayload({
      eventName: 'cart_abandoned',
      clientId,
      timestamp,
      context,
      variantId: merch?.id,
      productId: merch?.product?.id,
      productTitle: merch?.product?.title,
      variantTitle: merch?.title,
      quantity: cartLine?.quantity,
      price: cartLine?.cost?.totalAmount?.amount,
      currency: cartLine?.cost?.totalAmount?.currencyCode,
      shop
    })
  })

  analytics.subscribe('checkout_started', async (event) => {
    const { data } = event
    const checkout = data.checkout
    const payload = await buildCheckoutPayload({
      eventName: 'begin_checkout',
      event,
      extraFields: {
        uniqueConstant: checkout?.token,
        from: 'begin_checkout'
      }
    })
    if (payload) {
      sendEventToTracker(payload)

      // Set abandonment timeout
      // setAbandonmentTimer({
      //   key: 'checkout',
      //   eventName: 'checkout',
      //   payload
      // })
    }
  })

  analytics.subscribe('checkout_address_info_submitted', async (event) => {
    const { data } = event
    const checkout = data.checkout
    const payload = await buildCheckoutPayload({
      eventName: 'address_info_submitted',
      event,
      extraFields: {
        firstName: checkout.shippingAddress?.firstName,
        lastName: checkout.shippingAddress?.lastName,
        phone: checkout.shippingAddress?.phone,
        addressLine1: checkout.shippingAddress?.address1,
        addressLine2: checkout.shippingAddress?.address2,
        city: checkout.shippingAddress?.city,
        country: checkout.shippingAddress?.country,
        province: checkout.shippingAddress?.province,
        zip: checkout.shippingAddress?.zip,
        uniqueConstant: checkout?.token,
        currency: checkout?.currencyCode,
        from: 'address_info_submitted'
      }
    })
    if (payload) {
      sendEventToTracker(payload)
      // setAbandonmentTimer({
      //   key: 'checkout',
      //   eventName: 'checkout',
      //   payload
      // })
    }
  })
  analytics.subscribe('checkout_contact_info_submitted', async (event) => {
    const { data } = event
    const checkout = data.checkout
    const payload = await buildCheckoutPayload({
      eventName: 'contact_info_submitted',
      event,
      extraFields: {
        email: checkout.email,
        phone: checkout.phone,
        uniqueConstant: checkout?.token,
        from: 'contact_info_submitted'
      }
    })
    if (payload) {
      sendEventToTracker(payload)
      // setAbandonmentTimer({
      //   key: 'checkout',
      //   eventName: 'checkout',
      //   payload
      // })
    }
  })

  // Track purchase event

  analytics.subscribe('checkout_completed', async (event) => {
    // setAbandonmentTimer({ key: 'purchase' })

    const paymentTransactions = event.data.checkout.transactions?.map(
      (transaction) => ({
        paymentGateway: transaction.gateway,
        amount: transaction.amount?.amount,
        currency: transaction.amount?.currencyCode
      })
    )

    const payload = await buildCheckoutPayload({
      eventName: 'purchase',
      event,
      extraFields: {
        orderId: event.data.checkout.order?.id,
        paymentTransactions
      }
    })

    sendEventToTracker(payload)
  })

  async function sendEventToTracker(payload) {
    try {
      const response = await fetch(
        'https://public-api.testsignal.com/api/v1/app/tracking',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response from tracker:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await response.json()
    } catch (error) {
      console.error('Error sending event to tracker:', {
        error: error.message,
        payload: payload
      })
    }
  }
})
