// Flag to control extra section visibility
let showExtraSection = false
let showImageSection = false
let showPriceSection = false
let showOptionPannel = false
let highlightCheckbox = true
let activePriceTrigger = null
let regularEl = null
let compareEl = null
let badgeEl = null
let regularOriginalText = ''
let compareOriginalText = ''
let badgeOrginalText = ''
let targetElement
let targetImage
let regularPrice = true
let compareAtPrice
let badge
let referrerUrl
let payload
let parsedPayload
let themeId
let themeName
let regularPriceClassOrId = []
let comparePriceClassOrId = []
let badgeClassOrId = []
let productPriceContainer = []
let singleProductContainer = []
let productContainer = []
let addtocartSelector = []
let textClassOrId = []
let imgClassOrId = []
let contentContainer = []
let imageContainer = []
let triggerButtonClassOrId = []
let searchClassOrId = []
let modalClassOrId = []
let triggerButtonContainer = []
let triggerElementContainer = []
let singleImgClassOrId = []
let singleProductImageContainer = []
let searchItemLink = []
let searchImage = []
const PAYLOAD_KEY = 'signal_test_info'
const ACTIVE_KEY = 'signal_selector_info'
let activeTab = null
let isLoading = false
let updatedDom = []
let landingUrl = ''
let PRODUCT_HANDLE = 'selected_product'
let class_shop = window.Shopify.shop
let selected_variant_name = null
// Add this at the top of the file, after variable declarations
// if (sessionStorage.getItem(ACTIVE_KEY)) {
//     console.log("🚫 UniversalStoreClassPicker: Signal test is active, skipping...");
//     return; // Exit early if the other script is active
// }

// const detectorStyle = document.createElement('style')
// detectorStyle.innerHTML = `
//   .signalDetector-hide-price {
//     visibility: hidden !important;
//     opacity: 0 !important;
//     transition: opacity 0.3s ease-out;
//   }

//   .signalDetector-hide-container {
//     visibility: hidden !important;
//     opacity: 0 !important;
//     transition: opacity 0.3s ease;
//   }
//   .signalDetector-fade-in {
//   visibility: visible !important;
//   opacity: 1 !important;
// }
// `
// document.head.appendChild(detectorStyle)

async function getDataFromUrl() {
  const url = new URL(window.location.href)
  referrerUrl = document.referrer
  const encodedPayload = url.searchParams.get('payload')
  if (!encodedPayload) return

  function safeDecodeURIComponent(str) {
    try {
      const decodedOnce = decodeURIComponent(str)
      // Try decoding twice, if no error, probably double encoded
      const decodedTwice = decodeURIComponent(decodedOnce)
      return decodedTwice
    } catch {
      // If double decoding fails, return single decoded
      return str
    }
  }

  console.log('encodedPayload', encodedPayload)

  const jsonString = safeDecodeURIComponent(encodedPayload)
  const payload = JSON.parse(jsonString)
  console.log('✅ Payload from URL:', payload)

  if (payload?.appName == 'Signal') {
    const productData = JSON.parse(preview_data)
    console.log('data', productData)
    const updatedPayload = {
      experimentName: payload.experimentName,
      experimentType: payload.experimentType,
      appName: payload.appName,
      productInfo: productData // or filter/transform as needed
    }
    // ✅ Save updated object
    sessionStorage.setItem(PAYLOAD_KEY, JSON.stringify(updatedPayload))

    // console.log("✅ Final saved payload:", updatedPayload);
  }
}

function persistPayloadInUrl() {
  const referrer = document.referrer
  if (!referrer || !sessionStorage.getItem(PAYLOAD_KEY)) return

  const refUrl = new URL(referrer)
  const payloadQuery = refUrl.searchParams.get('payload')
  if (!payloadQuery) return

  const currentUrl = new URL(window.location.href)

  // Only set if current URL doesn't already have payload param
  if (!currentUrl.searchParams.has('payload')) {
    currentUrl.searchParams.set('payload', payloadQuery)

    // Replace the current history entry with the new URL
    window.history.replaceState({}, document.title, currentUrl.toString())
  }
}

function clearPayloadFromUrlAndStorage() {
  const url = new URL(window.location.href)
  if (url.searchParams.has('payload')) {
    url.searchParams.delete('payload')
    window.history.replaceState({}, document.title, url.toString())
  }
  sessionStorage.removeItem(PAYLOAD_KEY)
}

function showModalIfAllowed() {
  const storedPayload = sessionStorage.getItem(PAYLOAD_KEY)
  // console.log("🔍 Checking payload:", parsedPayload, "Referrer:", referrerUrl)

  if (!storedPayload) return

  parsedPayload = JSON.parse(storedPayload)
  if (
    referrerUrl === 'https://admin.testsignal.com' ||
    parsedPayload.appName === 'Signal'
  ) {
    console.log('✅ Showing modal...')
    document.body.appendChild(modal)
    renderModal()
    initProductSelect()
    // updatePricesForPage()
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('✅ DOM loaded')

  try {
    // const isSignalActive = localStorage.getItem(ACTIVE_KEY);

    // if (isSignalActive) {
    // 	clearPayloadFromUrlAndStorage();
    // 	return; // Don't show modal if experiment is already active
    // }

    await getDataFromUrl()
    persistPayloadInUrl()
    showModalIfAllowed()
    getThemeInfo()
    await fetchSelector()
    // preview_setupSearchAndModalListeners()
  } catch (error) {
    console.error('❌ Error in classDetectionModal.js:', error)
  }
})

function getThemeInfo() {
  const themeInfo = window.Shopify.theme
  themeId = themeInfo.id
  themeName = themeInfo.schema_name
}

// app.js

async function fetchSelector() {
  console.log('themeId', themeId)
  console.log('shop', class_shop)

  if (!themeId || !class_shop) {
    console.log('themeId not found')
    return
  }

  try {
    const response = await fetch(
      `https://api.testsignal.com/api/v1/app/selector/${themeId}?shop=${class_shop}`
    )
    const result = await response.json()
    console.log('result', result)

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch selector')
    }

    if (result.data) {
      const { themeName, selectors } = result.data

      selectors?.comparePriceClassOrId?.forEach((cs) => {
        comparePriceClassOrId.push(cs)
        compareEl = cs
      })
      selectors?.salePriceClassOrId?.forEach((rs) => {
        regularPriceClassOrId.push(rs)
        regularEl = rs
      })
      selectors?.badgeClassOrId?.forEach((bs) => {
        badgeClassOrId.push(bs)
        badgeEl = bs
      })
      selectors?.productContainer?.forEach((pc) => {
        productContainer.push(pc)
      })
      selectors?.singleProductContainer?.forEach((sc) => {
        singleProductContainer.push(sc)
      })
      badgeOrginalText = selectors?.badgeOrginalText
      selectors?.textClassOrId?.forEach((ts) => {
        textClassOrId.push(ts)
        contentEl = ts
      })
      selectors?.contentContainer?.forEach((cc) => {
        contentContainer.push(cc)
      })
      selectors?.imgClassOrId?.forEach((is) => {
        imgClassOrId.push(is)
        imageEl = is
      })
      selectors?.imageContainer?.forEach((ic) => {
        imageContainer.push(ic)
      })
      selectors?.triggerButtonClassOrId?.forEach((tbs) => {
        triggerButtonClassOrId.push(tbs)
        triggerEl = tbs
      })
      selectors?.triggerButtonContainer?.forEach((tbc) => {
        triggerButtonContainer.push(tbc)
      })
      selectors?.searchClassOrId?.forEach((ss) => {
        searchClassOrId.push(ss)
      })
      selectors?.modalClassOrId?.forEach((ms) => {
        modalClassOrId.push(ms)
      })
      selectors?.triggerElementContainer?.forEach((tec) => {
        triggerElementContainer.push(tec)
      })
      selectors?.priceContainer?.forEach((pc) => {
        productPriceContainer.push(pc)
      })
      selectors?.addtocartSelector?.forEach((atc) => {
        addtocartSelector.push(atc)
      })
      selectors?.singleImgClassOrId?.forEach((sis) => {
        singleImgClassOrId.push(sis)
        universel_singleImgEl = sis
      })
      selectors?.singleProductImageContainer?.forEach((spic) => {
        singleProductImageContainer.push(spic)
      })
      selectors?.searchItemLink?.forEach((sil) => {
        searchItemLink.push(sil)
      })
      selectors?.searchImage?.forEach((si) => {
        searchImage.push(si)
      })
      badgeOrginalText = selectors?.badgeOrginalText

      // console.log('regularEl', regularEl)
      // console.log('compareEl', compareEl)
      if (regularEl) updatePricesForPage(regularPriceClassOrId, true, false)
      if (compareEl) updatePricesForPage(comparePriceClassOrId, false, false)
      if (badgeEl) updatePricesForPage(badgeClassOrId, false, true)

      // console.log('resultData', themeName, selectors)
    }
  } catch (error) {
    console.error(error)
  }
}

// Create the main modal wrapper
const modal = document.createElement('div')
modal.id = 'classDetectionModal'
modal.style.cssText = `
  position: fixed;
  top: 10%;
  left: 20%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 720px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.3);
  z-index: 9999;
  font-family: sans-serif;
  overflow: hidden;
  display: block;
`

function makeDraggable(target, handle = target) {
  let isDragging = false
  let offsetX = 0
  let offsetY = 0

  handle.addEventListener('mousedown', function (e) {
    // Ignore right-click
    if (e.button !== 0) return

    isDragging = true
    offsetX = e.clientX - target.offsetLeft
    offsetY = e.clientY - target.offsetTop
    target.style.cursor = 'move'

    // Prevent selecting text while dragging
    e.preventDefault()
  })

  document.addEventListener('mouseup', function () {
    isDragging = false
    target.style.cursor = 'default'
  })

  document.addEventListener('mousemove', function (e) {
    if (isDragging) {
      target.style.left = e.clientX - offsetX + 'px'
      target.style.top = e.clientY - offsetY + 'px'
    }
  })
}

