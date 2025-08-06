// @ts-check
import { DiscountApplicationStrategy } from '../generated/api'

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: []
}

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const discountedItems = input.cart.lines.filter(
    (line) =>
      line.attribute?.value && line.merchandise.__typename == 'ProductVariant'
  )
  if (!discountedItems.length) return EMPTY_DISCOUNT
  const discounts = discountedItems.map((line) => {
    const variant = line.merchandise
    const discountedAmount = line?.attribute?.value
      ? parseFloat(line.attribute.value) * line.quantity
      : 0

    return {
      message: `__${line?.attribute?.value}`,
      targets: [
        {
          productVariant: {
            id: variant.__typename === 'ProductVariant' ? variant.id : ''
            // quantity: line?.quantity
          }
        }
      ],
      // value: { percentage: { value: discountedAmount } }
      value: { fixedAmount: { amount: discountedAmount.toFixed(2) } }
    }
  })

  return {
    discounts,
    discountApplicationStrategy: DiscountApplicationStrategy.All
  }
}
