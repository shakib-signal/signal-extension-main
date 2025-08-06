export const possibleSelectors = [
  // General selectors
  '.price-item--regular',
  '.price-item--sale',
  '.price-item--last',
  '[data-product-price]',

  // Combined structure selectors
  '.price__regular .price-item--regular',
  '.price__sale .price-item--sale',
  '.price__sale .price-item--last',
  '.price__container .price-item--regular',
  '.price__container .price-item--sale',

  // Hidden unit price (often skipped but present in some themes)
  '.unit-price .price-item--last',

  // Legacy / alternative theme structures
  '.product__price',
  '.product-single__price',
  '.product-price__price',
  '.product__price--sale',
  '.product__price--compare',
  '.product__price .price-item',
  '.product-price__reduced',
  '.product-price__amount',
  '.product-price .price-item',
  '.product__price .price',

  // For meta fields or special data-driven themes
  '[data-product-price]',
  '[data-regular-price]',
  '[data-sale-price]',
  '[data-price]',
  '[data-price-wrapper]'
]