// Function to render modal content based on showExtraSection
function renderModal() {
  const testGroup = parsedPayload?.productInfo?.tests ?? null
  const testProducts = parsedPayload?.productInfo?.testingProducts ?? null
  const productFromSession = sessionStorage.getItem(PRODUCT_HANDLE)
  console.log('productFormSession', productFromSession)

  const uniqueHandles = [
    ...new Set(testProducts.map((item) => item.productHandle))
  ]

  function truncateByPixelWidth(text, maxWidthPx, font) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.font = font

    let truncated = ''
    for (let i = 0; i < text.length; i++) {
      const slice = text.slice(0, i + 1)
      const width = ctx.measureText(slice + '…').width
      if (width > maxWidthPx) {
        return truncated + '…'
      }
      truncated = slice
    }

    return text
  }

  modal.innerHTML = `
    <!-- Top Bar -->
		<style>
    select:focus,
    input:focus,
    button:focus {
      outline: none;
      box-shadow: none;
    }
			.switch-label {
				display: flex;
				align-items: center;
				gap: 10px;
				font-size: 14px;
				font-weight: 600;
				font-family: sans-serif;
				color: #020617;
			}

			.switch-wrapper {
				position: relative;
				width: 40px;
				height: 20px;
			}

			.switch-input {
				opacity: 0;
				width: 0;
				height: 0;
			}

			.switch-slider {
				position: absolute;
				top: 0; left: 0;
				right: 0; bottom: 0;
				background-color: #ccc;
				border-radius: 20px;
				transition: background-color 0.2s;
				cursor: pointer;
			}

			.switch-slider::before {
				content: "";
				position: absolute;
				height: 16px;
				width: 16px;
				left: 2px;
				bottom: 2px;
				background-color: white;
				border-radius: 50%;
				transition: transform 0.2s;
			}

			.switch-input:checked + .switch-slider {
				background-color: #1D4ED8;
			}

			.switch-input:checked + .switch-slider::before {
				transform: translateX(20px);
			}
			.custom-radio-checkbox {
				position: relative;
				padding-left: 28px;
				cursor: pointer;
				font-size: 16px;
				user-select: none;
				display: flex;
				align-items: center;
			}

			.custom-radio-checkbox input {
				position: absolute;
				opacity: 0;
				cursor: pointer;
			}

			.custom-radio-checkbox .checkmark {
				position: absolute;
				left: 0;
				top: 2px;
				width: 20px;
				height: 20px;
				background-color: white;
				border: 1px solid #000;
				border-radius: 50%;
				box-sizing: border-box;
			}

			.custom-radio-checkbox .checkmark::after {
				content: "";
				position: absolute;
				top: 50%;
 				left: 50%;
				width: 14px;
				height: 14px;
				background-color: #A855F7; /* Purple inner dot */
				border-radius: 50%;
				transform: translate(-50%, -50%);
				display: none;
			}

			.custom-radio-checkbox input:checked ~ .checkmark::after {
				display: block;
			}

			#saveButton span {
				pointer-events: none;
			}
  </style>
    <div id="modalContainer" style="background: #fff; color: white; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px; box-shadow: 0 3px 3px -1px rgba(0, 0, 0, 0.1);"><div style="color: #1D4ED8; font-size: 20px; font-weight: 600">${
      parsedPayload?.experimentName
    }</div>
      <div style="display: flex; align-items: center; gap: 10px;">
				<button id="exitEditor" style="background: #DC2626; color: #fff; border: none; border-radius: 6px; padding: 10px 16px; font-weight: 400; cursor: pointer;">
          Exit
        </button>
				<div style="position: relative; display: inline-block;">
					<button id="saveButton" disabled
						style="background: #1D4ED8; color: #fff; border: 1px solid #ddd; padding: 8px 16px; border-radius: 6px; cursor: not-allowed; display: flex; align-items: center">
						<span id="saveButtonText">Save</span>
						<span id="saveSpinner" class="ring-spinner" style="display: none;"></span>
					</button>
					<div id="tooltipMessage" style="
						visibility: hidden;
						opacity: 0;
						background-color: #1D4ED8;
						color: #fff;
						text-align: center;
						padding: 6px 10px;
						border-radius: 4px;
						font-size: 12px;
						white-space: nowrap;

						position: absolute;
						top: 120%;
						left: -80%;
						transform: translateX(-50%);
						z-index: 1;

						transition: opacity 0.3s ease;
					">
						
					</div>
				</div>
      </div>
    </div>

    <!-- Middle Section -->
    <div style="padding: 24px 20px; display: flex; align-items: end; justify-content: space-between;">
			<div style= "display: flex; align-items: end; justify-content: center; gap: 20px; width: 100%">
				<div style= "width: 50%">
					<label style="display: block; margin-bottom: 6px; font-weight: 600; color: #020617">
					Quick Look
					</label>
					<select id="testProductSelect" 
						style="padding: 8px 16px; font-size: 14px; border-radius: 12px; border: 1px solid #E2E8F0; background-color: #fff; width: 100%; cursor: pointer;">
						<option value="">-- Select Product --</option>
						${uniqueHandles
              .map(
                (handle) =>
                  `<option value="${handle}" title="${handle}">
										${truncateByPixelWidth(handle, 290, '14px Arial')}
									</option>`
              )
              .join('')}
					</select>
				</div>
				<div style= "width: 50%">
					<select id="testGroupSelect" style="padding: 8px 16px; font-size: 14px; border-radius: 12px; border: 1px solid #E2E8F0; background-color: #fff; width: 100%; cursor: pointer;">
						${testGroup
              ?.map(
                (group) => `
							<option value="${group.testId ? group.testId : group.name}">
								${
                  group.name === 'Control'
                    ? 'Control Group'
                    : `Test Group ${group.name.split(' ')[1]}`
                }
							</option>
						`
              )
              .join('')}
					</select>
				</div>
			</div>
    </div>
		<hr style= "margin: 0; color: #E2E8F0">

    <!-- Bottom Toolbar -->
		<div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 20px;">
			<label class="switch-label">
				Highlight Replaces
				<div class="switch-wrapper">
					<input type="checkbox" id="highlight-checkbox" class="switch-input" ${
            highlightCheckbox ? 'checked' : ''
          }>
					<span class="switch-slider"></span>
				</div>
			</label>
			<div style="display: flex; align-items: center; gap: 6px;">
				<div style= "font-size: 16px; font-weight: 600; color: #020617;">Edit option panel</div>
				<button id="option-pannel-edit" style= "border: none; background: transparent; font-size: 16px; display: flex; align-items: center; gap: 5px; color: #1D4ED8; cursor: pointer;">
					${showOptionPannel ? 'Collapse' : 'Expand'}
					${
            showOptionPannel
              ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16" style="color: #1D4ED8;">
							<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
						</svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16" style="color: #1D4ED8;">
							<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
						</svg>`
          }
				</button>
			</div>
		</div>

    ${
      showOptionPannel
        ? `<div style="background: #fff; padding: 10px 16px; border-top: 1px solid #ddd; display: flex; align-items: center; justify-content: space-between">
      <div style="display: flex; justify-content: space-between; gap: 12px; width: 100%">
       
			 <div style="background-color: #DBEAFE; color: #1D4ED8; padding: 12px 16px; border: 1px solid #BFDBFE; border-radius: 10px; display: flex; align-items: center; gap: 10px; width: 100%; font-size: 12px">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="30" height="30" style="flex-shrink: 0; color: #020617">
					<circle cx="12" cy="12" r="10" fill="none" stroke = "#020617" />
					<rect x="11" y="10" width="2" height="7" fill="#020617" />
					<rect x="11" y="6" width="2" height="2" fill="#020617" />
				</svg>
				<span style= "font-size: 14px; color: #020617">Prices not updating? Click the selector button '
				<span>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
							stroke-width="1.5" stroke="currentColor" width="18" height="18" style="color: #020617; margin-bottom: -5px;">
							<path stroke-linecap="round" stroke-linejoin="round"
										d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
						</svg>
					</span> 
				' below, choose your theme’s price elements, then hit Save. They’ll auto-populate with the test group price you selected above. Need help? Check out the <a target= "_blank" href= 'https://admin.testsignal.com/quick-guide?from=${class_shop}' style="font-weight: 600; color: #1D4ED8">quick video</a> reference for guidance.
				</span>
			</div>
      </div>

    </div>`
        : ''
    }

    ${
      showExtraSection
        ? `
       <!-- Conditionally rendered block -->
				<div id="extra-toolbar-section" style="padding: 16px 20px; background: #fff; border-top: 1px solid #ccc;">
					<div style="margin-top: 16px;">
						<div style= "display: flex; align-items: center; justify-content: space-between">
						<label><strong>Selected Element Info:</strong></label>
						<svg class="element-picker-trigger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
							stroke-width="1.5" stroke="currentColor" width="20" height="20" style="color: #020617;">
							<path stroke-linecap="round" stroke-linejoin="round"
							d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
						</svg>
						</div>
						<input type="text" id="targetInfo" readonly value="content-class" style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #ccc; border-radius: 4px;" />
					</div>

					<div style="margin-top: 16px;">
						<label><strong>Replace Text:</strong></label>
						<input type="text" id="replaceInput" placeholder="Enter text to replace content..." style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #ccc; border-radius: 4px;" />
					</div>
				</div>
    `
        : showImageSection
        ? `
			<!-- Conditionally rendered block -->
				<div id="extra-toolbar-section" style="padding: 16px 20px; background: #fff; border-top: 1px solid #ccc;">
					<div style="margin-top: 16px;">
						<div style="display: flex; align-items: center; justify-content: space-between">
							<label><strong>Selected Element Info:</strong></label>
							<svg class="image-trigger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
								stroke-width="1.5" stroke="currentColor" width="20" height="20" style="color: #020617; cursor: pointer">
								<path stroke-linecap="round" stroke-linejoin="round"
								d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
							</svg>
						</div>
						<input type="text" id="targetInfo" readonly value= "image-class" style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #ccc; border-radius: 4px;" />
					</div>

					<div style="display: flex; gap: 20px; align-items: flex-start; margin-top: 16px;">
						<!-- Selected Image Preview -->
						<div style="width: 150px; height: 200px; border: 1px solid #A855F7; border-radius: 8px; box-sizing: border-box; position: relative">
							${
                targetImage
                  ? `
							<img id="previewImage" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" />
							<div style= "position: absolute; left: 10%; bottom: 5%; background-color: #A855F7; border-radius: 16px; padding: 2px 10px">
								<div style= "color: #fff; font-size: 12px; font-weight: 550">Selected Image</div>
							</div>
							`
                  : `<div style= "text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
								<div style= "font-weight: 550; color: #7E22CE; opacity: .5;"> Please track an image to show preview.</div>
							</div>`
              }
						</div>

						<!-- Upload Button with Custom SVG -->
						<div style="width: 150px; height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
							<label for="uploadImageInput" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #9a37f1; border-radius: 8px; padding: 16px; text-align: center; width: 100%; height: 100%; background: #E2E8F0;">
								<!-- Your Custom SVG Icon -->
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
									stroke-width="1.5" stroke="currentColor" style="width: 60px; height: 60px; color:#9a37f1;">
									<path stroke-linecap="round" stroke-linejoin="round"
										d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5
											1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18
											3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0
											0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0
											0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375
											0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
								</svg>
								<span style="margin-top: 8px; font-size: 14px; color: #9a37f1;">Upload Image</span>
							</label>
							<input type="file" id="uploadImageInput" accept="image/*" style="display: none;" />
						</div>
					</div>
				</div>
				`
        : showPriceSection
        ? `
		 <!-- Tab Header -->
		 <div style= "padding: 20px">
			<div style="display: flex; width: 100%; gap: 12px; margin-bottom: 12px; border-radius: 8px; padding: 10px; background-color: #F1F5F9">
				<button id="regularTab" class="tab-button active-tab">Regular Price</button>
				<button id="compareTab" class="tab-button">Compare at Price</button>
				<button id="badgeTab" class="tab-button">Badge</button>
			</div>

			<!-- Tab Container -->
			<div id="priceTabContent" style="background: #fff;">

				<!-- Regular Price Tab -->
				<div id="regularPriceTab" class="tab-section">
					<div style="padding: 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff;">
						<div style="display:flex; align-items: center; justify-content: space-between">
							<label><strong>Sale / Regular Price Class:</strong></label>
							<div style="display:flex; align-items: center; gap: 5px;">
								<div class= "delete-button-bg">
									<svg class= "regular-price-class-delete" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
									<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
									</svg>
								</div>
								<div class= "picker-bg">
									<svg class="regular-price-trigger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
									stroke-width="1.5" stroke="currentColor" width="20" height="20" style="color: black;">
									<path stroke-linecap="round" stroke-linejoin="round"
										d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
									</svg>
								</div>
							</div>
						</div>
						<input type="text" id="priceClassInput" placeholder = "e.g. .price-item.price-item--sale.price-item--last"
							style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #ccc; border-radius: 4px;" />
						<label style="margin-top: 16px; display: block;" for="containerSelectorInput"><strong>Product Container Selector:</strong></label>
						<input style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #ccc; border-radius: 4px;" type="text" id="containerSelectorInput" placeholder="e.g. product-page, .product-container, .product-card-wrapper, product-card, product-price, [data-product-id], [data-pid]" />
					</div>
				</div>

				<!-- Compare at Price Tab -->
				<div id="comparePriceTab" class="tab-section" style="margin-top: 24px; display: none;">
					<div style="padding: 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff;">
						<div style="display:flex; align-items: center; justify-content: space-between">
							<label><strong>Compare at Price Class:</strong></label>
							<div style="display:flex; align-items: center; gap: 5px;">
								<div class= "delete-button-bg">
									<svg class= "compare-price-class-delete" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
									<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
									</svg>
								</div>
								<div class= "picker-bg">
									<svg class="compare-at-price-trigger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
									stroke-width="1.5" stroke="currentColor" width="20" height="20" style="color: black;">
									<path stroke-linecap="round" stroke-linejoin="round"
										d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
									</svg>
								</div>
							</div>
						</div>
						<input type="text" id="compareAtPriceClassInput" placeholder =".price-item.price-item--regular"
							style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #ccc; border-radius: 4px;" />
						<label style="margin-top: 16px; display: block;" for="compareContainerSelectorInput"><strong>Product Container Selector:</strong></label>
						<input style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #ccc; border-radius: 4px;" type="text" id="compareContainerSelectorInput" placeholder="e.g. product-page, .product-container, .product-card-wrapper, product-card, product-price, [data-product-id], [data-pid]" />
					</div>
				</div>
				<!-- badge tab -->
				<div id="badgePriceTab" class="tab-section" style="margin-top: 24px; display: none;">
					<div style="padding: 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff;">
						<div style="display:flex; align-items: center; justify-content: space-between">
							<label><strong>Badge Class:</strong></label>
							<div style="display:flex; align-items: center; gap: 5px;">
								<div class= "delete-button-bg">
									<svg class= "badge-class-delete" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
									<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
									</svg>
								</div>
								<div class= "picker-bg" >
									<svg class="badge-trigger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
									stroke-width="1.5" stroke="currentColor" width="20" height="20" style="color: black;">
									<path stroke-linecap="round" stroke-linejoin="round"
										d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
									</svg>
								</div>
							</div>
						</div>
						<input type="text" id="badgeClassInput" placeholder =".badge.price__badge-sale.color-scheme-5"
							style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #ccc; border-radius: 4px;" />
						<label style="margin-top: 16px; display: block;" for="badgeContainerSelectorInput"><strong>Product Container Selector:</strong></label>
						<input style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #ccc; border-radius: 4px;" type="text" id="badgeContainerSelectorInput" placeholder="e.g. product-page, .product-container, .product-card-wrapper, product-card, product-price, [data-product-id], [data-pid]" />
					</div>
				</div>
			</div>
		 </div>

			<!-- Styles for Tabs -->
			<style>
				.tab-button {
					padding: 6px 14px;
					border: none;
					background-color: transparent;
					cursor: pointer;
					font-size: 14px;
					font-weight: 500;
					color: #64748B;
					width: 50%
				}

				.active-tab {
					color: #fff;
					background: #1D4ED8;
					border-radius: 8px;
				}
				
				.picker-bg{
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 4px;
					background: #F1F5F9;
					border-radius: 5px;
					cursor: pointer;
				}

				.delete-button-bg{
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 4px;
					background: #F1F5F9;
					border-radius: 5px;
					cursor: pointer;
				}

				.delete-button-bg:hover{
					background: #1D4ED8;
					color: #fff;
				}

				// .delete-button-bg:hover .regular-price-class-delete{
				// 	color: #fff;
				// }

				.tab-section {
					animation: fadeIn 0.2s ease-in-out;
				}

				@keyframes fadeIn {
					from {
						opacity: 0.5;
					}

					to {
						opacity: 1;
					}
				}

				.ring-spinner {
					width: 16px;
					height: 16px;
					border: 2px solid #1D4ED8;
					border-top-color: transparent;
					border-radius: 50%;
					animation: spin 0.6s linear infinite;
				}

				@keyframes spin {
					to {
						transform: rotate(360deg);
					}
				}
			</style>
		 `
        : ''
    }
  `

  const header = modal.querySelector('#modalContainer')
  makeDraggable(modal, header)

  const button = document.getElementById('saveButton')
  const tooltip = document.getElementById('tooltipMessage')
  const container = button.parentElement

  container.addEventListener('mouseenter', () => {
    if (button.disabled) {
      tooltip.textContent = 'Please detect content, image or price'
    } else {
      tooltip.textContent = 'We only save your detected Tag, Id, Class'
    }
    tooltip.style.visibility = 'visible'
    tooltip.style.opacity = '1'
  })

  container.addEventListener('mouseleave', () => {
    tooltip.style.visibility = 'hidden'
    tooltip.style.opacity = '0'
  })

  function setupPriceTabs() {
    const regularTab = document.getElementById('regularTab')
    const compareTab = document.getElementById('compareTab')
    const badgeTab = document.getElementById('badgeTab')

    if (!regularTab || !compareTab || !badgeTab) return

    regularTab.onclick = function () {
      regularPrice = true
      compareAtPrice = false
      badge = false

      updatePriceTabUI()
      renderModal()
      updateButtonStates()
    }

    compareTab.onclick = function () {
      regularPrice = false
      compareAtPrice = true
      badge = false

      updatePriceTabUI()
      renderModal()
      updateButtonStates()
    }

    badgeTab.onclick = function () {
      regularPrice = false
      compareAtPrice = false
      badge = true

      updatePriceTabUI()
      renderModal()
      updateButtonStates()
    }
  }

  function updatePriceTabUI() {
    const regularTab = document.getElementById('regularTab')
    const compareTab = document.getElementById('compareTab')
    const badgeTab = document.getElementById('badgeTab')

    const regularPriceTab = document.getElementById('regularPriceTab')
    const comparePriceTab = document.getElementById('comparePriceTab')
    const badgePriceTab = document.getElementById('badgePriceTab')

    if (regularPrice) {
      regularPriceTab.style.display = 'block'
      comparePriceTab.style.display = 'none'
      badgePriceTab.style.display = 'none'

      regularTab.classList.add('active-tab')
      compareTab.classList.remove('active-tab')
      badgeTab.classList.remove('active-tab')
    } else if (compareAtPrice) {
      regularPriceTab.style.display = 'none'
      comparePriceTab.style.display = 'block'
      badgePriceTab.style.display = 'none'

      regularTab.classList.remove('active-tab')
      compareTab.classList.add('active-tab')
      badgeTab.classList.remove('active-tab')
    } else if (badge) {
      regularPriceTab.style.display = 'none'
      comparePriceTab.style.display = 'none'
      badgePriceTab.style.display = 'block'

      regularTab.classList.remove('active-tab')
      compareTab.classList.remove('active-tab')
      badgeTab.classList.add('active-tab')
    }
  }

  if (showPriceSection) {
    setupPriceTabs()
    updatePriceTabUI() // ensure correct tab is shown initially
  }

  function updateDeleteButtonState(priceClassArray, deleteButton) {
    // console.log('priceClassArray', priceClassArray)
    if (priceClassArray.length === 0) {
      deleteButton.style.pointerEvents = 'none'
      deleteButton.style.opacity = '0.4'
    } else {
      deleteButton.style.pointerEvents = 'auto'
      deleteButton.style.opacity = '1'
    }
  }

  const regularDelete = document.querySelector('.regular-price-class-delete')
  if (regularDelete) {
    updateDeleteButtonState(regularPriceClassOrId, regularDelete)
  }

  const compareDelete = document.querySelector('.compare-price-class-delete')
  if (compareDelete) {
    updateDeleteButtonState(comparePriceClassOrId, compareDelete)
  }

  const badgeDelete = document.querySelector('.badge-class-delete')
  if (badgeDelete) {
    updateDeleteButtonState(badgeClassOrId, badgeDelete)
  }

  // Attach live DOM updater after modal rerender
  if (showExtraSection) {
    const infoInput = document.getElementById('targetInfo')
    const replaceInput = document.getElementById('replaceInput')
    const hideCheckbox = document.getElementById('hideCheckbox')
    const leaveCheckbox = document.getElementById('leaveCheckbox')

    const el = window.__targetElement
    targetElement = el
    const originalText = el?.innerText

    if (infoInput && window.__targetInfo) {
      infoInput.value = `Tag: ${el?.tagName.toLowerCase()}, ID: ${
        el?.id || '—'
      }, Class: ${el?.className?.trim() || '—'}`
      textClassOrId = infoInput.value
      regularPriceClassOrId = null
      comparePriceClassOrId = null
      imgClassOrId = null
    }

    if (highlightCheckbox) highlightCheckbox.disabled = false
    setupHighlightCheckbox(highlightCheckbox, el)

    replaceInput?.addEventListener('input', () => {
      if (!leaveCheckbox?.checked && el) {
        el.innerText = replaceInput.value
      }
    })

    hideCheckbox?.addEventListener('change', () => {
      if (!leaveCheckbox?.checked && el) {
        el.style.display = hideCheckbox.checked ? 'none' : ''
      }
    })

    leaveCheckbox?.addEventListener('change', () => {
      if (leaveCheckbox.checked && el) {
        el.style.display = ''
        el.innerText = originalText

        replaceInput.value = originalText
        hideCheckbox.checked = false

        replaceInput.disabled = true
        hideCheckbox.disabled = true

        if (highlightCheckbox) {
          highlightCheckbox.checked = false
          highlightCheckbox.disabled = true
          removeHighlight(el)
        }
      } else {
        replaceInput.disabled = false
        hideCheckbox.disabled = false
        if (highlightCheckbox) highlightCheckbox.disabled = false
      }
    })

    // document.getElementById("closeExtraSection").addEventListener("click", () => {
    // 	showExtraSection = false;
    // 	if (highlightCheckbox) {
    // 		highlightCheckbox.checked = false;
    // 		highlightCheckbox.disabled = true;
    // 		removeHighlight(el);
    // 	}
    // 	renderModal();
    // });
  }

  if (showImageSection) {
    const infoInput = document.getElementById('targetInfo')
    const previewImage = document.getElementById('previewImage')
    const uploadInput = document.getElementById('uploadImageInput')
    const hideCheckbox = document.getElementById('hideCheckbox')
    const leaveCheckbox = document.getElementById('leaveCheckbox')

    const el = targetImage

    // console.log("Editing image:", el);
    if (!el || el.tagName !== 'IMG') {
      // console.log("No valid image element found or tag is not IMG.");
      return
    }

    const originalSrc = el.src
    // console.log("Original image src:", originalSrc);

    if (infoInput) {
      infoInput.value = `Tag: ${el?.tagName.toLowerCase()}, ID: ${
        el?.id || '—'
      }, Class: ${el?.className?.trim() || '—'}`
      textClassOrId = null
      regularPriceClassOrId = null
      comparePriceClassOrId = null
      imgClassOrId = infoInput.value
    }

    if (previewImage) {
      previewImage.src = originalSrc
    }

    hideCheckbox.disabled = leaveCheckbox.checked
    uploadInput.disabled = leaveCheckbox.checked

    const newUploadInput = uploadInput.cloneNode(true)
    uploadInput.parentNode.replaceChild(newUploadInput, uploadInput)

    const newHideCheckbox = hideCheckbox.cloneNode(true)
    hideCheckbox.parentNode.replaceChild(newHideCheckbox, hideCheckbox)

    const newLeaveCheckbox = leaveCheckbox.cloneNode(true)
    leaveCheckbox.parentNode.replaceChild(newLeaveCheckbox, leaveCheckbox)

    newUploadInput.addEventListener('change', () => {
      // console.log("Upload input changed");
      if (!el || newLeaveCheckbox.checked) {
        console.log('No element or leave checked, ignoring upload.')
        return
      }

      const file = newUploadInput.files[0]
      if (!file) {
        console.log('No file selected.')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const newSrc = event.target.result
        // console.log("File loaded, updating image src");

        el.src = newSrc
        el.srcset = newSrc // important to override srcset
        if (previewImage) previewImage.src = newSrc
      }
      reader.readAsDataURL(file)
    })

    newHideCheckbox.addEventListener('change', () => {
      // console.log("Hide checkbox changed", newHideCheckbox.checked);
      if (!el || newLeaveCheckbox.checked) return
      el.style.display = newHideCheckbox.checked ? 'none' : ''
    })

    const originalSrcset = el.getAttribute('srcset') // save original srcset

    // ...

    newLeaveCheckbox.addEventListener('change', () => {
      if (!el) return

      if (newLeaveCheckbox.checked) {
        // Revert changes
        el.src = originalSrc
        if (originalSrcset !== null) {
          el.setAttribute('srcset', originalSrcset)
        } else {
          el.removeAttribute('srcset')
        }
        el.style.display = ''

        newHideCheckbox.checked = false
        newUploadInput.value = ''
        if (previewImage) previewImage.src = originalSrc

        // Disable controls
        newHideCheckbox.disabled = true
        newUploadInput.disabled = true
      } else {
        // Enable controls
        newHideCheckbox.disabled = false
        newUploadInput.disabled = false
      }
    })
  }

  if (showPriceSection) {
    setTimeout(() => {
      const infoPriceInput = document.getElementById('priceClassInput')
      const infoCompareInput = document.getElementById(
        'compareAtPriceClassInput'
      )
      const infoBadgeInput = document.getElementById('badgeClassInput')
      // const replacePriceInput = document.getElementById('replacePriceInput');
      // const replaceCompareInput = document.getElementById('replaceComparePriceInput');
      const hidePriceCheckbox = document.getElementById('hidePriceCheckbox')
      const hideCompareCheckbox = document.getElementById('hideCompareCheckbox')
      const leavePriceCheckbox = document.getElementById('leavePriceCheckbox')
      const leaveCompareCheckbox = document.getElementById(
        'leaveCompareCheckbox'
      )
      // console.log('regularPrice', regularPrice)
      // console.log('hidePriceCheckbox', hidePriceCheckbox)
      // console.log('leavePriceCheckbox', leavePriceCheckbox)

      if (regularEl) {
        const value = regularEl.trim()
        if (!regularPriceClassOrId.includes(value)) {
          regularPriceClassOrId.push(regularEl)
        }
        infoPriceInput.value = regularPriceClassOrId?.join(' ')
        updatePricesForPage(regularPriceClassOrId, true, false)
        const regularDelete = document.querySelector(
          '.regular-price-class-delete'
        )
        if (regularDelete) {
          updateDeleteButtonState(regularPriceClassOrId, regularDelete)
        }
      }

      if (compareEl) {
        comparePriceClassOrId.push(compareEl)
        infoCompareInput.value = comparePriceClassOrId?.join(' ')
        updatePricesForPage(comparePriceClassOrId, false, false)
        const compareDelete = document.querySelector(
          '.compare-price-class-delete'
        )
        if (compareDelete) {
          updateDeleteButtonState(comparePriceClassOrId, compareDelete)
        }
      }

      if (badgeEl) {
        badgeClassOrId.push(badgeEl)
        infoBadgeInput.value = badgeClassOrId?.join(' ')
        updatePricesForPage(badgeClassOrId, false, true)
        const badgeDelete = document.querySelector('.badge-class-delete')
        if (badgeDelete) {
          updateDeleteButtonState(badgeClassOrId, badgeDelete)
        }
      }

      textClassOrId = null
      imgClassOrId = null
    }, 0)

    function findDomElementFromInfo(elInfo, id) {
      // console.log('elinfo', elInfo)
      // console.log('inputId', id)
      let currentContext = document

      for (const parent of elInfo.parentHierarchy) {
        const tags = parent.tags || [parent.tag] // support tags array or single tag
        let found = null

        // Try each tag with the class selector
        for (const tag of tags) {
          const selector = `${tag}${parent.class
            .split(' ')
            .map((c) => '.' + c)
            .join('')}`
          found = currentContext.querySelector(selector)
          if (found) {
            console.log(`Found parent element with selector: ${selector}`)
            // console.log('Text content:', found.innerText.trim());
            break
          }
        }

        if (!found) {
          console.warn(
            `Parent element not found for tags ${tags} and class ${parent.class}`
          )
          return null
        }

        currentContext = found
      }

      const targetTags = elInfo.targetTags || [elInfo.targetTag]
      let targetElement = null

      for (const tag of targetTags) {
        const selector = `${tag}${elInfo.targetClass
          .split(' ')
          .map((c) => '.' + c)
          .join('')}`
        targetElement = currentContext.querySelector(selector)
        if (targetElement) {
          // console.log(`Found target element with selector: ${selector}`);
          if (id === 'badgeClassInput') {
            badgeOrginalText = targetElement.innerText.trim()
          }
          break
        }
      }

      if (!targetElement) {
        console.warn(
          `Target element not found for tags ${targetTags} and class ${elInfo.targetClass}`
        )
        return null
      }

      return targetElement
    }

    const priceInputs = [
      document.getElementById('priceClassInput'),
      document.getElementById('compareAtPriceClassInput'),
      document.getElementById('badgeClassInput')
    ]

    priceInputs.forEach((input) => {
      if (input) {
        input.addEventListener('blur', () => {
          console.log(`${input.id} blur event fired`)

          const value = input.value.trim()
          if (!value || value === '—') return

          const classes = value
            .split(/\s+/)
            .map((cls) => cls.replace(/^\./, ''))
            .filter(Boolean)

          if (classes.length === 0) return

          const targetClass = classes.at(-1)
          const parentClasses = classes.slice(0, -1)

          const manualElInfo = {
            targetClass,
            targetTags: ['div', 'span', 's', 'dl'],
            parentHierarchy: parentClasses.map((cls) => ({
              tags: ['div', 'span', 's', 'dl'],
              class: cls
            })),
            dom: null
          }

          manualElInfo.dom = findDomElementFromInfo(manualElInfo, input.id)
          // console.log('manualInfo', manualElInfo.dom);
          if (!manualElInfo.dom) {
            console.warn('Could not find element from manual selector input')
            return
          }

          // console.log('📝 Manually entered selector parsed and element found:', manualElInfo);

          // You can distinguish which input it is here
          const type =
            input.id === 'priceClassInput'
              ? 'regular'
              : input.id === 'compareAtPriceClassInput'
              ? 'compare'
              : 'badge'

          // Store the found element to the appropriate global variable
          if (type === 'regular') {
            regularEl = input.value
            updatePricesForPage(regularEl, true, false)
            renderModal()
          } else if (type === 'compare') {
            compareEl = input.value
            updatePricesForPage(compareEl, false, false)
            renderModal()
          } else {
            badgeEl = input.value
            updatePricesForPage(badgeEl, false, true)
            renderModal()
          }
        })
      }
    })

    const containerInputs = [
      document.getElementById('containerSelectorInput'),
      document.getElementById('compareContainerSelectorInput'),
      document.getElementById('badgeContainerSelectorInput')
    ]

    containerInputs.forEach((input) => {
      if (input) {
        input.addEventListener('input', () => {
          console.log('containerSelectorInput input event fired')

          if (regularEl) updatePricesForPage(regularEl, true, false)
          if (compareEl) updatePricesForPage(compareEl, false, false)
          if (badgeEl) updatePricesForPage(badgeEl, false, true)
        })
      }
    })
  }

  const saveButton = document.getElementById('saveButton')
  if (saveButton) {
    const shouldEnable =
      showExtraSection ||
      showImageSection ||
      (showPriceSection && (!!regularEl || !!compareEl || !!badgeEl))
    saveButton.disabled = !shouldEnable

    if (!shouldEnable) {
      saveButton.style.backgroundColor = '#BFDBFE'
      saveButton.style.color = '#f0f0f0'
      saveButton.style.cursor = 'not-allowed'
      saveButton.style.borderColor = '#ddd'
    } else {
      saveButton.style.backgroundColor = '#1D4ED8'
      saveButton.style.color = '#ffffff'
      saveButton.style.cursor = 'pointer'
      saveButton.style.borderColor = '#ccc'
    }
  }

  // Attach Exit button event
  const exitBtn = document.getElementById('exitEditor')
  if (exitBtn) {
    exitBtn.onclick = () => {
      modal.style.display = 'none'
      sessionStorage.removeItem(PAYLOAD_KEY)
      sessionStorage.removeItem(PRODUCT_HANDLE)
      clearPayloadFromUrlAndStorage()
    }
  }

  const selectEl = document.getElementById('testGroupSelect')
  if (selectEl) {
    selectEl.addEventListener('change', () => {
      console.log('Change event fired!', selectEl.value)
      // console.log('comparePriceClassOrId', comparePriceClassOrId)
      // console.log('regularPriceClassOrId', regularPriceClassOrId)
      if (regularEl) updatePricesForPage(regularPriceClassOrId, true, false)
      if (compareEl) updatePricesForPage(comparePriceClassOrId, false, false)
      if (badgeEl) updatePricesForPage(badgeClassOrId, false, true)
    })
  }

  // const productSelect = document.getElementById('testProductSelect')
  // if (productSelect) {
  //   productSelect.addEventListener('change', () => {
  //     console.log('product select click')
  //     updateUrlWithProduct(productSelect.value)
  //   })
  // }
}

// Initialize dropdown behavior
function initProductSelect() {
  const productSelect = document.getElementById('testProductSelect')
  if (!productSelect) return

  // Extract handle from path: /products/{handle}
  const pathMatch = window.location.pathname.match(/^\/products\/([^/]+)/)
  const currentHandle = pathMatch ? pathMatch[1] : null

  if (
    currentHandle &&
    [...productSelect.options].some((opt) => opt.value === currentHandle)
  ) {
    // If dropdown contains this handle → select it
    productSelect.value = currentHandle
  } else {
    // Otherwise → default
    productSelect.value = ''
  }

  // On select → redirect
  productSelect.addEventListener('change', () => {
    const selectedHandle = productSelect.value
    if (!selectedHandle) return

    // Preserve existing query params
    const urlParams = new URLSearchParams(window.location.search)
    const testingProducts = parsedPayload?.productInfo?.testingProducts

    if (!Array.isArray(testingProducts)) return

    // Find the first matching product by productHandle
    const matchingProduct = testingProducts.find(
      (p) => p.productHandle === selectedHandle
    )

    if (!matchingProduct) return

    const variantId = matchingProduct.variantId
    urlParams.set('variant', variantId) // value is dynamic

    window.location.href = `/products/${selectedHandle}?${urlParams.toString()}`
  })
}

initProductSelect()

// update button state
function updateButtonStates() {
  const contentButton = document.querySelector('.extra-section-trigger')
  const imageButton = document.querySelector('.image-section-trigger')
  const priceButton = document.querySelector('.open-price-option')

  // Content Button
  if (contentButton) {
    if (showExtraSection) {
      contentButton.style.backgroundColor = '#1D4ED8'
      contentButton.style.color = '#fff'
      contentButton
        ?.querySelectorAll('svg path')
        .forEach((p) => p.setAttribute('fill', '#fff'))
    } else {
      contentButton.style.backgroundColor = '#fff'
      contentButton.style.color = '#020617'
      contentButton
        ?.querySelectorAll('svg path')
        .forEach((p) => p.setAttribute('fill', '#020617'))
    }
  }

  // Image Button
  if (imageButton) {
    if (showImageSection) {
      imageButton.style.backgroundColor = '#1D4ED8'
      imageButton.style.color = '#fff'
      imageButton
        ?.querySelectorAll('svg path')
        .forEach((p) => p.setAttribute('fill', '#fff'))
    } else {
      imageButton.style.backgroundColor = '#fff'
      imageButton.style.color = '#020617'
      imageButton
        ?.querySelectorAll('svg path')
        .forEach((p) => p.setAttribute('fill', '#020617'))
    }
  }

  // Price Button
  if (priceButton) {
    // console.log('showPriceSection from btn', showPriceSection)
    if (showPriceSection) {
      priceButton.style.backgroundColor = '#1D4ED8'
      priceButton.style.color = '#fff'
      priceButton
        ?.querySelectorAll('svg path')
        .forEach((p) => p.setAttribute('fill', '#fff'))
    } else {
      priceButton.style.backgroundColor = '#fff'
      priceButton.style.color = '#020617'
      priceButton
        ?.querySelectorAll('svg path')
        .forEach((p) => p.setAttribute('fill', '#020617'))
    }
  }
}

// highlight-checkbox

document.body.addEventListener('change', (event) => {
  const target = event.target.closest('#highlight-checkbox')
  // console.log('updatedDom', updatedDom)
  if (target) {
    if (target?.checked) {
      highlightCheckbox = true
      if (updatedDom.length > 0) {
        updatedDom.forEach((el) => {
          el.style.border = '1px dashed #1D4ED8'
          el.style.color = '#1D4ED8'
        })
      }
      console.log('✅ Highlight Replaces is ON', highlightCheckbox)
      // your logic when ON
    } else {
      highlightCheckbox = false
      if (updatedDom.length > 0) {
        updatedDom.forEach((el) => {
          el.style.border = 'none'
          el.style.color = ''
        })
      }
      console.log('🚫 Highlight Replaces is OFF', highlightCheckbox)
      // your logic when OFF
    }
  }
})

document.body.addEventListener('click', (event) => {
  const target = event.target.closest('.regular-price-class-delete')
  if (target) {
    console.log('delet button click')
    if (regularPriceClassOrId.length > 0) {
      console.log('regularPriceClassOrId', regularPriceClassOrId)
      const infoPriceInput = document.getElementById('priceClassInput')
      const containerInput = document.getElementById('containerSelectorInput')
      regularPriceClassOrId = []
      regularEl = ''
      productContainer = []
      target.style.pointerEvents = 'none'
      target.style.opacity = '0.4'
      infoPriceInput.value = ''
      containerInput.value = ''
      showToast('Regular classes delete successfully!', 'success')
    }
  }
})

document.body.addEventListener('click', (event) => {
  const target = event.target.closest('.compare-price-class-delete')
  if (target) {
    if (comparePriceClassOrId.length > 0) {
      const infoCompareInput = document.getElementById(
        'compareAtPriceClassInput'
      )
      const containerInput = document.getElementById(
        'compareContainerSelectorInput'
      )
      comparePriceClassOrId = []
      compareEl = ''
      productContainer = []
      infoCompareInput.value = ''
      containerInput.value = ''
      showToast('Compare classes delete successfully!', 'success')
    }
  }
})

document.body.addEventListener('click', (event) => {
  const target = event.target.closest('.badge-class-delete')
  if (target) {
    if (badgeClassOrId.length > 0) {
      const infoBadgeInput = document.getElementById('badgeClassInput')
      const containerInput = document.getElementById(
        'badgeContainerSelectorInput'
      )
      badgeClassOrId = []
      badgeEl = ''
      productContainer = []
      infoBadgeInput.value = ''
      containerInput.value = ''
      showToast('badge classes delete successfully!', 'success')
    }
  }
})

// open and close edit pannel
document.body.addEventListener('click', function (event) {
  const target = event.target.closest('#option-pannel-edit')
  if (target) {
    showOptionPannel = !showOptionPannel
    if (showOptionPannel) {
      // Panel expanded – default to Content
      if (parsedPayload?.experimentType == 'price_testing') {
        showPriceSection = true
        // activeTab = "regular"
      } else if (parsedPayload?.experimentType == 'image_testing') {
        showImageSection = true
      } else {
        showExtraSection = true
      }
    } else {
      // Panel collapsed – reset everything
      showExtraSection = false
      showImageSection = false
      showPriceSection = false
    }

    renderModal()
    // updatePricesForPage()
    updateButtonStates() // ✅ highlight only Content button
  }
})

// save the class in database -- hit save button
document.body.addEventListener('click', function (event) {
  if (event.target && event.target.id === 'saveButton') {
    isLoading = true
    // show the spinner
    document.getElementById('saveSpinner').style.display = 'inline-block'
    document.getElementById('saveButtonText').textContent = 'Saving...'
    console.log('shop', class_shop)
    const payload = {
      themeId: themeId?.toString(),
      themeName: themeName,
      shop: class_shop,
      selectors: {
        themeId: themeId,
        shop: window.Shopify.shop,
        salePriceClassOrId: regularPriceClassOrId,
        comparePriceClassOrId: comparePriceClassOrId,
        priceContainer: productPriceContainer,
        productContainer: productContainer,
        singleProductContainer: singleProductContainer,
        badgeClassOrId: badgeClassOrId,
        badgeOrginalText: badgeOrginalText,
        addtocartSelector: addtocartSelector,
        textClassOrId: textClassOrId,
        contentContainer: contentContainer,
        imgClassOrId: imgClassOrId,
        imageContainer: imageContainer,
        triggerButtonClassOrId: triggerButtonClassOrId,
        searchClassOrId: searchClassOrId,
        modalClassOrId: modalClassOrId,
        triggerButtonContainer: triggerButtonContainer,
        triggerElementContainer: triggerElementContainer,
        singleImgClassOrId: singleImgClassOrId,
        singleProductImageContainer: singleProductImageContainer,
        searchItemLink: searchItemLink,
        searchImage: searchImage
      }
    }

    console.log('payload', payload)

    // fetch("http://localhost:5001/api/v1/app/selector", {
    fetch('https://api.testsignal.com/api/v1/app/selector', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then((response) => {
        if (!response.ok) {
          showToast('Save failed. Please try again.', 'error')
          isLoading = false
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then((data) => {
        console.log('Success:', data)
        showToast('Saved successfully!', 'success')
        isLoading = false
        // hide the spinner
        document.getElementById('saveSpinner').style.display = 'none'
        document.getElementById('saveButtonText').textContent = 'Save'
      })
      .catch((error) => {
        console.error('Error:', error)
        isLoading = false
      })
  }
})

// toast

function showToast(message, type = 'success') {
  const toast = document.createElement('div')
  toast.textContent = message

  // Choose background color based on type
  const borderColor = type === 'success' ? '#1D4ED8' : '#f44336' // green or red
  const color = type === 'success' ? '#1D4ED8' : '#f44336' // green or red

  Object.assign(toast.style, {
    position: 'fixed',
    top: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: ' #ffffff',
    color: color,
    padding: '10px 30px',
    borderRadius: '20px',
    border: `2px solid ${borderColor}`,
    fontSize: '16px',
    fontWeight: '550',
    textAlign: 'center',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity 0.5s ease-in-out',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' // 👈 box shadow added
  })

  document.body.appendChild(toast)

  // Fade in
  requestAnimationFrame(() => {
    toast.style.opacity = '1'
  })

  // Fade out after 3s
  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => {
      toast.remove()
    }, 200)
  }, 3000)
}

// show extra section
document.body.addEventListener('click', (e) => {
  const trigger = e.target.closest('.extra-section-trigger')
  if (trigger) {
    e.preventDefault()

    showExtraSection = true // ✅ explicitly set true
    showPriceSection = false
    showImageSection = false

    renderModal()
    // updatePricesForPage()
    updateButtonStates() // ✅ consistent update
  }
})

// show image section
document.body.addEventListener('click', (e) => {
  const trigger = e.target.closest('.image-section-trigger')
  if (trigger) {
    e.preventDefault()

    showImageSection = true
    showExtraSection = false
    showPriceSection = false

    renderModal()
    // updatePricesForPage()
    updateButtonStates()
  }
})

// show price section
const priceSection = document.querySelector('.price-section') // Section to show/hide

document.body.addEventListener('click', (e) => {
  const trigger = e.target.closest('.open-price-option')
  if (trigger) {
    e.preventDefault()
    showPriceSection = true
    showExtraSection = false
    showImageSection = false

    renderModal() // optional if you're dynamically updating
    // updatePricesForPage()

    setTimeout(() => {
      updateButtonStates()
    }, 10) // keep your delay if modal rendering overwrites button
  }
})

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.querySelector('.element-picker-trigger')
  let picking = false

  // List of class keywords to ignore
  const priceRelatedKeywords = [
    'price',
    'price-box',
    'price-item',
    'price__badge',
    'product-price',
    'price--on-sale',
    'price--regular',
    'price--sale',
    'price__container'
  ]

  const isPriceRelated = (el) => {
    if (!el) return false
    const classList = el.classList?.value || ''
    return priceRelatedKeywords.some((keyword) => classList.includes(keyword))
  }

  const hasPriceAncestor = (el) => {
    while (el && el !== document.body) {
      if (isPriceRelated(el)) return true
      el = el.parentElement
    }
    return false
  }

  const mouseOver = (e) => {
    const target = e.target
    if (
      !target.closest('.element-picker-trigger') &&
      !isPriceRelated(target) &&
      !hasPriceAncestor(target)
    ) {
      target.classList.add('__hover-target')
    }
  }

  const mouseOut = (e) => {
    e.target.classList.remove('__hover-target')
  }

  const clickHandler = (e) => {
    let target = e.target

    if (
      target.closest('.element-picker-trigger') ||
      target.closest('#element-info-modal') ||
      isPriceRelated(target) ||
      hasPriceAncestor(target)
    ) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    stopPicker()

    const tag = target.tagName.toLowerCase()
    const id = target.id || '—'
    const className =
      typeof target.className === 'string' && target.className.trim() !== ''
        ? target.className
        : '—'
    const content = target.innerText.trim() || '—'

    showModal(tag, id, className, target, content)
  }

  const startPicker = () => {
    if (picking) return
    picking = true

    // When picking starts

    const style = document.createElement('style')
    style.id = '__picker-style'
    style.textContent = `
      .__hover-target {
        outline: 2px dashed red !important;
        cursor: crosshair !important;
      }
    `
    document.head.appendChild(style)

    document.addEventListener('mouseover', mouseOver)
    document.addEventListener('mouseout', mouseOut)
    document.addEventListener('click', clickHandler, true)
  }

  const stopPicker = () => {
    if (!picking) return
    picking = false

    // When picking ends
    document.removeEventListener('mouseover', mouseOver)
    document.removeEventListener('mouseout', mouseOut)
    document.removeEventListener('click', clickHandler, true)
    document.getElementById('__picker-style')?.remove()
    document
      .querySelectorAll('.__hover-target')
      .forEach((el) => el.classList.remove('__hover-target'))
  }

  const showModal = (tag, id, className, targetElement) => {
    document.getElementById('element-info-modal')?.remove()

    const modal = document.createElement('div')
    modal.id = 'element-info-modal'
    modal.style.position = 'absolute'
    modal.style.background = '#fff'
    modal.style.border = '1px solid #E2E8F0'
    modal.style.borderRadius = '16px'
    modal.style.padding = '16px 0'
    modal.style.fontFamily = 'sans-serif'
    modal.style.fontSize = '14px'
    modal.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
    modal.style.zIndex = '9999'

    modal.innerHTML = `
      <div style= "padding: 0 16px">
				<div><strong style="color: #020617">Tag:</strong> <span style= "color: #1D4ED8">${tag}</span></div>
				<div><strong style="color: #020617">ID:</strong> <span style= "color: #1D4ED8">${id}</span></div>
				<div><strong style="color: #020617">Class:</strong> <span style= "color: #1D4ED8">${className}</span></div>
			</div>
			<hr style= "margin-top: 5px; margin-bottom: 5px; color: #E2E8F0">
      <div style= "display: flex; align-items: center; justify-content: end; gap: 5px; margin-top: 10px; padding: 0 16px">
				<button id="close-info" style="margin-right:10px; border-radius: 25px; background-color: #DC2626; border: none; padding: 6px 12px; color: #fff">Close</button>
				<button id="edit-info" style="border-radius: 25px; background-color: #1D4ED8; border: none; padding: 6px 12px; color: #fff; display: flex; align-items: center; justify-content: center; gap: 5px">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M7.99935 13.3332H13.9993M10.9167 2.41449C11.1821 2.1491 11.542 2 11.9173 2C12.2927 2 12.6526 2.1491 12.918 2.41449C13.1834 2.67988 13.3325 3.03983 13.3325 3.41516C13.3325 3.79048 13.1834 4.15043 12.918 4.41582L4.91133 12.4232C4.75273 12.5818 4.55668 12.6978 4.34133 12.7605L2.42667 13.3192C2.3693 13.3359 2.30849 13.3369 2.25061 13.3221C2.19272 13.3072 2.13988 13.2771 2.09763 13.2349C2.05538 13.1926 2.02526 13.1398 2.01043 13.0819C1.9956 13.024 1.9966 12.9632 2.01333 12.9058L2.572 10.9912C2.63481 10.776 2.75083 10.5802 2.90933 10.4218L10.9167 2.41449Z" stroke="#F8FAFC" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
					Edit
				</button>
			</div>
    `

    document.body.appendChild(modal)

    const rect = targetElement.getBoundingClientRect()
    modal.style.top = `${rect.bottom + window.scrollY + 6}px`
    modal.style.left = `${rect.left + window.scrollX}px`

    modal.querySelector('#close-info').onclick = () => {
      renderModal()
      modal.remove()
      // updatePricesForPage()
      updateButtonStates()
    }

    modal.querySelector('#edit-info').onclick = () => {
      window.__targetElement = targetElement
      window.__targetInfo = `ID: ${id}, Class: ${className}`
      renderModal()
      modal.remove()
      // updatePricesForPage()
      updateButtonStates()
    }

    // const outsideClickListener = (event) => {
    // 	    if (!modal.contains(event.target)) {
    // 				modal.remove();
    // 	      renderModal();
    // 				updatePricesForPage()
    // 				updateButtonStates()
    // 	      document.removeEventListener('click', outsideClickListener);
    // 	    }
    // 	  };
    // 	  document.addEventListener('click', outsideClickListener);
  }

  // Toggle picker on trigger click
  document.body.addEventListener('click', (e) => {
    const testGroupSelect = document.getElementById('testGroupSelect')
    const priceBtn = document.querySelector('.open-price-option')
    const imgBtn = document.querySelector('.image-section-trigger')
    if (e.target.closest('.element-picker-trigger')) {
      e.preventDefault()
      if (picking) {
        stopPicker()
        // Change fill color of all <path> elements inside SVG
        const paths = e.target.closest('.element-picker-trigger')
        paths.style.color = '#020617'

        if (testGroupSelect) {
          testGroupSelect.disabled = false
          testGroupSelect.style.cursor = 'pointer'
          testGroupSelect.style.opacity = '1'
        }
        if (priceBtn) {
          priceBtn.disabled = false
          priceBtn.style.cursor = 'pointer'
          priceBtn.style.opacity = '1'
        }
        if (imgBtn) {
          imgBtn.disabled = false
          imgBtn.style.cursor = 'pointer'
          imgBtn.style.opacity = '1'
        }
      } else {
        startPicker()
        // Change fill color of all <path> elements inside SVG
        const paths = e.target.closest('.element-picker-trigger')
        paths.style.color = '#A855F7'

        if (testGroupSelect) {
          testGroupSelect.disabled = true
          testGroupSelect.style.cursor = 'not-allowed'
          testGroupSelect.style.opacity = '0.6'
        }

        if (priceBtn) {
          priceBtn.disabled = true
          priceBtn.style.cursor = 'not-allowed'
          priceBtn.style.opacity = '0.6'
        }
        if (imgBtn) {
          imgBtn.disabled = true
          imgBtn.style.cursor = 'not-allowed'
          imgBtn.style.opacity = '0.6'
        }
      }
    }
  })
})

// retrive price classes
function buildSelectorFromHierarchy(elObject) {
  const getCleanClass = (cls) => {
    if (!cls) return ''
    const classStr = typeof cls === 'string' ? cls : cls.baseVal || ''
    return classStr
      .split(/\s+/)
      .filter((c) => /^[a-zA-Z0-9_-]+$/.test(c))
      .map((c) => `.${c}`)
      .join('')
  }

  // Build parent hierarchy string
  const parentClassList = (elObject.parentHierarchy || [])
    .map((p) => {
      let refPart = p.ref ? `[ref="${p.ref}"]` : ''
      let classPart = getCleanClass(p.class)
      return `${refPart}${classPart}`
    })
    .reverse()
    .join(' ')

  // Target element
  let targetRefPart = elObject.targetRef ? `[ref="${elObject.targetRef}"]` : ''
  let targetClassList = getCleanClass(elObject.targetClass)

  // Final selector
  return `${
    parentClassList ? `${parentClassList} ` : ''
  }${targetRefPart}${targetClassList}`
}

function toClassSelectorWithSpaces(classString) {
  return classString
    .trim()
    .split(/\s+/)
    .filter((cls) => /^[a-zA-Z0-9_-]+$/.test(cls)) // Keep only valid class names
    .map((cls) => `.${cls}`)
    .join(' ')
}

// for price picking
document.addEventListener('DOMContentLoaded', () => {
  let pickingPrice = false
  let hoverStyle
  let activePriceTrigger = null

  const regularPriceSelectors = [
    '.price-item--regular',
    '.regular-price',
    '.price-regular',
    '.price-item.regular',
    '.price',
    '.price-regular-value'
  ]
  const salePriceSelectors = [
    '.price-item--sale',
    '.sale-price',
    '.price-sale',
    '.price-item.sale',
    '.price-compare'
  ]
  const badgeSelectors = ['.price__badge-sale', '.price__badge', '.badge']
  const priceSelectors = [
    ...regularPriceSelectors,
    ...salePriceSelectors,
    '.product-price',
    '.price-box',
    'a'
  ]

  function isHorizonTheme() {
    return (
      document.querySelector('product-card') !== null ||
      document.querySelector('product-price') !== null
    )
  }

  function findPriceElement(target) {
    for (const sel of badgeSelectors) {
      const el = target.closest(sel)
      if (el) return { el, type: 'Badge' }
    }
    for (const sel of salePriceSelectors) {
      const el = target.closest(sel)
      if (el) return { el, type: 'Sale Price' }
    }
    for (const sel of regularPriceSelectors) {
      const el = target.closest(sel)
      if (el) return { el, type: 'Regular Price' }
    }
    return null
  }

  // =============================
  // ✅ Default Theme Picker
  // =============================
  const defaultMouseOver = (e) => {
    const aTag = e.target.closest('a')
    if (aTag && !aTag.__replaced) {
      aTag.__originalDisplay = aTag.style.display
      aTag.style.display = 'none'

      const h5 = document.createElement('h5')
      h5.textContent = aTag.innerText || aTag.textContent || ''
      h5.style.color = '#121212'
      aTag.parentNode.insertBefore(h5, aTag.nextSibling)
      aTag.__replaced = true

      h5.addEventListener('mouseout', () => {
        h5.remove()
        aTag.style.display = aTag.__originalDisplay || ''
        aTag.__replaced = false
      })
    }

    if (priceSelectors.some((sel) => e.target.closest(sel))) {
      e.target.classList.add('__price-hover-target')
    }
  }

  const defaultMouseOut = (e) => {
    e.target.classList.remove('__price-hover-target')
  }

  const defaultClickHandler = (e) => {
    if (
      e.target.closest('.regular-price-trigger') ||
      e.target.closest('.compare-at-price-trigger') ||
      e.target.closest('.badge-trigger')
    )
      return
    e.preventDefault()
    e.stopPropagation()

    const match = findPriceElement(e.target)
    if (!match) return

    const { el: target, type } = match
    stopPricePicker()
    target.classList.add('__price-selected')
    showPriceInfoModal(target, type)
  }

  function startDefaultPricePicker() {
    if (pickingPrice) return
    pickingPrice = true

    appendHoverStyle()

    document.addEventListener('mouseover', defaultMouseOver)
    document.addEventListener('mouseout', defaultMouseOut)
    document.addEventListener('click', defaultClickHandler, true)
  }

  // =============================
  // ✅ Horizon Theme Picker
  // =============================
  let horizonMouseOver, horizonMouseOut, horizonClickHandler

  const horizonSelectors = [
    'product-price .price',
    'product-price .compare-at-price',
    '.price-regular-value',
    '.price-compare',
    '.price__badge',
    'product-page .price-regular-value',
    'product-page .price-compare',
    'product-page .price__badge',
    '.price'
  ]

  horizonMouseOver = (e) => {
    const el = e.target.closest(horizonSelectors.join(','))
    if (el) el.classList.add('__price-hover-target')
  }

  horizonMouseOut = (e) => {
    e.target.classList.remove('__price-hover-target')
  }

  horizonClickHandler = (e) => {
    // 🛡️ Prevent the handler from reacting to trigger button clicks
    if (
      e.target.closest('.regular-price-trigger') ||
      e.target.closest('.compare-at-price-trigger') ||
      e.target.closest('.badge-trigger')
    )
      return
    e.preventDefault()
    e.stopPropagation()

    const el = e.target.closest(horizonSelectors.join(','))
    console.log('el', el)
    if (!el) return

    stopPricePicker()
    el.classList.add('__price-selected')

    let type = el.classList.contains('compare-at-price')
      ? 'Compare at Price'
      : 'Sale or Regular Price'
    showPriceInfoModal(el, type)
  }

  function startHorizonPricePicker() {
    if (pickingPrice) return
    pickingPrice = true

    appendHoverStyle()

    document.addEventListener('mouseover', horizonMouseOver)
    document.addEventListener('mouseout', horizonMouseOut)
    document.addEventListener('click', horizonClickHandler, true)
    console.log('Horizon Picker started')
  }

  function appendHoverStyle() {
    hoverStyle = document.createElement('style')
    hoverStyle.id = '__price-picker-style'
    hoverStyle.textContent = `
			.__price-hover-target {
				outline: 2px dashed #1D4ED8 !important;
				cursor: crosshair !important;
			}
			.__price-selected {
				outline: 3px solid #1D4ED8 !important;
			}
		`
    document.head.appendChild(hoverStyle)
  }

  // =============================
  // ✅ Picker Toggle Logic
  // =============================
  function startPricePicker() {
    // console.log('isHorizon', isHorizonTheme())
    if (isHorizonTheme()) {
      console.log('inHorizon')
      startHorizonPricePicker()
    } else {
      console.log('indefault')
      startDefaultPricePicker()
    }
  }

  function stopPricePicker() {
    // console.log('stopPicker', pickingPrice)
    if (!pickingPrice) return
    pickingPrice = false
    // console.log('stopPicker', pickingPrice)

    document.getElementById('__price-picker-style')?.remove()
    document
      .querySelectorAll('.__price-hover-target')
      .forEach((el) => el.classList.remove('__price-hover-target'))
    document
      .querySelectorAll('.__price-selected')
      .forEach((el) => el.classList.remove('__price-selected'))

    document.removeEventListener('mouseover', defaultMouseOver)
    document.removeEventListener('mouseout', defaultMouseOut)
    document.removeEventListener('click', defaultClickHandler, true)

    document.removeEventListener('mouseover', horizonMouseOver)
    document.removeEventListener('mouseout', horizonMouseOut)
    document.removeEventListener('click', horizonClickHandler, true)
    console.log('Picker stopped')
  }

  // =============================
  // ✅ Trigger Button Events
  // =============================
  document.body.addEventListener('click', (e) => {
    const regular = e.target.closest('.regular-price-trigger')
    const compare = e.target.closest('.compare-at-price-trigger')
    const badge = e.target.closest('.badge-trigger')

    if (regular) {
      e.preventDefault()
      toggleTrigger('regular', regular)
    } else if (compare) {
      e.preventDefault()
      toggleTrigger('compare', compare)
    } else if (badge) {
      toggleTrigger('badge', badge)
    }
  })

  function toggleTrigger(triggerType, buttonEl) {
    const testGroupSelect = document.getElementById('testGroupSelect')
    const contentBtn = document.querySelector('.extra-section-trigger')
    const imgBtn = document.querySelector('.image-section-trigger')

    if (pickingPrice && activePriceTrigger === triggerType) {
      // console.log('trigger from one')
      stopPricePicker()
      activePriceTrigger = null
      buttonEl.style.color = '#020617'
      const button = document.querySelectorAll('.picker-bg')
      if (button) {
        button.forEach((btn) => {
          btn.style.background = '#F1F5F9'
        })
      }

      if (testGroupSelect) {
        testGroupSelect.disabled = false
        testGroupSelect.style.cursor = 'pointer'
        testGroupSelect.style.opacity = '1'
      }
      if (contentBtn) {
        contentBtn.disabled = false
        contentBtn.style.cursor = 'pointer'
        contentBtn.style.opacity = '1'
      }
      if (imgBtn) {
        imgBtn.disabled = false
        imgBtn.style.cursor = 'pointer'
        imgBtn.style.opacity = '1'
      }
    } else {
      // console.log('trigger form two')
      stopPricePicker()
      activePriceTrigger = triggerType
      // console.log('activeTrigger', activePriceTrigger)
      startPricePicker()
      // console.log('pickeingPrice', pickingPrice)
      buttonEl.style.color = '#fff'
      const button = document.querySelectorAll('.picker-bg')
      if (button) {
        button.forEach((btn) => {
          btn.style.background = '#1D4ED8'
        })
      }

      if (testGroupSelect) {
        testGroupSelect.disabled = true
        testGroupSelect.style.cursor = 'not-allowed'
        testGroupSelect.style.opacity = '0.6'
      }
      if (contentBtn) {
        contentBtn.disabled = true
        contentBtn.style.cursor = 'not-allowed'
        contentBtn.style.opacity = '0.6'
      }
      if (imgBtn) {
        imgBtn.disabled = true
        imgBtn.style.cursor = 'not-allowed'
        imgBtn.style.opacity = '0.6'
      }
    }
  }

  // =============================
  // ✅ Modal and Helpers (same as before)
  // =============================
  function getParentHierarchy(el, depth = 3) {
    if (!el) {
      console.warn('No element reference provided.')
      return []
    }

    const hierarchy = []
    let current = el.parentElement
    let level = 0

    while (current && level < depth) {
      let rawClass = current.className
      let className =
        typeof rawClass === 'string'
          ? rawClass.trim()
          : (rawClass?.baseVal || '—').trim()

      const tag = current.tagName.toLowerCase()
      const refAttr = current.getAttribute('ref')

      hierarchy.push({
        tag,
        class: className,
        ref: refAttr || null
      })

      // Break the loop if ref="priceContainer" or tag is <price-container>
      if (refAttr === 'priceContainer' || tag === 'product-price') {
        break
      }

      current = current.parentElement
      level++
    }

    return hierarchy
  }

  function showPriceInfoModal(target, type) {
    document.getElementById('price-info-modal')?.remove()

    const modal = document.createElement('div')
    modal.id = 'price-info-modal'
    modal.style.position = 'absolute'
    modal.style.background = 'white'
    modal.style.border = '1px solid #E2E8F0'
    modal.style.borderRadius = '16px'
    modal.style.padding = '16px 0'
    modal.style.fontFamily = 'sans-serif'
    modal.style.fontSize = '14px'
    modal.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
    modal.style.zIndex = '10000'

    const tag = target.tagName.toLowerCase()
    const id = target.id || '—'
    const className = target.className ? target.className.trim() : '—'
    const parents = getParentHierarchy(target)
    let parentsHTML = parents
      .map(
        (p, i) => `
			<div><strong style="color: #020617">Parent ${i + 1}:</strong> 
			<span style="color: #0369A1">${p.tag}</span> 
			<span style="color: #475569">.${p.class}</span>
			</div>`
      )
      .join('')

    modal.innerHTML = `
			<div style="padding: 0 16px">
				<div><strong style="color: #020617">Type:</strong> <span style="color: #1D4ED8">${type}</span></div>
				<div><strong style="color: #020617">Tag:</strong> <span style="color: #1D4ED8">${tag}</span></div>
				<div><strong style="color: #020617">ID:</strong> <span style="color: #1D4ED8">${id}</span></div>
				<div><strong style="color: #020617">Class:</strong> <span style="color: #1D4ED8">${className}</span></div>
				${parentsHTML}
			</div>
			<hr style="margin-top: 5px; margin-bottom: 5px; color: #E2E8F0">
			<div style="display: flex; align-items: center; justify-content: start; gap: 5px; margin-top: 10px; padding: 0 16px">
				<button id="edit-price-info" style="border-radius: 10px; background-color: #1D4ED8; border: none; padding: 6px 12px; color: #fff">Select</button>
				<button id="close-price-info" style="margin-right:10px; border-radius: 10px; background-color: #DC2626; border: none; padding: 6px 12px; color: #fff">Close</button>
			</div>
		`

    document.body.appendChild(modal)
    const rect = target.getBoundingClientRect()
    modal.style.top = `${rect.bottom + window.scrollY + 6}px`
    modal.style.left = `${rect.left + window.scrollX}px`

    modal.querySelector('#close-price-info').onclick = () => {
      modal.remove()
      target.classList.remove('__price-selected')
      renderModal()
      // updatePricesForPage()
      updateButtonStates()
    }

    modal.querySelector('#edit-price-info').onclick = () => {
      modal.remove()
      target.classList.remove('__price-selected')
      const parentHierarchy = getParentHierarchy(target, 3)
      const targetClass = target.className || '—'
      const targetTag = target.tagName.toLowerCase()

      const combinedInfo = {
        targetClass,
        targetTag,
        parentHierarchy,
        dom: target // ✅ store DOM element here
      }

      function flattenSelectors(raw) {
        const selectors = []

        raw.forEach((item) => {
          // Handle class strings
          if (item.class) {
            const classParts = item.class
              .trim()
              .split(/\s+/)
              .filter((cls) => /^[a-zA-Z0-9_-]+$/.test(cls)) // filter out invalid ones like "—"
              .map((cls) => `.${cls}`)
            selectors.push(...classParts)
          }

          // Handle [ref="..."]
          if (item.ref) {
            selectors.push(`[ref="${item.ref}"]`)
          }
        })

        return selectors
      }
      // console.log('Selected Info:', combinedInfo); // Optional debug log

      if (activePriceTrigger === 'regular') {
        regularEl = buildSelectorFromHierarchy(combinedInfo)
        regularOriginalText = target.innerText
        const container = flattenSelectors(combinedInfo?.parentHierarchy).join(
          ' '
        )
        const value = container.trim()
        if (!productPriceContainer.includes(value)) {
          productPriceContainer.push(container)
        }
      } else if (activePriceTrigger === 'compare') {
        compareEl = buildSelectorFromHierarchy(combinedInfo)
        compareOriginalText = target.innerText
        const container = flattenSelectors(combinedInfo?.parentHierarchy).join(
          ' '
        )
        const value = container.trim()
        if (!productPriceContainer.includes(value)) {
          productPriceContainer.push(container)
        }
      } else if (activePriceTrigger === 'badge') {
        badgeEl = buildSelectorFromHierarchy(combinedInfo)
        badgeOrginalText = target.innerText
        const container = flattenSelectors(combinedInfo?.parentHierarchy).join(
          ' '
        )
        const value = container.trim()
        if (!productPriceContainer.includes(value)) {
          productPriceContainer.push(container)
        }
      }
      renderModal()
      // updatePricesForPage()
      updateButtonStates()
    }
  }
})

// for image trigger
function enableImagePickerForOthers() {
  let pickingImage = false
  let disabledElements = []
  let selectedImage = null

  const imageTrigger = document.querySelector('.image-trigger')

  function startImagePicker() {
    if (pickingImage) return
    pickingImage = true
    // console.log('✅ Image picker started');

    // Temporarily remove Shopify zoom triggers
    document
      .querySelectorAll('.product-media-container--zoomable')
      .forEach((el) => {
        if (el.hasAttribute('on:click')) {
          const original = el.getAttribute('on:click')
          el.setAttribute('data-original-onclick', original)
          el.removeAttribute('on:click') // This fully disables zoom
        }
      })

    // Disable pointer events on links/buttons to avoid interference
    disabledElements = [...document.querySelectorAll('a, button')]
    disabledElements.forEach((el) => {
      el.setAttribute(
        'data-original-pointer-events',
        el.style.pointerEvents || ''
      )
      el.style.pointerEvents = 'none'
    })

    // Inject CSS styles for hover and selected states on images
    if (!document.getElementById('__image-picker-style')) {
      const style = document.createElement('style')
      style.id = '__image-picker-style'
      style.textContent = `
				img.__image-hovered {
					border: 2px dashed purple !important;
					outline-offset: 4px;
					cursor: pointer;
				}
				img.__image-selected {
					border: 3px solid purple !important;
					outline-offset: 4px;
					cursor: pointer;
				}
			`
      document.head.appendChild(style)
    }

    // Add event listeners on document for delegation
    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseout', onMouseOut)
    document.addEventListener('click', onClick, true)
  }

  function stopImagePicker() {
    if (!pickingImage) return
    pickingImage = false
    // console.log('🛑 Image picker stopped');

    // Restore pointer events on disabled elements
    disabledElements.forEach((el) => {
      const original = el.getAttribute('data-original-pointer-events')
      el.style.pointerEvents = original || ''
      el.removeAttribute('data-original-pointer-events')
    })
    disabledElements = []

    // Remove selected and hovered classes from images
    if (selectedImage) {
      selectedImage.classList.remove('__image-selected')
      selectedImage = null
    }
    document
      .querySelectorAll('img.__image-hovered')
      .forEach((img) => img.classList.remove('__image-hovered'))

    // Remove event listeners
    document.removeEventListener('mouseover', onMouseOver)
    document.removeEventListener('mouseout', onMouseOut)
    document.removeEventListener('click', onClick, true)

    // Remove style tag
    const styleTag = document.getElementById('__image-picker-style')
    if (styleTag) styleTag.remove()
  }

  function onMouseOver(e) {
    if (!pickingImage) return
    const img = findImageFromEventTarget(e.target)
    if (img && img !== selectedImage) {
      img.classList.add('__image-hovered')
    }
  }

  function onMouseOut(e) {
    if (!pickingImage) return
    const img = findImageFromEventTarget(e.target)
    if (img) {
      img.classList.remove('__image-hovered')
    }
  }

  function onClick(e) {
    console.log('target', e.target)
    if (!pickingImage) return
    // console.log('target', e.target)
    const img = findImageFromEventTarget(e.target)
    if (!img) return

    // console.log('Found image:', img.src);

    e.preventDefault()
    e.stopPropagation()

    // Remove previous selection
    if (selectedImage && selectedImage !== e.target) {
      selectedImage.classList.remove('__image-selected')
    }

    selectedImage = img
    selectedImage.classList.add('__image-selected')

    // Show modal with image info
    showImageModal(selectedImage)

    // Stop picker mode after selection
    stopImagePicker()
  }

  function showImageModal(target) {
    // Remove existing modal if any
    document.getElementById('image-info-modal')?.remove()

    const modal = document.createElement('div')
    modal.id = 'image-info-modal'
    modal.style.position = 'absolute'
    modal.style.background = 'white'
    modal.style.border = '1px solid #E2E8F0'
    modal.style.borderRadius = '16px'
    modal.style.padding = '16px 0'
    modal.style.fontFamily = 'sans-serif'
    modal.style.fontSize = '14px'
    modal.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
    modal.style.zIndex = '10000'

    const tag = target.tagName.toLowerCase()
    const id = target.id || '—'
    const className = target.className ? target.className.trim() : '—'

    modal.innerHTML = `
      <div style= "padding: 0 16px">
				<div><strong style="color: #020617">Tag:</strong> <span style= "color: #7E22CE">${tag}</span></div>
				<div><strong style="color: #020617">ID:</strong> <span style= "color: #7E22CE">${id}</span></div>
				<div><strong style="color: #020617">Class:</strong> <span style= "color: #7E22CE">${className}</span></div>
			</div>
			<hr style= "margin-top: 5px; margin-bottom: 5px; color: #E2E8F0">
      <div style= "display: flex; align-items: center; justify-content: end; gap: 5px; margin-top: 10px; padding: 0 16px">
				<button id="close-image-info" style="margin-right:10px; border-radius: 25px; background-color: #DC2626; border: none; padding: 6px 12px; color: #fff">Close</button>
				<button id="edit-image-info" style="border-radius: 25px; background-color: #7E22CE; border: none; padding: 6px 12px; color: #fff; display: flex; align-items: center; justify-content: center; gap: 5px">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M7.99935 13.3332H13.9993M10.9167 2.41449C11.1821 2.1491 11.542 2 11.9173 2C12.2927 2 12.6526 2.1491 12.918 2.41449C13.1834 2.67988 13.3325 3.03983 13.3325 3.41516C13.3325 3.79048 13.1834 4.15043 12.918 4.41582L4.91133 12.4232C4.75273 12.5818 4.55668 12.6978 4.34133 12.7605L2.42667 13.3192C2.3693 13.3359 2.30849 13.3369 2.25061 13.3221C2.19272 13.3072 2.13988 13.2771 2.09763 13.2349C2.05538 13.1926 2.02526 13.1398 2.01043 13.0819C1.9956 13.024 1.9966 12.9632 2.01333 12.9058L2.572 10.9912C2.63481 10.776 2.75083 10.5802 2.90933 10.4218L10.9167 2.41449Z" stroke="#F8FAFC" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
					Edit
				</button>
			</div>
    `

    document.body.appendChild(modal)

    const rect = target.getBoundingClientRect()
    modal.style.top = `${rect.bottom + window.scrollY + 6}px`
    modal.style.left = `${rect.left + window.scrollX}px`

    document.getElementById('close-image-info').onclick = () => {
      modal.remove()
      target.classList.remove('__image-selected')
    }

    modal.querySelector('#edit-image-info').onclick = () => {
      modal.remove()
      target.classList.remove('__image-selected')

      targetImage = target
      window.__targetInfo = `ID: ${id}, Class: ${className}`

      renderModal()
      // updatePricesForPage()
      updateButtonStates()
      // Restore Shopify zoom triggers
      document
        .querySelectorAll('.product-media-container--zoomable')
        .forEach((el) => {
          const original = el.getAttribute('data-original-onclick')
          if (original) {
            el.setAttribute('on:click', original)
            el.removeAttribute('data-original-onclick')
          }
        })
    }

    setTimeout(() => {
      const outsideClickListener = (event) => {
        if (!modal.contains(event.target)) {
          modal.remove()
          target.classList.remove('__image-selected')
          document.removeEventListener('click', outsideClickListener)
        }
      }
      document.addEventListener('click', outsideClickListener)
    }, 0)
  }

  startImagePicker()

  return {
    startImagePicker,
    stopImagePicker,
    isPicking: () => pickingImage
  }

  function findImageFromEventTarget(target) {
    if (target.tagName === 'IMG') return target

    // Find the closest card container
    const card = target.closest('.card')
    if (!card) return null

    // Look specifically inside .card__inner > .card__media for the img
    const image = card.querySelector('.card__inner > .card__media img')
    return image // This will be the <img> element or null if not found
  }
}

// for catalog page image selection
let catalogSelectionEnabled = false
let catalogClickListener
const cardListenersMap = new Map()

function fixZIndex() {
  if (document.getElementById('fix-z-index-style')) return // already added

  const style = document.createElement('style')
  style.id = 'fix-z-index-style'
  style.textContent = `
    .card-wrapper.product-card-wrapper {
      display: block !important;
    }

    .card {
      position: relative;
      display: flex !important;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }

    .card__inner {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .card__media {
      position: relative;
      z-index: 10;
      pointer-events: auto;
      width: 100%;
    }

    .card__content {
      position: relative;
      z-index: 1;
      width: 100%;
    }

    /* Added to keep images contained */
    .card__media img {
      box-sizing: border-box;
      max-width: 100%;
      height: auto;
      display: block;
    }
		.slideshow-paused * {
			animation-play-state: paused !important;
			transition: none !important;
			scroll-snap-type: none !important;
			pointer-events: none !important;
		}
  `
  document.head.appendChild(style)
}

function removeFixZIndex() {
  const style = document.getElementById('fix-z-index-style')
  if (style) style.remove()
}

function enableCatalogImageSelection() {
  if (catalogSelectionEnabled) return // avoid duplicate init
  // console.log("Enabling catalog image selection...");
  catalogSelectionEnabled = true
  fixZIndex()

  const catalogImages = document.querySelectorAll(
    '.card__media img, .product-media__image'
  )

  console.log(`Found ${catalogImages.length} catalog images.`)

  catalogImages.forEach((img, index) => {
    // console.log(`Processing image ${index + 1}:`, img);
    if (img.dataset.igSelectable === 'true') return
    img.dataset.igSelectable = 'true'

    // Wrap img with relative wrapper if not already wrapped
    if (!img.parentElement.classList.contains('catalog-edit-wrapper')) {
      // console.log("Wrapping image in catalog-edit-wrapper.");
      const wrapper = document.createElement('div')
      wrapper.classList.add('catalog-edit-wrapper')
      wrapper.style.position = 'relative'
      wrapper.style.display = 'inline-block'

      img.parentNode.insertBefore(wrapper, img)
      wrapper.appendChild(img)

      // Create edit icon
      const icon = document.createElement('div')
      icon.classList.add('catalog-edit-icon')
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"  width="30" height="30" style="color: grey;">
				<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
			</svg>
			`
      Object.assign(icon.style, {
        position: 'absolute',
        top: '5px',
        left: '5px',
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: '9999',
        pointerEvents: 'auto'
      })
      wrapper.appendChild(icon)
      // INSIDE the icon creation block:

      icon.addEventListener('mouseenter', () => {
        const slideshow = icon.closest('slideshow-component')
        if (slideshow) {
          slideshow.classList.add('slideshow-paused')
        }
      })

      icon.addEventListener('mouseleave', () => {
        const slideshow = icon.closest('slideshow-component')
        if (slideshow) {
          slideshow.classList.remove('slideshow-paused')
        }
      })
      // console.log("Icon added to wrapper.");
    }

    const card = img.closest('.card, .product-card')
    if (!card) return

    // Mouse enter/leave handlers to disable pointer events on links/buttons except icon
    function handleMouseEnter() {
      const elements = [...card.querySelectorAll('a, button')]
      elements.forEach((el) => {
        if (!el.closest('.catalog-edit-wrapper')) {
          if (!el.hasAttribute('data-original-pointer-events')) {
            el.setAttribute(
              'data-original-pointer-events',
              el.style.pointerEvents || ''
            )
            el.style.pointerEvents = 'none'
          }
        }
      })
    }

    function handleMouseLeave() {
      const elements = [
        ...card.querySelectorAll(
          'a[data-original-pointer-events], button[data-original-pointer-events]'
        )
      ]
      elements.forEach((el) => {
        el.style.pointerEvents =
          el.getAttribute('data-original-pointer-events') || ''
        el.removeAttribute('data-original-pointer-events')
      })
    }

    // Remove cleanup listener added during disable
    card.removeEventListener('mouseenter', cleanupPointerEventsOnMouseEnter)

    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mouseleave', handleMouseLeave)

    cardListenersMap.set(card, {
      mouseenter: handleMouseEnter,
      mouseleave: handleMouseLeave
    })
  })

  // Show modal function inside enableCatalogImageSelection
  function showImageModal(target) {
    document.getElementById('image-info-modal')?.remove()

    const modal = document.createElement('div')
    modal.id = 'image-info-modal'
    Object.assign(modal.style, {
      position: 'absolute',
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '16px 0',
      fontFamily: 'sans-serif',
      fontSize: '14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      zIndex: '10000'
    })

    const tag = target.tagName.toLowerCase()
    const id = target.id || '—'
    const className = target.className ? target.className.trim() : '—'

    modal.innerHTML = `
      <div style= "padding: 0 16px">
				<div><strong style="color: #020617">Tag:</strong> <span style= "color: #1D4ED8">${tag}</span></div>
				<div><strong style="color: #020617">ID:</strong> <span style= "color: #1D4ED8">${id}</span></div>
				<div><strong style="color: #020617">Class:</strong> <span style= "color: #1D4ED8">${className}</span></div>
			</div>
			<hr style= "margin-top: 5px; margin-bottom: 5px; color: #E2E8F0">
      <div style= "display: flex; align-items: center; justify-content: end; gap: 5px; margin-top: 10px; padding: 0 16px">
				<button id="close-image-info" style="margin-right:10px; border-radius: 25px; background-color: #DC2626; border: none; padding: 6px 12px; color: #fff">Close</button>
				<button id="edit-image-info" style="border-radius: 25px; background-color: #1D4ED8; border: none; padding: 6px 12px; color: #fff; display: flex; align-items: center; justify-content: center; gap: 5px">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M7.99935 13.3332H13.9993M10.9167 2.41449C11.1821 2.1491 11.542 2 11.9173 2C12.2927 2 12.6526 2.1491 12.918 2.41449C13.1834 2.67988 13.3325 3.03983 13.3325 3.41516C13.3325 3.79048 13.1834 4.15043 12.918 4.41582L4.91133 12.4232C4.75273 12.5818 4.55668 12.6978 4.34133 12.7605L2.42667 13.3192C2.3693 13.3359 2.30849 13.3369 2.25061 13.3221C2.19272 13.3072 2.13988 13.2771 2.09763 13.2349C2.05538 13.1926 2.02526 13.1398 2.01043 13.0819C1.9956 13.024 1.9966 12.9632 2.01333 12.9058L2.572 10.9912C2.63481 10.776 2.75083 10.5802 2.90933 10.4218L10.9167 2.41449Z" stroke="#F8FAFC" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
					Edit
				</button>
			</div>
    `

    document.body.appendChild(modal)

    const rect = target.getBoundingClientRect()
    modal.style.top = `${rect.bottom + window.scrollY + 6}px`
    modal.style.left = `${rect.left + window.scrollX}px`

    document.getElementById('close-image-info').onclick = () => {
      modal.remove()
      target.classList.remove('__image-selected')
      if (target.parentElement) target.parentElement.style.border = 'none'
      target.style.border = 'none'
      disableCatalogImageSelection()
      renderModal()
      // updatePricesForPage()
      updateButtonStates()
    }

    modal.querySelector('#edit-image-info').onclick = () => {
      modal.remove()
      target.classList.remove('__image-selected')
      if (target.parentElement) target.parentElement.style.border = 'none'
      target.style.border = 'none'

      targetImage = target
      window.__targetInfo = `ID: ${id}, Class: ${className}`

      // Your modal rendering logic here
      showImageSection = true
      disableCatalogImageSelection()
      renderModal()
      // updatePricesForPage()
      updateButtonStates()
    }

    // setTimeout(() => {
    //   const outsideClickListener = (event) => {
    //     if (!modal.contains(event.target)) {
    //       modal.remove();
    //       target.classList.remove('__image-selected');
    //       if (target.parentElement) target.parentElement.style.border = 'none';
    //       target.style.border = 'none';
    //       document.removeEventListener('click', outsideClickListener);
    //     }
    //   };
    //   document.addEventListener('click', outsideClickListener);
    // }, 0);
  }

  // Delegated click listener for edit icons
  catalogClickListener = (e) => {
    // console.log('target', e.target)
    const icon = e.target.closest('.catalog-edit-icon')
    if (!icon) return

    e.preventDefault()
    e.stopPropagation()

    const card = icon.closest('.card, .product-card')
    if (!card) return

    // Find all images inside .card__media
    const imgs = card.querySelectorAll(
      '.card__media img, .product-media__image'
    )

    // Remove previously selected highlights from all images
    imgs.forEach((img) => {
      img.classList.remove('__image-selected')
      img.style.border = 'none'
      if (img.parentElement) img.parentElement.style.border = 'none'
    })

    // We highlight the image related to clicked icon (should be one)
    const wrapper = icon.parentElement
    const img = wrapper.querySelector('img')
    if (!img) return

    img.classList.add('__image-selected')
    img.style.border = '2px dashed purple'
    img.style.boxSizing = 'border-box'
    // wrapper.style.border = '2px dashed #007bff';

    showImageModal(img)
  }

  document.addEventListener('click', catalogClickListener)
}

