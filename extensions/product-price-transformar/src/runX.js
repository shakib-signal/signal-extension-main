// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 * @typedef {import("../generated/api").CartOperation} CartOperation
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: []
}

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const operations = input.cart.lines.reduce(
    /** @param {CartOperation[]} acc */
    (acc, cartLine) => {
      const expandOperation = optionallyBuildExpandOperation(cartLine)

      if (expandOperation) {
        return [...acc, { expand: expandOperation }]
      }

      return acc
    },
    []
  )

  return operations.length > 0 ? { operations } : NO_CHANGES
}

/**
 * @param {RunInput['cart']['lines'][number]} cartLine
 */
function optionallyBuildExpandOperation({
  id: cartLineId,
  merchandise,
  attribute
}) {
  const propertise = attribute?.value
  if (propertise && merchandise.__typename === 'ProductVariant') {
    const experiment = JSON.parse(propertise)
    const customPrice = parseFloat(experiment.__si_p || 0)
    if (customPrice > 0) {
      return {
        cartLineId,
        expandedCartItems: [
          {
            merchandiseId: `${merchandise.id}${
              experiment.selling_plan
                ? `?selling_plan=${experiment.selling_plan}`
                : ''
            }`,
            quantity: 1,
            price: {
              adjustment: {
                fixedPricePerUnit: {
                  amount: customPrice
                }
              }
            },
            attributes: Object.entries(experiment).map(([key, value]) => ({
              key,
              value
            }))
          }
        ]
      }
    } else {
      return {
        cartLineId,
        expandedCartItems: [
          {
            merchandiseId: merchandise.id,
            quantity: 1,
            attributes: Object.entries(experiment).map(([key, value]) => ({
              key,
              value
            }))
          }
        ]
      }
    }
  }
}
