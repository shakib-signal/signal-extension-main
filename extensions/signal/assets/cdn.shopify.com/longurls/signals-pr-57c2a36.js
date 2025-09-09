let products = []
let searchInput = []
let modalTrigger = []
let productContainerTest = []
let possibleSelectors = {}
let customSelectors = {}
let sellingObj = {}
let shippingExp = {}
let currencySymbol = null
const current_themeId = window.Shopify.theme.id.toString()
const current_themeName = window.Shopify.theme.schema_name
const current_shop = window.Shopify.shop
const flicker_selectors = flicker_container_selectors
// Get custom selectors from theme settings
const all_selectors = selectors_data
const selectors = all_selectors?.find(
  (selector) => selector.themeId == current_themeId
)?.selectors
searchInput = splitSelectors(selectors?.searchClassOrId)

const modalContent = splitSelectors(selectors?.modalClassOrId ?? [])
const modalButton = splitSelectors(selectors?.triggerButtonClassOrId ?? [])

if (modalContent || modalButton) {
  modalTrigger = [...modalContent, ...modalButton]
}
productContainerTest = [
  ...(selectors?.productContainer || []),
  ...(selectors?.triggerElementContainer || [])
]
;(function storeSelectorsForPrice() {
  customSelectors = {
    productCardContainer: productContainerTest || [],
    singleProductContainer: selectors?.singleProductContainer || [],
    searchInputSelector: searchInput || [],
    modalTriggerSelector: modalTrigger || [],
    priceContainer: selectors?.priceContainer || [],
    compare: selectors?.comparePriceClassOrId || [],
    sale: selectors?.salePriceClassOrId || [],
    badges: ['.badge', '.price__badge']
  }

  // Merge default and custom selectors
  possibleSelectors = {
    productCardContainer: [
      ...new Set([
        ...customSelectors.productCardContainer

        // ...defaultSelectors.productContainer
      ])
    ],
    singleProductContainer: [
      ...new Set([
        ...customSelectors.singleProductContainer
        // ...defaultSelectors.productContainer
      ])
    ],
    priceContainer: [
      ...new Set([
        ...customSelectors.priceContainer
        // ...defaultSelectors.priceContainer
      ])
    ],
    compare: [
      ...new Set([...customSelectors.compare])
      // ...defaultSelectors.regular
    ],
    sale: [...new Set([...customSelectors.sale])],
    badges: [...new Set([...customSelectors.badges])]
  }
})()
const earlyStyle = document.createElement('style')
earlyStyle.innerHTML = `
  .signal-hide-price {
    visibility: hidden !important;
    opacity: 0 !important;
    transition: opacity 0.3s ease-out;
  }
  .signal-hide-body {
    visibility: hidden !important;
    opacity: 0 !important;
    transition: opacity 0.3s ease;
  }
  .signal-hide-container {
    visibility: hidden !important;
    opacity: 0 !important;
    transition: opacity 0.3s ease;
  }
  .signal-fade-in {
  visibility: visible !important;
  opacity: 1 !important;
}
`
document.head.appendChild(earlyStyle)
// image selector
window.signalSettings = {
  hideBody: false,
  showConsoleLog: false
}
const consoleLog = (content) => {
  if (window?.signalSettings?.showConsoleLog) {
    console.log(content)
  }
}
// if (window?.signalSettings?.hideBody) {
//   document.documentElement.classList.add('signal-hide-body')
//   setTimeout(() => {
//     document.documentElement.classList.remove('signal-hide-body')
//   }, 1200) // fallback to unhide after 1.5s
// }
const sanitizeArray = (arr) =>
  (Array.isArray(arr) ? arr : [arr])
    .filter(Boolean)
    .map((s) => s.trim())
    .filter(Boolean)

// Get custom selectors injected from theme settings (Liquid or App Block)
const customImageSelectors = {
  productCardContainer: [],

  productCardImage: [],

  singleProductContainer: [],

  singleProductImage: [],

  predictiveSearchItem: [],

  predictiveSearchImage: []
}

// Define reliable default selectors for common themes
const defaultImageSelectors = {
  productCardContainer: [
    '.card--standard',
    '.product-card',
    '.grid-view-item.product-card',
    '.product-card-wrapper'
  ],
  productCardImage: [
    '.card__media img',
    '.product-card__image',
    '.grid-view-item__image',
    '.product-media__image',
    '.lazyloaded',
    'picture img'
  ],

  singleProductContainer: [
    '[data-product-id]',
    '.product.product--large',
    '.product-media-container', // Added for this theme
    'product-page'
  ],
  singleProductImage: [
    '.product__media img',
    '.product-gallery__image',
    '.product__media-item img',
    '.product__media.media img',
    '.image-magnify-lightbox',
    '.product-media__image', // Main image selector for this theme
    'slideshow-slide img', // Added for slides in carousel
    'picture img'
  ],

  singleProductMediaWrapper: [
    '.product__media-wrapper',
    '.product-media-container',
    'slideshow-slide', // Added for this theme
    'slide-control'
  ],

  singleProductThumbnails: [
    '.product__media-list',
    '.slider__slide img',
    '.slideshow-controls__thumbnail img', // Thumbnail images in controls
    '.dialog-thumbnails-list__thumbnail img' // Thumbnails in zoom dialog
  ],

  predictiveSearchItem: ['.predictive-search__list-item'],
  predictiveSearchImage: ['.predictive-search__image'],

  // Existing additional selectors
  productCardInner: ['.card__inner', 'picture'],
  productCardMediaContainer: [
    '.card__media',
    '.grid-view-item__image-wrapper',
    '.product-media-container' // Added for this theme
  ],
  productCardMediaDiv: [
    '.media',
    '.product-media' // Added for this theme
  ],
  productCardContentBlocks: ['.card__content'],
  productCardHeading: ['.card__heading', '.grid-view-item__title']
}

// Merge custom and default selectors
const imageSelectors = {
  productCardContainer: [
    ...new Set([
      ...customImageSelectors.productCardContainer,
      ...defaultImageSelectors.productCardContainer
    ])
  ],
  productCardImage: [
    ...new Set([
      ...customImageSelectors.productCardImage,
      ...defaultImageSelectors.productCardImage
    ])
  ],
  singleProductContainer: [
    ...new Set([
      ...customImageSelectors.singleProductContainer,
      ...defaultImageSelectors.singleProductContainer
    ])
  ],
  singleProductImage: [
    ...new Set([
      ...customImageSelectors.singleProductImage,
      ...defaultImageSelectors.singleProductImage
    ])
  ],
  predictiveSearchItem: [
    ...new Set([
      ...customImageSelectors.predictiveSearchItem,
      ...defaultImageSelectors.predictiveSearchItem
    ])
  ],
  predictiveSearchImage: [
    ...new Set([
      ...customImageSelectors.predictiveSearchImage,
      ...defaultImageSelectors.predictiveSearchImage
    ])
  ],
  productCardContentBlocks: [
    ...new Set([
      ...(customImageSelectors.productCardContentBlocks || []),
      ...defaultImageSelectors.productCardContentBlocks
    ])
  ],
  productCardInner: [...new Set([...defaultImageSelectors.productCardInner])],
  productCardMediaContainer: [
    ...new Set([...defaultImageSelectors.productCardMediaContainer])
  ],
  productCardHeading: [
    ...new Set([...defaultImageSelectors.productCardHeading])
  ]
}

const STORAGE_PREFIX = 'ts_si'

const setStorage = (experimentId, key, value) => {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}_${experimentId}_${key}`,
      JSON.stringify(value)
    )
  } catch (e) {
    console.error('Storage Set Error:', e)
  }
}

const getStorage = (experimentId, key) => {
  try {
    const value = localStorage.getItem(
      `${STORAGE_PREFIX}_${experimentId}_${key}`
    )
    return value ? JSON.parse(value) : null
  } catch (e) {
    console.error('Storage Get Error:', e)
    return null
  }
}

const removeStorage = (experimentId, key) => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}_${experimentId}_${key}`)
  } catch (e) {
    console.error('Storage Remove Error:', e)
  }
}

const removeHideBody = () => {
  if (window?.signalSettings?.hideBody) {
    document.documentElement.classList.remove('signal-hide-body')
  }
}

// store experiment data

function storeExperimentData(experiments, products, utmParams) {
  const experiment = experiments?.find(
    (exp) => exp.experimentType === 'theme_testing'
  )

  const experimentData = {
    experiments,
    products,
    utmParams: utmParams,
    themeTestingExperiment: experiment?.id,
    themeObject: experiment?.theme
  }
  localStorage.setItem(
    'signal_active_experiments',
    JSON.stringify(experimentData)
  )
}

function waitForUserSession(callback, interval = 100, maxWait = 1500) {
  const start = Date.now()

  const check = () => {
    const userSession = localStorage.getItem('signal_user_session')
    if (userSession) {
      callback()
    } else if (Date.now() - start < maxWait) {
      setTimeout(check, interval)
    } else {
      console.warn('User session not found in time')
      callback() // Run anyway as fallback
    }
  }

  check()
}

function formatedPriceWithCurrency(cents) {
  try {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '')
    }
    let value = ''
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/
    const formatString = signalMoneyFormat.replace(/<[^>]*>/g, '')

    function defaultOption(opt, def) {
      return typeof opt === 'undefined' ? def : opt
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption(precision, 2)
      thousands = defaultOption(thousands, ',')
      decimal = defaultOption(decimal, '.')

      if (isNaN(number) || number == null) {
        return 0
      }
      number = (number / 100.0).toFixed(precision)
      const parts = number.split('.')
      const dollars = parts[0].replace(
        /(\d)(?=(\d\d\d)+(?!\d))/g,
        '$1' + thousands
      )
      const cents = parts[1] ? decimal + parts[1] : ''

      return dollars + cents
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2)
        break
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0)
        break
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',')
        break
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',')
        break
      default:
        value = formatWithDelimiters(cents, 2)
        break
    }

    return formatString.replace(placeholderRegex, value)
  } catch (error) {
    const currency = Shopify?.currency?.active || 'USD'

    const formattedAmount = new Intl.NumberFormat(Shopify?.locale, {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'narrowSymbol'
    }).format(cents / 100)
    currencySymbol = formattedAmount.match(/^[^\d]+/)[0]
    return formattedAmount
  }
}

// spliting classes
function splitSelectors(selectorArray) {
  return selectorArray?.flatMap((selector) => {
    const prefix = selector[0] // '.' or '#'
    const rest = selector.slice(1) // remove first character

    const parts = rest.split('.') // split by dot
    return parts.map((part, index) => {
      // First part keeps the original prefix (either . or #)
      // Remaining parts are class names → prefixed with '.'
      if (index === 0) return prefix + part
      return '.' + part
    })
  })
}

function hidePriceElements(priceElements) {
  if (!priceElements) return
  ;['compare', 'sale', 'badges'].forEach((type) => {
    const value = priceElements[type]
    if (!value) return

    // If it's a NodeList or Array, loop through
    if (NodeList.prototype.isPrototypeOf(value) || Array.isArray(value)) {
      value.forEach((el) => {
        el.classList.add('signal-hide-price')
      })
    } else if (value instanceof Element) {
      // It's a single DOM element (e.g., container)
      value.classList.add('signal-hide-price')
    }
  })
}

// Utility to reveal specific price elements
function revealPriceElements(priceElements) {
  if (!priceElements) return
  ;['container', 'compare', 'sale', 'badges'].forEach((type) => {
    const value = priceElements[type]
    if (!value) return

    const reveal = (el) => {
      // Step 1: Add fade-in class (which makes it visible + opacity 1)
      el.classList.add('signal-fade-in')

      // Step 2: Wait for transition, then remove the hidden class
      setTimeout(() => {
        el.classList.remove('signal-hide-price')
        el.classList.remove('signal-fade-in') // optional, if you want a clean DOM
      }, 400) // match your transition duration
    }

    if (NodeList.prototype.isPrototypeOf(value) || Array.isArray(value)) {
      value.forEach(reveal)
    } else if (value instanceof Element) {
      reveal(value)
    }
  })
}

function revelAllHiddenPrices() {
  const elements = document.querySelectorAll(
    (flicker_container_selectors || ['.price']).join(',')
  )
  elements.forEach((el) => {
    el.setAttribute(
      'style',
      'visibility: visible!important; opacity: 1!important; transition: opacity 0.3s ease-in-out;'
    )
  })
}

function revealAllHiddenClasses() {
  const hiddenClasses = document.querySelectorAll('.signal-hide-price')
  hiddenClasses.forEach((container) => {
    container.classList.add('signal-fade-in')
    setTimeout(() => {
      container.classList.remove('signal-hide-price')
      container.classList.remove('signal-fade-in')
    }, 400)
  })
}

// fetching selectors data

// async function fetchStoreClassSelector() {
//   const themeInfo = window.Shopify.theme
//   const themeId = themeInfo.id
//   const themeName = themeInfo.schema_name
//   const shop = window.Shopify.shop

//   if (!themeId) {
//     return {}
//   }

//   try {
//     const response = await fetch(
//       `https://api.testsignal.com/api/v1/app/selector/${themeId}?shop=${shop}`
//       // `http://localhost:5001/api/v1/app/selector/${themeId}`
//     )
//     const result = await response.json()

//     if (!response.ok) {
//       throw new Error(result.message || 'Failed to fetch selector')
//     }

//     if (result.data) {
//       const { themeName, selectors: fetchedSelectors } = result.data
//       return fetchedSelectors || {}
//     }
//   } catch (error) {
//     console.error(error)
//   }

//   return {}
// }

// // Initialize selectors immediately
// ;(async function initializeSelectors() {
//   selectors = await fetchStoreClassSelector()
// })()

// started code