function disableCatalogImageSelection() {
  if (!catalogSelectionEnabled) {
    // console.log('Catalog selection already disabled.');
    return
  }
  catalogSelectionEnabled = false

  removeFixZIndex()

  const catalogImages = document.querySelectorAll(
    '.card__media img[data-ig-selectable="true"], .product-media__image[data-ig-selectable="true"]'
  )
  console.log(`Found ${catalogImages.length} selectable images.`)

  // Restore pointer-events and remove listeners on all cards in map
  cardListenersMap.forEach((listeners, card) => {
    // 1. Restore pointer events immediately
    listeners.mouseleave({ currentTarget: card })

    // 2. Remove mouseenter and mouseleave listeners
    card.removeEventListener('mouseenter', listeners.mouseenter)
    card.removeEventListener('mouseleave', listeners.mouseleave)

    // 3. Add cleanup listener on mouseenter to fix any leftover pointer-events:none on hover
    card.addEventListener('mouseenter', cleanupPointerEventsOnMouseEnter)
  })

  // Clear the map for clean state
  cardListenersMap.clear()

  // Unwrap images, reset styles, remove data attributes, etc.
  catalogImages.forEach((img) => {
    img.removeAttribute('data-ig-selectable')
    const wrapper = img.parentElement
    if (wrapper && wrapper.classList.contains('catalog-edit-wrapper')) {
      wrapper.parentNode.insertBefore(img, wrapper)
      wrapper.remove()
    }
    img.classList.remove('__image-selected')
    if (img.parentElement) {
      img.parentElement.style.border = 'none'
    }

    const card = img.closest('.card, .product-card')
    if (card) {
      const link = card.querySelector('a.full-unstyled-link')
      if (link && link.blockLinkClicks) {
        link.removeEventListener('click', link.blockLinkClicks, true)
        delete link.blockLinkClicks
      }

      // Restore pointer-events for all anchors and buttons in the card
      card.querySelectorAll('a, button').forEach((el) => {
        const originalPointer = el.getAttribute('data-original-pointer-events')
        el.style.pointerEvents = originalPointer || 'auto'
        el.removeAttribute('data-original-pointer-events')
      })
    }
  })

  // Remove global click listener if present
  if (catalogClickListener) {
    document.removeEventListener('click', catalogClickListener)
    catalogClickListener = null
  }

  console.log('disableCatalogImageSelection finished.')
}

