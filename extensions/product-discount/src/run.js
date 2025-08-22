// @ts-check
import { DiscountApplicationStrategy } from '../generated/api'

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
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
  // Only subscription lines
  const subscriptionLines = input.cart.lines.filter(
    (line) =>
      line.attribute?.value &&
      line.sellingPlanAllocation &&
      line.merchandise.__typename === 'ProductVariant'
  )

  if (!subscriptionLines.length) return EMPTY_DISCOUNT

  const discounts = subscriptionLines
    .map((line) => {
      const merch = line.merchandise
      // Only handle ProductVariant
      if (merch.__typename !== 'ProductVariant') return null

      const variant = merch // this is the ProductVariant object
      const variantId = variant.id // safe, because __typename is ProductVariant

      const experiment = line.attribute?.value
        ? JSON.parse(line.attribute.value)
        : {}
      const currentPrice = parseFloat(experiment.__si_p || 0)
      const discountPercentage = parseFloat(experiment.__si_sub || 0)
      const discountAmount =
        currentPrice * (discountPercentage / 100) * line.quantity

      console.log(
        JSON.stringify({
          discountAmount,
          quantity: line.quantity,
          experiment
        })
      )

      if (discountAmount > 0) {
        return {
          message: `Subscription discount`,
          targets: [{ productVariant: { id: variantId } }],
          value: { fixedAmount: { amount: discountAmount.toFixed(2) } }
        }
      }

      return null
    })
    .filter(function (d) {
      return d !== null // remove null values
    })

  return {
    discounts,
    discountApplicationStrategy: DiscountApplicationStrategy.All
  }
}