document.addEventListener('DOMContentLoaded', async () => {
  const applyTestPrices = (experiment, activeTestId) => {
    const activeTest = getStorage(experiment.id, 'active_ts') || activeTestId

    return experiment?.testingProducts
      .filter((i) => i.experimentId == experiment.id && i.testId == activeTest)
      ?.map((product) => {
        const discountPercentage = Math.round(
          (parseFloat(product?.discountAmount) /
            parseFloat(product?.compareAtPrice)) *
            100
        )

        const obj = {
          ...product,
          compareAtPrice: parseFloat(product?.compareAtPrice ?? 0),
          schedule: experiment?.schedule,
          experimentType: experiment?.experimentType,
          discountPercentage,
          isSellingPlanEnable: false,
          sellingPrice: null
        }
        return obj
      })
  }
  // ... existing code ...

  // Global update prices function with retry logic
  // function updatePrices(
  //   func = null,
  //   attempt = 1,
  //   maxAttempts = 5,
  //   retryDelay = 500
  // ) {
  //   console.log('Updating prices, attempt:', attempt)
  //   func ? func() : updateProductPrices()

  //   // Retry if needed (some themes override prices after initial render)
  //   if (attempt < maxAttempts) {
  //     setTimeout(
  //       () => updatePrices(func, attempt + 1, maxAttempts, retryDelay),
  //       retryDelay
  //     )
  //   }
  // }

  // search and modal listeners
  function setupSearchAndModalListeners() {
    consoleLog('Setting up search and modal listeners')

    // Listen for search input changes
    document.addEventListener('input', (event) => {
      try {
        const searchInput = event.target.closest(
          `${
            customSelectors.searchInputSelector.length > 0
              ? `${customSelectors.searchInputSelector.join(',')},`
              : ''
          } input[type="search"], input[type="text"][name*="search"], input[type="text"][placeholder*="search"]`
        )
        if (!searchInput) return
        // Update prices after a short delay to allow search results to load
        setTimeout(() => {
          try {
            updateProductPricesOnCard()
          } catch (error) {
            console.error('Error updating prices:', error)
          }
        }, 1500)
      } catch (error) {
        console.error('Error in search input handler:', error)
      }
    })

    // Listen for search form submissions
    document.addEventListener('submit', (event) => {
      try {
        const searchForm = event.target.closest(
          `${
            customSelectors.searchInputSelector.length > 0
              ? `${customSelectors.searchInputSelector.join(',')},`
              : ''
          } form[action*="query"]`
        )
        if (!searchForm) return

        // Update prices after form submission
        setTimeout(() => {
          try {
            updateProductPricesOnCard()
          } catch (error) {
            console.error('Error updating prices:', error)
          }
        }, 1500)
      } catch (error) {
        console.error('Error in search form handler:', error)
      }
    })

    // Listen for clicks on search results
    document.addEventListener('click', (event) => {
      try {
        const searchResult = event.target.closest(
          `${
            customSelectors.searchInputSelector.length > 0
              ? `${customSelectors.searchInputSelector.join(',')},`
              : ''
          } .slider--search-presets, input[type="search"], input[type="text"][name*="search"], input[type="text"][placeholder*="search"]`
        )
        if (!searchResult) return

        // Update prices when a search result is clicked
        setTimeout(() => {
          try {
            updateProductPricesOnCard()
          } catch (error) {
            console.error('Error updating prices:', error)
          }
        }, 1500)
      } catch (error) {
        console.error('Error in search result click handler:', error)
      }
    })

    // Listen for modal open events
    document.addEventListener('click', (event) => {
      try {
        const modalTrigger = event.target.closest(
          `${
            customSelectors.modalTriggerSelector.length > 0
              ? `${customSelectors.modalTriggerSelector.join(',')},`
              : ''
          } [data-modal-trigger],.predictive-search, [data-drawer-trigger], [aria-controls*="modal"], [aria-controls*="drawer"], modal-opener, [aria-haspopup="dialog"], [data-modal]`
        )
        if (!modalTrigger) return

        // Get the specific modal ID from the trigger
        let modalId = null
        if (modalTrigger.hasAttribute('data-modal')) {
          modalId = modalTrigger.getAttribute('data-modal')
        } else if (modalTrigger.closest('modal-opener')) {
          modalId = modalTrigger
            .closest('modal-opener')
            .getAttribute('data-modal')
        } else if (modalTrigger.hasAttribute('aria-controls')) {
          modalId = modalTrigger.getAttribute('aria-controls')
        }

        // Update prices when a modal is opened
        setTimeout(() => {
          try {
            // Find the open modal
            const openModal = document.querySelector('quick-add-modal[open]')
            if (openModal) {
              consoleLog('Found Open Modal:', openModal)

              // Get the product info from the open modal
              const productInfo = openModal.querySelector('product-info')
              if (productInfo) {
                const productId = productInfo.getAttribute('data-product-id')

                // Get the variant ID from the form
                const form = openModal.querySelector(
                  'form[action*="/cart/add"]'
                )
                if (form) {
                  const variantInput = form.querySelector('input[name="id"]')
                  if (variantInput) {
                    const variantId = variantInput.value

                    // Update prices for this specific product/variant
                    updateSingleProductPrice(variantId)
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error updating prices:', error)
          }
        }, 1500)
      } catch (error) {
        console.error('Error in modal trigger handler:', error)
      }
    })

    // Listen for Shopify's predictive search results
    document.addEventListener('predictive-search:render', () => {
      try {
        setTimeout(() => {
          try {
            updateProductPricesOnCard()
          } catch (error) {
            console.error('Error updating prices:', error)
          }
        }, 1500)
      } catch (error) {
        console.error('Error in predictive search handler:', error)
      }
    })

    // Listen for custom search events that might be added by themes
    document.addEventListener('search:results', () => {
      try {
        setTimeout(() => {
          try {
            updateProductPricesOnCard()
          } catch (error) {
            console.error('Error updating prices:', error)
          }
        }, 1500)
      } catch (error) {
        console.error('Error in search results handler:', error)
      }
    })
  }

  // function detectCurrencyFormat(priceText) {
  //   // Use global format if available, otherwise fallback to detecting from text

  //   if (globalCurrencyFormat.prefix || globalCurrencyFormat.suffix) {
  //     return globalCurrencyFormat
  //   }

  //   // Remove 'From' prefix if it exists
  //   const cleanText = priceText.replace(/^From\s+/i, '').trim()

  //   // Extract currency prefix and suffix
  //   const prefix = cleanText.match(/^([^\d]+)/)?.[1]?.trim() || ''
  //   const suffix = cleanText.match(/([^\d]+)$/)?.[1]?.trim() || ''

  //   return { prefix, suffix }
  // }

  function findPriceElements(container) {
    let foundElements = {
      container: null,
      compare: [],
      sale: [],
      badges: []
    }

    // Find container

    for (const selector of possibleSelectors.priceContainer) {
      const element = container.querySelector(selector)

      if (element) {
        foundElements.container = element
        break
      }
    }
    // If no container found, use the container itself
    if (!foundElements.container) {
      foundElements.container = container
    }

    // Find all compare prices
    for (const selector of possibleSelectors.compare) {
      const element = foundElements.container.querySelector(selector)

      if (element) {
        foundElements.compare.push(element)
      }
      // elements.forEach((element) => {
      // })
    }

    // Find all sale prices
    for (const selector of possibleSelectors.sale) {
      const element = foundElements.container.querySelector(selector)
      if (element) {
        foundElements.sale.push(element)
      }
      // elements.forEach((element) => {
      // })
    }
    // Find all badges
    // for (const selector of possibleSelectors.badges) {
    //   const elements = container.querySelectorAll(selector)
    //   elements.forEach((element) => {
    //     if (element) {
    //       foundElements.badges.push(element)
    //     }
    //   })
    // }
    for (const selector of possibleSelectors.badges) {
      const element = container.querySelector(selector)
      if (element) {
        foundElements.badges.push(element)
      }
      // elements.forEach((element) => {
      // })

      if (foundElements.badges.length > 0) {
        break // stop checking other selectors
      }
    }

    return foundElements
  }
  const getIdFromCartForm = (event = null) => {
    let form = event
      ? event.target.closest('form[action*="/cart/add"]')
      : document.querySelector('form[action*="/cart/add"]')
    if (!form) {
      form = document.querySelector('form[action*="/cart/add"]')
      if (!form) {
        console.warn('No form found for cart add action')
        return null
      }
    }
    const select = form.querySelector('select[name="id"]')
    if (select) return select.value
    const hidden = form.querySelector('input[name="id"]')
    if (hidden) return hidden.value
    const radio = form.querySelector(
      'input[type="radio"][data-variant-id]:checked'
    )
    if (radio) return radio.dataset.variantId || radio.value
    return null
  }
  function getVariantId(input = null) {
    // If input is provided, try to get variant ID directly from it

    if (input) {
      const isRadio = input.type === 'radio' && input.name
      if (isRadio) {
        // Get the checked radio from the same group
        const checked = document.querySelector(
          `input[name="${input.name}"]:checked`
        )
        return checked?.dataset.variantId || checked?.value || null
      }
      return input.dataset.variantId || input.value || null
    }

    // Fallback: If no input was passed or input didn't contain variant ID, look for a variant selector in the product form
    return getIdFromCartForm()
  }

  const sellingPlanHandler = (event) => {
    let toggle = null
    if (
      event &&
      event.target.matches(
        '[name="selling_plan_toggle"], [name="selling_plan"]'
      )
    ) {
      toggle = event.target
    } else {
      toggle = document.querySelector(
        '[name="selling_plan_toggle"], [name="selling_plan"]'
      )
    }
    if (!toggle) return
    const select = toggle.getAttribute('data-id') || toggle.value
    const isOn = toggle.checked || (toggle.value != '' ? true : false)

    sellingObj = {
      isToggleOn: isOn,
      value: select
    }
    return sellingObj
  }

  const hideIndividualPriceElements = (productContainer) => {
    const priceElements = findPriceElements(productContainer)
    hidePriceElements(priceElements)
  }

  const updateVariantPriceOnCard = (productContainer, variantInput) => {
    // const productContainer = variantInput.closest(
    //   possibleSelectors.productCardContainer.join(',')
    // )
    if (!productContainer) return
    const variantValue = variantInput.value
    const handle = productContainer
      .querySelector('a[href*="/products/"]')
      .href.split('/')
      .pop()
      .split('?')[0]
    const matchingVariant = products.find((product) => {
      return (
        product.productHandle === handle && product.variantName === variantValue
      )
    })
    if (!matchingVariant) {
      consoleLog(`No matching variant found for ${variantValue}`)
      return
    }
    const {
      price: variantPrice,
      compareAtPrice: variantCompareAtPrice,
      discountAmount: variantDiscountAmount,
      discountPercentage: variantDiscountPercentage
    } = matchingVariant
    const priceElements = findPriceElements(productContainer)
    updatePriceElements(
      priceElements,
      variantPrice,
      variantCompareAtPrice,
      variantDiscountAmount,
      variantDiscountPercentage
    )
  }
  // change handler
  const variantHandler = (event) => {
    // const productContainer = document.querySelectorAll(
    //   [
    //     ...possibleSelectors.singleProductContainer,
    //     ...possibleSelectors.productCardContainer
    //   ].join(',')
    // )
    // if (productContainer) {
    //   for (const container of productContainer) {
    //     const priceElements = findPriceElements(container)
    //     hidePriceElements(priceElements)
    //   }
    // }

    try {
      // sellingPlanHandler(event)
      const productContainer = event.target.closest(
        [
          ...possibleSelectors.singleProductContainer,
          ...possibleSelectors.productCardContainer
        ].join(',')
      )
      if (productContainer) {
        hideIndividualPriceElements(productContainer)
      }
      const variantInput = event.target.closest(
        'input[name="id"], select[name="id"], [name="id"] [value], .single-option-selector, input[type="radio"][name*="Denominations"]:checked, input[data-variant-id]:checked,.js-product-option'
      )
      // Update prices after a short delay to allow variant changes to complete
      setTimeout(() => {
        try {
          if (variantInput) {
            updateVariantPriceOnCard(productContainer, variantInput)
            const variantId = getVariantId(variantInput)
            updateSingleProductPrice(variantId)

            waitForProductPriceAndRun()
          } else {
            const variantId = getIdFromCartForm(event)
            updateSingleProductPrice(variantId)

            waitForProductPriceAndRun()
          }
        } catch (error) {
          console.error('Error updating prices:', error)
        }
      }, 600)
    } catch (error) {
      console.error('Error in variant change handler:', error)
    }
  }
  document.addEventListener('change', variantHandler)

  // update product prices

  const updatePrice = (priceEl, price) => {
    // console.log('priceEl', price)
    if (!priceEl) return null

    const priceText = formatedPriceWithCurrency(parseFloat(price) * 100)
    priceEl.textContent = priceText

    return priceEl
  }
  const updateBadgeText = (text, newValue) => {
    const cleanedText = text
      .replace(new RegExp(`\\${currencySymbol}`, 'g'), '')
      .trim()
    const pattern = /^(.*?)([a-zA-Z]*\d+\.?\d*%?)(.*)$/i
    const match = cleanedText.match(pattern)

    if (match) {
      const [, beforeText, , afterText] = match
      return beforeText + newValue + afterText
    }

    return newValue
  }

  // function updateSaleClass(container, isOnSale) {
  //   if (!container || !Array.from(container.classList).length) return

  //   // Find the main price container (either .price or the container itself)

  //   let mainPriceContainer = null
  //   for (const selector of possibleSelectors.priceContainer) {
  //     if (container.classList.contains(selector)) {
  //       mainPriceContainer = container
  //       break
  //     }
  //   }
  //   if (!mainPriceContainer) {
  //     mainPriceContainer = container.closest('.price')
  //   }

  //   if (isOnSale) {
  //     mainPriceContainer.classList.add('price--on-sale')
  //   } else {
  //     mainPriceContainer.classList.remove('price--on-sale')
  //   }
  // }

  // Helper function to update price elements
  function updatePriceElements(
    priceElements,
    price,
    compareAtPrice,
    discountAmount,
    discountPercentage
  ) {
    if (!priceElements.container) {
      consoleLog('No price container found')
      return
    }

    // Helper function to update DOM with retry logic
    const updateDom = (
      priceEl,
      priceValue,
      attempt = 1,
      maxAttempts = 1,
      retryDelay = 400
    ) => {
      if (!priceEl) return
      updatePrice(priceEl, priceValue)
      // console.log('Updating price:', attempt, priceEl, priceValue)
      if (attempt < maxAttempts) {
        setTimeout(
          () =>
            updateDom(
              priceEl,
              priceValue,
              attempt + 1,
              maxAttempts,
              retryDelay
            ),
          retryDelay
        )
      }
    }

    let comparePriceContainer = priceElements.container

    const comparePriceEls = comparePriceContainer.querySelectorAll(
      `s, del, .compare-at-price, compare-at-price ${
        possibleSelectors?.compare?.length
          ? `,${possibleSelectors.compare.join(',')}`
          : ''
      }`
    )

    // Update all sale prices
    priceElements.sale.forEach((priceEl) => {
      // Always update sale price
      updateDom(priceEl, price)

      if (compareAtPrice > 0) {
        // If there's a valid compare-at price, update it
        priceElements.compare.forEach((el) => {
          updateDom(el, compareAtPrice)
        })
        // if (comparePriceEls && comparePriceEls.length > 0) {
        // }
      } else {
        updateDom(priceEl, price) // fallback
      }
    })

    // Update all badges
    if (discountAmount > 0) {
      priceElements.badges.forEach((badgeEl) => {
        const badgeText = badgeEl.textContent?.trim()
        if (!badgeText) return

        const hasPercentage = badgeText.includes('%')
        const hasPrice =
          /[a-zA-Z]*\d+\.?\d*/.test(badgeText) && !badgeText.includes('%')
        // if (badgeEl.dataset.updated) return
        if (hasPercentage) {
          const newText = `${discountPercentage}%`
          badgeEl.textContent = updateBadgeText(badgeText, newText)
          badgeEl.dataset.updated = 'true'
        } else if (hasPrice) {
          const newText = formatedPriceWithCurrency(
            parseFloat(discountAmount) * 100
          )
          badgeEl.textContent = updateBadgeText(badgeText, newText)
          badgeEl.dataset.updated = 'true'
        }
      })
    }

    // Update all sale prices if compare price exists
    // if (compareAtPrice > 0) {
    //   // Then update the sale price
    //   priceElements.sale.forEach((priceEl) => {
    //     updateDom(priceEl, price)
    //   })

    //   // Add sale class to parent
    //   // updateSaleClass(priceElements.container, true)
    // } else {
    //   // Remove sale class if no sale price
    //   // updateSaleClass(priceElements.container, false)
    // }
    requestAnimationFrame(() => {
      revealPriceElements(priceElements)
    })
  }

  function subscribeSellingPlane(
    matchedProduct,
    testPrice,
    products,
    variantId
  ) {
    const selectedPlanId = sellingObj?.value
    const selectedSellingPlan = matchedProduct?.sellingPlan?.find(
      (plan) => plan?.id?.split('/').pop() === selectedPlanId
    )
    const sellingDiscount = selectedSellingPlan?.percentage

    const price = sellingDiscount
      ? testPrice - (testPrice * sellingDiscount) / 100
      : testPrice
    const productToUpdate = products.find(
      (product) => product.variantId == variantId
    )
    if (productToUpdate) {
      productToUpdate.sellingPrice = price
      productToUpdate.isSellingPlanEnable = true
      productToUpdate.sellingDiscount = sellingDiscount
    }
    return price
  }

  // Helper function to update sale class

  function updateSingleProductPrice(variantId) {
    const url = window.location.href
    const handle = url?.split('/')?.pop()?.split('?')[0]

    const matchedProduct = products
      .filter((p) => p?.experimentType == 'price_testing')
      .find((product) => {
        return product.variantId == variantId
          ? true
          : product.productHandle == handle && product.variantName == variantId
      })

    if (!matchedProduct) {
      console.warn('Active variant not found in products list.')
      revealAllHiddenClasses()
      return
    }

    const {
      price,
      compareAtPrice,
      discountAmount,
      discountPercentage,
      productHandle
    } = matchedProduct

    // const productContainer = document.querySelectorAll(
    //   possibleSelectors.singleProductContainer.join(',')
    // )
    const productContainer = document.querySelectorAll(
      possibleSelectors.singleProductContainer.join(',')
    )
    if (!productContainer) return

    // if (sellingObj?.isToggleOn) {
    //   price = subscribeSellingPlane(matchedProduct, price, products, variantId)
    // }
    // Find and update price elements

    for (const container of productContainer) {
      const priceElements = findPriceElements(container)
      hidePriceElements(priceElements)
      updatePriceElements(
        priceElements,
        price,
        compareAtPrice,
        discountAmount,
        discountPercentage
      )
      // updateProductPricesOnCard()
      // if (productCardContainer) {
      //   const anchor = productCardContainer.querySelector(
      //     `a[href*="/products/${productHandle}"]`
      //   )
      //   if (anchor) {
      //     const priceElements = findPriceElements(container)
      //     hidePriceElements(priceElements)
      //     updatePriceElements(
      //       priceElements,
      //       price,
      //       compareAtPrice,
      //       discountAmount,
      //       discountPercentage
      //     )
      //   }
      // }
      // else {
      //   const priceElements = findPriceElements(container)
      //   hidePriceElements(priceElements)
      //   updatePriceElements(
      //     priceElements,
      //     price,
      //     compareAtPrice,
      //     discountAmount,
      //     discountPercentage
      //   )
      // }
    }
  }

  // Function to update a single product card with specific product data
  // function updateSingleProductCard(container, product) {
  //   const {
  //     productHandle,
  //     variantId,
  //     price,
  //     compareAtPrice,
  //     discountAmount,
  //     discountPercentage
  //   } = product

  //   consoleLog(
  //     `Updating single product card for ${productHandle} with price ${price}`
  //   )

  //   // Find the anchor link for this product
  //   const anchor = container.querySelector(
  //     `a[href*="/products/${productHandle}"]`
  //   )
  //   if (!anchor) {
  //     consoleLog(`No anchor found for ${productHandle} in container`)
  //     return
  //   }

  //   // Update the anchor URL with the variant ID
  //   if (anchor.tagName === 'A') {
  //     try {
  //       const currentHref = new URL(anchor.href, window.location.origin)
  //       currentHref.searchParams.set('variant', variantId)
  //       anchor.href = currentHref.toString()
  //     } catch (error) {
  //       consoleLog(`Error updating anchor href for ${productHandle}:`, error)
  //     }
  //   }

  //   // Find and update price elements
  //   const priceElements = findPriceElements(container)

  //   // Update main product price
  //   updatePriceElements(
  //     priceElements,
  //     price,
  //     compareAtPrice,
  //     discountAmount,
  //     discountPercentage
  //   )

  //   // Update variant prices if container exists
  //   updateVariantPricesOnCard(container, productHandle)
  // }

  const sortCatalogProducts = () => {
    const groupedByHandle = {}
    const filteredProducts = products?.filter(
      (p) => p?.experimentType == 'price_testing'
    )
    for (const product of filteredProducts) {
      const normalizedHandle = product.productHandle.trim().toLowerCase()
      if (
        !groupedByHandle[normalizedHandle] ||
        parseFloat(product.price) <
          parseFloat(groupedByHandle[normalizedHandle].price)
      ) {
        groupedByHandle[normalizedHandle] = product
      }
    }
    const lowestPriceVariants = Object.values(groupedByHandle)
    return lowestPriceVariants
  }
  const updateVariantPricesOnCard = (productContainer, productHandle) => {
    // Update variant prices on this specific card
    const variantLabels = productContainer.querySelectorAll('.js-label-option')
    // productContainer.querySelectorAll('.js-option-price')

    variantLabels.forEach((variantLabel) => {
      const input = variantLabel.querySelector('input[type="radio"]')
      if (!input) return

      const variantValue = input.value // e.g., "50 mL", "100 mL"

      // Find matching product variant for this specific variant
      const matchingVariant = products.find((product) => {
        return (
          product.productHandle === productHandle &&
          product.variantName === variantValue
        )
      })

      if (!matchingVariant) {
        consoleLog(
          `No matching variant found for ${productHandle} - ${variantValue}`
        )
        return
      }

      const {
        price: variantPrice,
        compareAtPrice: variantCompareAtPrice,
        discountAmount: variantDiscountAmount,
        discountPercentage: variantDiscountPercentage
      } = matchingVariant

      // Update the variant price span directly
      if (variantPrice) {
        const formattedPrice = formatedPriceWithCurrency(
          parseFloat(variantPrice) * 100
        )
        const priceSpan = variantLabel.querySelector('.js-option-price')
        priceSpan.textContent = formattedPrice

        // Update data attributes if they exist
        if (priceSpan.dataset.originalPrice) {
          priceSpan.dataset.originalPrice = formattedPrice
        }

        consoleLog(
          `Updated variant price for ${productHandle} - ${variantValue}: ${formattedPrice}`
        )
      }
    })
  }
  function processAnchor(anchor, product, container) {
    const {
      productHandle,
      variantId,
      price,
      compareAtPrice,
      discountAmount,
      discountPercentage
    } = product

    const href = anchor.href || anchor.getAttribute('href')
    const url = new URL(href, window.location.origin)

    // Verify correct product match
    const pathSegments = url.pathname.split('/')
    const productsIndex = pathSegments.indexOf('products')
    const isValidProduct =
      productsIndex !== -1 &&
      productsIndex + 1 < pathSegments.length &&
      pathSegments[productsIndex + 1] === productHandle
    if (!isValidProduct) return

    // Update anchor with variantId
    if (anchor.tagName === 'A') {
      const currentHref = new URL(anchor.href, window.location.origin)
      currentHref.searchParams.set('variant', variantId)
      anchor.href = currentHref.toString()
    }

    // Update price elements
    const priceElements = findPriceElements(container)
    updatePriceElements(
      priceElements,
      price,
      compareAtPrice,
      discountAmount,
      discountPercentage
    )

    // Sync variant prices on card
    updateVariantPricesOnCard(container, productHandle)
  }
  function updateProductPricesOnCard() {
    // Guard clause: no products
    if (!products || !products.length) {
      console.warn('No products available.')
      revealAllHiddenClasses()
      return
    }

    const productContainers = document.querySelectorAll(
      possibleSelectors.productCardContainer.join(',')
    )
    const sortedProducts = sortCatalogProducts()

    sortedProducts.forEach((product) => {
      const { productHandle } = product

      productContainers.forEach((container) => {
        const anchors = container.querySelectorAll(
          `a[href*="/products/${productHandle}"]`
        )
        if (!anchors.length) return

        anchors.forEach((anchor) => {
          processAnchor(anchor, product, container)
        })
      })
    })
  }

  function updateProductPrices(variantId = null) {
    if (!products || !products.length) {
      console.warn('No products available.')
      revealAllHiddenClasses()
      return
    }
    // sellingPlanHandler()
    if (variantId) {
      // On product page, try to update single product price first
      updateSingleProductPrice(variantId)
    } else if (window.location.pathname.includes('/products/')) {
      const urlParams = new URLSearchParams(window.location.search)
      const variantFromURL = urlParams.get('variant')
      let variantId = variantFromURL ?? firstVariant_product
      updateSingleProductPrice(variantId)
    } else {
      updateProductPricesOnCard()
    }
  }

  // finding single product path
  function isProductPage() {
    return window.location.pathname.includes('/products/')
  }

  function isInMainProductBlock(el) {
    // Checks if this price element is part of the main product's purchase form
    return !!el.closest('form[action^="/cart/add"]')
  }

  // update hydrozen theme prices
  function updateHydrozenThemePrices() {
    if (!Array.isArray(products)) return

    // const activeGroupProducts = testingProducts?.filter(
    //   (p) => p.testId == activeTestId
    // )

    products
      ?.filter((p) => p?.experimentType == 'price_testing')
      .forEach(({ productId, price, compareAtPrice }) => {
        const selector = `product-price[data-product-id="${productId}"]`

        document.querySelectorAll(selector).forEach((productPriceEl) => {
          // Remove existing replacement if it exists (prevents duplicates)
          const priceSpan = productPriceEl.querySelector('.price')
          if (!priceSpan) return

          // Compose price HTML with compareAtPrice if exists
          // const compareHtml =
          //   compareAtPrice && parseFloat(compareAtPrice) > 0
          //     ? `<s style="color:#888; margin-right:10px;">Tk ${parseFloat(compareAtPrice).toFixed(2)}</s> `
          //     : '';

          priceSpan.innerHTML = formatedPriceWithCurrency(
            parseFloat(price) * 100
          )

          // Also find and remove or update the separate compare-at-price element if it exists
          const compareEl = productPriceEl.querySelector('.compare-at-price')
          if (compareEl) {
            if (compareAtPrice && parseFloat(compareAtPrice) > 0) {
              // Update the compare-at-price text
              compareEl.textContent = formatedPriceWithCurrency(
                parseFloat(compareAtPrice) * 100
              )
            } else {
              // Or remove it if no valid compareAtPrice
              compareEl.remove()
            }
          }

          // console.log(`✅ Overridden price for product ${productId}`);
        })
      })
  }

  // ✅ Update catalog grid prices
  function updateHydrozenCatalogPrices() {
    if (!Array.isArray(products)) return

    products
      ?.filter((p) => p?.experimentType == 'price_testing')
      .forEach(({ productId, price, compareAtPrice }) => {
        const selector = `product-price[data-product-id="${productId}"]`

        document.querySelectorAll(selector).forEach((el) => {
          // ❌ Skip if this is the main product price block
          if (isProductPage() && isInMainProductBlock(el)) return

          const priceSpan = el.querySelector('.price')
          if (priceSpan) {
            priceSpan.innerHTML = formatedPriceWithCurrency(
              parseFloat(price) * 100
            )
          }

          const compareEl = el.querySelector('.compare-at-price')
          if (compareEl) {
            if (compareAtPrice && parseFloat(compareAtPrice) > 0) {
              compareEl.textContent = formatedPriceWithCurrency(
                parseFloat(compareAtPrice) * 100
              )
            } else {
              compareEl.remove()
            }
          }
        })
      })
  }

  // ✅ Update price on product page (variant-specific)
  function updateHydrozenProductPagePrices() {
    const variantId = new URLSearchParams(location.search).get('variant')
    if (!variantId) return

    const matched = products
      ?.filter((p) => p?.experimentType == 'price_testing')
      .find((p) => String(p.variantId) === String(variantId))
    if (!matched) return

    const selector = `product-price[data-product-id="${matched.productId}"]`

    let attempts = 0
    const maxAttempts = 10

    const updateLoop = () => {
      const productPriceEls = document.querySelectorAll(selector)
      if (!productPriceEls.length && attempts < maxAttempts) {
        attempts++
        return setTimeout(updateLoop, 200)
      }

      productPriceEls.forEach((el) => {
        const priceSpan = el.querySelector('.price')
        const compareEl = el.querySelector('.compare-at-price')

        if (priceSpan) {
          priceSpan.innerHTML = formatedPriceWithCurrency(
            parseFloat(matched.price) * 100
          )
        }
        if (compareEl) {
          if (
            matched.compareAtPrice &&
            parseFloat(matched.compareAtPrice) > 0
          ) {
            compareEl.textContent = formatedPriceWithCurrency(
              parseFloat(matched.compareAtPrice) * 100
            )
          } else {
            compareEl.remove()
          }
        }
      })

      // Check again after delay — in case Shopify overwrites us
      if (attempts < maxAttempts) {
        attempts++
        setTimeout(updateLoop, 300)
      }
    }

    updateLoop()
  }

  // ✅ Unified price updater
  function updateHydrozenThemePrices() {
    if (isProductPage()) {
      updateHydrozenProductPagePrices()
      updateHydrozenCatalogPrices() // In case product page has related products
    } else {
      updateHydrozenCatalogPrices()
    }
  }

  function debounce(fn, delay) {
    let timeout
    return () => {
      clearTimeout(timeout)
      timeout = setTimeout(fn, delay)
    }
  }

  function startHydrozenPriceOverride() {
    const debouncedUpdate = debounce(() => {
      updateHydrozenThemePrices()
    }, 500)

    debouncedUpdate() // Initial run

    // Watch for DOM changes once
    const observer = new MutationObserver(debouncedUpdate)
    observer.observe(document.body, { childList: true, subtree: true })

    // Optional: stop observing after a while (e.g., 10 seconds)
    setTimeout(() => observer.disconnect(), 10000)
  }

  function waitForProductPriceAndRun() {
    // const waitInterval = setInterval(() => {
    //   // No product page check here anymore

    // }, 300);
    const target = document.querySelector('product-price')
    if (target) {
      consoleLog('[DEBUG] product-price found, running price override')
      // clearInterval(waitInterval);

      if (document.readyState === 'loading') {
        document.addEventListener(
          'DOMContentLoaded',
          startHydrozenPriceOverride
        )
      } else {
        startHydrozenPriceOverride()
      }
    }
  }

  // Description testing

  function updateDescription(variantId, productDescription) {
    const verifyProductPage = window.location.pathname.includes('/products/')
    if (!verifyProductPage) return
    const variantIdFromUrl = new URLSearchParams(window.location.search).get(
      'variant'
    )
    const detectedVariantId = variantIdFromUrl ?? firstVariant_product
    const truncateToThreeLines = (htmlText, maxLength = 338) => {
      // Create a temporary div to parse HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlText

      // Get plain text content
      const plainText = tempDiv.textContent || tempDiv.innerText || ''

      if (plainText.length <= maxLength) return htmlText

      // Find the last complete sentence within the limit
      const truncated = plainText.substring(0, maxLength)
      const lastSentenceEnd = Math.max(
        truncated.lastIndexOf('.'),
        truncated.lastIndexOf('!'),
        truncated.lastIndexOf('?')
      )

      let cutPoint = maxLength
      if (lastSentenceEnd > maxLength * 0.6) {
        cutPoint = lastSentenceEnd + 1
      } else {
        // If no good sentence break, cut at word boundary
        const lastSpace = truncated.lastIndexOf(' ')
        cutPoint = lastSpace > maxLength * 0.7 ? lastSpace : maxLength
      }

      // Now we need to find the corresponding position in the HTML
      let htmlPosition = 0
      let textPosition = 0
      let inTag = false

      for (let i = 0; i < htmlText.length && textPosition < cutPoint; i++) {
        if (htmlText[i] === '<') {
          inTag = true
        } else if (htmlText[i] === '>') {
          inTag = false
        } else if (!inTag) {
          textPosition++
        }
        htmlPosition = i + 1
      }

      // Extract the truncated HTML and add ellipsis if needed
      let truncatedHtml = htmlText.substring(0, htmlPosition)
      if (cutPoint < plainText.length) {
        truncatedHtml
        // truncatedHtml += '...'
      }

      return truncatedHtml
    }

    if (variantId === detectedVariantId) {
      const descriptionContainer = document.querySelector(
        selectors?.textClassOrId
      )
      if (!descriptionContainer) return

      const descriptionSummarySelector =
        descriptionContainer.querySelector('summary')

      // Clone summary before clearing container
      const copySummaryDiv = descriptionSummarySelector
        ? descriptionSummarySelector.cloneNode(true)
        : null

      // Clear container content
      descriptionContainer.innerHTML = ''

      if (copySummaryDiv) {
        const truncatedDescription = truncateToThreeLines(productDescription)

        const existingParagraph = copySummaryDiv.querySelector('p')
        const readMoreButton = copySummaryDiv.querySelector('.js-pdp-read-more')

        if (existingParagraph && readMoreButton) {
          // Preserve "Read More" button
          existingParagraph.innerHTML =
            truncatedDescription + readMoreButton.outerHTML
        } else {
          // Just insert truncated description
          copySummaryDiv.innerHTML = truncatedDescription
        }

        descriptionContainer.appendChild(copySummaryDiv)
      }

      // Always append full description
      const fullDescriptionDiv = document.createElement('div')
      fullDescriptionDiv.className = 'product-description-full'
      fullDescriptionDiv.innerHTML = productDescription
      descriptionContainer.appendChild(fullDescriptionDiv)
    }
  }

  // ✅ Track variant URL changes
  function onVariantUrlChange(callback) {
    const pushState = history.pushState
    const replaceState = history.replaceState

    function trigger() {
      setTimeout(callback, 300) // let DOM update
    }

    history.pushState = function () {
      pushState.apply(history, arguments)
      trigger()
    }

    history.replaceState = function () {
      replaceState.apply(history, arguments)
      trigger()
    }

    window.addEventListener('popstate', trigger)
  }

  function getUTMParams() {
    const urlParams = new URLSearchParams(window.location.search)
    const referrer = document.referrer || ''
    const landingPage = window.location.href

    return {
      source: urlParams.get('utm_source') || '',
      medium: urlParams.get('utm_medium') || '',
      campaign: urlParams.get('utm_campaign') || '',
      content: urlParams.get('utm_content') || '',
      term: urlParams.get('utm_term') || '',
      referrer,
      landing_page: landingPage
    }
  }

  function isUTMAllowed(experiment) {
    if (!experiment.isActiveUTM) return true // If UTM logic is not active, allow by default

    const utmParams = getUTMParams()
    if (
      !utmParams ||
      !utmParams.source ||
      !utmParams.medium ||
      !utmParams.campaign
    ) {
      return false
    }
    for (const utmRule of experiment.utmRules) {
      const match =
        (utmRule.source ? utmRule.source === utmParams.source : true) &&
        (utmRule.medium ? utmRule.medium === utmParams.medium : true) &&
        (utmRule.campaign ? utmRule.campaign === utmParams.campaign : true) &&
        (utmRule.content ? utmRule.content === utmParams.content : true) &&
        (utmRule.term ? utmRule.term === utmParams.term : true)

      if (match) {
        return utmRule.action === 'enable' // Allow test if action is "enable"
      }
    }
    return false
  }

  // function distributeUserToTest(experiment) {
  //   // Generate a random number between 0 and 100
  //   const randomNumber = Math.random() * 100
  //   let cumulativePercentage = 0

  //   // Find which test the user should be assigned to based on allocation percentages
  //   for (const test of experiment.tests) {
  //     cumulativePercentage += parseFloat(test.allocation)
  //     if (randomNumber <= cumulativePercentage) {
  //       return test
  //     }
  //   }

  //   // If no test is assigned (shouldn't happen if allocations sum to 100), return control group
  //   return { id: experiment.controlGroup }
  // }
  function hashStringToFloat(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash |= 0 // Convert to 32bit integer
    }

    // Convert hash to a float between 0 and 1
    return Math.abs(hash) / 0xffffffff
  }

  const distributeUserToTest = async (experiment) => {
    let userSession
    try {
      userSession = JSON.parse(localStorage.getItem('signal_user_session'))
    } catch (e) {
      console.warn('Error parsing user session:', e)
      return { testId: experiment.controlGroup, name: 'Control' }
    }

    // Fallback to control group if no user ID
    if (!userSession?.clientId) {
      return { testId: experiment.controlGroup, name: 'Control' }
    }
    const response = await fetch(
      'https://public-api.testsignal.com/api/v1/app/store-user/assign-test',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          skip_zrok_interstitial: 'true'
        },
        body: JSON.stringify({
          userId: userSession.clientId,
          experiment,
          si_size: 10
        })
      }
    )
    const result = await response.json()
    if (result.success) {
      return result.data
    }

    // const hashValue = hashStringToFloat(userSession.clientId) * 100
    // let cumulativePercentage = 0

    // for (const test of experiment.tests) {
    //   cumulativePercentage += parseFloat(test.allocation)
    //   if (hashValue <= cumulativePercentage) {
    //     return { ...test, hashValue }
    //   }
    // }

    return { testId: experiment.controlGroup, name: 'Control' }
  }

  const runTestBasedOnType = (type, newProducts, expData) => {
    switch (type) {
      case 'price_testing':
        updateProductPrices()
        break
      case 'image_testing':
        for (const product of newProducts) {
          updateProductImages(
            product?.productId,
            product?.productHandle,
            product?.imageUrl,
            true
          )
        }
        break
      case 'description_testing':
        for (const product of newProducts) {
          updateDescription(product.variantId, product.productDescription)
        }
        break
      case 'shipping_testing':
        shippingExp = expData
        break

      default:
        break
    }
  }

  const experimentWithTest = (experiment, testId) => {
    return {
      id: experiment.id,
      name: experiment.name,
      experimentType: experiment.experimentType,
      testId: testId
    }
  }

  async function switchTestByUser(experiment, experiments) {
    const now = Date.now()

    let experimentFound = false
    if (experiments?.length == 0) {
      localStorage.removeItem('signal_active_experiments')
      consoleLog(
        '%cNo active experiment found. Resetting prices.',
        'color: red;'
      )
      return
    }
    // if (experiment.status !== 'active') return

    const startDate = new Date(experiment?.startDate).getTime()
    const endDate = new Date(experiment?.endDate).getTime()

    const ignoreTest = () => {
      localStorage.removeItem('signal_active_experiments')
      removeStorage(experiment.id, 'active_ts')
      removeStorage(experiment.id, 'last_ts_switch')
      removeStorage(experiment.id, 'next_ts_time')

      const newProducts = applyTestPrices(experiment, experiment?.controlGroup)
      products.push(...newProducts)
      const activeExpData = experimentWithTest(
        experiment,
        experiment?.controlGroup
      )
      runTestBasedOnType(experiment?.experimentType, newProducts, activeExpData)
    }
    const trouthy = endDate
      ? now >= startDate && now <= endDate
      : now >= startDate

    if (trouthy) {
      experimentFound = true
      if (!isUTMAllowed(experiment)) {
        consoleLog('%cUTM rule disabled this test. Skipping...', 'color: gray;')
        ignoreTest()
        return
      }

      // Get or assign user to a test
      let activeTest = getStorage(experiment.id, 'active_ts')
      let activeTestName = getStorage(experiment.id, 'active_ts_name')

      if (!activeTest) {
        try {
          const assignedTest = await distributeUserToTest(experiment)

          activeTest = assignedTest.testId
          activeTestName = assignedTest.name
          const activeTestHashValue = assignedTest.hashValue
          setStorage(experiment.id, 'active_ts', activeTest)
          setStorage(
            experiment.id,
            'active_ts_name',
            `${activeTestName} (${activeTestHashValue || 'N/A'})`
          )
        } catch (error) {
          console.error('Error assigning user to test:', error)
          // Fallback to control group
          activeTest = experiment.controlGroup
          activeTestName = 'Control'
          setStorage(experiment.id, 'active_ts', activeTest)
          setStorage(experiment.id, 'active_ts_name', activeTestName)
        }
      }

      // Store active experiment data in local storage for web pixel

      // Store active experiment data in local storage for web pixel
      if (experiment?.experimentType != 'theme_testing') {
        console.log(
          `%cUser assigned to test: ${activeTestName} of ${experiment.name}`,
          'color: lightgreen; font-weight:bold;'
        )
      } else {
        console.log(
          `%cTheme Testing running of (${experiment.name})`,
          'color: lightgreen; font-weight:bold;'
        )
      }

      const utmParams = getUTMParams()
      const newProducts = applyTestPrices(experiment, activeTest)
      products.push(...newProducts)
      const activeExpData = experimentWithTest(experiment, activeTest)
      storeExperimentData(experiments, products, utmParams)
      runTestBasedOnType(experiment?.experimentType, newProducts, activeExpData)

      // Schedule reset at experiment end
      let resetTime = new Date(endDate).getTime() - now
      if (resetTime > 0) {
        setTimeout(() => {
          console.clear()
          console.log(
            '%cTest period is over. Resetting everything.',
            'color: red; font-weight: bold;'
          )
          ignoreTest()
        }, resetTime)
      }
    } else {
      consoleLog('Experiment ended')
      ignoreTest()
    }

    if (!experimentFound) {
      localStorage.removeItem('signal_active_experiments')
      console.clear()
      console.log(
        '%cNo active experiment found. Resetting prices.',
        'color: red;'
      )
      ignoreTest()
    }
  }

  function scheduleNextTest(testIntervals, experiment, endDate) {
    if (!testIntervals.length) return

    const now = Date.now()
    let currentTest = null

    // Loop through all intervals that are ready to run
    while (
      testIntervals.length &&
      new Date(testIntervals[0].time).getTime() <= now
    ) {
      currentTest = testIntervals.shift()
    }

    if (currentTest && isUTMAllowed(experiment)) {
      const lastSwitch = parseInt(
        getStorage(experiment.id, 'last_ts_switch') || 0,
        10
      )
      if (now - lastSwitch > 1000) {
        setStorage(experiment.id, 'active_ts', currentTest.id)
        setStorage(experiment.id, 'last_ts_switch', now)
        console.log(
          `%cCurrently Running(Timebased): ${
            currentTest?.name ? `(${currentTest?.name})` : ''
          } of ${experiment.name}`,
          'color: lightgreen; font-weight: bold;'
        )

        const newProducts = applyTestPrices(experiment, currentTest.id)
        const activeExpData = experimentWithTest(experiment, currentTest.id)
        products.push(...newProducts)
        runTestBasedOnType(
          experiment?.experimentType,
          newProducts,
          activeExpData
        )
      }
    }

    // Now setup the next test timer if any
    if (testIntervals.length) {
      const nextTest = testIntervals[0]
      const nextTestTime = new Date(nextTest.time).getTime()

      console.log(
        `%cNext Test(Timebased): ${nextTest?.name} of ${
          experiment?.name
        } (scheduled for ${new Date(nextTestTime).toLocaleString()})`,
        'color: orange; font-weight: bold;'
      )

      setStorage(experiment.id, 'next_ts_time', nextTestTime)

      const timer = setTimeout(() => {
        // if (isUTMAllowed(experiment)) {
        //   setStorage(experiment.id, 'active_ts', nextTest.id)
        //   setStorage(experiment.id, 'last_ts_switch', Date.now())

        //   const newProducts = applyTestPrices(experiment, nextTest.id)
        //   products.push(...newProducts)
        //   runTestBasedOnType(experiment?.experimentType, newProducts)
        // }

        scheduleNextTest(testIntervals, experiment, endDate)
      }, nextTestTime - now)

      // Schedule reset at experiment end
      let resetTime = new Date(endDate).getTime() - now
      if (resetTime > 0) {
        setTimeout(() => {
          console.clear()
          console.log(
            '%cTest period is over. Resetting everything.',
            'color: red; font-weight: bold;'
          )
          removeStorage(experiment.id, 'active_ts')
          removeStorage(experiment.id, 'last_ts_switch')
          removeStorage(experiment.id, 'next_ts_time')

          const newProducts = applyTestPrices(
            experiment,
            experiment?.controlGroup
          )
          products.push(...newProducts)
          const activeExpData = experimentWithTest(
            experiment,
            experiment?.controlGroup
          )
          runTestBasedOnType(
            experiment?.experimentType,
            newProducts,
            activeExpData
          )

          clearTimeout(timer)
        }, resetTime)
      }
    }
  }

  function switchTest(experiment, experiments) {
    const now = Date.now()
    let experimentFound = false

    const startDate = new Date(experiment?.startDate).getTime()
    const endDate = new Date(experiment?.endDate).getTime()
    const ignoreTest = () => {
      localStorage.removeItem('signal_active_experiments')
      removeStorage(experiment.id, 'active_ts')
      removeStorage(experiment.id, 'last_ts_switch')
      removeStorage(experiment.id, 'next_ts_time')

      const newProducts = applyTestPrices(experiment, experiment?.controlGroup)
      products.push(...newProducts)
      const activeExpData = experimentWithTest(
        experiment,
        experiment?.controlGroup
      )
      runTestBasedOnType(experiment?.experimentType, newProducts, activeExpData)
    }
    if (now >= startDate && now <= endDate) {
      experimentFound = true
      if (!isUTMAllowed(experiment)) {
        console.log(
          '%cUTM rule disabled this test. Skipping...',
          'color: gray;'
        )
        ignoreTest()
        return
      }

      if (now >= startDate && now <= endDate && isUTMAllowed(experiment)) {
        // Store active experiment data in local storage for web pixel

        const utmParams = getUTMParams()
        storeExperimentData(experiments, products, utmParams)

        const duration = (endDate - startDate) / (1000 * 60)
        const testIntervals = []
        let cumulativeTime = startDate

        experiment?.tests.forEach((test) => {
          let allocation =
            (parseFloat(test.allocation) / 100) * duration * 60 * 1000
          testIntervals.push({
            id: test?.testId,
            time: cumulativeTime,
            name: test?.name
          })
          cumulativeTime += allocation
        })
        // console.log(
        //   `%cFound active experiment: ${experiment.name}`,
        //   'color: yellow; font-weight:bold;'
        // )
        scheduleNextTest(testIntervals, experiment, endDate)
      }
    } else {
      // Clear active experiment data when experiment ends
      ignoreTest()
    }

    if (!experimentFound) {
      // Clear active experiment data when no experiments are running
      localStorage.removeItem('signal_active_experiments')
      console.clear()
      console.log(
        '%cNo active experiment found. Resetting prices.',
        'color: red;'
      )

      ignoreTest()
    }
  }

  // ----------image testing code -----------------

  function updateImageOnNewThemeDetails(productId, imageUrl) {
    if (!imageUrl) {
      console.warn(`No image URL provided for product ${productId}`)
      return
    }

    const checkId = document.querySelector('media-gallery:not([id])')

    if (checkId) {
      // -------- Details Page Image Update --------
      const productContainer = document.querySelector(`
        [data-product-id="${productId}"],
        [data-productid="${productId}"],
        product-form[data-product-id="${productId}"]
      `)

      if (productContainer) {
        let mediaGallery = productContainer.querySelector('media-gallery')

        if (!mediaGallery) {
          const mediaSection =
            productContainer.closest('.product-information__grid') ||
            productContainer.closest('.product') ||
            productContainer.closest('.product-section')

          if (mediaSection) {
            mediaGallery = mediaSection.querySelector('media-gallery')
          }
        }

        if (mediaGallery) {
          const updateImage = (img) => {
            if (!img) return false
            img.src = imageUrl
            img.srcset = `${imageUrl} 1x`
            if (img.hasAttribute('data_max_resolution')) {
              img.setAttribute('data_max_resolution', imageUrl)
            }
            return true
          }

          let updatedCount = 0
          updatedCount += updateImage(
            mediaGallery.querySelector('slideshow-slide img')
          )
            ? 1
            : 0

          updatedCount += updateImage(
            mediaGallery.querySelector('.media-gallery__grid img')
          )
            ? 1
            : 0

          updatedCount += updateImage(
            mediaGallery.querySelector('.dialog-zoomed-gallery img')
          )
            ? 1
            : 0

          consoleLog(
            `✅ Updated ${updatedCount} images on details page for product ${productId}`
          )
        }
      }
      consoleLog(productContainer, 'not found')
    }
  }

  function updateImageOnNewThemeCategory(productId, imageUrl) {
    // -------- Grid View Image Update (always runs) --------
    const gridItem = document.querySelector(
      `li[data-product-id="${productId}"]`
    )

    if (gridItem) {
      const gridImg = gridItem.querySelector('.product-media__image')

      if (gridImg) {
        gridImg.src = imageUrl
        gridImg.srcset = `${imageUrl} 1x`
        if (gridImg.hasAttribute('data_max_resolution')) {
          gridImg.setAttribute('data_max_resolution', imageUrl)
        }
        // console.log(`✅ Updated grid view image for product ${productId}`)
      } else {
        // console.log(`⚠️ Grid image not found for product ${productId}`)

        const card = gridItem.querySelector('.card-gallery')
        if (!card) {
          // console.warn(
          //   `⚠️ .card-gallery not found inside gridItem for product ${productId}`
          // )
          return
        }

        // Check if the image already exists to avoid duplicates
        const existingImg = card.querySelector(`img[src="${imageUrl}"]`)
        if (existingImg) {
          // console.log(
          //   `ℹ️ Image already exists for product ${productId}, skipping append.`
          // )
          return
        }

        const image = document.createElement('img')
        image.src = imageUrl
        const selectTitle = document.querySelector('product-title')
        selectTitle.style.display = 'none'
        image.alt = 'Product image'
        card.appendChild(image)
        // console.log(
        //   `✅ Appended new image to .card-gallery for product ${productId}`
        // )
      }
    }
  }

  function updateProductImage(productId, imageUrl) {
    if (!productId || !imageUrl) {
      console.warn('⚠️ Missing required parameters: productId and imageUrl')
      return
    }

    // Find all product cards with this ID (could be in multiple sections)
    const productCards = document.querySelectorAll(
      `product-card-link[data-product-id="${productId}"],
     product-card[data-product-id="${productId}"]`
    )

    if (!productCards.length) {
      console.warn(`⚠️ No product cards found for product ${productId}`)
      return
    }

    productCards.forEach((productCard) => {
      try {
        // Try to find the gallery container
        const gallery = productCard.querySelector(
          `.card-gallery[data-product-id="${productId}"]`
        )

        if (!gallery) {
          console.warn(`⚠️ No gallery found for product ${productId}`)
          return
        }

        // Handle slideshow-based galleries (carousel section)
        const slideshow = gallery.querySelector('slideshow-component')
        if (slideshow) {
          const activeSlide =
            slideshow.querySelector('slideshow-slide[aria-hidden="false"]') ||
            slideshow.querySelector('slideshow-slide') // Fallback to first slide

          if (activeSlide) {
            const imgEl = activeSlide.querySelector('img.product-media__image')

            if (imgEl) {
              // Update existing image
              if (!imgEl.dataset.originalSrc) {
                imgEl.dataset.originalSrc = imgEl.src
                imgEl.dataset.originalSrcset = imgEl.srcset || ''
              }
              imgEl.src = imageUrl
              imgEl.srcset = `${imageUrl} 1x`
              if (imgEl.hasAttribute('data_max_resolution')) {
                imgEl.setAttribute('data_max_resolution', imageUrl)
              }
              consoleLog(`✅ Updated slideshow image for product ${productId}`)
            } else {
              // Create new image if none exists
              const newImg = document.createElement('img')
              newImg.src = imageUrl
              newImg.srcset = `${imageUrl} 1x`
              newImg.alt = 'Product Image'
              newImg.className = 'product-media__image'
              newImg.loading = 'lazy'
              activeSlide.appendChild(newImg)
              consoleLog(
                `✅ Created new slideshow image for product ${productId}`
              )
            }
          }
        }
        // Handle direct image injection (grid section)
        else {
          const existingImg = gallery.querySelector('img.product-media__image')
          const titlePlaceholder = gallery.querySelector(
            '.product-card-gallery__title-placeholder'
          )

          if (existingImg) {
            // Update existing image
            existingImg.src = imageUrl
            existingImg.style.objectFit = 'cover'
            existingImg.style.width = '100%'
            existingImg.style.height = '100%'
            if (titlePlaceholder) {
              titlePlaceholder.style.display = 'none'
            }
            consoleLog(`✅ Updated grid image for product ${productId}`)
          } else {
            // Create new image if none exists
            const newImg = document.createElement('img')
            newImg.src = imageUrl
            newImg.alt = 'Product Image'
            newImg.className = 'product-media__image'
            newImg.style.objectFit = 'cover'
            newImg.style.width = '100%'
            newImg.style.height = '100%'
            newImg.dataset.injected = 'true'
            gallery.style.height = '100%'

            if (titlePlaceholder) {
              titlePlaceholder.style.display = 'none'
            }

            gallery.appendChild(newImg)
            consoleLog(`✅ Created new grid image for product ${productId}`)
          }
        }
      } catch (err) {
        console.error(`❌ Error updating product ${productId} image:`, err)
      }
    })
  }

  function updateDetailsPageNoImage(productId, imageUrl) {
    const container = document.querySelector('.product-information__grid')
    const div = document.createElement('div')
    const imgElc = document.createElement('img')
    container.style.gridTemplateColumns =
      'var(--full-page-grid-margin) var(--full-page-grid-margin)'
    container.classList.remove('product-information__grid--half')
    imgElc.src = imageUrl
    div.appendChild(imgElc)
    container.appendChild(div)
  }

  function updateImageOnNewThemeSearch(productId, imageUrl) {
    const searchModals = document.querySelectorAll(
      '#search-modal, .search-modal'
    )

    searchModals.forEach((searchModal) => {
      const predictiveSearch = searchModal.querySelector('.predictive-search')
      if (!predictiveSearch) return

      // Use more comprehensive selectors to catch all instances
      const allProductCards = predictiveSearch.querySelectorAll(
        `[data-product-id="${productId}"], [data-product-handle*="${productId}"]`
      )

      allProductCards.forEach((card) => {
        const imgContainer = card.querySelector(
          '.resource-card__media, .card__media'
        )
        if (!imgContainer) return

        // Handle both img and placeholder cases
        let imgEl = imgContainer.querySelector('img')
        const placeholder = imgContainer.querySelector(
          '.resource-card__image-placeholder'
        )

        if (imageUrl) {
          if (!imgEl) {
            imgEl = document.createElement('img')
            imgEl.className = 'resource-card__image'
            imgEl.loading = 'lazy'
            imgContainer.appendChild(imgEl)
          }

          // Update image attributes
          imgEl.src = imageUrl
          imgEl.srcset = imageUrl
          imgEl.alt = 'Product Image'

          // Hide placeholder if exists
          if (placeholder) {
            placeholder.style.display = 'none'
          }
        } else {
          // If no imageUrl provided, show placeholder if exists
          if (placeholder) {
            placeholder.style.display = ''
            if (imgEl) {
              imgEl.remove()
            }
          } else if (imgEl && imgEl.dataset.originalSrc) {
            // Fall back to original src if available
            imgEl.src = imgEl.dataset.originalSrc
            imgEl.srcset = imgEl.dataset.originalSrc
          }
        }
      })

      observePredictiveSearch(productId, '', imageUrl, true)
    })
  }

  // Function to apply image testing changes on the storefront DOM
  function updateProductImages(productId, productHandle, imageUrl, isActive) {
    try {
      let didUpdate = false

      // --- Universal Safe Query Helpers ---
      const safeQuery = (selectors = [], root = document) => {
        for (const sel of selectors) {
          const el = root.querySelector(sel)
          if (el) return el
        }
        return null
      }

      const safeQueryAll = (selectors = [], root = document) => {
        for (const sel of selectors) {
          const els = root.querySelectorAll(sel)
          if (els.length) return els
        }
        return []
      }

      // --- Slideshow Image Update ---
      const slideShowContainer = document.querySelector('slideshow-container')
      if (slideShowContainer) {
        updateProductImage(productId, imageUrl)
        didUpdate = true
      }

      // --- Homepage Product Card ---
      const homepageProduct = document.querySelector(
        `product-card-link[data-product-id="${productId}"]`
      )
      if (homepageProduct) {
        updateProductImage(productId, imageUrl)
        didUpdate = true
      }

      // --- Predictive Search New Theme ---
      const searchModals = document.querySelectorAll(
        '#search-modal, .search-modal'
      )
      searchModals.forEach((searchModal) => {
        const modalContent = searchModal.querySelector('.search-modal__content')
        const productCard = searchModal.querySelector(
          `.predictive-search-results__card , product-card-link[data-product-id="${productId}"]`
        )

        // Ensure both modal structure and product exist (avoids false triggers on old theme)
        if (modalContent && productCard) {
          consoleLog('✅ New Theme Predictive Search Triggered')
          updateImageOnNewThemeSearch(productId, imageUrl)
          didUpdate = true
        }
      })

      // --- Enhanced Predictive Search (New Theme Specific) ---
      const predictiveSearches = document.querySelectorAll('.predictive-search')
      predictiveSearches.forEach((search) => {
        const hasNewThemeWrapper = search.querySelector(
          '.predictive-search-results__card'
        )
        const productNodes = search.querySelectorAll(
          `[data-product-id="${productId}"], product-card[data-handle*="${productHandle}"]`
        )

        // Only trigger if wrapper and product exist, meaning it's new theme
        if (hasNewThemeWrapper && productNodes.length) {
          consoleLog('✅ Enhanced Predictive Search (New Theme) Triggered')
          updateImageOnNewThemeSearch(productId, imageUrl)
          didUpdate = true
        }
      })

      // --- Grid Category Card ---
      const gridTarget = document.querySelector(
        `.card-gallery[data-product-id="${productId}"]`
      )
      if (gridTarget) {
        updateImageOnNewThemeCategory(productId, imageUrl)
        didUpdate = true
      }

      // --- Product Detail New Theme ---
      const mediaGallery = document.querySelector('media-gallery:not([id])')
      const detailsPageNoProductImage = document.querySelector(
        `.product-information__grid.product-information--media-none`
      )
      if (detailsPageNoProductImage) {
        const eProductId = document
          .querySelector('product-form-component')
          ?.getAttribute('data-product-id')
        if (eProductId == productId) {
          updateDetailsPageNoImage(productId, imageUrl)
          didUpdate = true
        }
      }
      if (mediaGallery) {
        updateImageOnNewThemeDetails(productId, imageUrl)
        didUpdate = true
      }

      // --- If newer theme handled, skip old structure logic ---
      if (didUpdate) return true

      // --- OLD THEME: Product Detail Image ---
      const matchedSelectors = singleProductContainer.filter((sel) =>
        document.querySelector(sel)
      )

      if (matchedSelectors.includes('product-page')) {
        const productContainers = safeQueryAll(
          imageSelectors.singleProductContainer
        )

        productContainers?.forEach((productContainer) => {
          const linkEl = productContainer.querySelector('a[href*="/products/"]')
          if (!linkEl) return
          const href = linkEl.getAttribute('href')
          const handleInHref = href.split('/').pop()?.split('?')[0]
          // console.log('handleHref', handleInHref)
          if (handleInHref !== productHandle) return

          matchedSelectors.forEach((sel) => {
            const container = document.querySelector(sel)
            if (!container) return

            let img = container.querySelector('picture img')

            if (img && imageUrl) {
              img.src = imageUrl
              img.removeAttribute('data-src')
              img.removeAttribute('data-srcset')
              img.removeAttribute('srcset')
              img.removeAttribute('sizes')
              img.loading = 'eager'
            }
            // console.log('imges', img)
          })

          let pictureImg = productContainer.querySelector('picture img')
          let flotingImg = productContainer.querySelector(
            'floating-product ul li img'
          )

          if (flotingImg) {
            flotingImg.style.display = 'none'
          }

          if (pictureImg && imageUrl) {
            pictureImg.src = imageUrl
          }
        })
      } else {
        const productContainers = safeQueryAll(
          imageSelectors.singleProductContainer
        )

        productContainers.forEach((productContainer) => {
          const linkEl = productContainer.querySelector('a[href*="/products/"]')
          if (!linkEl) return
          const href = linkEl.getAttribute('href')
          const handleInHref = href.split('/').pop()?.split('?')[0]

          if (handleInHref !== productHandle) return

          // console.log('productContainer', productContainer)

          let pictureImg = productContainer.querySelector('picture img')
          // console.log('picture', pictureImg)

          if (pictureImg && imageUrl) {
            pictureImg.src = imageUrl
          }

          let mediaList = safeQuery(['.product__media-list'], productContainer)
          if (!mediaList) {
            mediaList = document.createElement('ul')
            mediaList.className =
              'product__media-list contains-media grid grid--peek list-unstyled slider slider--mobile'
            mediaList.setAttribute('role', 'list')

            const wrapper =
              productContainer.querySelector('.product__media-wrapper') ||
              productContainer.querySelector('.grid__item')
            ;(wrapper || productContainer).appendChild(mediaList)
          }

          if (productContainer.classList.contains('product--no-media')) {
            productContainer.classList.remove('product--no-media')
            productContainer.classList.replace('grid--1-col', 'grid--2-col')
          }

          let imgEl = safeQuery(imageSelectors.singleProductImage, mediaList)
          // console.log('imgel', imgEl)
          if (!imgEl) {
            const mediaItem = document.createElement('li')
            mediaItem.className =
              'product__media-item grid__item slider__slide is-active scroll-trigger animate--fade-in'

            const mediaContainer = document.createElement('div')
            mediaContainer.className =
              'product-media-container media-type-image media-fit-contain global-media-settings gradient constrain-height'
            mediaContainer.style.setProperty('--ratio', '1.0')

            imgEl = document.createElement('img')
            imgEl.className = 'product__media media media--transparent'
            imgEl.style.objectFit = 'cover'
            imgEl.style.width = '100%'
            imgEl.style.height = '100%'

            mediaContainer.appendChild(imgEl)
            mediaItem.appendChild(mediaContainer)
            mediaList.appendChild(mediaItem)
          }

          if (!imgEl.dataset.originalSrc) {
            imgEl.dataset.originalSrc = imgEl.src || ''
            imgEl.dataset.originalSrcset = imgEl.srcset || ''
          }

          imgEl.src =
            isActive && imageUrl ? imageUrl : imgEl.dataset.originalSrc
          imgEl.srcset =
            isActive && imageUrl ? imageUrl : imgEl.dataset.originalSrcset
        })
      }

      // --- OLD THEME: Modal Image ---
      updateModalImage(productHandle, imageUrl, true)

      // --- OLD THEME: Grid/List Product Cards ---
      const cardContainers = safeQueryAll(imageSelectors.productCardContainer)
      // console.log('cardContainer', cardContainers)

      cardContainers.forEach((card) => {
        const linkEl = safeQuery(['a[href*="/products/"]'], card)
        if (!linkEl) return

        const href = linkEl.getAttribute('href')
        const handleInHref = href.split('/').pop()?.split('?')[0]
        // console.log('handleInHref', handleInHref)
        if (handleInHref !== productHandle) return

        const cardInner = safeQuery(imageSelectors.productCardInner, card)
        // console.log('cardInner', cardInner)
        if (!cardInner) return

        let imgEl
        let firstContentBlock
        let secondContentBlock

        if (cardInner && cardInner?.matches('picture')) {
          imgEl = cardInner.querySelector('img')
          // console.log('imgUrl', imageUrl)
          if (imgEl && imageUrl) {
            imgEl.src = imageUrl

            // Prevent lazy loader from overriding it
            imgEl.removeAttribute('data-src')
            imgEl.removeAttribute('data-srcset')
            imgEl.removeAttribute('srcset')
            imgEl.removeAttribute('sizes')
            imgEl.loading = 'eager'

            imgEl.dataset.injected = 'true'
            // console.log('imgEl', imgEl)
            return
          }
        } else {
          let mediaContainer = safeQuery(
            imageSelectors.productCardMediaContainer,
            card
          )
          let mediaDiv = mediaContainer
            ? safeQuery(imageSelectors.productCardMediaDiv, mediaContainer)
            : null

          imgEl = mediaDiv ? safeQuery(['img', 'picture img'], mediaDiv) : null

          const contentBlocks = card.querySelectorAll(
            imageSelectors.productCardContentBlocks
          )
          firstContentBlock = contentBlocks[0] || null
          secondContentBlock = contentBlocks[1] || null

          if (secondContentBlock) {
            secondContentBlock.style.display = 'block'
            const heading = safeQuery(
              imageSelectors.productCardHeading,
              secondContentBlock
            )
            if (heading) heading.style.display = 'block'
          }

          if (!imgEl && isActive && imageUrl) {
            if (!mediaContainer) {
              mediaContainer = document.createElement('div')
              mediaContainer.className = 'card__media'
              cardInner.prepend(mediaContainer)
            }

            const existingImages = card.querySelectorAll(
              'img:not([data-injected])'
            )
            existingImages.forEach((img) => {
              img.style.display = 'none'
            })

            const clickableWrapper = document.createElement('a')
            clickableWrapper.href = href
            clickableWrapper.className = 'card__media-link'
            clickableWrapper.setAttribute('aria-label', 'View product')

            mediaDiv = document.createElement('div')
            mediaDiv.className = 'media media--transparent'

            imgEl = document.createElement('img')
            imgEl.src = imageUrl
            imgEl.alt = 'Product Image'
            imgEl.className = 'motion-reduce'
            imgEl.loading = 'lazy'
            imgEl.dataset.injected = 'true'

            mediaDiv.appendChild(imgEl)
            clickableWrapper.appendChild(mediaDiv)
            mediaContainer.appendChild(clickableWrapper)

            if (firstContentBlock) firstContentBlock.style.display = 'none'
            return
          }

          if (imgEl) {
            if (!imgEl.dataset.originalSrc) {
              imgEl.dataset.originalSrc = imgEl.src
              imgEl.dataset.originalSrcset = imgEl.srcset || ''
            }

            if (isActive && imageUrl) {
              imgEl.src = imageUrl
              imgEl.srcset = imageUrl
              if (firstContentBlock) firstContentBlock.style.display = 'none'
            } else {
              if (imgEl.dataset.injected === 'true') {
                imgEl.remove()
                if (mediaDiv && !mediaDiv.hasChildNodes()) mediaDiv.remove()
              } else {
                imgEl.src = imgEl.dataset.originalSrc
                imgEl.srcset = imgEl.dataset.originalSrcset
              }
              if (firstContentBlock) firstContentBlock.style.display = 'block'
            }
          }
        }
      })

      // --- OLD THEME: Predictive Search Legacy ---
      const searchItems = safeQueryAll(imageSelectors.predictiveSearchItem)
      searchItems.forEach((item) => {
        const linkEl = item.querySelector('a[href*="/products/"]')
        if (!linkEl) return

        const href = linkEl.getAttribute('href')
        const handleInHref = href.split('/').pop()?.split('?')[0]
        if (handleInHref !== productHandle) return

        let imgEl = safeQuery(imageSelectors.predictiveSearchImage, item)

        if (!imgEl && isActive && imageUrl) {
          const imgContainer = document.createElement('div')
          imgContainer.style.cssText =
            'width:50px; height:50px; margin-right:15px; overflow:hidden; flex-shrink:0;'

          const newImg = document.createElement('img')
          newImg.src = imageUrl
          newImg.alt = 'Product Image'
          newImg.className = 'predictive-search__image'
          newImg.dataset.injected = 'true'
          newImg.style.cssText = 'width:100%; height:100%; object-fit:contain;'

          imgContainer.appendChild(newImg)
          item.style.display = 'flex'
          item.style.alignItems = 'center'
          linkEl.insertBefore(imgContainer, linkEl.firstChild)
          return
        }

        if (imgEl) {
          if (!imgEl.dataset.originalSrc) {
            imgEl.dataset.originalSrc = imgEl.src
            imgEl.dataset.originalSrcset = imgEl.srcset || ''
          }

          if (isActive && imageUrl) {
            imgEl.src = imageUrl
            imgEl.srcset = imageUrl
          } else {
            if (imgEl.dataset.injected === 'true') {
              imgEl.parentElement?.remove()
            } else {
              imgEl.src = imgEl.dataset.originalSrc
              imgEl.srcset = imgEl.dataset.originalSrcset
            }
          }
        }
      })

      // --- Attach Observer for Predictive Search Changes ---
      observePredictiveSearch(productId, productHandle, imageUrl, isActive)

      return true
    } catch (error) {
      console.error('❌ Error updating product images:', error)
      return false
    }
  }

  function observePredictiveSearch(
    productId,
    productHandle,
    imageUrl,
    isActive
  ) {
    const searchContainers = document.querySelectorAll(
      '.predictive-search, .search-modal__content'
    )

    if (!searchContainers.length) return

    searchContainers.forEach((container) => {
      let debounceTimer = null

      const isOldTheme = container.matches(
        '.predictive-search:not([data-testid])'
      )
      const isNewTheme = container.matches(
        '.predictive-search[data-testid="search-component--modal"], .search-modal__content'
      )

      const observer = new MutationObserver((mutations) => {
        if (isOldTheme) {
          // For older themes, update on any DOM mutation
          clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => {
            updateProductImages(productId, productHandle, imageUrl, isActive)
          }, 200)
        } else if (isNewTheme) {
          // For new themes, only update when relevant product nodes are added
          const hasProductUpdates = mutations.some((mutation) =>
            Array.from(mutation.addedNodes || []).some((node) => {
              if (!(node instanceof Element)) return false

              return (
                node.matches?.(`[data-product-id="${productId}"]`) ||
                node.querySelector?.(`[data-product-id="${productId}"]`)
              )
            })
          )

          if (hasProductUpdates) {
            clearTimeout(debounceTimer)
            debounceTimer = setTimeout(() => {
              updateImageOnNewThemeSearch(productId, imageUrl)
            }, 200)
          }
        }
      })

      observer.observe(container, {
        childList: true,
        subtree: true
      })
    })
  }

  function updateModalImage(productHandle, testImageUrl, isActive) {
    if (!productHandle) return

    const modals = document.querySelectorAll(
      'product-modal, .product-media-modal'
    )
    modals.forEach((modal) => {
      const modalImg = modal.querySelector('img')
      if (!modalImg) {
        // console.log('No modal image found in', modal)
        return
      }

      if (!modalImg.dataset.originalSrc) {
        modalImg.dataset.originalSrc = modalImg.src
        modalImg.dataset.originalSrcset = modalImg.srcset || ''
      }

      const pathParts = window.location.pathname.split('/')
      const currentHandle = pathParts.includes('products')
        ? pathParts[pathParts.indexOf('products') + 1]
        : null

      if (!productHandle || currentHandle !== productHandle) {
        consoleLog(
          `Skipping modal update: current handle (${currentHandle}) vs productHandle (${productHandle})`
        )
        return
      }

      modalImg.src = isActive ? testImageUrl : modalImg.dataset.originalSrc
      modalImg.srcset = isActive
        ? testImageUrl
        : modalImg.dataset.originalSrcset

      consoleLog(`✅ Modal image updated for productHandle=${productHandle}`)
    })
  }

  function setupPriceContainerObserver() {
    let isUpdating = false
    let updateTimeout = null

    const observer = new MutationObserver((mutations) => {
      // Skip if we're already in an update cycle
      if (isUpdating) return

      let hasPriceChanges = false
      let containersToHide = new Set()

      const priceClasses = [
        // ...flicker_selectors,
        ...possibleSelectors.compare,
        ...possibleSelectors.sale,
        ...possibleSelectors.badges
        // '.price',
        // '.price_inner',
        // '.price-regular-value',
        // '.price-sale-value',
        // '.price__regular',
        // '.price__sale',
        // '.price__badge',
        // '.compare-at-price',
        // 's',
        // 'del',
        // '.price-item',
        // '.price__container',
        // '.price-compare'
      ]
      const containerClasses = [
        ...flicker_selectors
        // '.price',
        // '.price_inner'
        // '.product-card',
        // '.card-wrapper',
        // '.grid-view-item',
        // '[id*="price-template"]'
        // 'product-page',
        // 'product-card'
      ]

      mutations.forEach((mutation) => {
        // Check for removed nodes that are price-related
        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const isPriceElement =
                node.matches &&
                (node.matches(priceClasses.join(',')) ||
                  (node.querySelector &&
                    node.querySelector(priceClasses.join(','))))

              if (isPriceElement) {
                hasPriceChanges = true
                const container = node.closest(containerClasses.join(','))
                if (container) {
                  containersToHide.add(container)
                }
              }
            }
          })
        }

        // Check for added nodes that are price-related
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const isPriceElement =
                node.matches &&
                (node.matches(priceClasses.join(',')) ||
                  (node.querySelector &&
                    node.querySelector(priceClasses.join(','))))

              if (isPriceElement) {
                hasPriceChanges = true
                const container = node.closest(containerClasses.join(','))
                if (container) {
                  containersToHide.add(container)
                }
              }
            }
          })
        }
      })

      // If we detected price changes, handle them intelligently
      if (hasPriceChanges && containersToHide.size > 0) {
        isUpdating = true

        // Clear any existing timeout
        if (updateTimeout) {
          clearTimeout(updateTimeout)
        }

        // Hide all affected containers
        containersToHide.forEach((container) => {
          if (!container.classList.contains('signal-hide-container')) {
            container.classList.add('signal-hide-container')
          }
        })

        // Set a longer timeout to allow for Shopify's DOM replacement cycle
        updateTimeout = setTimeout(() => {
          containersToHide.forEach((container) => {
            container.classList.remove('signal-hide-container')
          })
          isUpdating = false
          updateTimeout = null
        }, 600) // Increased delay to handle Shopify's DOM replacement
      }
    })

    // Start observing the entire document for price container changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return observer
  }

  function clearTsSiKeys() {
    const keysToRemove = []

    // Collect matching keys first (to avoid issues while iterating)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes(STORAGE_PREFIX)) {
        keysToRemove.push(key)
      }
    }

    // Remove them
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key)
      // console.log(`🗑️ Removed localStorage key: ${key}`)
    })
  }

  function fixMalformedJson(rawJson) {
    // Escape quotes inside HTML tags only
    const cleaned = rawJson.replace(
      /<[^>]*>/g,
      (tag) => tag.replace(/"/g, '\\"') // escape only inside tags
    )

    try {
      return JSON.parse(cleaned)
    } catch (err) {
      console.error('❌ Still invalid JSON:', err.message)
      throw err
    }
  }

  // 🏁 **Run once on page load**

  waitForUserSession(async () => {
    try {
      const experiments = signal_rules
      clearTsSiKeys()
      experiments.forEach(async (experiment) => {
        if (experiment.schedule.method == 'time-based') {
          switchTest(experiment, experiments)
        } else {
          await switchTestByUser(experiment, experiments)
        }
      })
    } catch (e) {
      console.error(e)
    }
  })
  setTimeout(() => {
    revelAllHiddenPrices()
  }, 1800)
  waitForProductPriceAndRun()
  setupPriceContainerObserver()
  setupSearchAndModalListeners()
  // onVariantUrlChange(updateHydrozenThemePrices)

  // Add click handler for product links
  // document.addEventListener('click', (event) => {
  //   const productLink = event.target.closest('a[href*="/products/"]')
  //   if (productLink) {
  //     const url = new URL(productLink.href)
  //     const variantId = url.searchParams.get('variant')
  //     if (variantId) {
  //       // Store the variant ID in sessionStorage for the product page
  //       const productHandle = productLink.href
  //         .split('/products/')[1]
  //         .split('?')[0]
  //       sessionStorage.setItem(`selected_variant_${productHandle}`, variantId)
  //     }
  //   }
  // })
  // const target = document.querySelector('product-price')

  // const newThemeObserver = new MutationObserver(() => {
  //   newThemeObserver.disconnect()
  //   // Replace inner HTML
  //   updateProductPricesOnCard()
  // })
  // if (target) {
  //   newThemeObserver.observe(target, { childList: true, subtree: true })
  // }

  // Check for stored variant on product page load
  // document.addEventListener('DOMContentLoaded', () => {
  //   const productHandle = window.location.pathname
  //     .split('/products/')[1]
  //     ?.split('?')[0]
  //   if (productHandle) {
  //     const storedVariantId = sessionStorage.getItem(
  //       `selected_variant_${productHandle}`
  //     )
  //     if (storedVariantId) {
  //       // Find and select the variant
  //       const variantInput = document.querySelector(
  //         `input[name="id"][value="${storedVariantId}"]`
  //       )
  //       if (variantInput) {
  //         variantInput.checked = true
  //         variantInput.dispatchEvent(new Event('change'))
  //       }
  //       // Clear the stored variant
  //       sessionStorage.removeItem(`selected_variant_${productHandle}`)
  //     }
  //   }
  // })

  // Add change event listener for both select elements
  // document
  //   .querySelectorAll('select.single-option-selector, select[name="id"]')
  //   .forEach((select) => {
  //     select.addEventListener('change', (event) => {
  //       event.preventDefault()
  //       event.stopPropagation()

  //       const form = select.closest("form[action*='/cart/add']")
  //       if (!form) return

  //       // Get the actual variant ID from the hidden select
  //       const variantSelect = form.querySelector('select[name="id"]')
  //       if (!variantSelect) return

  //       const variantId = variantSelect.value

  //       const product = products?.find((p) => p?.variantId == variantId)

  //       const price = product?.discountAmount
  //       const userSession = JSON.parse(
  //         localStorage.getItem('signal_user_session') || 'null'
  //       )
  //       const userId = userSession?.clientId

  //       if (!price) {
  //         console.warn('No custom price found. Proceeding with default price.')

  //         return
  //       }

  //       // Update the price display
  //     })
  //   })

  // Function to handle add to cart with custom price
  // function handleAddToCartX(event, form) {
  //   event.preventDefault()
  //   event.stopPropagation()

  //   const variantSelect = form.querySelector(
  //     'input[name="id"],select[name="id"]'
  //   )
  //   if (!variantSelect) return

  //   const variantId = variantSelect.value
  //   const formData = new FormData(form)

  //   // Get quantity safely, fallback to 1
  //   const quantityRaw = formData.get('quantity')
  //   const quantity = quantityRaw ? parseInt(quantityRaw, 10) : 1

  //   const experiments = JSON.parse(
  //     localStorage.getItem('signal_active_experiments') || 'null'
  //   )
  //   const experimentPairs = []

  //   // Theme Test
  //   const themeExp = experiments?.experiments?.find((e) => e.theme)
  //   if (themeExp?.theme?.experimentId && themeExp?.theme?.testId) {
  //     experimentPairs.push(
  //       `${themeExp.theme.experimentId}_${themeExp.theme.testId}`
  //     )
  //   }

  //   // Image Test

  //   const imageTestExp = products
  //     .filter((p) => p.experimentType === 'image_testing')
  //     .find((p) => p.variantId === variantId)

  //   if (imageTestExp) {
  //     experimentPairs.push(
  //       `${imageTestExp.experimentId}_${imageTestExp.testId}`
  //     )
  //   }

  //   // Price Test
  //   const priceTestExp = products
  //     .filter((p) => p.experimentType === 'price_testing')
  //     .find((p) => p.variantId === variantId)

  //   const discountAmount = parseFloat(priceTestExp?.discountAmount).toFixed(2)
  //   const price = parseFloat(priceTestExp?.price).toFixed(2)
  //   const experimentId = priceTestExp?.experimentId
  //   const testId = priceTestExp?.testId

  //   if (experimentId && testId) {
  //     experimentPairs.push(`${experimentId}_${testId}`)
  //   }

  //   const userSession = JSON.parse(
  //     localStorage.getItem('signal_user_session') || 'null'
  //   )
  //   const userId = userSession?.clientId

  //   const experimentString = experimentPairs.join(',')

  //   const properties = {
  //     __si_p: price,
  //     __si_d: discountAmount,
  //     __si_ud: userId,
  //     __si_exp: experimentString
  //   }

  //   if (experimentString == '') {
  //     console.warn('No experiment found. Proceeding with default.')
  //     return
  //   }

  //   fetch('/cart/add.js', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       id: variantId,
  //       quantity: quantity > 0 ? quantity : 1,
  //       properties: {
  //         __si_exp: JSON.stringify(properties)
  //       }
  //     })
  //   })
  //     .then(async (response) => {
  //       // Check if cart drawer exists
  //       const cartDrawer = document.querySelector('cart-drawer')

  //       if (cartDrawer && window.routes && window.routes.cart_url) {
  //         try {
  //           // Fetch the updated cart-drawer HTML (this uses the theme's AJAX view)
  //           const ajaxUrl = `${window.routes.cart_url}?view=ajax`
  //           const drawerResponse = await fetch(ajaxUrl)
  //           const updatedDrawerHtml = await drawerResponse.text()

  //           // Update the cart-drawer and open it
  //           if (cartDrawer.renderContent) {
  //             // Update the drawer's contents using the component's own render method
  //             await cartDrawer.renderContent(updatedDrawerHtml)
  //             // Finally, open the drawer
  //             cartDrawer.open()
  //           } else {
  //             // Fallback if renderContent method doesn't exist
  //             cartDrawer.innerHTML = updatedDrawerHtml
  //             cartDrawer.open()
  //           }

  //           console.log('Variant added and cart drawer refreshed/opened.')
  //         } catch (error) {
  //           console.error('Error updating cart drawer:', error)
  //           // Fallback to cart page if drawer update fails
  //           window.location.href = '/cart'
  //         }
  //       } else {
  //         // No cart drawer found, redirect to cart page
  //         window.location.href = '/cart'
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Error adding to cart:', error)
  //       form.submit()
  //     })
  // }

  async function handleCartDrawerUpdate() {
    const cartDrawer = document.querySelector('cart-drawer')

    if (cartDrawer && window.routes?.cart_url) {
      try {
        const ajaxUrl = `${window.routes.cart_url}?view=ajax`
        const drawerResponse = await fetch(ajaxUrl)
        const updatedDrawerHtml = await drawerResponse.text()

        if (cartDrawer.renderContent) {
          await cartDrawer.renderContent(updatedDrawerHtml)
          cartDrawer.open()
        } else {
          cartDrawer.innerHTML = updatedDrawerHtml
          cartDrawer.open()
        }

        consoleLog('Cart drawer refreshed and opened.')
      } catch (error) {
        console.error('Error updating cart drawer:', error)
        // window.location.href = '/cart'
      }
    } else {
      // Fallback to default cart page if drawer doesn't exist
      window.location.href = '/cart'
      consoleLog('No cart drawer found. Proceeding with default.')
    }
  }

  function handleAddToCart(event, form) {
    const variantSelect = form.querySelector(
      'input[name="id"],select[name="id"]'
    )
    if (!variantSelect) return

    const variantId = variantSelect.value
    const formData = new FormData(form)

    const quantityRaw = formData.get('quantity')
    const quantity = quantityRaw ? parseInt(quantityRaw, 10) : 1

    const experiments = JSON.parse(
      localStorage.getItem('signal_active_experiments') || 'null'
    )
    const experimentPairs = []

    // Theme Test
    const themeExp = experiments?.experiments?.find((e) => e.theme)
    if (themeExp?.theme?.experimentId && themeExp?.theme?.testId) {
      experimentPairs.push(
        `${themeExp.theme.experimentId}_${themeExp.theme.testId}`
      )
    }

    // Image Test
    const imageTestExp = products
      .filter((p) => p.experimentType === 'image_testing')
      .find((p) => p.variantId === variantId)

    if (imageTestExp) {
      experimentPairs.push(
        `${imageTestExp.experimentId}_${imageTestExp.testId}`
      )
    }
    // description Test
    const descriptionTestExp = products
      .filter((p) => p.experimentType === 'description_testing')
      .find((p) => p.variantId === variantId)

    if (descriptionTestExp) {
      experimentPairs.push(
        `${descriptionTestExp.experimentId}_${descriptionTestExp.testId}`
      )
    }

    const shippingExp = experiments?.experiments?.find(
      (e) => e.experimentType == 'shipping_testing'
    )
    if (shippingExp?.shipping?.experimentId && shippingExp?.shipping?.testId) {
      experimentPairs.push(
        `${shippingExp.shipping.experimentId}_${shippingExp.shipping.testId}`
      )
    }

    // Price Test
    const priceTestExp = products
      .filter((p) => p.experimentType === 'price_testing')
      .find((p) => p.variantId === variantId)

    const discountAmount = parseFloat(priceTestExp?.discountAmount).toFixed(2)

    const price = parseFloat(priceTestExp?.price).toFixed(2)
    // const price = parseFloat(priceTestExp?.price).toFixed(2)
    const experimentId = priceTestExp?.experimentId
    const testId = priceTestExp?.testId

    if (experimentId && testId) {
      experimentPairs.push(`${experimentId}_${testId}`)
    }

    const userSession = JSON.parse(
      localStorage.getItem('signal_user_session') || 'null'
    )
    const userId = userSession?.clientId

    const experimentString = experimentPairs.join(',')

    // ✅ No experiments? Do nothing — let theme handle it.
    if (experimentString === '') {
      consoleLog('No experiment found. Letting theme handle Add to Cart.')
      return // don't preventDefault or stopPropagation
    }

    // ✅ Has experiment: override default behavior
    event.preventDefault()
    event.stopPropagation()
    const addButton = form.querySelector('[name="add"]')
    addButton?.classList.add('is-loading', 'app-loading-white')
    const properties = {
      // __si_sub: sellingObj?.isToggleOn ? priceTestExp?.sellingDiscount : '',
      __si_ud: userId,
      __si_exp: experimentString
    }
    if (priceTestExp) {
      properties['__si_p'] = price
      properties['__si_d'] = discountAmount
    }

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity > 0 ? quantity : 1,
        sections: 'header,cart-drawer,cart-page,cart-json',
        // ...(sellingObj?.isToggleOn && {
        //   selling_plan: sellingObj?.value
        // }),
        properties: {
          __si_exp: JSON.stringify(properties)
        }
      })
    })
      .then(async () => {
        await handleCartDrawerUpdate()
      })
      .catch((error) => {
        console.error('Error adding to cart:', error)
        form.submit()
      })
      .finally(() => {
        addButton?.classList.remove('is-loading', 'app-loading-white')
        const variantButtons = document.querySelectorAll('.app-loading')
        if (variantButtons) {
          variantButtons.forEach((button) => {
            button.classList.remove('app-loading')
          })
        }
      })
  }

  // Function to setup add to cart button
  function setupAddToCartButton(form) {
    // Find the original add to cart button
    const originalButton = form.querySelector(
      'button[type="submit"], input[type="submit"], .add-to-cart, [name="add"]'
    )
    if (!originalButton) return

    // Create a shallow copy of the button
    const buttonCopy = originalButton.cloneNode(true)

    // Remove type="submit" from the button copy
    if (buttonCopy.hasAttribute('type')) {
      buttonCopy.removeAttribute('type')
    }

    // Remove the original button
    originalButton.style.display = 'none'
    originalButton.parentNode.insertBefore(buttonCopy, originalButton)

    // Add click handler to the copy
    buttonCopy.addEventListener('click', (event) => {
      handleAddToCart(event, form)
    })

    // Also keep the form submit handler as backup
    form.addEventListener('submit', (event) => {
      handleAddToCart(event, form)
    })
  }

  // Setup add to cart buttons for all forms
  document
    .querySelectorAll('form[action*="/cart/add"]')
    .forEach(setupAddToCartButton)

  // Watch for dynamically added forms
  // Flag to prevent infinite loops when updating prices
  // let isUpdatingPrices = false

  // const observer = new MutationObserver((mutations) => {
  //   // Skip if we're already updating prices to prevent loops
  //   if (isUpdatingPrices) return

  //   let shouldUpdatePrices = false

  //   mutations.forEach((mutation) => {
  //     // Skip if this mutation is from our price updates
  //     if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
  //       const hasPriceUpdates = Array.from(mutation.addedNodes).some(
  //         (node) =>
  //           node.nodeType === 1 && node.classList?.contains('js-option-price')
  //       )
  //       if (hasPriceUpdates) return
  //     }

  //     mutation.addedNodes.forEach((node) => {
  //       if (node.nodeType === 1) {
  //         // Check if the added node contains product cards or is a product card
  //         const hasProductCards =
  //           node.matches &&
  //           (node.matches('a[href*="/products/"]') ||
  //             (possibleSelectors.productCardContainer.length > 0 &&
  //               possibleSelectors.productCardContainer.some((selector) =>
  //                 node.matches(selector)
  //               )))

  //         if (hasProductCards) {
  //           shouldUpdatePrices = true
  //           console.log(
  //             'Product cards detected in DOM changes, will update prices'
  //           )
  //         }

  //         // Check if the added node is a form (for add to cart functionality)
  //         if (node.matches && node.matches('form[action*="/cart/add"]')) {
  //           setupAddToCartButton(node)
  //         }
  //         // Check for forms inside the added node
  //         if (node.querySelectorAll) {
  //           node
  //             .querySelectorAll('form[action*="/cart/add"]')
  //             .forEach(setupAddToCartButton)
  //         }
  //       }
  //     })
  //   })

  //   // Only update prices if product cards were actually added
  //   if (shouldUpdatePrices) {
  //     console.log('Updating prices due to new product cards')
  //     isUpdatingPrices = true

  //     updateProductPricesOnCard()
  //   }
  //   setTimeout(() => {
  //     revelAllHiddenPrices()
  //     isUpdatingPrices = false
  //   }, 600)
  // })

  // old

  const observerX = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // 1) New product cards added
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return // skip text etc.
          // ✅ only run if it's a whole product card (adjust selector)

          updateProductPricesOnCard() // pass the card
          if (node.matches('form[action*="/cart/add"]')) {
            setupAddToCartButton(node)
          }
          node
            .querySelectorAll('form[action*="/cart/add"]')
            .forEach(setupAddToCartButton)
          // if (node.matches(possibleSelectors.productCardContainer.join(','))) {
          //   // setup add-to-cart on forms inside this card
          // }
          setTimeout(revelAllHiddenPrices, 1600)
        })
      }

      // 2) Existing card DOM changes (like price update)
      // if (
      //   mutation.type === 'characterData' ||
      //   (mutation.type === 'attributes' &&
      //     mutation.target.classList.contains('js-option-price'))
      // ) {
      //   return
      // }
    })
  })

  // Function to setup add-to-cart functionality for variant change elements
  function setupVariantChangeAddToCart(variantNode, variantId) {
    if (!variantNode || !variantId) return

    // Prevent multiple bindings on the same node
    if (variantNode.dataset && variantNode.dataset.siBound === '1') return
    if (variantNode.dataset) variantNode.dataset.siBound = '1'

    // Add click event listener to the variant node with capture phase to ensure it runs first
    variantNode.addEventListener(
      'click',
      function (event) {
        // Prevent the default behavior and stop propagation to ensure only our code runs
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        // Deselect previously selected variant in this popup group
        const groupEl =
          variantNode.closest('animate-small-slide') ||
          variantNode.closest('.js-variant-popup-cart') ||
          document
        groupEl
          .querySelectorAll('.js-variant-change.selected')
          .forEach((el) => {
            if (el !== variantNode) el.classList.remove('selected')
          })
        // Select current
        variantNode.classList.add('selected')

        // Get the experiments data
        const experiments = JSON.parse(
          localStorage.getItem('signal_active_experiments') || 'null'
        )
        const experimentPairs = []

        // Theme Test
        const themeExp = experiments?.experiments?.find((e) => e.theme)
        if (themeExp?.theme?.experimentId && themeExp?.theme?.testId) {
          experimentPairs.push(
            `${themeExp.theme.experimentId}_${themeExp.theme.testId}`
          )
        }

        // Image Test
        const imageTestExp = products
          .filter((p) => p.experimentType === 'image_testing')
          .find((p) => p.variantId === variantId)

        if (imageTestExp) {
          experimentPairs.push(
            `${imageTestExp.experimentId}_${imageTestExp.testId}`
          )
        }

        // Price Test
        const priceTestExp = products
          .filter((p) => p.experimentType === 'price_testing')
          .find((p) => p.variantId === variantId)

        const discountAmount = parseFloat(
          priceTestExp?.discountAmount || 0
        ).toFixed(2)
        const price = parseFloat(priceTestExp?.price || 0).toFixed(2)
        const experimentId = priceTestExp?.experimentId
        const testId = priceTestExp?.testId

        if (experimentId && testId) {
          experimentPairs.push(`${experimentId}_${testId}`)
        }

        const userSession = JSON.parse(
          localStorage.getItem('signal_user_session') || 'null'
        )
        const userId = userSession?.clientId

        const experimentString = experimentPairs.join(',')

        // If no experiments, let the default behavior happen
        if (experimentString === '') {
          console.log(
            'No experiment found. Letting default behavior handle Add to Cart.'
          )
          return
        }

        // Show loading spinner inside this variant card
        const loadingEl = variantNode.querySelector('.js-loading')
        if (loadingEl) {
          loadingEl.classList.add('is-loading')
        }

        const properties = {
          __si_p: price,
          __si_d: discountAmount,
          __si_ud: userId,
          __si_exp: experimentString
        }

        // Use your existing add-to-cart logic
        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: variantId,
            quantity: 1,
            sections: 'header,cart-drawer,cart-page,cart-json',
            properties: {
              __si_exp: JSON.stringify(properties)
            }
          })
        })
          .then(async () => {
            await handleCartDrawerUpdate()

            // Close the popup after successful cart addition using theme's existing transitions
            const popup =
              variantNode.closest('popup-modal') ||
              variantNode.closest('.popup-modal') ||
              document.querySelector('.popup-modal--variant-mob.open') ||
              document.querySelector('.js-popup-cart-change.open')

            if (popup) {
              // Use theme's existing transition system - add opacity-0 for smooth fade out
              popup.style.transition = 'opacity 0.3s ease-out'
              popup.style.opacity = '0'

              // Wait for transition to complete, then remove the popup
              setTimeout(() => {
                popup.classList.remove('open')
                popup.style.removeProperty('z-index')
                popup.style.removeProperty('opacity')
                popup.style.removeProperty('transition')

                // Also remove backdrop styles
                const backdrop = popup.querySelector('.js-backdrop')
                if (backdrop) {
                  backdrop.style.removeProperty('z-index')
                }
              }, 300) // 300ms transition duration
            }
          })
          .catch((error) => {
            console.error('Error adding to cart:', error)
          })
          .finally(() => {
            const loadingEl = variantNode.querySelector('.js-loading')
            if (loadingEl) {
              loadingEl.classList.remove('is-loading')
            }
          })
      },
      true
    ) // Add capture phase parameter to ensure our listener runs first

    // Add visual indication that this variant is clickable
    // variantNode.style.cursor = 'pointer'
  }
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // 1) New product cards added

      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return // skip text etc.

          // Check for variant change elements
          if (node.matches('.js-variant-change')) {
            const variantId = node.getAttribute('data-variant-id')
            const matchedProduct = products.find(
              (p) => p.variantId === variantId
            )

            if (matchedProduct) {
              // console.log(
              //   'Variant change element detected in main observer:',
              //   node
              // )
              // Add our add-to-cart functionality directly to the existing node
              setupVariantChangeAddToCart(node, variantId)
            }
          }

          updateProductPricesOnCard() // pass the card
          if (node.matches('form[action*="/cart/add"]')) {
            setupAddToCartButton(node)
          }
          node
            .querySelectorAll('form[action*="/cart/add"]')
            .forEach(setupAddToCartButton)
          // if (node.matches(possibleSelectors.productCardContainer.join(','))) {
          //   // setup add-to-cart on forms inside this card
          // }
          setTimeout(revelAllHiddenPrices, 1600)
        })
      }

      // 2) Existing card DOM changes (like price update)
      // if (
      //   mutation.type === 'characterData' ||
      //   (mutation.type === 'attributes' &&
      //     mutation.target.classList.contains('js-option-price'))
      // ) {
      //   return
      // }
    })
  })

  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true
    // characterData: true,
    // attributes: true
    // attributeFilter: ['data-original-price', 'data-selling-plan-price']
  })
})