// Helper: cleanup function on mouseenter for cards
function cleanupPointerEventsOnMouseEnter(e) {
  const card = e.currentTarget
  card.querySelectorAll('a, button').forEach((el) => {
    const originalPointer = el.getAttribute('data-original-pointer-events')
    if (originalPointer !== null) {
      el.style.pointerEvents = originalPointer || 'auto'
      el.removeAttribute('data-original-pointer-events')
    } else if (el.style.pointerEvents === 'none') {
      el.style.pointerEvents = 'auto'
    }
  })
  // console.log('[cleanupPointerEventsOnMouseEnter] cleaned card:', card);
}

let imagePickerInstance = null

document.body.addEventListener('click', (e) => {
  const trigger = e.target.closest('.image-trigger')
  if (!trigger) return

  e.preventDefault()

  const pathname = window.location.pathname
  const isCatalog =
    pathname === '/catalog' ||
    pathname === '/' ||
    pathname.includes('/collections/')
  const isActive = trigger.classList.contains('__active-trigger')

  // Reference the select dropdown
  const testGroupSelect = document.getElementById('testGroupSelect')
  const contentBtn = document.querySelector('.extra-section-trigger')
  const priceBtn = document.querySelector('.open-price-option')

  // Deactivate all triggers and reset styles
  document.querySelectorAll('.image-trigger.__active-trigger').forEach((el) => {
    el.classList.remove('__active-trigger')
    el.style.color = '#020617'
  })

  // If already active, deactivate and clean up
  if (isActive) {
    // console.log('Deactivating image picker...');
    if (
      imagePickerInstance &&
      typeof imagePickerInstance.stopImagePicker === 'function'
    ) {
      imagePickerInstance.stopImagePicker()
      imagePickerInstance = null
    }
    if (isCatalog) {
      disableCatalogImageSelection()
    }

    // ✅ Re-enable select when picker stops
    if (testGroupSelect) {
      testGroupSelect.disabled = false
      testGroupSelect.style.cursor = 'pointer'
      testGroupSelect.style.opacity = '1'
    }
    if (contentBtn) {
      contentBtn.disabled = false
      contentBtn.style.cursor = 'pointer'
      contentBtn.style.opacity = '1'
    }
    if (priceBtn) {
      priceBtn.disabled = false
      priceBtn.style.cursor = 'pointer'
      priceBtn.style.opacity = '1'
    }

    return
  }

  // Activate the clicked trigger
  trigger.classList.add('__active-trigger')
  trigger.style.color = '#A855F7'

  if (isCatalog) {
    // console.log('Catalog mode');
    enableCatalogImageSelection()
  } else {
    // console.log('Single product mode');
    imagePickerInstance = enableImagePickerForOthers() // returns an instance with stopImagePicker()
  }
  // ✅ Disable select when picker is active
  if (testGroupSelect) {
    testGroupSelect.disabled = true
    testGroupSelect.style.cursor = 'not-allowed'
    testGroupSelect.style.opacity = '0.6'
  }
  if (contentBtn) {
    contentBtn.disabled = true
    contentBtn.style.cursor = 'not-allowed'
    contentBtn.style.opacity = '0.6'
  }
  if (priceBtn) {
    priceBtn.disabled = true
    priceBtn.style.cursor = 'not-allowed'
    priceBtn.style.opacity = '0.6'
  }
})

// anti-flicker function
// function hidePriceElementsFromDetector(priceElements) {
//   if (!priceElements) return
//   ;['compare', 'sale', 'badges'].forEach((type) => {
//     const value = priceElements[type]
//     if (!value) return
//     // If it's a NodeList or Array, loop through
//     if (NodeList.prototype.isPrototypeOf(value) || Array.isArray(value)) {
//       value.forEach((el) => {
//         el.classList.add('signalDetector-hide-price')
//       })
//     } else if (value instanceof Element) {
//       // It's a single DOM element (e.g., container)
//       value.classList.add('signalDetector-hide-price')
//     }
//   })
// }
// // Utility to reveal specific price elements
// function revealPriceElementsFromDetector(priceElement) {
//   if (!priceElement) return
//   const reveal = (el) => {
//     // Step 1: Add fade-in class (which makes it visible + opacity 1)
//     el.classList.add('signalDetector-fade-in')
//     // Step 2: Wait for transition, then remove the hidden class
//     setTimeout(() => {
//       el.classList.remove('signalDetector-hide-price')
//       el.classList.remove('signalDetector-fade-in') // optional, if you want a clean DOM
//     }, 400) // match your transition duration
//   }
//   if (priceElement instanceof Element) {
//     reveal(priceElement)
//   }
// }

function getProductInfoFromElement(el, inputId) {
  // console.log('el', el)
  const defaultSelectors =
    '[data-product-id], [data-product-handle], .product-card-wrapper, .card-wrapper, product-page, product-card, product-price, [data-pid], product-info, floating-product'
  const savedSelectors = singleProductContainer // assumed to be an array
  const input = document.getElementById(inputId)
  const userInputSelector = input?.value?.trim()

  let container = null
  let matchedSelector = null
  let matchedFrom = null

  // 1. Try saved selectors first
  if (Array.isArray(savedSelectors)) {
    for (const sel of savedSelectors) {
      try {
        const match = el.closest(sel)
        if (match) {
          container = match
          matchedSelector = sel
          matchedFrom = 'saved'
          break
        }
      } catch (e) {
        console.warn(`Invalid selector in savedSelectors: "${sel}"`, e)
      }
    }
  }

  // 2. Try default selectors
  if (!container && defaultSelectors?.trim()) {
    try {
      container = el.closest(defaultSelectors)
      if (container) {
        matchedSelector = defaultSelectors
          .split(',')
          .map((s) => s.trim())
          .find((sel) => container.matches(sel))
        matchedFrom = 'default'
      }
    } catch (e) {
      console.warn('Invalid defaultSelectors:', e)
    }
  }

  // 3. Try user input selector
  if (!container && userInputSelector) {
    try {
      container = el.closest(userInputSelector)
      if (container) {
        matchedSelector = userInputSelector
        matchedFrom = 'input'
      }
    } catch (e) {
      console.warn('Invalid user input selector:', e)
    }
  }

  // 🔹 Ignore nested product-card elements inside a container
  if (container && container.tagName === 'PRODUCT-PAGE') {
    const closestCard = el.closest('product-card')
    if (
      closestCard &&
      closestCard !== el &&
      !container.isSameNode(closestCard)
    ) {
      // The element is inside a nested product-card in a main product-page → skip
      return null
    }
  }

  // 4. Set input value based on which matched
  if (container && input && matchedSelector && matchedFrom) {
    input.value = `${matchedSelector}`
    singleProductContainer = [matchedSelector]
    // console.log(`Matched from "${matchedFrom}" using selector: ${matchedSelector}`);
  }

  // console.log('container', container)
  // const targetCard = document.querySelector('product-card'); // find the element

  // if (targetCard && container.contains(targetCard)) {
  // 		container = null;
  // }

  if (!container) return null

  // 5. Extract product info
  const productId =
    container.getAttribute('data-product-id') ||
    container.getAttribute('data-pid')

  let productHandle =
    container.getAttribute('data-product-handle') ||
    container.getAttribute('data-handle')

  let selectedValue

  // 🔽 Fallback 1: look for anchor href containing /products/
  if (!productHandle) {
    const anchor = container.querySelector('a[href*="/products/"]')
    if (anchor) {
      const href = anchor.getAttribute('href') || ''
      const match = href.match(/\/products\/([^/?#]+)/) // capture handle
      if (match) {
        productHandle = match[1]
      }
    }

    const selectEl = container.querySelector('select')
    if (selectEl) {
      selectedValue = selectEl.options[selectEl.selectedIndex].value
    }

    if (el.classList.contains('js-option-price')) {
      const parentLabel = el.closest('label') // find the wrapping label
      if (!parentLabel) return

      const parentInput = parentLabel.querySelector('input.js-product-option') // find input inside label
      if (!parentInput) return

      const value = parentInput.value
      selectedValue = value
    }
  }

  // Get variantId from URL if on a product page
  let variantId = null
  const pathname = window.location.pathname
  const urlParams = new URLSearchParams(window.location.search)
  if (pathname.includes('/products/')) {
    if (!variantId) {
      variantId = urlParams.get('variant')
    } else {
      variantId = firstVariant_product?.toString()
    }
  }

  // If no variant in URL, fallback to input/select field
  if (!variantId) {
    variantId = document.querySelector(
      'input[name="id"], select[name="id"]'
    )?.value
  }

  if (productId || productHandle || variantId) {
    return { productId, productHandle, variantId, container, selectedValue }
  }

  // 6. Fallback from product link
  const productLink = container.querySelector('a[href*="/products/"]')
  if (productLink) {
    const href = productLink.getAttribute('href')
    const match = href.match(/\/products\/([^\/\?]+)/)
    if (match) {
      return { productId: null, productHandle: match[1], container }
    }
  }

  return null
}

// for badge text
const updateBadgeText = (text, newValue) => {
  const pattern = /^(.*?)([a-zA-Z]*\d+\.?\d*%?)(.*)$/i
  const match = text.match(pattern)
  if (match) {
    const [, beforeText, , afterText] = match
    return beforeText + newValue + afterText
  }
  return newValue
}

function updatePricesForPage(selector, isRegular, isbadge) {
  // console.log('selector', selector)
  const selectEl = document.getElementById('testGroupSelect')
  if (!selectEl) return

  const selectedTestGroupId = selectEl.value
  if (!selectedTestGroupId) return

  // console.log('selectedTestGroupId', selectedTestGroupId)

  const testingProducts = parsedPayload?.productInfo?.testingProducts || []

  // Normalize selector to an array of elements
  let elements = []
  if (Array.isArray(selector)) {
    selector.forEach((sel) => {
      elements.push(...document.querySelectorAll(sel))
    })
  } else if (typeof selector === 'string') {
    elements = Array.from(document.querySelectorAll(selector))
  }

  if (isRegular) {
    // Add .js-option-price elements individually
    const hover_btn_price = document.querySelectorAll('.js-option-price')
    elements.push(...hover_btn_price)
  }

  // console.log('elements', elements)

  if (!elements.length) return

  elements.forEach((el) => {
    // console.log('el', el)
    let inputId
    if (!isbadge) {
      inputId = isRegular
        ? 'containerSelectorInput'
        : 'compareContainerSelectorInput'
    } else {
      inputId = 'badgeContainerSelectorInput'
    }
    const productInfo = getProductInfoFromElement(el, inputId)

    // console.log('testingproducts', testingProducts)
    if (!productInfo) return
    // console.log('productInfo', productInfo)

    const matchedProduct = testingProducts.find((p) => {
      const testGroupMatch = (p.testId || p.name) === selectedTestGroupId

      if (!testGroupMatch) return false

      if (window.location.pathname.includes('/products/')) {
        // If variantId exists, only match by variant
        if (p.productId === productInfo.productId) {
          if (selected_variant_name) {
            // console.log('selected_variant_name', selected_variant_name)
            const productVarinat = `${p.productHandle}_${p.variantName}`
            // console.log('variantName', productVarinat === selected_variant_name)
            return productVarinat === selected_variant_name
          } else if (productInfo.variantId) {
            return p.variantId === productInfo.variantId
          }
        }
      }
      if (productInfo.selectedValue) {
        return (
          p.productHandle === productInfo.productHandle &&
          p.variantName === productInfo.selectedValue
        )
      }
      // Fallback to productId or handle
      return (
        p.productId === productInfo.productId ||
        p.productHandle === productInfo.productHandle
      )
    })

    if (!matchedProduct) return
    // console.log('matchedProduct', matchedProduct)

    if (!isbadge) {
      const priceValue = isRegular
        ? matchedProduct.price
        : matchedProduct.compareAtPrice
      if (!priceValue) return

      // console.log('priceValue', priceValue)

      const formattedPrice = formatedPriceWithCurrency(
        parseFloat(priceValue) * 100
      )

      safelyUpdatePrice(el, formattedPrice, false)
    } else {
      // const preBadgeValue = isPlainLabel(badgeOrginalText)
      // console.log('preBadge', preBadgeValue)
      // const badgeValue = !preBadgeValue ? matchedProduct.discountAmount : badgeOrginalText;
      // const badgeValue = matchedProduct.discountAmount
      const discountPercentage = Math.round(
        (parseFloat(matchedProduct?.discountAmount) /
          parseFloat(matchedProduct?.compareAtPrice)) *
          100
      )

      // console.log('discountPercentage', discountPercentage)
      // console.log('badgeOrginalText', badgeOrginalText)
      // const classified = classifyLabel(badgeOrginalText)
      const badgeText = badgeOrginalText.trim()
      const hasPercentage = badgeText.includes('%')
      const hasPrice =
        /[a-zA-Z]*\d+\.?\d*/.test(badgeText) && !badgeText.includes('%')
      let badgeValue
      // if (classified.type === 'plain') {
      //   badgeValue = classified.value
      // } else if (classified.type === 'number-only') {
      //   badgeValue = discountPercentage + '%'
      // } else if (classified.type === 'mixed') {
      //   badgeValue = classified.text + ' ' + discountPercentage + '%'
      // }
      if (hasPercentage) {
        const newText = `${discountPercentage}%`
        badgeValue = updateBadgeText(badgeText, newText)
      } else if (hasPrice) {
        const newText = formatedPriceWithCurrency(
          parseFloat(matchedProduct?.discountAmount) * 100
        )
        badgeValue = updateBadgeText(badgeText, newText)
      } else {
        badgeValue = badgeOrginalText
      }
      safelyUpdatePrice(el, badgeValue, true)
    }
  })
}

function classifyLabel(str) {
  if (!str || typeof str !== 'string') {
    return { type: 'invalid', value: '' }
  }

  const cleaned = str.trim()

  // Case 1: Only plain string (no digits, no percent)
  if (!/\d/.test(cleaned) && !/%/.test(cleaned)) {
    return { type: 'plain', value: cleaned }
  }

  // Case 2: Only number or number with % or currency symbol
  const onlyNumberRegex = /^[\s৳₹$€£]*\d+([.,]?\d+)?\s*%?\s*$/
  if (onlyNumberRegex.test(cleaned)) {
    return { type: 'number-only', value: cleaned }
  }

  // Case 3: Mixed (contains both text and number/percent)
  const textPart = cleaned.replace(/[\d.,\s%৳₹$€£]+/g, '').trim()
  const numberPartMatch = cleaned.match(/[\d]+([.,]?\d+)?\s*%?/)
  const numberPart = numberPartMatch ? numberPartMatch[0].trim() : ''

  return {
    type: 'mixed',
    value: cleaned,
    text: textPart, // e.g., "Off"
    number: numberPart // e.g., "20%"
  }
}

function safelyUpdatePrice(el, formattedPrice, isbadge, attempt = 0) {
  if (attempt > 5) {
    console.warn('❌ Failed to update price after max retries:', el)
    return
  }

  // If element is still in DOM, try setting price
  if (document.body.contains(el)) {
    // console.log('el', el)
    updatedDom.push(el)
    el.innerText = formattedPrice
    if (!isbadge) {
      if (highlightCheckbox) {
        el.style.color = '#1D4ED8'
        el.style.border = '1px dashed #1D4ED8'
      } else {
        el.style.border = ''
        el.style.color = ''
      }
    } else {
      el.style.color = ''
    }
    // console.log(`✅ Price updated on retry #${attempt}`, el, formattedPrice);
  } else {
    // Retry after delay
    setTimeout(() => {
      safelyUpdatePrice(el, formattedPrice, attempt + 1)
    }, 100 + attempt * 50)
  }
}

// heighlight change price
// Inject CSS dynamically for price change highlight
const style = document.createElement('style')
style.textContent = `
  .price-changed {
    color: #7e22ce !important; /* green color */
    transition: color 0.8s ease;
  }
`
document.head.appendChild(style)

function highlightChange(element) {
  if (!element) return
  element.classList.add('price-changed')
}

document
  .querySelectorAll(
    'input[name="id"], input[type="radio"], input[type="radio"][data-variant-id], select[name="id"],.js-product-option'
  )
  .forEach((select) => {
    select.addEventListener('change', () => {
      // console.log('variant change');
      if (parsedPayload?.appName === 'Signal') {
        const selectedHandle = select.getAttribute('data-handle')
        // console.log('selectedHandle', selectedHandle)
        selected_variant_name = selectedHandle
          ? `${selectedHandle}_${select.value}`
          : null

        // console.log('reqularEl', regularEl)
        // console.log('compareEl', compareEl)

        // Wait for theme DOM update to complete before updating price
        setTimeout(() => {
          if (regularEl) updatePricesForPage(regularPriceClassOrId, true, false)
          if (compareEl)
            updatePricesForPage(comparePriceClassOrId, false, false)
          if (badgeEl) updatePricesForPage(badgeClassOrId, false, true)
        }, 600) // 600ms is a safe delay for themes like Horizon
      }
    })
  })

// function preview_setupSearchAndModalListeners() {
//   consoleLog('Setting up search and modal listeners')

//   // Listen for search input changes
//   document.addEventListener('input', (event) => {
//     try {
//       const searchInput = event.target.closest(
//         `${
//           searchClassOrId?.length > 0
//             ? `${searchClassOrId.join(',')},`
//             : ''
//         } input[type="search"], input[type="text"][name*="search"], input[type="text"][placeholder*="search"]`
//       )
//       if (!searchInput) return
//       // Update prices after a short delay to allow search results to load
//       setTimeout(() => {
//         try {
//           if (regularEl) updatePricesForPage(regularPriceClassOrId, true)
// 					if (compareEl) updatePricesForPage(comparePriceClassOrId, false)
//         } catch (error) {
//           console.error('Error updating prices:', error)
//         }
//       }, 1500)
//     } catch (error) {
//       console.error('Error in search input handler:', error)
//     }
//   })

//   // Listen for search form submissions
//   document.addEventListener('submit', (event) => {
//     try {
//       const searchForm = event.target.closest(
//         `${
//           searchClassOrId?.length > 0
//             ? `${searchClassOrId.join(',')},`
//             : ''
//         } form[action*="query"]`
//       )
//       if (!searchForm) return

//       // Update prices after form submission
//       setTimeout(() => {
//         try {
//           if (regularEl) updatePricesForPage(regularPriceClassOrId, true)
// 					if (compareEl) updatePricesForPage(comparePriceClassOrId, false)
//         } catch (error) {
//           console.error('Error updating prices:', error)
//         }
//       }, 1500)
//     } catch (error) {
//       console.error('Error in search form handler:', error)
//     }
//   })

//   // Listen for clicks on search results
//   document.addEventListener('click', (event) => {
//     try {
//       const searchResult = event.target.closest(
//         `${
//           searchClassOrId?.length > 0
//             ? `${searchClassOrId?.join(',')},`
//             : ''
//         } .slider--search-presets, input[type="search"], input[type="text"][name*="search"], input[type="text"][placeholder*="search"]`
//       )
//       if (!searchResult) return

//       // Update prices when a search result is clicked
//       setTimeout(() => {
//         try {
//           if (regularEl) updatePricesForPage(regularPriceClassOrId, true)
// 					if (compareEl) updatePricesForPage(comparePriceClassOrId, false)
//         } catch (error) {
//           console.error('Error updating prices:', error)
//         }
//       }, 1500)
//     } catch (error) {
//       console.error('Error in search result click handler:', error)
//     }
//   })

//   // Listen for modal open events
//   document.addEventListener('click', (event) => {
//     try {
//       const modalTrigger = event.target.closest(
//         `${
//           modalClassOrId?.length > 0
//             ? `${modalClassOrId.join(',')},`
//             : ''
//         } [data-modal-trigger],.predictive-search, [data-drawer-trigger], [aria-controls*="modal"], [aria-controls*="drawer"], modal-opener, [aria-haspopup="dialog"], [data-modal]`
//       )
//       if (!modalTrigger) return

//       // Get the specific modal ID from the trigger
//       let modalId = null
//       if (modalTrigger.hasAttribute('data-modal')) {
//         modalId = modalTrigger.getAttribute('data-modal')
//       } else if (modalTrigger.closest('modal-opener')) {
//         modalId = modalTrigger
//           .closest('modal-opener')
//           .getAttribute('data-modal')
//       } else if (modalTrigger.hasAttribute('aria-controls')) {
//         modalId = modalTrigger.getAttribute('aria-controls')
//       }

//       // Update prices when a modal is opened
//       setTimeout(() => {
//         try {
//           // Find the open modal
//           const openModal = document.querySelector('quick-add-modal[open]')
//           if (openModal) {
//             consoleLog('Found Open Modal:', openModal)

//             // Get the product info from the open modal
//             const productInfo = openModal.querySelector('product-info')
//             if (productInfo) {
//               const productId = productInfo.getAttribute('data-product-id')

//               // Get the variant ID from the form
//               const form = openModal.querySelector(
//                 'form[action*="/cart/add"]'
//               )
//               if (form) {
//                 const variantInput = form.querySelector('input[name="id"]')
//                 if (variantInput) {
//                   const variantId = variantInput.value

//                   // Update prices for this specific product/variant
//                   if (regularEl) updatePricesForPage(regularPriceClassOrId, true)
// 									if (compareEl) updatePricesForPage(comparePriceClassOrId, false)
//                 }
//               }
//             }
//           }
//         } catch (error) {
//           console.error('Error updating prices:', error)
//         }
//       }, 1500)
//     } catch (error) {
//       console.error('Error in modal trigger handler:', error)
//     }
//   })

//   // Listen for Shopify's predictive search results
//   document.addEventListener('predictive-search:render', () => {
//     try {
//       setTimeout(() => {
//         try {
//           if (regularEl) updatePricesForPage(regularPriceClassOrId, true)
// 					if (compareEl) updatePricesForPage(comparePriceClassOrId, false)
//         } catch (error) {
//           console.error('Error updating prices:', error)
//         }
//       }, 1500)
//     } catch (error) {
//       console.error('Error in predictive search handler:', error)
//     }
//   })

//   // Listen for custom search events that might be added by themes
//   document.addEventListener('search:results', () => {
//     try {
//       setTimeout(() => {
//         try {
//           if (regularEl) updatePricesForPage(regularPriceClassOrId, true)
// 					if (compareEl) updatePricesForPage(comparePriceClassOrId, false)
//         } catch (error) {
//           console.error('Error updating prices:', error)
//         }
//       }, 1500)
//     } catch (error) {
//       console.error('Error in search results handler:', error)
//     }
//   })
// }
