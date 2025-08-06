// Flag to control extra section visibility
let universel_showExtraSection = true
let universel_showImageSection = false
let universel_showPriceSection = false
let universel_showOptionPannel = false
let universel_showTriggerSection = false
let universel_highlightCheckbox = false
let universel_activePriceTrigger = null
let universel_regularEl = null
let universel_compareEl = null
let universel_badgeEl = null
let universel_contentEl = null
let universel_imageEl = null
let universel_triggerEl = null
let universel_searchEL = null
let universel_modalEl = null
let universel_regularOriginalText = ''
let universel_compareOriginalText = ''
let universel_badgeOrginalText = ''
let universel_regularPriceElement = ''
let universel_comparePriceElement = ''
let universel_badgeElement = ''
let universel_targetElement
let universel_targetImage
let universel_targetContent
let universel_targetTrigger
let universel_targetSearch
let universel_targetModal
let universel_regularPrice = true
let universel_compareAtPrice
let universel_badge
let universel_triggerElement
let universel_triggerClass
let universel_eventTracker = false
let universel_referrerUrl
let universel_payload
let universel_parsedPayload
let universel_themeId
let universel_themeName
let universel_regularPriceClassOrId = []
let universel_comparePriceClassOrId = []
let universel_badgeClassOrId = []
let universel_productPriceContainer = []
let universel_productContainer = []
let universel_singleProductContainer = []
let universel_textClassOrId = []
let universel_imgClassOrId = []
let universel_triggerButtonClassOrId = []
let universel_searchClassOrId = []
let universel_modalClassOrId = []
let universel_contentContainer = []
let universel_imageContainer = []
let universel_addtocartSelector = []
let universel_triggerButtonContainer = []
let universel_triggerElementContainer = []
const universel_PAYLOAD_KEY = 'signal_selector_info'
const universel_ACTIVE_KEY = 'signal_test_info'
let universel_activeTab = null
let universel_isLoading = false
let universel_updatedDom = []
let universel_shop = window.Shopify.shop

// Add this at the top of the file, after variable declarations
// if (sessionStorage.getItem(universel_ACTIVE_KEY)) {
//     console.log("🚫 ClassDetectionModal: Signal selector is active, skipping...");
//     return; // Exit early if the other script is active
// }

async function universel_getDataFromUrl() {
  const universel_url = new URL(window.location.href)
  universel_referrerUrl = document.universel_referrer
  const universel_encodedPayload =
    universel_url.searchParams.get('universel_payload')
  // console.log('universel_encodedPayload', universel_encodedPayload)
  if (!universel_encodedPayload) return

  function universel_safeDecodeURIComponent(str) {
    try {
      const universel_decodedOnce = decodeURIComponent(str)
      // Try decoding twice, if no error, probably double encoded
      const universel_decodedTwice = decodeURIComponent(universel_decodedOnce)
      return universel_decodedTwice
    } catch {
      // If double decoding fails, return single decoded
      return str
    }
  }

  console.log('universel_encodedPayload', universel_encodedPayload)

  const universel_jsonString = universel_safeDecodeURIComponent(
    universel_encodedPayload
  )
  const universel_payload = JSON.parse(universel_jsonString)
  console.log('✅ Payload from URL:', universel_payload)

  if (
    universel_payload?.appName == 'Signal-config' &&
    universel_payload?.requestFrom == 'Store-config'
  ) {
    const universel_updatedPayload = {
      appName: universel_payload.appName,
      requestFrom: universel_payload.requestFrom // or filter/transform as needed
    }
    // ✅ Save updated object
    sessionStorage.setItem(
      universel_PAYLOAD_KEY,
      JSON.stringify(universel_updatedPayload)
    )

    // console.log("✅ Final saved universel_payload:", universel_updatedPayload);
  }
}

function universel_persistPayloadInUrl() {
  const universel_referrer = document.referrer
  if (!universel_referrer) return

  const universel_refUrl = new URL(universel_referrer)
  const universel_payloadQuery =
    universel_refUrl.searchParams.get('universel_payload')
  if (!universel_payloadQuery) return

  const universel_currentUrl = new URL(window.location.href)

  // Only set if current URL doesn't already have universel_payload param
  if (!universel_currentUrl.searchParams.has('universel_payload')) {
    universel_currentUrl.searchParams.set(
      'universel_payload',
      universel_payloadQuery
    )

    // Replace the current history entry with the new URL
    window.history.replaceState(
      {},
      document.title,
      universel_currentUrl.toString()
    )
  }
}

function clearPayloadFromUrlAndStorage() {
  const universel_url = new URL(window.location.href)
  if (universel_url.searchParams.has('universel_payload')) {
    universel_url.searchParams.delete('universel_payload')
    window.history.replaceState({}, document.title, universel_url.toString())
  }
  sessionStorage.removeItem(universel_PAYLOAD_KEY)
}

function universel_showModalIfAllowed() {
  const universel_storedPayload = sessionStorage.getItem(universel_PAYLOAD_KEY)
  // console.log("🔍 Checking universel_payload:", universel_parsedPayload, "Referrer:", universel_referrerUrl)

  if (!universel_storedPayload) return

  universel_parsedPayload = JSON.parse(universel_storedPayload)
  if (
    universel_referrerUrl === 'https://admin.testsignal.com/' ||
    (universel_parsedPayload.appName === 'Signal-config' &&
      universel_parsedPayload.requestFrom === 'Store-config')
  ) {
    console.log('✅ Showing universel_modal...')
    document.body.appendChild(universel_modal)
    // updatePricesForPage()
    universel_renderModal()
    universel_updateButtonStates()
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await universel_getDataFromUrl()

    universel_persistPayloadInUrl()
    universel_getThemeInfo()

    universel_persistPayloadInUrl()
    universel_showModalIfAllowed()
    universel_getThemeInfo()
    await universel_fetchSelector()
  } catch (error) {
    console.error('❌ Error in universalStoreClassPicker.js:', error)
  }
})

function universel_getThemeInfo() {
  const themeInfo = window.Shopify.theme
  universel_themeId = themeInfo.id
  universel_themeName = themeInfo.schema_name
}

// app.js

async function universel_fetchSelector() {
  console.log('universel_themeId', universel_themeId)

  if (!universel_themeId || !universel_shop) {
    console.log('universel_themeId not found')
    return
  }

  try {
    const response = await fetch(
      `https://api.testsignal.com/api/v1/app/selector/${universel_themeId}?shop=${universel_shop}`
    )
    const result = await response.json()
    // console.log('result', result)

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch selector')
    }

    if (result.data) {
      const { themeName, selectors } = result.data

      selectors?.comparePriceClassOrId?.forEach((cs) => {
        universel_comparePriceClassOrId.push(cs)
        universel_compareEl = cs
      })
      selectors?.salePriceClassOrId?.forEach((rs) => {
        universel_regularPriceClassOrId.push(rs)
        universel_regularEl = rs
      })
      selectors?.badgeClassOrId?.forEach((bs) => {
        universel_badgeClassOrId.push(bs)
        universel_badgeEl = bs
      })
      selectors?.productContainer?.forEach((pc) => {
        universel_productContainer.push(pc)
      })
      selectors?.singleProductContainer?.forEach((sc) => {
        universel_singleProductContainer.push(sc)
      })
      universel_badgeOrginalText = selectors?.badgeOrginalText
      selectors?.textClassOrId?.forEach((ts) => {
        universel_textClassOrId.push(ts)
        universel_contentEl = ts
      })
      selectors?.contentContainer?.forEach((cc) => {
        universel_contentContainer.push(cc)
      })
      selectors?.imgClassOrId?.forEach((is) => {
        universel_imgClassOrId.push(is)
        universel_imageEl = is
      })
      selectors?.imageContainer?.forEach((ic) => {
        universel_imageContainer.push(ic)
      })
      selectors?.triggerButtonClassOrId?.forEach((tbs) => {
        universel_triggerButtonClassOrId.push(tbs)
        universel_triggerEl = tbs
      })
      selectors?.triggerButtonContainer?.forEach((tbc) => {
        universel_triggerButtonContainer.push(tbc)
      })
      selectors?.searchClassOrId?.forEach((ss) => {
        universel_searchClassOrId.push(ss)
        universel_searchEL = ss
      })
      selectors?.modalClassOrId?.forEach((ms) => {
        universel_modalClassOrId.push(ms)
        universel_modalEl = ms
      })
      selectors?.triggerElementContainer?.forEach((tec) => {
        universel_triggerElementContainer.push(tec)
      })
      selectors?.priceContainer?.forEach((pc) => {
        universel_productPriceContainer.push(pc)
      })
      selectors?.addtocartSelector?.forEach((atc) => {
        universel_addtocartSelector.push(atc)
      })

      // console.log('resultData', universel_themeName, selectors)
    }
  } catch (error) {
    console.error(error)
  }
}

// Create the main universel_modal wrapper
const universel_modal = document.createElement('div')
universel_modal.id = 'universel_editorModal'
universel_modal.style.cssText = `
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

// Function to render universel_modal content based on universel_showExtraSection
function universel_renderModal() {
  // const testGroup = universel_parsedPayload?.productInfo?.tests ?? null
  // console.log("testGroup", universel_modal)

  universel_modal.innerHTML = `
    <!-- Top Bar -->
		<style>
    select:focus,
    input:focus,
    button:focus {
      outline: none;
      box-shadow: none;
    }
			.universel_switch-label {
				display: flex;
				align-items: center;
				gap: 10px;
				font-size: 14px;
				font-weight: 600;
				font-family: sans-serif;
				color: #020617;
			}

			.universel_switch-wrapper {
				position: relative;
				width: 40px;
				height: 20px;
			}

			.universel_switch-input {
				opacity: 0;
				width: 0;
				height: 0;
			}

			.universel_switch-slider {
				position: absolute;
				top: 0; left: 0;
				right: 0; bottom: 0;
				background-color: #ccc;
				border-radius: 20px;
				transition: background-color 0.2s;
				cursor: pointer;
			}

			.universel_switch-slider::before {
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

			.universel_switch-input:checked + .universel_switch-slider {
				background-color: #1D4ED8;
			}

			.universel_switch-input:checked + .universel_switch-slider::before {
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

			.custom-radio-checkbox .universel_checkmark {
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

			.custom-radio-checkbox .universel_checkmark::after {
				content: "";
				position: absolute;
				top: 50%;
 				left: 50%;
				width: 14px;
				height: 14px;
				background-color: #1D4ED8; /* Purple inner dot */
				border-radius: 50%;
				transform: translate(-50%, -50%);
				display: none;
			}

			.custom-radio-checkbox input:checked ~ .universel_checkmark::after {
				display: block;
			}

			.universel_checkmark{
				color: #020617;
			}

			#universel_saveButton span {
				pointer-events: none;
			}

			.universel_tab-button {
					padding: 6px 14px;
					border: none;
					background-color: transparent;
					cursor: pointer;
					font-size: 16px;
					font-weight: 700;
					color: #64748B;
					width: 50%
				}

				.universel_active-tab {
					color: #1D4ED8;
					border-bottom: 2px solid #1D4ED8;
				}

				.universel_tab-section {
					animation: fadeIn 0.2s ease-in-out;
				}

				.universel_picker-btn-bg{
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 4px;
					background: #F1F5F9;
					border-radius: 5px;
					cursor: pointer;
				}

				.universel_delete-btn-bg{
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 4px;
					background: #F1F5F9;
					border-radius: 5px;
					cursor: pointer;
				}

				.universel_delete-btn-bg svg{
					color: black;
				}

				.universel_delete-btn-bg:hover{
					background: #DC2626;
					color: #fff;
				}

				.universel_delete-btn-bg:hover svg{
					color: #fff;
				}

				@keyframes fadeIn {
					from {
						opacity: 0.5;
					}

					to {
						opacity: 1;
					}
				}

				.universel_ring-spinner {
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
    <div id="universel_modalContainer" style="background: #fff; color: white; padding: 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 3px 3px -1px #E2E8F0;">
      <div style="font-weight: bold; color: #020617; display: flex; align-items: center; gap: 10px">
				<span style="font-size: 20px; font-weight: 700; color: #020617">Class Selector</span>
				<hr style = "margin: 0; width: 130px"; height: 3px;/>
			</div>
			<div style="display: flex; align-items: center; justify-content: end; gap: 12px;">
					<button class="universel_extra-section-trigger" style="background: white; border: 1px solid #E2E8F0; padding: 8px; border-radius: 12px; font-size: 14px; font-weight: 550; display: inline-flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer">
						<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M11.4993 0.0410156C11.8445 0.0410156 12.1243 0.320838 12.1243 0.666016V1.71226C13.1322 1.72262 13.9744 1.75706 14.6734 1.87566C15.5301 2.02102 16.2332 2.30199 16.7983 2.86705C17.4219 3.49069 17.6987 4.28148 17.8301 5.2585C17.9577 6.20783 17.9577 7.42085 17.9577 8.9523V9.04636C17.9577 10.5778 17.9577 11.7909 17.8301 12.7402C17.6987 13.7172 17.4219 14.508 16.7983 15.1316C16.2332 15.6967 15.5301 15.9777 14.6734 16.123C13.9744 16.2416 13.1322 16.2761 12.1243 16.2864V17.3327C12.1243 17.6779 11.8445 17.9577 11.4993 17.9577C11.1542 17.9577 10.8743 17.6779 10.8743 17.3327V0.666016C10.8743 0.320838 11.1542 0.0410156 11.4993 0.0410156ZM12.1243 15.0363V2.96242C13.1129 2.97298 13.8652 3.0064 14.4643 3.10805C15.1659 3.22709 15.5936 3.43009 15.9144 3.75094C16.2671 4.10361 16.4785 4.58665 16.5912 5.42506C16.7064 6.28144 16.7077 7.41033 16.7077 8.99935C16.7077 10.5884 16.7064 11.7173 16.5912 12.5736C16.4785 13.4121 16.2671 13.8951 15.9144 14.2478C15.5936 14.5686 15.1659 14.7716 14.4643 14.8906C13.8652 14.9923 13.1129 15.0257 12.1243 15.0363Z" fill="#020617"/>
							<path d="M7.28567 1.70768L8.99935 1.70768C9.34453 1.70768 9.62435 1.9875 9.62435 2.33268C9.62435 2.67786 9.34453 2.95768 8.99935 2.95768H7.33268C5.74367 2.95768 4.61478 2.95901 3.75839 3.07415C2.91998 3.18687 2.43694 3.39826 2.08427 3.75094C1.73159 4.10361 1.5202 4.58665 1.40748 5.42506C1.29234 6.28144 1.29102 7.41033 1.29102 8.99935C1.29102 10.5884 1.29234 11.7173 1.40748 12.5736C1.5202 13.4121 1.73159 13.8951 2.08427 14.2478C2.43694 14.6004 2.91998 14.8118 3.75839 14.9246C4.61478 15.0397 5.74367 15.041 7.33268 15.041H8.99935C9.34453 15.041 9.62435 15.3208 9.62435 15.666C9.62435 16.0112 9.34453 16.291 8.99935 16.291H7.28567C5.75422 16.291 4.54117 16.291 3.59183 16.1634C2.61481 16.032 1.82402 15.7553 1.20039 15.1316C0.57675 14.508 0.299985 13.7172 0.168629 12.7402C0.040993 11.7909 0.0410031 10.5778 0.0410159 9.04638V8.95234C0.0410031 7.42088 0.040993 6.20784 0.168629 5.2585C0.299985 4.28148 0.57675 3.49069 1.20039 2.86705C1.82402 2.24342 2.61481 1.96665 3.59183 1.83529C4.54118 1.70766 5.7542 1.70767 7.28567 1.70768Z" fill="#020617"/>
							<path d="M4.68087 5.48879C4.93084 5.45762 5.23626 5.45765 5.56921 5.45768H7.42952C7.76247 5.45765 8.06787 5.45762 8.31784 5.48879C8.59173 5.52296 8.88371 5.60285 9.13472 5.8259C9.17754 5.86396 9.21809 5.9045 9.25613 5.94732C9.47919 6.19833 9.55908 6.49031 9.59325 6.7642C9.62443 7.01417 9.62439 7.31958 9.62436 7.65254L9.62435 7.68685C9.62435 8.03203 9.34453 8.31185 8.99935 8.31185C8.65417 8.31185 8.37435 8.03203 8.37435 7.68685C8.37435 7.30808 8.37321 7.08211 8.35286 6.91892C8.3325 6.75572 8.16312 6.72918 8.16312 6.72918C7.99993 6.70883 7.77396 6.70769 7.39519 6.70769H7.12435V11.291H8.16602C8.5112 11.291 8.79102 11.5708 8.79102 11.916C8.79102 12.2612 8.5112 12.541 8.16602 12.541H4.83269C4.48751 12.541 4.20769 12.2612 4.20769 11.916C4.20769 11.5708 4.48751 11.291 4.83269 11.291H5.87435V6.70769H5.60352C5.22474 6.70769 4.99878 6.70883 4.83558 6.72918C4.83558 6.72918 4.6662 6.75572 4.64585 6.91892C4.62549 7.08211 4.62435 7.30808 4.62435 7.68685C4.62435 8.03203 4.34453 8.31185 3.99935 8.31185C3.65418 8.31185 3.37435 8.03203 3.37435 7.68685L3.37435 7.65254C3.37432 7.31958 3.37428 7.01417 3.40546 6.7642C3.43962 6.49031 3.51952 6.19833 3.74257 5.94732C3.78062 5.9045 3.82117 5.86396 3.86399 5.8259C4.115 5.60285 4.40698 5.52296 4.68087 5.48879Z" fill="#020617"/>
							</svg>
						Content
					</button>
					<button class = "universel_image-section-trigger" style="background: white; border: 1px solid #E2E8F0; padding: 8px; border-radius: 12px; font-size: 14px; font-weight: 550; display: inline-flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer">
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M9.95153 1.04102H10.0472C11.9708 1.04101 13.4784 1.041 14.6546 1.19914C15.8585 1.361 16.8086 1.69879 17.5542 2.44446C18.2999 3.19014 18.6377 4.14016 18.7996 5.3441C18.9577 6.52034 18.9577 8.02788 18.9577 9.95154V10.0472C18.9577 11.9708 18.9577 13.4784 18.7996 14.6546C18.6377 15.8585 18.2999 16.8086 17.5542 17.5542C16.8086 18.2999 15.8585 18.6377 14.6546 18.7996C13.4784 18.9577 11.9708 18.9577 10.0472 18.9577H9.95154C8.02788 18.9577 6.52034 18.9577 5.3441 18.7996C4.14016 18.6377 3.19014 18.2999 2.44446 17.5542C1.69879 16.8086 1.361 15.8585 1.19914 14.6546C1.041 13.4784 1.04101 11.9708 1.04102 10.0472V9.95153C1.04101 8.02787 1.041 6.52034 1.19914 5.3441C1.361 4.14016 1.69879 3.19014 2.44446 2.44446C3.19014 1.69879 4.14016 1.361 5.3441 1.19914C6.52034 1.041 8.02787 1.04101 9.95153 1.04102ZM5.51066 2.43799C4.44533 2.58122 3.80306 2.85363 3.32835 3.32835C2.85363 3.80306 2.58122 4.44533 2.43799 5.51066C2.29234 6.59398 2.29102 8.01749 2.29102 9.99935C2.29102 11.9812 2.29234 13.4047 2.43799 14.488C2.58122 15.5534 2.85363 16.1956 3.32835 16.6704C3.80306 17.1451 4.44533 17.4175 5.51066 17.5607C6.59398 17.7064 8.01749 17.7077 9.99935 17.7077C11.9812 17.7077 13.4047 17.7064 14.488 17.5607C15.5534 17.4175 16.1956 17.1451 16.6704 16.6704C17.1451 16.1956 17.4175 15.5534 17.5607 14.488C17.7064 13.4047 17.7077 11.9812 17.7077 9.99935C17.7077 8.01749 17.7064 6.59398 17.5607 5.51066C17.4175 4.44533 17.1451 3.80306 16.6704 3.32835C16.1956 2.85363 15.5534 2.58122 14.488 2.43799C13.4047 2.29234 11.9812 2.29102 9.99935 2.29102C8.01749 2.29102 6.59398 2.29234 5.51066 2.43799ZM13.3327 5.62435C12.7574 5.62435 12.291 6.09072 12.291 6.66602C12.291 7.24131 12.7574 7.70768 13.3327 7.70768C13.908 7.70768 14.3743 7.24131 14.3743 6.66602C14.3743 6.09072 13.908 5.62435 13.3327 5.62435ZM11.041 6.66602C11.041 5.40036 12.067 4.37435 13.3327 4.37435C14.5983 4.37435 15.6243 5.40036 15.6243 6.66602C15.6243 7.93167 14.5983 8.95768 13.3327 8.95768C12.067 8.95768 11.041 7.93167 11.041 6.66602ZM7.08599 10.9799C6.59927 10.4632 5.78686 10.4361 5.26678 10.9191L4.59136 11.5465C4.33844 11.7814 3.94298 11.7668 3.70807 11.5139C3.47317 11.261 3.48776 10.8655 3.74068 10.6306L4.4161 10.0033C5.43948 9.05274 7.03811 9.10609 7.99584 10.1227L10.2021 12.4647C10.4328 12.7096 10.8106 12.7426 11.0804 12.5414C12.0803 11.7954 13.4726 11.8802 14.3746 12.742L16.2644 14.5474C16.514 14.7859 16.523 15.1815 16.2846 15.4311C16.0462 15.6807 15.6505 15.6897 15.4009 15.4513L13.5111 13.6458C13.0502 13.2055 12.3387 13.1621 11.8278 13.5433C11.049 14.1243 9.95845 14.029 9.29223 13.3218L7.08599 10.9799Z" fill="#020617"/>
						</svg>
						Image
					</button>
					<button class = "universel_open-price-option" style="background: white; border: 1px solid #E2E8F0; padding: 8px; border-radius: 12px; font-size: 14px; font-weight: 550; display: inline-flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer">
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M9.3646 2.33175C8.8529 2.39937 8.22103 2.54451 7.32218 2.75194L6.2987 2.98813C5.53952 3.16332 5.0167 3.28478 4.61736 3.42183C4.23184 3.55415 4.01374 3.68458 3.84916 3.84916C3.68458 4.01374 3.55415 4.23184 3.42183 4.61736C3.28478 5.0167 3.16332 5.53952 2.98813 6.2987L2.75194 7.32218C2.54451 8.22103 2.39937 8.8529 2.33175 9.3646C2.26587 9.86311 2.28106 10.2004 2.369 10.507C2.45694 10.8137 2.62282 11.1077 2.9429 11.4955C3.27144 11.8936 3.72941 12.3525 4.3817 13.0048L5.90639 14.5295C7.0393 15.6624 7.84546 16.4667 8.53852 16.9955C9.21717 17.5133 9.71342 17.7077 10.218 17.7077C10.7225 17.7077 11.2187 17.5133 11.8974 16.9955C12.5904 16.4667 13.3966 15.6624 14.5295 14.5295C15.6624 13.3966 16.4667 12.5904 16.9955 11.8974C17.5133 11.2187 17.7077 10.7225 17.7077 10.218C17.7077 9.71342 17.5133 9.21717 16.9955 8.53852C16.4667 7.84546 15.6624 7.0393 14.5295 5.90639L13.0048 4.3817C12.3525 3.72941 11.8936 3.27144 11.4955 2.9429C11.1077 2.62282 10.8137 2.45694 10.507 2.369C10.2004 2.28106 9.86311 2.26587 9.3646 2.33175ZM9.20083 1.09252C9.79859 1.01353 10.3228 1.01576 10.8516 1.16744C11.3805 1.31912 11.8262 1.59503 12.2912 1.97883C12.7408 2.34986 13.2414 2.85052 13.8669 3.47599L15.4467 5.0558C16.5389 6.14797 17.4036 7.01267 17.9893 7.7803C18.5919 8.57013 18.9577 9.33022 18.9577 10.218C18.9577 11.1057 18.5919 11.8658 17.9893 12.6556C17.4036 13.4232 16.5389 14.2879 15.4467 15.3801L15.3801 15.4467C14.2879 16.5389 13.4232 17.4036 12.6556 17.9893C11.8658 18.5919 11.1057 18.9577 10.218 18.9577C9.33022 18.9577 8.57013 18.5919 7.7803 17.9893C7.01266 17.4036 6.14796 16.5389 5.05578 15.4467L3.47598 13.8669C2.85051 13.2414 2.34985 12.7408 1.97883 12.2912C1.59503 11.8262 1.31912 11.3805 1.16744 10.8516C1.01576 10.3228 1.01353 9.79859 1.09252 9.20083C1.16889 8.62298 1.3281 7.93308 1.52701 7.0712L1.77756 5.98547C1.94353 5.26621 2.07887 4.67968 2.23953 4.21159C2.40731 3.72273 2.61863 3.31193 2.96528 2.96528C3.31193 2.61863 3.72273 2.40731 4.21159 2.23953C4.67968 2.07887 5.26621 1.94353 5.98547 1.77756L7.0712 1.52701C7.93308 1.3281 8.62298 1.16889 9.20083 1.09252ZM7.90846 6.66197C7.50167 6.25517 6.84212 6.25517 6.43533 6.66197C6.02853 7.06877 6.02853 7.72831 6.43533 8.13511C6.84212 8.5419 7.50167 8.5419 7.90846 8.13511C8.31526 7.72831 8.31526 7.06877 7.90846 6.66197ZM5.55144 5.77809C6.44639 4.88313 7.8974 4.88313 8.79235 5.77809C9.6873 6.67304 9.6873 8.12404 8.79235 9.01899C7.8974 9.91394 6.44639 9.91394 5.55144 9.01899C4.65649 8.12404 4.65649 6.67304 5.55144 5.77809ZM15.8752 9.15782C16.1193 9.4019 16.1193 9.79763 15.8753 10.0417L10.0594 15.8577C9.81535 16.1018 9.41962 16.1018 9.17554 15.8578C8.93146 15.6137 8.93145 15.218 9.17552 14.9739L14.9914 9.15784C15.2354 8.91376 15.6312 8.91375 15.8752 9.15782Z" fill="#020617"/>
						</svg>
						Price
					</button>
					<button class = "universel_open-trigger-option" style="background: white; border: 1px solid #E2E8F0; padding: 8px; border-radius: 12px; font-size: 14px; font-weight: 550; display: inline-flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer">
						<svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M5.70508 11.9411V3.94106C5.70508 3.56664 5.85382 3.20755 6.11857 2.94279C6.38333 2.67804 6.74242 2.5293 7.11684 2.5293C7.49127 2.5293 7.85035 2.67804 8.11511 2.94279C8.37987 3.20755 8.52861 3.56664 8.52861 3.94106V10.9999M8.52861 10.5293V8.64694C8.52861 8.27252 8.67735 7.91343 8.9421 7.64868C9.20686 7.38392 9.56595 7.23518 9.94037 7.23518C10.3148 7.23518 10.6739 7.38392 10.9386 7.64868C11.2034 7.91343 11.3521 8.27252 11.3521 8.64694V10.9999M11.3521 9.58812C11.3521 9.2137 11.5009 8.85461 11.7656 8.58985C12.0304 8.32509 12.3895 8.17636 12.7639 8.17636C13.1383 8.17636 13.4974 8.32509 13.7622 8.58985C14.0269 8.85461 14.1757 9.2137 14.1757 9.58812V10.9999" stroke="#020617" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M14.1765 10.5291C14.1765 10.1546 14.3252 9.79556 14.59 9.5308C14.8547 9.26604 15.2138 9.1173 15.5882 9.1173C15.9627 9.1173 16.3217 9.26604 16.5865 9.5308C16.8513 9.79556 17 10.1546 17 10.5291V14.7644C17 16.2621 16.405 17.6984 15.346 18.7574C14.287 19.8165 12.8506 20.4114 11.3529 20.4114H9.47059H9.66635C8.73114 20.4116 7.81053 20.1795 6.98718 19.7359C6.16384 19.2924 5.46354 18.6513 4.94918 17.8702L4.76471 17.5879C4.47106 17.1374 3.44016 15.3404 1.672 12.1968C1.49172 11.8764 1.44356 11.4983 1.53777 11.1429C1.63198 10.7875 1.86113 10.4828 2.17647 10.2938C2.5125 10.0927 2.90598 10.0095 3.29465 10.0572C3.68331 10.1049 4.04496 10.2809 4.32235 10.5573L5.70588 11.9408M2.88235 2.52907L1.94118 1.58789M1.94118 6.29377H1M11.3529 2.52907L12.2941 1.58789M12.2941 5.3526H13.2353" stroke="#020617" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						Trigger
					</button>
				</div>
    </div>

   <div style="padding: 16px 20px">
	 	<div style="background-color: #DBEAFE; color: #1D4ED8; padding: 12px; border: 1px solid #BFDBFE; border-radius: 10px; display: flex; align-items: center; gap: 10px; width: 100%; font-size: 12px; margin-bottom: 16px;">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20" style="flex-shrink: 0; color: #020617">
					<circle cx="12" cy="12" r="10" fill="none" stroke = "#020617" />
					<rect x="11" y="10" width="2" height="7" fill="#020617" />
					<rect x="11" y="6" width="2" height="2" fill="#020617" />
				</svg>
				<span style= "font-size: 14px; color: #020617">Click the selector button '
				<span>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
							stroke-width="1.5" stroke="currentColor" width="18" height="18" style="color: #020617; margin-bottom: -5px; display: inline-flex">
							<path stroke-linecap="round" stroke-linejoin="round"
										d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
						</svg>
					</span> 
				' below, choose your theme's ${
          universel_showExtraSection
            ? 'content'
            : universel_showImageSection
            ? 'image'
            : universel_showPriceSection
            ? 'price'
            : universel_showTriggerSection
            ? 'search-trigger'
            : ''
        } elements, then hit Save.
				</span>
			</div>
	 		<div style="padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
			<!-- Middle Section -->

			<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px">
					<label class="universel_switch-label">
					Highlight Replaces
					<div class="universel_switch-wrapper">
						<input type="checkbox" id="universel_highlight-checkbox" class="universel_switch-input" ${
              universel_highlightCheckbox ? 'checked' : ''
            }>
						<span class="universel_switch-slider"></span>
					</div>
					</label>
					${
            !universel_showTriggerSection
              ? !universel_showPriceSection
                ? `
							<!-- Hide / Leave Checkboxes image and content -->
							<div style="display: flex; gap: 12px;">
								<label class="custom-radio-checkbox">
									<input type="checkbox" id="universel_hideCheckbox" />
									<span class="universel_checkmark"></span> Hide Element
								</label>
								<label class="custom-radio-checkbox">
									<input type="checkbox" id="universel_leaveCheckbox" />
									<span class="universel_checkmark" ></span> Leave As Is
								</label>
							</div>
						`
                : universel_regularPrice
                ? `
								<!-- Hide / Leave Checkboxes regular price -->
								<div style="display: flex; gap: 12px;">
									<label class="custom-radio-checkbox">
										<input type="checkbox" id="universel_hidePriceCheckbox" />
										<span class="universel_checkmark"></span> Hide Element
									</label>
									<label class="custom-radio-checkbox">
										<input type="checkbox" id="universel_leavePriceCheckbox" />
										<span class="universel_checkmark"></span> Leave As Is
									</label>
								</div>
							`
                : universel_compareAtPrice
                ? `
									<!-- Hide / Leave Checkboxes compare price -->
									<div style="margin-top: 16px; display: flex; gap: 12px;">
										<label class="custom-radio-checkbox">
											<input type="checkbox" id="universel_hideCompareCheckbox" />
											<span class="universel_checkmark"></span> Hide Element
										</label>
										<label class="custom-radio-checkbox">
											<input type="checkbox" id="universel_leaveCompareCheckbox" />
											<span class="universel_checkmark"></span> Leave As Is
										</label>
									</div>
								`
                : `
									<!-- Hide / Leave Checkboxes universel_badge -->
									<div style="margin-top: 16px; display: flex; gap: 12px;">
										<label class="custom-radio-checkbox">
											<input type="checkbox" id="universel_hideBadgeCheckbox" />
											<span class="universel_checkmark"></span> Hide Element
										</label>
										<label class="custom-radio-checkbox">
											<input type="checkbox" id="universel_leaveBadgeCheckbox" />
											<span class="universel_checkmark"></span> Leave As Is
										</label>
									</div>
								`
              : ''
          }
			</div>

			${
        universel_showExtraSection
          ? `
				<!-- Conditionally rendered block -->
					<div id="extra-toolbar-section" background: #fff;">
						<div>
							<div style= "display: flex; align-items: center; justify-content: space-between">
							<label style="color: #020617"><strong>Selected Element Info:</strong></label>
							<div style="display: flex; align-items: center; gap: 5px">
									<div class= "universel_delete-btn-bg">
										<svg class= "universel_content-class-delete" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
										<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
										</svg>
									</div>
									<div class="universel_picker-btn-bg">
										<svg class="universel_element-picker-trigger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
										stroke-width="1.5" stroke="currentColor" width="20" height="20" style="color: #020617;">
										<path stroke-linecap="round" stroke-linejoin="round"
										d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
										</svg>
									</div>
								</div>
							</div>
							<input type="text" id="universel_targetInfo" readonly placeholder=".card__content .card__information .card__heading.h5 .full-unstyled-link" style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" />
						</div>

						<div style="margin-top: 16px;">
							<label style="color: #020617"><strong>Element Container</strong></label>
							<input type="text" id="universel_targetInfoContainer" readonly placeholder=".card-wrapper .product-card-wrapper .underline-links-hover" style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;"/>
						</div>

						<div style="margin-top: 16px;">
							<label style="color: #020617"><strong>Replace Text:</strong></label>
							<input type="text" id="universel_replaceInput" placeholder="Enter text to replace content..." style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" />
						</div>
					</div>
			`
          : universel_showImageSection
          ? `
				<!-- Conditionally rendered block -->
					<div id="extra-toolbar-section" background: #fff;">
						<div>
							<div style="display: flex; align-items: center; justify-content: space-between">
								<label style="color: #020617"><strong>Selected Element Info:</strong></label>
								<div style="display: flex; align-items: center; gap: 5px">
									<div class= "universel_delete-btn-bg">
										<svg class= "universel_image-class-delete" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
										<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
										</svg>
									</div>
									<div class= "universel_picker-btn-bg">
										<svg class="universel_image-trigger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
										stroke-width="1.5" stroke="currentColor" width="20" height="20" style="color: #020617; cursor: pointer">
										<path stroke-linecap="round" stroke-linejoin="round"
										d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
										</svg>
									</div>
								</div>
							</div>
							<input type="text" id="universel_targetImageInfo" readonly placeholder= ".card__media .media.media--transparent.media--hover-effect .catalog-edit-wrapper .motion-reduce" style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" />
						</div>
						<div>
							<label style="color: #020617">
							<strong>Element Container</strong>
							</label>
							<input type="text" id="universel_targetImageContainer" readonly placeholder= ".product-card-wrapper" style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" />
						</div>

						<div style="display: flex; gap: 20px; align-items: flex-start; margin-top: 16px;">
							<!-- Selected Image Preview -->
							<div style="width: 150px; height: 200px; border: 1px solid #1D4ED8; border-radius: 8px; box-sizing: border-box; position: relative">
								${
                  universel_targetImage
                    ? `
								<img id="universel_previewImage" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" />
								<div style= "position: absolute; left: 10%; bottom: 5%; background-color: #1D4ED8; border-radius: 16px; padding: 2px 10px">
									<div style= "color: #fff; font-size: 12px; font-weight: 550">Selected Image</div>
								</div>
								`
                    : `<div style= "text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
									<div style= "font-weight: 400; color: #1D4ED8; opacity: .5;"> Please track an image to show preview.</div>
								</div>`
                }
							</div>

							<!-- Upload Button with Custom SVG -->
							<div style="width: 150px; height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
								<label for="universel_uploadImageInput" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #1D4ED8; border-radius: 8px; padding: 16px; text-align: center; width: 100%; height: 100%; background: #E2E8F0;">
									<!-- Your Custom SVG Icon -->
									<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M25.3852 10.54V2.69141M21.4609 6.61572H29.3096" stroke="#1D4ED8" stroke-width="1.70622" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M16.8821 4H10.734C8.53615 4 7.43724 4 6.59779 4.42772C5.85938 4.80396 5.25904 5.4043 4.8828 6.14271C4.45508 6.98217 4.45508 8.08108 4.45508 10.2789V21.267C4.45508 23.4648 4.45508 24.5637 4.8828 25.4031C5.25904 26.1416 5.85938 26.7419 6.59779 27.1181C7.43724 27.5459 8.53615 27.5459 10.734 27.5459H22.7685C23.985 27.5459 24.5933 27.5459 25.0923 27.4121C26.4466 27.0493 27.5044 25.9915 27.8672 24.6372C28.0009 24.1382 28.0009 23.5299 28.0009 22.3134M14.2659 11.1946C14.2659 12.6395 13.0945 13.8108 11.6496 13.8108C10.2048 13.8108 9.03344 12.6395 9.03344 11.1946C9.03344 9.74968 10.2048 8.57836 11.6496 8.57836C13.0945 8.57836 14.2659 9.74968 14.2659 11.1946ZM20.1393 15.6659L9.07419 25.725C8.45181 26.2908 8.14062 26.5737 8.11309 26.8188C8.08924 27.0312 8.17069 27.2419 8.33123 27.383C8.51645 27.5459 8.93701 27.5459 9.77812 27.5459H22.0569C23.9395 27.5459 24.8808 27.5459 25.6201 27.2296C26.5482 26.8326 27.2876 26.0931 27.6847 25.165C28.0009 24.4257 28.0009 23.4844 28.0009 21.6018C28.0009 20.9684 28.0009 20.6517 27.9317 20.3567C27.8447 19.9861 27.6778 19.6388 27.4427 19.3393C27.2557 19.101 27.0083 18.9032 26.5137 18.5075L22.8546 15.5802C22.3596 15.1842 22.1121 14.9861 21.8395 14.9163C21.5993 14.8547 21.3464 14.8626 21.1105 14.9393C20.8429 15.0262 20.6084 15.2394 20.1393 15.6659Z" stroke="#1D4ED8" stroke-width="1.70622" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
									<span style="margin-top: 8px; font-size: 14px; color: #1D4ED8;">click to choose files</span>
								</label>
								<input type="file" id="universel_uploadImageInput" accept="image/*" style="display: none;" />
							</div>
						</div>
					</div>
					`
          : universel_showPriceSection
          ? `
			<!-- Tab Header -->
			<div>
				<div style="display: flex; width: 100%; gap: 12px; margin-bottom: 12px; border-radius: 8px; padding: 10px; background-color: #F1F5F9">
					<button id="universel_regularTab" class="universel_tab-button universel_active-tab">Regular Price</button>
					<button id="universel_compareTab" class="universel_tab-button">Compare at Price</button>
					<button id="universel_badgeTab" class="universel_tab-button">Badge</button>
				</div>

				<!-- Tab Container -->
				<div id="priceTabContent" style="background: #fff;">

					<!-- Regular Price Tab -->
					<div id="universel_regularPriceTab" class="universel_tab-section">
						<div style="padding: 12px; border: 1px solid #E2E8F0; border-radius: 6px; background: #fff;">
							<div style="display:flex; align-items: center; justify-content: space-between">
								<label style="color: #020617"><strong>Sale / Regular Price Class:</strong></label>
								<div style="display:flex; align-items: center; gap: 5px;">
									<div class= "universel_delete-btn-bg">
										<svg class= "universel_regular-price-class-delete" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20" >
										<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
										</svg>
									</div>
									<div class= "universel_picker-btn-bg">
										<svg class="universel_regular-price-trigger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
										stroke-width="1.5" stroke="currentColor" width="20" height="20" style="color: black;">
										<path stroke-linecap="round" stroke-linejoin="round"
											d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
										</svg>
									</div>
								</div>
							</div>
							<input type="text" id="universel_priceClassInput" placeholder = "e.g. .price-item.price-item--sale.price-item--last"
								style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" />
							${
                window.location.pathname.startsWith('/products/')
                  ? `
									<label style="margin-top: 16px; display: block; color: #020617;" for="universel_singleContainerInput"><strong>Single Product Container</strong></label>
									<input style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" type="text" id="universel_singleContainerInput" placeholder="e.g. product-page, .product-container, .product-card-wrapper, product-card, product-price, [data-product-id], [data-pid]" />`
                  : `
									<label style="margin-top: 16px; display: block; color: #020617;" for="universel_containerSelectorInput"><strong>Product Container Selector</strong></label>
									<input style="width: 100%; padding: 8px; margin-top: 6px; border: 2px solid #E2E8F0; border-radius: 4px;" type="text" id="universel_containerSelectorInput" placeholder="e.g. product-page, .product-container, .product-card-wrapper, product-card, product-price, [data-product-id], [data-pid]" />`
              }
							<label style="margin-top: 16px; display: block; color: #020617" for="universel_price-input"><strong>Replace Price</strong></label>
							<input style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" type="text" id="universel_price-input" placeholder="Enter your price here...."/>
						</div>
					</div>

					<!-- Compare at Price Tab -->
					<div id="universel_comparePriceTab" class="universel_tab-section" style="margin-top: 24px; display: none;">
						<div style="padding: 12px; border: 1px solid #E2E8F0; border-radius: 6px; background: #fff;">
							<div style="display:flex; align-items: center; justify-content: space-between">
								<label style="color: #020617"><strong>Compare at Price Class:</strong></label>
								<div style="display:flex; align-items: center; gap: 5px;">
									<div class= "universel_delete-btn-bg">
										<svg class= "universel_compare-price-class-delete" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20" >
										<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
										</svg>
									</div>
									<div class= "universel_picker-btn-bg">
										<svg class="universel_compare-at-price-trigger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
										stroke-width="1.5" stroke="currentColor" width="20" height="20" style="color: black;">
										<path stroke-linecap="round" stroke-linejoin="round"
											d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
										</svg>
									</div>
								</div>
							</div>
							<input type="text" id="universel_compareAtPriceClassInput" placeholder =".price-item.price-item--regular"
								style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" />
							${
                window.location.pathname.startsWith('/products/')
                  ? `
								<label style="margin-top: 16px; display: block; color: #020617;" for="universel_singleCompareContainerSelectorInput"><strong>Single Product Container Selector:</strong></label>
								<input style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" type="text" id="universel_singleCompareContainerSelectorInput" placeholder="e.g. product-page, .product-container, .product-card-wrapper, product-card, product-price, [data-product-id], [data-pid]" />
								`
                  : `
								<label style="margin-top: 16px; display: block; color: #020617;" for="universel_compareContainerSelectorInput"><strong>Product Container Selector:</strong></label>
								<input style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" type="text" id="universel_compareContainerSelectorInput" placeholder="e.g. product-page, .product-container, .product-card-wrapper, product-card, product-price, [data-product-id], [data-pid]" />
								`
              }
							<label style="margin-top: 16px; display: block; color: #020617;" for="compare-universel_price-input"><strong>Replace compare price</strong></label>
							<input style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" type="text" id="compare-universel_price-input" placeholder="Enter your price here...." />
						</div>
					</div>
					<!-- universel_badge tab -->
					<div id="universel_badgePriceTab" class="universel_tab-section" style="margin-top: 24px; display: none;">
						<div style="padding: 12px; border: 1px solid #E2E8F0; border-radius: 6px; background: #fff;">
							<div style="display:flex; align-items: center; justify-content: space-between">
								<label style="color: #020617"><strong>Badge Class:</strong></label>
								<div style="display:flex; align-items: center; gap: 5px;">
									<div class= "universel_delete-btn-bg">
										<svg class= "universel_badge-class-delete" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20" >
										<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
										</svg>
									</div>
									<div class= "universel_picker-btn-bg">
										<svg class="universel_badge-trigger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
										stroke-width="1.5" stroke="currentColor" width="20" height="20" style="color: black;">
										<path stroke-linecap="round" stroke-linejoin="round"
											d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
										</svg>
									</div>
								</div>
							</div>
							<input type="text" id="universel_badgeClassInput" placeholder =".universel_badge.price__badge-sale.color-scheme-5"
								style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" />
							${
                window.location.pathname.startsWith('/products/')
                  ? `
								<label style="margin-top: 16px; display: block; color: #020617;" for="universel_singleBadgeContainerSelectorInput"><strong>Single Product Container Selector:</strong></label>
								<input style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" type="text" id="universel_singleBadgeContainerSelectorInput" placeholder="e.g. product-page, .product-container, .product-card-wrapper, product-card, product-price, [data-product-id], [data-pid]" />
								`
                  : `
								<label style="margin-top: 16px; display: block; color: #020617;" for="universel_badgeContainerSelectorInput"><strong>Product Container Selector:</strong></label>
								<input style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" type="text" id="universel_badgeContainerSelectorInput" placeholder="e.g. product-page, .product-container, .product-card-wrapper, product-card, product-price, [data-product-id], [data-pid]" />
								`
              }
							<label style="margin-top: 16px; display: block; color: #020617;" for="universel_badge-input"><strong>Replace universel_badge</strong></label>
							<input style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" type="text" id="universel_badge-input" placeholder="Enter your universel_badge here...." />
						</div>
					</div>
				</div>
			</div>
			`
          : universel_showTriggerSection
          ? `
			<!-- Tab Header -->
				<div style="display: flex; width: 100%; gap: 12px; margin-bottom: 12px; border-radius: 8px; padding: 10px; background-color: #F1F5F9">
					<button id="trigger-element" class="universel_tab-button universel_active-tab">Trigger Element</button>
					<button id="trigger-class" class="universel_tab-button">Trigger Class</button>
				</div>
				<!-- Tab Container -->
				<div id="triggerTabContent" style="background: #fff;">

					<!-- Trigger Element -->
					<div id="trigger-element-tab" class="universel_tab-section">
						<div style="padding: 12px; border: 1px solid #E2E8F0; border-radius: 6px; background: #fff;">
							<div style="display:flex; align-items: center; justify-content: space-between">
								<label style="color: #020617"><strong>Trigger button Class:</strong></label>
								<div style="display:flex; align-items: center; gap: 5px;">
									<div class= "universel_delete-btn-bg">
										<svg class= "trigger-button-class-delete" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20" >
										<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
										</svg>
									</div>
									<div class= "universel_picker-btn-bg">
										<svg class="event-button-trigger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
										stroke-width="1.5" stroke="currentColor" width="20" height="20" style="color: black;">
										<path stroke-linecap="round" stroke-linejoin="round"
											d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
										</svg>
									</div>
								</div>
							</div>
							<input type="text" id="trigger-input" placeholder = ".modal__toggle-open.icon.icon-search"
								style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" />
							<label style="margin-top: 16px; display: block; color: #020617;" for="universel_triggerButtonContainer"><strong>Element Container</strong></label>
							<input style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" type="text" id="universel_triggerButtonContainer" placeholder=".header__icons .header__icons--localization .header-localization" />
						</div>
					</div>

					<!-- Trigger class Tab -->
					<div id="universel_trigger-class-tab" class="universel_tab-section" style="margin-top: 24px; display: none;">
						<div style="padding: 12px; border: 1px solid #E2E8F0; border-radius: 6px; background: #fff;">
							<div style="display:flex; align-items: center; justify-content: space-between">
								<label style="color: #020617"><strong>Modal Trigger Selector:</strong></label>
								<div style="display:flex; align-items: center; gap: 5px;">
									<div class= "universel_delete-btn-bg">
										<svg class= "universel_event-trigger-class-delete" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20" >
										<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
										</svg>
									</div>
									<div class= "universel_picker-btn-bg">
										<svg class="universel_event-trigger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
										stroke-width="1.5" stroke="currentColor" width="20" height="20" style="color: black;">
										<path stroke-linecap="round" stroke-linejoin="round"
											d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
										</svg>
									</div>
								</div>
							</div>
							<input type="text" id="universel_eventClassInput" placeholder =".search-universel_modal.modal__content.gradient"
								style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" />
							<label style="margin-top: 16px; display: block; color: #020617;" for="universel_eventSearchInput"><strong>Search Input Selector:</strong></label>
							<input style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" type="text" id="universel_eventSearchInput" placeholder="#Search-In-Modal.search__input.field__input" />
							<label style="margin-top: 16px; display: block; color: #020617;" for="universel_eventContainer"><strong>Element Container Selector:</strong></label>
							<input style="width: 100%; padding: 8px; margin-top: 6px; border: 1px solid #E2E8F0; border-radius: 4px;" type="text" id="universel_eventContainer" placeholder="predictive-search" />
						</div>
					</div>
				</div>
			`
          : ''
      }
			</div>
	 </div>

		<!-- Bottom Section -->
		<hr style= "margin: 0; background: #E2E8F0;"/>
		<div style="padding: 20px; display: flex; align-items: center; justify-content: end; gap: 14px">
				<div>
					<div style="display: flex; align-items: center; gap: 20px;">
					<button id="universel_exitEditor" style="background: #DC26261A; color: #DC2626; border: none; border-radius: 6px; padding: 10px 16px; font-weight: 400; cursor: pointer;">
						Exit Editor
					</button>
				</div>
			</div>
      <div style="position: relative; display: inline-block;">
				<button id="universel_saveButton" disabled
					style="background: #1D4ED8; color: #fff; border: 1px solid #ddd; padding: 8px 16px; border-radius: 6px; cursor: not-allowed;">
					<span id="universel_saveButtonText">Save</span>
  				<span id="universel_saveSpinner" class="universel_ring-spinner" style="display: none;"></span>
				</button>
				<div id="universel_tooltipMessage" style="
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
					bottom: 120%;
					left: -80%;
					transform: translateX(-50%);
					z-index: 1;

					transition: opacity 0.3s ease;
				">
					
				</div>
			</div>
    </div>
  `

  const header = universel_modal.querySelector('#universel_modalContainer')
  makeDraggable(universel_modal, header)

  const button = document.getElementById('universel_saveButton')
  // console.log('button', button)
  const tooltip = document.getElementById('universel_tooltipMessage')
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
    const universel_regularTab = document.getElementById('universel_regularTab')
    const universel_compareTab = document.getElementById('universel_compareTab')
    const universel_badgeTab = document.getElementById('universel_badgeTab')

    if (!universel_regularTab || !universel_compareTab || !universel_badgeTab)
      return

    universel_regularTab.onclick = function () {
      universel_regularPrice = true
      universel_compareAtPrice = false
      universel_badge = false

      universel_updatePriceTabUI()
      universel_renderModal()
      universel_updateButtonStates()
    }

    universel_compareTab.onclick = function () {
      universel_regularPrice = false
      universel_compareAtPrice = true
      universel_badge = false

      universel_updatePriceTabUI()
      universel_renderModal()
      universel_updateButtonStates()
    }

    universel_badgeTab.onclick = function () {
      universel_regularPrice = false
      universel_compareAtPrice = false
      universel_badge = true

      universel_updatePriceTabUI()
      universel_renderModal()
      universel_updateButtonStates()
    }
  }

  function universel_updatePriceTabUI() {
    const universel_regularTab = document.getElementById('universel_regularTab')
    const universel_compareTab = document.getElementById('universel_compareTab')
    const universel_badgeTab = document.getElementById('universel_badgeTab')

    const universel_regularPriceTab = document.getElementById(
      'universel_regularPriceTab'
    )
    const universel_comparePriceTab = document.getElementById(
      'universel_comparePriceTab'
    )
    const universel_badgePriceTab = document.getElementById(
      'universel_badgePriceTab'
    )

    if (universel_regularPrice) {
      universel_regularPriceTab.style.display = 'block'
      universel_comparePriceTab.style.display = 'none'
      universel_badgePriceTab.style.display = 'none'

      universel_regularTab.classList.add('universel_active-tab')
      universel_compareTab.classList.remove('universel_active-tab')
      universel_badgeTab.classList.remove('universel_active-tab')
    } else if (universel_compareAtPrice) {
      universel_regularPriceTab.style.display = 'none'
      universel_comparePriceTab.style.display = 'block'
      universel_badgePriceTab.style.display = 'none'

      universel_regularTab.classList.remove('universel_active-tab')
      universel_compareTab.classList.add('universel_active-tab')
      universel_badgeTab.classList.remove('universel_active-tab')
    } else if (universel_badge) {
      universel_regularPriceTab.style.display = 'none'
      universel_comparePriceTab.style.display = 'none'
      universel_badgePriceTab.style.display = 'block'

      universel_regularTab.classList.remove('universel_active-tab')
      universel_compareTab.classList.remove('universel_active-tab')
      universel_badgeTab.classList.add('universel_active-tab')
    }
  }

  function setUpTriggerTab() {
    const triggerElementButton = document.getElementById('trigger-element')
    const triggerClassButton = document.getElementById('trigger-class')

    if (!triggerElementButton || !triggerClassButton) return

    triggerElementButton.onclick = function () {
      universel_triggerElement = true
      universel_triggerClass = false

      updateTriggerTabUI()
      universel_renderModal()
      universel_updateButtonStates()
    }

    triggerClassButton.onclick = function () {
      universel_triggerElement = false
      universel_triggerClass = true

      updateTriggerTabUI()
      universel_renderModal()
      universel_updateButtonStates()
    }
  }

  function updateTriggerTabUI() {
    const triggerElementButton = document.getElementById('trigger-element')
    const triggerClassButton = document.getElementById('trigger-class')

    const triggerElementTab = document.getElementById('trigger-element-tab')
    const triggerClassTab = document.getElementById(
      'universel_trigger-class-tab'
    )

    if (universel_triggerElement) {
      triggerElementTab.style.display = 'block'
      triggerClassTab.style.display = 'none'

      triggerElementButton.classList.add('universel_active-tab')
      triggerClassButton.classList.remove('universel_active-tab')
    } else if (universel_triggerClass) {
      triggerElementTab.style.display = 'none'
      triggerClassTab.style.display = 'block'

      triggerElementButton.classList.remove('universel_active-tab')
      triggerClassButton.classList.add('universel_active-tab')
    }
  }

  if (universel_showPriceSection) {
    setupPriceTabs()
    universel_updatePriceTabUI() // ensure correct tab is shown initially
  }

  if (universel_showTriggerSection) {
    setUpTriggerTab()
    updateTriggerTabUI()
  }

  function updateDeleteButtonState(priceClassArray, deleteButton) {
    console.log('priceClassArray', priceClassArray)
    if (priceClassArray.length === 0) {
      deleteButton.style.pointerEvents = 'none'
      deleteButton.style.opacity = '0.4'
    } else {
      deleteButton.style.pointerEvents = 'auto'
      deleteButton.style.opacity = '1'
    }
  }

  const regularDelete = document.querySelector(
    '.universel_regular-price-class-delete'
  )
  if (regularDelete) {
    updateDeleteButtonState(universel_regularPriceClassOrId, regularDelete)
  }

  const compareDelete = document.querySelector(
    '.universel_compare-price-class-delete'
  )
  if (compareDelete) {
    updateDeleteButtonState(universel_comparePriceClassOrId, compareDelete)
  }

  const badgeDelete = document.querySelector('.universel_badge-class-delete')
  if (badgeDelete) {
    updateDeleteButtonState(universel_badgeClassOrId, badgeDelete)
  }

  const contentDelete = document.querySelector(
    '.universel_content-class-delete'
  )
  if (contentDelete) {
    updateDeleteButtonState(universel_textClassOrId, contentDelete)
  }

  const imageDelete = document.querySelector('.universel_image-class-delete')
  if (imageDelete) {
    updateDeleteButtonState(universel_imgClassOrId, imageDelete)
  }

  const triggerElementDelete = document.querySelector(
    '.trigger-button-class-delete'
  )
  if (triggerElementDelete) {
    updateDeleteButtonState(
      universel_triggerButtonClassOrId,
      triggerElementDelete
    )
  }

  const triggerClassDelete = document.querySelector(
    '.universel_event-trigger-class-delete'
  )
  if (triggerClassDelete) {
    updateDeleteButtonState(universel_searchClassOrId, triggerClassDelete)
  }

  // Attach live DOM updater after universel_modal rerender
  if (universel_showExtraSection) {
    console.log('I am extra and true')
    console.log('universel_contentEl', universel_contentEl)
    const infoInput = document.getElementById('universel_targetInfo')
    const universel_replaceInput = document.getElementById(
      'universel_replaceInput'
    )
    const universel_hideCheckbox = document.getElementById(
      'universel_hideCheckbox'
    )
    const universel_leaveCheckbox = document.getElementById(
      'universel_leaveCheckbox'
    )
    const containerInput = document.getElementById(
      'universel_targetInfoContainer'
    )

    if (universel_contentEl) {
      let originalText
      const value = universel_contentEl.trim(',')
      console.log('value', value)
      if (!universel_textClassOrId.includes(value)) {
        universel_textClassOrId.push(universel_contentEl)
      }
      infoInput.value = universel_textClassOrId?.join(' ')
      let container

      if (universel_targetContent) {
        container = getParentHierarchy(universel_targetContent, 5)
        if (container) {
          containerClass = container[4].class
            .split(' ')
            .map((cls) => '.' + cls)
            .join(' ')
          containerInput.value = containerClass
          const value = containerClass.trim()
          if (!universel_contentContainer.includes(value)) {
            universel_contentContainer.push(containerClass)
          }
        }
      } else {
        container = universel_contentContainer?.join(' ')
        containerInput.value = container
        const value = container.trim()
        if (!universel_contentContainer.includes(value)) {
          universel_contentContainer.push(container)
        }
      }

      const contentDelete = document.querySelector(
        '.universel_content-class-delete'
      )
      if (contentDelete) {
        updateDeleteButtonState(universel_textClassOrId, contentDelete)
      }

      if (universel_targetContent) {
        originalText = universel_targetContent.innerText
        universel_replaceInput.value = originalText

        universel_replaceInput?.addEventListener('input', () => {
          if (!universel_leaveCheckbox?.checked && universel_targetContent) {
            universel_targetContent.innerText = universel_replaceInput.value
          }
        })
      }

      universel_hideCheckbox?.addEventListener('change', () => {
        if (!universel_leaveCheckbox?.checked && universel_targetContent) {
          universel_targetContent.style.display = universel_hideCheckbox.checked
            ? 'none'
            : ''
        }
      })

      universel_leaveCheckbox?.addEventListener('change', () => {
        if (universel_leaveCheckbox.checked && universel_targetContent) {
          universel_targetContent.style.display = ''
          universel_targetContent.innerText = originalText

          universel_replaceInput.value = originalText
          universel_hideCheckbox.checked = false

          universel_replaceInput.disabled = true
          universel_hideCheckbox.disabled = true

          if (universel_highlightCheckbox) {
            universel_highlightCheckbox.checked = false
            universel_highlightCheckbox.disabled = true
          }
        } else {
          universel_replaceInput.disabled = false
          universel_hideCheckbox.disabled = false
          if (universel_highlightCheckbox)
            universel_highlightCheckbox.disabled = false
        }
      })
    }
  }

  if (universel_showImageSection) {
    const infoInput = document.getElementById('universel_targetImageInfo')
    const universel_previewImage = document.getElementById(
      'universel_previewImage'
    )
    const uploadInput = document.getElementById('universel_uploadImageInput')
    const universel_hideCheckbox = document.getElementById(
      'universel_hideCheckbox'
    )
    const universel_leaveCheckbox = document.getElementById(
      'universel_leaveCheckbox'
    )
    const containerInput = document.getElementById(
      'universel_targetImageContainer'
    )

    if (universel_imageEl) {
      const value = universel_imageEl.trim()
      if (!universel_imgClassOrId.includes(value)) {
        universel_imgClassOrId.push(universel_imageEl)
      }
      infoInput.value = universel_imgClassOrId?.join(' ')

      let container
      if (universel_targetImage) {
        container = findTopmostParentWithClass(universel_targetImage)
      } else {
        container = universel_imageContainer?.join(' ')
      }

      if (container) {
        containerInput.value = container
        const value = container.trim()
        if (!universel_imageContainer.includes(value)) {
          universel_imageContainer.push(container)
        }
      }

      const imageDelete = document.querySelector(
        '.universel_image-class-delete'
      )
      if (imageDelete) {
        updateDeleteButtonState(universel_imgClassOrId, imageDelete)
      }

      const originalSrc = universel_targetImage?.src
      // console.log("Original image src:", originalSrc);

      if (universel_previewImage) {
        universel_previewImage.src = originalSrc
      }

      universel_hideCheckbox.disabled = universel_leaveCheckbox.checked
      uploadInput.disabled = universel_leaveCheckbox.checked

      const newUploadInput = uploadInput.cloneNode(true)
      uploadInput.parentNode.replaceChild(newUploadInput, uploadInput)

      const newHideCheckbox = universel_hideCheckbox.cloneNode(true)
      universel_hideCheckbox.parentNode.replaceChild(
        newHideCheckbox,
        universel_hideCheckbox
      )

      const newLeaveCheckbox = universel_leaveCheckbox.cloneNode(true)
      universel_leaveCheckbox.parentNode.replaceChild(
        newLeaveCheckbox,
        universel_leaveCheckbox
      )

      newUploadInput.addEventListener('change', () => {
        // console.log("Upload input changed");
        if (!universel_targetImage || newLeaveCheckbox.checked) {
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

          if (universel_targetImage) {
            universel_targetImage.src = newSrc
            universel_targetImage.srcset = newSrc
          } // important to override srcset
          if (universel_previewImage) universel_previewImage.src = newSrc
        }
        reader.readAsDataURL(file)
      })

      newHideCheckbox.addEventListener('change', () => {
        // console.log("Hide checkbox changed", newHideCheckbox.checked);
        if (!universel_targetImage || newLeaveCheckbox.checked) return
        universel_targetImage.style.display = newHideCheckbox.checked
          ? 'none'
          : ''
      })

      const originalSrcset = universel_targetImage
        ? universel_targetImage.getAttribute('srcset')
        : '' // save original srcset

      // ...

      newLeaveCheckbox.addEventListener('change', () => {
        if (!universel_targetImage) return

        if (newLeaveCheckbox.checked) {
          // Revert changes
          universel_targetImage.src = originalSrc
          if (originalSrcset !== null) {
            universel_targetImage.setAttribute('srcset', originalSrcset)
          } else {
            universel_targetImage.removeAttribute('srcset')
          }
          universel_targetImage.style.display = ''

          newHideCheckbox.checked = false
          newUploadInput.value = ''
          if (universel_previewImage) universel_previewImage.src = originalSrc

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
  }

  function normalizeSelector(selector) {
    if (!selector || typeof selector !== 'string') return ''

    // Split into parts by space
    const parts = selector.trim().split(/\s+/).filter(Boolean)

    // Remove duplicates
    const uniqueParts = [...new Set(parts)]

    // Rejoin and return
    return uniqueParts.join(' ')
  }

  if (universel_showPriceSection) {
    setTimeout(() => {
      const infoPriceInput = document.getElementById(
        'universel_priceClassInput'
      )
      const infoCompareInput = document.getElementById(
        'universel_compareAtPriceClassInput'
      )
      const infoBadgeInput = document.getElementById(
        'universel_badgeClassInput'
      )
      const replacePriceInput = document.getElementById('universel_price-input')
      const replaceCompareInput = document.getElementById(
        'compare-universel_price-input'
      )
      const replaceBadgeInput = document.getElementById('universel_badge-input')
      const priceContainerInput = document.getElementById(
        'universel_containerSelectorInput'
      )
      const singlePriceContainerInput = document.getElementById(
        'universel_singleContainerInput'
      )
      const comparePriceContainerInput = document.getElementById(
        'universel_compareContainerSelectorInput'
      )
      const singleComparePriceContainerInput = document.getElementById(
        'universel_singleCompareContainerSelectorInput'
      )
      const badgeContainerInput = document.getElementById(
        'universel_badgeContainerSelectorInput'
      )
      const singleBadgeContainerInput = document.getElementById(
        'universel_singleBadgeContainerSelectorInput'
      )
      const universel_hidePriceCheckbox = document.getElementById(
        'universel_hidePriceCheckbox'
      )
      const universel_hideCompareCheckbox = document.getElementById(
        'universel_hideCompareCheckbox'
      )
      const universel_leavePriceCheckbox = document.getElementById(
        'universel_leavePriceCheckbox'
      )
      const universel_leaveCompareCheckbox = document.getElementById(
        'universel_leaveCompareCheckbox'
      )
      const universel_leaveBadgeCheckbox = document.getElementById(
        'universel_leaveBadgeCheckbox'
      )
      const universel_hideBadgeCheckbox = document.getElementById(
        'universel_hideBadgeCheckbox'
      )
      // console.log('universel_regularPrice', universel_regularPrice)
      // console.log('universel_hidePriceCheckbox', universel_hidePriceCheckbox)
      // console.log('universel_leavePriceCheckbox', universel_leavePriceCheckbox)

      if (universel_regularEl) {
        const value = universel_regularEl.trim()
        if (!universel_regularPriceClassOrId.includes(value)) {
          universel_regularPriceClassOrId.push(universel_regularEl)
        }
        infoPriceInput.value = universel_regularPriceClassOrId?.join(' ')
        const regularDelete = document.querySelector(
          '.universel_regular-price-class-delete'
        )
        if (regularDelete) {
          updateDeleteButtonState(
            universel_regularPriceClassOrId,
            regularDelete
          )
        }
        const originalPrice = universel_regularPriceElement?.innerText
        let container
        if (universel_regularPriceElement) {
          container = findTopmostParentWithClass(universel_regularPriceElement)
        } else {
          if (window.location.pathname.startsWith('/products/')) {
            container = universel_singleProductContainer?.join(' ')
          } else {
            container = universel_productContainer?.join(' ')
          }
        }
        if (container) {
          if (window.location.pathname.startsWith('/products/')) {
            if (singlePriceContainerInput) {
              singlePriceContainerInput.value = container
              const value = container.trim()
              const normalized = normalizeSelector(value)

              if (!universel_singleProductContainer.includes(normalized)) {
                universel_singleProductContainer.push(normalized)
              }
            }
          } else {
            if (priceContainerInput) {
              priceContainerInput.value = container
              const value = container.trim()
              const normalized = normalizeSelector(value)

              if (!universel_productContainer.includes(normalized)) {
                universel_productContainer.push(normalized)
              }
            }
          }
        }
        if (universel_regularPriceElement) {
          replacePriceInput.value = universel_regularPriceElement.innerText
          replacePriceInput?.addEventListener('input', () => {
            if (
              !universel_leavePriceCheckbox?.checked &&
              universel_regularPriceElement
            ) {
              universel_regularPriceElement.innerText = replacePriceInput.value
            }
          })
        }

        universel_hidePriceCheckbox?.addEventListener('change', () => {
          if (
            !universel_leavePriceCheckbox?.checked &&
            universel_regularPriceElement
          ) {
            universel_regularPriceElement.style.display =
              universel_hidePriceCheckbox.checked ? 'none' : ''
          }
        })

        universel_leavePriceCheckbox?.addEventListener('change', () => {
          if (
            universel_leavePriceCheckbox.checked &&
            universel_regularPriceElement
          ) {
            universel_regularPriceElement.style.display = ''
            universel_regularPriceElement.innerText = originalPrice

            replacePriceInput.value = originalPrice
            universel_hidePriceCheckbox.checked = false

            replacePriceInput.disabled = true
            universel_hidePriceCheckbox.disabled = true

            if (universel_highlightCheckbox) {
              universel_highlightCheckbox.checked = false
              universel_highlightCheckbox.disabled = true
            }
          } else {
            replacePriceInput.disabled = false
            universel_hidePriceCheckbox.disabled = false
            if (universel_highlightCheckbox)
              universel_highlightCheckbox.disabled = false
          }
        })
      }

      if (universel_compareEl) {
        universel_comparePriceClassOrId.push(universel_compareEl)
        infoCompareInput.value = universel_comparePriceClassOrId?.join(' ')
        const compareDelete = document.querySelector(
          '.universel_compare-price-class-delete'
        )
        if (compareDelete) {
          updateDeleteButtonState(
            universel_comparePriceClassOrId,
            compareDelete
          )
        }
        const orginalCompare = universel_comparePriceElement.innerText
        let container
        if (universel_comparePriceElement) {
          container = findTopmostParentWithClass(universel_comparePriceElement)
        } else {
          if (window.location.pathname.startsWith('/products/')) {
            container = universel_singleProductContainer?.join(' ')
          } else {
            container = universel_productContainer?.join(' ')
          }
        }
        if (container) {
          if (window.location.pathname.startsWith('/products/')) {
            if (singleComparePriceContainerInput) {
              singleComparePriceContainerInput.value = container
              const value = container.trim()
              const normalized = normalizeSelector(value)

              if (!universel_singleProductContainer.includes(normalized)) {
                universel_singleProductContainer.push(normalized)
              }
            }
          } else {
            if (comparePriceContainerInput) {
              comparePriceContainerInput.value = container
              const value = container.trim()
              const normalized = normalizeSelector(value)

              if (!universel_productContainer.includes(normalized)) {
                universel_productContainer.push(normalized)
              }
            }
          }
        }
        if (universel_comparePriceElement) {
          replaceCompareInput.value = universel_comparePriceElement.innerText
          replaceCompareInput?.addEventListener('input', () => {
            if (
              !universel_leaveCompareCheckbox?.checked &&
              universel_comparePriceElement
            ) {
              universel_comparePriceElement.innerText =
                replaceCompareInput.value
            }
          })
        }

        universel_hideCompareCheckbox?.addEventListener('change', () => {
          if (
            !universel_leaveCompareCheckbox?.checked &&
            universel_comparePriceElement
          ) {
            universel_comparePriceElement.style.display =
              universel_hideCompareCheckbox.checked ? 'none' : ''
          }
        })

        universel_leaveCompareCheckbox?.addEventListener('change', () => {
          if (
            universel_leaveCompareCheckbox.checked &&
            universel_comparePriceElement
          ) {
            universel_comparePriceElement.style.display = ''
            universel_comparePriceElement.innerText = orginalCompare

            replaceCompareInput.value = orginalCompare
            universel_hideCompareCheckbox.checked = false

            replaceCompareInput.disabled = true
            universel_hideCompareCheckbox.disabled = true

            if (universel_highlightCheckbox) {
              universel_highlightCheckbox.checked = false
              universel_highlightCheckbox.disabled = true
            }
          } else {
            replaceCompareInput.disabled = false
            universel_hideCompareCheckbox.disabled = false
            if (universel_highlightCheckbox)
              universel_highlightCheckbox.disabled = false
          }
        })
      }

      if (universel_badgeEl) {
        console.log('universel_badgeElement', universel_badgeElement)
        universel_badgeClassOrId.push(universel_badgeEl)
        infoBadgeInput.value = universel_badgeClassOrId?.join(' ')
        const badgeDelete = document.querySelector(
          '.universel_badge-class-delete'
        )
        if (badgeDelete) {
          updateDeleteButtonState(universel_badgeClassOrId, badgeDelete)
        }
        const originalBadge = universel_badgeElement.innerText
        let container
        if (universel_badgeElement) {
          container = findTopmostParentWithClass(universel_badgeElement)
        } else {
          if (window.location.pathname.startsWith('/products/')) {
            container = universel_singleProductContainer?.join(' ')
          } else {
            container = universel_productContainer?.join(' ')
          }
        }
        if (container) {
          if (window.location.pathname.startsWith('/products/')) {
            if (singleBadgeContainerInput) {
              singleBadgeContainerInput.value = container
              const value = container.trim()
              const normalized = normalizeSelector(value)

              if (!universel_singleProductContainer.includes(normalized)) {
                universel_singleProductContainer.push(normalized)
              }
            }
          } else {
            if (badgeContainerInput) {
              badgeContainerInput.value = container
              const value = container.trim()
              const normalized = normalizeSelector(value)

              if (!universel_productContainer.includes(normalized)) {
                universel_productContainer.push(normalized)
              }
            }
          }
        }
        if (universel_badgeElement) {
          replaceBadgeInput.value = universel_badgeElement.innerText
          replaceBadgeInput?.addEventListener('input', () => {
            if (
              !universel_leaveBadgeCheckbox?.checked &&
              universel_badgeElement
            ) {
              universel_badgeElement.innerText = replaceBadgeInput.value
            }
          })
        }

        universel_hideBadgeCheckbox?.addEventListener('change', () => {
          if (
            !universel_leaveBadgeCheckbox?.checked &&
            universel_badgeElement
          ) {
            universel_badgeElement.style.display =
              universel_hideBadgeCheckbox.checked ? 'none' : ''
          }
        })

        universel_leaveBadgeCheckbox?.addEventListener('change', () => {
          if (universel_leaveBadgeCheckbox.checked && universel_badgeElement) {
            universel_badgeElement.style.display = ''
            universel_badgeElement.innerText = originalBadge

            replaceBadgeInput.value = originalBadge
            universel_hideBadgeCheckbox.checked = false

            replaceBadgeInput.disabled = true
            universel_hideBadgeCheckbox.disabled = true

            if (universel_highlightCheckbox) {
              universel_highlightCheckbox.checked = false
              universel_highlightCheckbox.disabled = true
            }
          } else {
            replaceBadgeInput.disabled = false
            universel_hideBadgeCheckbox.disabled = false
            if (universel_highlightCheckbox)
              universel_highlightCheckbox.disabled = false
          }
        })
      }
    }, 0)
  }

  if (universel_showTriggerSection) {
    setTimeout(() => {
      const infoTriggerInput = document.getElementById('trigger-input')
      const infoEventClassInput = document.getElementById(
        'universel_eventClassInput'
      )
      const infoSearchClassInput = document.getElementById(
        'universel_eventSearchInput'
      )
      const triggerBtnContainer = document.getElementById(
        'universel_triggerButtonContainer'
      )
      const universel_eventContainer = document.getElementById(
        'universel_eventContainer'
      )
      // console.log('universel_regularPrice', universel_regularPrice)
      // console.log('universel_hidePriceCheckbox', universel_hidePriceCheckbox)
      // console.log('universel_leavePriceCheckbox', universel_leavePriceCheckbox)

      if (universel_triggerEl) {
        const value = universel_triggerEl.trim()
        if (!universel_triggerButtonClassOrId.includes(value)) {
          universel_triggerButtonClassOrId.push(universel_triggerEl)
        }
        infoTriggerInput.value = universel_triggerButtonClassOrId?.join(' ')
        let container
        if (universel_targetTrigger) {
          container = getParentHierarchy(universel_targetTrigger, 5)
          if (container) {
            containerClass = container[4].class
              .split(' ')
              .map((cls) => '.' + cls)
              .join(' ')
            triggerBtnContainer.value = containerClass
            universel_triggerButtonContainer.push(containerClass)
          }
        } else {
          container = universel_triggerButtonContainer?.join(' ')
          triggerBtnContainer.value = container
        }

        const triggerElementDelete = document.querySelector(
          '.trigger-button-class-delete'
        )
        if (triggerElementDelete) {
          updateDeleteButtonState(
            universel_triggerButtonClassOrId,
            triggerElementDelete
          )
        }
      }

      if (universel_searchEL) {
        const value = universel_searchEL.trim()
        if (!universel_searchClassOrId.includes(value)) {
          universel_searchClassOrId.push(universel_searchEL)
        }
        infoSearchClassInput.value = universel_searchClassOrId?.join(' ')
        let container
        if (universel_targetSearch) {
          container = findTopmostParentWithClass(universel_targetSearch)
        } else {
          container = universel_triggerElementContainer?.join(' ')
        }

        if (container) {
          universel_eventContainer.value = container
          const value = container.trim()
          if (!universel_triggerElementContainer.includes(value)) {
            universel_triggerElementContainer.push(container)
          }
        }
        const triggerClassDelete = document.querySelector(
          '.universel_event-trigger-class-delete'
        )
        if (triggerClassDelete) {
          updateDeleteButtonState(universel_searchClassOrId, triggerClassDelete)
        }
      }

      if (universel_modalEl) {
        const value = universel_searchEL.trim()
        if (!universel_modalClassOrId.includes(value)) {
          universel_modalClassOrId.push(universel_modalEl)
        }
        infoEventClassInput.value = universel_modalClassOrId?.join(' ')
        // const regularDelete = document.querySelector('.universel_regular-price-class-delete');
        // if (regularDelete) {
        // 	updateDeleteButtonState(universel_regularPriceClassOrId, regularDelete);
        // }
      }

      // if (universel_compareEl) {
      // 	universel_comparePriceClassOrId.push(universel_compareEl)
      // 	infoCompareInput.value = universel_comparePriceClassOrId?.join(" ")
      // 	const compareDelete = document.querySelector('.universel_compare-price-class-delete');
      // 	if (compareDelete) {
      // 		updateDeleteButtonState(universel_comparePriceClassOrId, compareDelete);
      // 	}
      // 	replaceCompareInput.value = universel_comparePriceElement.innerText
      // 	const orginalCompare = universel_comparePriceElement.innerText
      // 	const container = findTopmostParentWithClass(universel_comparePriceElement)
      // 	if(container){
      // 		comparePriceContainerInput.value = container
      // 	}
      // }
    }, 0)
  }

  const universel_saveButton = document.getElementById('universel_saveButton')
  if (universel_saveButton) {
    const shouldEnable =
      (universel_showExtraSection && !!universel_contentEl) ||
      (universel_showImageSection && !!universel_imageEl) ||
      (universel_showPriceSection &&
        (!!universel_regularEl ||
          !!universel_compareEl ||
          !!universel_badgeEl)) ||
      (universel_showTriggerSection &&
        (!!universel_triggerEl || !!universel_searchEL || !!universel_modalEl))
    universel_saveButton.disabled = !shouldEnable

    if (!shouldEnable) {
      universel_saveButton.style.backgroundColor = '#BFDBFE'
      universel_saveButton.style.color = '#fff'
      universel_saveButton.style.cursor = 'not-allowed'
      universel_saveButton.style.borderColor = '#ddd'
    } else {
      universel_saveButton.style.backgroundColor = '#1D4ED8'
      universel_saveButton.style.color = '#fff'
      universel_saveButton.style.cursor = 'pointer'
      universel_saveButton.style.borderColor = '#ccc'
    }
  }

  // Attach Exit button event
  const exitBtn = document.getElementById('universel_exitEditor')
  if (exitBtn) {
    exitBtn.onclick = () => {
      universel_modal.style.display = 'none'
      sessionStorage.removeItem(universel_PAYLOAD_KEY)
      clearPayloadFromUrlAndStorage()
    }
  }

  const selectEl = document.getElementById('testGroupSelect')
  if (selectEl) {
    selectEl.addEventListener('change', () => {
      console.log('Change event fired!', selectEl.value)
      // console.log('universel_comparePriceClassOrId', universel_comparePriceClassOrId)
      // console.log('universel_regularPriceClassOrId', universel_regularPriceClassOrId)
      if (universel_regularEl)
        updatePricesForPage(universel_regularPriceClassOrId, true, false)
      if (universel_compareEl)
        updatePricesForPage(universel_comparePriceClassOrId, false, false)
      if (universel_badgeEl)
        updatePricesForPage(universel_badgeClassOrId, false, true)
    })
  }
}

// update button state
function universel_updateButtonStates() {
  const contentButton = document.querySelector(
    '.universel_extra-section-trigger'
  )
  const imageButton = document.querySelector('.universel_image-section-trigger')
  const priceButton = document.querySelector('.universel_open-price-option')
  const triggerButton = document.querySelector('.universel_open-trigger-option')

  // Content Button
  if (contentButton) {
    if (universel_showExtraSection) {
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
    if (universel_showImageSection) {
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
    // console.log('universel_showPriceSection from btn', universel_showPriceSection)
    if (universel_showPriceSection) {
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

  // Trigger Button
  if (triggerButton) {
    // console.log('universel_showPriceSection from btn', universel_showPriceSection)
    if (universel_showTriggerSection) {
      triggerButton.style.backgroundColor = '#1D4ED8'
      triggerButton.style.color = '#fff'
      triggerButton
        ?.querySelectorAll('svg path')
        .forEach((p) => p.setAttribute('stroke', '#fff'))
    } else {
      triggerButton.style.backgroundColor = '#fff'
      triggerButton.style.color = '#020617'
      triggerButton
        ?.querySelectorAll('svg path')
        .forEach((p) => p.setAttribute('stroke', '#020617'))
    }
  }
}

// universel_highlight-checkbox

document.body.addEventListener('change', (event) => {
  const target = event.target.closest('#universel_highlight-checkbox')
  if (target) {
    if (target?.checked) {
      universel_highlightCheckbox = true
      if (universel_targetContent) {
        universel_targetContent.style.color = '#1D4ED8'
        universel_targetContent.style.border = '1px dashed #1D4ED8'
      }
      if (universel_targetImage) {
        universel_targetImage.style.border = '1px dashed #1D4ED8'
      }
      if (universel_regularPriceElement) {
        universel_regularPriceElement.style.color = '#1D4ED8'
        universel_regularPriceElement.style.border = '1px dashed #1D4ED8'
      }
      if (universel_comparePriceElement) {
        universel_comparePriceElement.style.color = '#1D4ED8'
        universel_comparePriceElement.style.border = '1px dashed #1D4ED8'
      }
      if (universel_badgeElement) {
        universel_badgeElement.style.color = '#fff'
        universel_badgeElement.style.border = '#1D4ED8'
      }
      console.log('✅ Highlight Replaces is ON', universel_highlightCheckbox)
      // your logic when ON
    } else {
      universel_highlightCheckbox = false
      if (universel_targetContent) {
        universel_targetContent.style.color = ''
        universel_targetContent.style.border = ''
      }
      if (universel_targetImage) {
        universel_targetImage.style.border = ''
      }
      if (universel_regularPriceElement) {
        universel_regularPriceElement.style.color = ''
        universel_regularPriceElement.style.border = ''
      }
      if (universel_comparePriceElement) {
        universel_comparePriceElement.style.color = ''
        universel_comparePriceElement.style.border = ''
      }
      if (universel_badgeElement) {
        universel_badgeElement.style.color = ''
        universel_badgeElement.style.border = ''
      }
      console.log('🚫 Highlight Replaces is OFF', universel_highlightCheckbox)
      // your logic when OFF
    }
  }
})

document.body.addEventListener('click', (event) => {
  const target = event.target.closest('.universel_regular-price-class-delete')
  if (target) {
    console.log('delet button click')
    if (universel_regularPriceClassOrId.length > 0) {
      console.log(
        'universel_regularPriceClassOrId',
        universel_regularPriceClassOrId
      )
      const infoPriceInput = document.getElementById(
        'universel_priceClassInput'
      )
      const containerInput = document.getElementById(
        'universel_containerSelectorInput'
      )
      universel_regularPriceClassOrId = []
      universel_regularEl = ''
      universel_productContainer = []
      target.style.pointerEvents = 'none'
      target.style.opacity = '0.4'
      infoPriceInput.value = ''
      containerInput.value = ''
      universel_showToast('Regular classes delete successfully!', 'success')
      universel_renderModal()
      universel_updateButtonStates()
    }
  }
})

document.body.addEventListener('click', (event) => {
  const target = event.target.closest('.universel_compare-price-class-delete')
  if (target) {
    if (universel_comparePriceClassOrId.length > 0) {
      const infoCompareInput = document.getElementById(
        'universel_compareAtPriceClassInput'
      )
      const containerInput = document.getElementById(
        'universel_compareContainerSelectorInput'
      )
      universel_comparePriceClassOrId = []
      universel_compareEl = ''
      universel_productContainer = []
      infoCompareInput.value = ''
      containerInput.value = ''
      universel_showToast('Compare classes delete successfully!', 'success')
      universel_renderModal()
      universel_updateButtonStates()
    }
  }
})

document.body.addEventListener('click', (event) => {
  const target = event.target.closest('.universel_badge-class-delete')
  if (target) {
    if (universel_badgeClassOrId.length > 0) {
      const infoBadgeInput = document.getElementById(
        'universel_badgeClassInput'
      )
      const containerInput = document.getElementById(
        'universel_badgeContainerSelectorInput'
      )
      universel_badgeClassOrId = []
      universel_badgeEl = ''
      universel_productContainer = []
      infoBadgeInput.value = ''
      containerInput.value = ''
      universel_showToast(
        'universel_badge classes delete successfully!',
        'success'
      )
      universel_renderModal()
      universel_updateButtonStates()
    }
  }
})

document.body.addEventListener('click', (event) => {
  const target = event.target.closest('.universel_content-class-delete')
  if (target) {
    if (universel_textClassOrId.length > 0) {
      const infoTextInput = document.getElementById('universel_targetInfo')
      const textContainerInput = document.getElementById(
        'universel_targetInfoContainer'
      )
      const textReplaceInput = document.getElementById('universel_replaceInput')
      universel_textClassOrId = []
      universel_contentContainer = []
      universel_contentEl = ''
      infoTextInput.value = ''
      textContainerInput.value = ''
      textReplaceInput.value = ''
      universel_targetContent = null
      universel_showToast('Content classes delete successfully!', 'success')
      universel_renderModal()
      universel_updateButtonStates()
    }
  }
})

document.body.addEventListener('click', (event) => {
  const target = event.target.closest('.universel_image-class-delete')
  if (target) {
    if (universel_imgClassOrId.length > 0) {
      const infoImgInput = document.getElementById('universel_targetImageInfo')
      const imgContainerInput = document.getElementById(
        'universel_targetImageContainer'
      )
      // const selectedImage = document.getElementById('universel_previewImage')
      universel_imgClassOrId = []
      universel_imageContainer = []
      universel_imageEl = ''
      infoImgInput.value = ''
      imgContainerInput.value = ''
      universel_targetImage = null
      universel_showToast('Image classes delete successfully!', 'success')
      universel_renderModal()
      universel_updateButtonStates()
    }
  }
})

document.body.addEventListener('click', (event) => {
  const target = event.target.closest('.trigger-button-class-delete')
  if (target) {
    if (universel_triggerButtonClassOrId.length > 0) {
      const infoTriggerButtonInput = document.getElementById('trigger-input')
      const triggerButtonContainerInput = document.getElementById(
        'universel_triggerButtonContainer'
      )
      // const selectedImage = document.getElementById('universel_previewImage')
      universel_triggerButtonClassOrId = []
      universel_triggerButtonContainer = []
      universel_triggerEl = ''
      infoTriggerButtonInput.value = ''
      triggerButtonContainerInput.value = ''
      universel_targetTrigger = null
      universel_showToast(
        'Trigger button classes delete successfully!',
        'success'
      )
      universel_renderModal()
      universel_updateButtonStates()
    }
  }
})

document.body.addEventListener('click', (event) => {
  const target = event.target.closest('.universel_event-trigger-class-delete')
  if (target) {
    if (
      universel_searchClassOrId.length > 0 ||
      universel_modalClassOrId.length > 0
    ) {
      const infoEventInput = document.getElementById(
        'universel_eventClassInput'
      )
      const universel_eventSearchInput = document.getElementById(
        'universel_eventSearchInput'
      )
      const eventContainerInput = document.getElementById(
        'universel_eventContainer'
      )
      // const selectedImage = document.getElementById('universel_previewImage')
      universel_searchClassOrId = []
      universel_modalClassOrId = []
      universel_eventContainer = []
      universel_searchEL = ''
      universel_modalEl = ''
      infoEventInput.value = ''
      universel_eventSearchInput.value = ''
      eventContainerInput.value = ''
      universel_targetSearch = null
      universel_showToast('Event classes delete successfully!', 'success')
      universel_renderModal()
      universel_updateButtonStates()
    }
  }
})

// save the class in database -- hit save button
document.body.addEventListener('click', function (event) {
  if (event.target && event.target.id === 'universel_saveButton') {
    universel_isLoading = true
    // show the spinner
    document.getElementById('universel_saveSpinner').style.display =
      'inline-block'
    document.getElementById('universel_saveButtonText').textContent =
      'Saving...'
    const universel_payload = {
      themeId: universel_themeId?.toString(),
      themeName: universel_themeName,
      shop: universel_shop,
      selectors: {
        salePriceClassOrId: universel_regularPriceClassOrId,
        comparePriceClassOrId: universel_comparePriceClassOrId,
        priceContainer: universel_productPriceContainer,
        productContainer: universel_productContainer,
        singleProductContainer: universel_singleProductContainer,
        badgeClassOrId: universel_badgeClassOrId,
        badgeOrginalText: universel_badgeOrginalText,
        addtocartSelector: universel_addtocartSelector,
        textClassOrId: universel_textClassOrId,
        contentContainer: universel_contentContainer,
        imgClassOrId: universel_imgClassOrId,
        imageContainer: universel_imageContainer,
        triggerButtonClassOrId: universel_triggerButtonClassOrId,
        searchClassOrId: universel_searchClassOrId,
        modalClassOrId: universel_modalClassOrId,
        triggerButtonContainer: universel_triggerButtonContainer,
        triggerElementContainer: universel_triggerElementContainer
      }
    }

    console.log('universel_payload', universel_payload)

    // fetch('http://localhost:5001/api/v1/app/selector', {
    fetch('https://api.testsignal.com/api/v1/app/selector', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(universel_payload)
    })
      .then((response) => {
        if (!response.ok) {
          universel_showToast('Save failed. Please try again.', 'error')
          universel_isLoading = false
          document.getElementById('universel_saveSpinner').style.display =
            'none'
          document.getElementById('universel_saveButtonText').textContent =
            'Save'
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then((data) => {
        console.log('Success:', data)
        universel_showToast('Saved successfully!', 'success')
        universel_isLoading = false
        // hide the spinner
        document.getElementById('universel_saveSpinner').style.display = 'none'
        document.getElementById('universel_saveButtonText').textContent = 'Save'
      })
      .catch((error) => {
        console.error('Error:', error)
        universel_isLoading = false

        document.getElementById('universel_saveSpinner').style.display = 'none'
        document.getElementById('universel_saveButtonText').textContent = 'Save'
      })
  }
})

// toast

function universel_showToast(message, type = 'success') {
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
  const trigger = e.target.closest('.universel_extra-section-trigger')
  if (trigger) {
    e.preventDefault()

    universel_showExtraSection = true // ✅ explicitly set true
    universel_showPriceSection = false
    universel_showImageSection = false
    universel_showTriggerSection = false

    universel_renderModal()
    // updatePricesForPage()
    universel_updateButtonStates() // ✅ consistent update
  }
})

// show image section
document.body.addEventListener('click', (e) => {
  const trigger = e.target.closest('.universel_image-section-trigger')
  if (trigger) {
    e.preventDefault()

    universel_showImageSection = true
    universel_showExtraSection = false
    universel_showPriceSection = false
    universel_showTriggerSection = false

    universel_renderModal()
    // updatePricesForPage()
    universel_updateButtonStates()
  }
})

// show price section

document.body.addEventListener('click', (e) => {
  const trigger = e.target.closest('.universel_open-price-option')
  if (trigger) {
    e.preventDefault()
    universel_showPriceSection = true
    universel_showExtraSection = false
    universel_showImageSection = false
    universel_showTriggerSection = false

    universel_renderModal() // optional if you're dynamically updating
    // updatePricesForPage()

    setTimeout(() => {
      universel_updateButtonStates()
    }, 10) // keep your delay if universel_modal rendering overwrites button
  }
})

document.body.addEventListener('click', (e) => {
  const trigger = e.target.closest('.universel_open-trigger-option')
  if (trigger) {
    e.preventDefault()
    universel_showTriggerSection = true
    universel_showPriceSection = false
    universel_showExtraSection = false
    universel_showImageSection = false

    universel_renderModal() // optional if you're dynamically updating
    // updatePricesForPage()

    setTimeout(() => {
      universel_updateButtonStates()
    }, 10) // keep your delay if universel_modal rendering overwrites button
  }
})

// for content picking
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.querySelector('.universel_element-picker-trigger')
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
      !target.closest('.universel_element-picker-trigger') &&
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
      target.closest('.universel_element-picker-trigger') ||
      target.closest('#element-info-universel_modal') ||
      isPriceRelated(target) ||
      hasPriceAncestor(target)
    ) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    stopPicker()

    universel_showModal(target)
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

  const universel_showModal = (target) => {
    document.getElementById('element-info-universel_modal')?.remove()

    console.log('target', target)

    const universel_modal = document.createElement('div')
    universel_modal.id = 'element-info-universel_modal'
    universel_modal.style.position = 'absolute'
    universel_modal.style.background = '#fff'
    universel_modal.style.border = '1px solid #E2E8F0'
    universel_modal.style.borderRadius = '16px'
    universel_modal.style.padding = '16px 0'
    universel_modal.style.fontFamily = 'sans-serif'
    universel_modal.style.fontSize = '14px'
    universel_modal.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
    universel_modal.style.zIndex = '9999'

    const tag = target.tagName.toLowerCase()
    const id = target.id || '—'
    const rawClass = target.className
    const className =
      typeof rawClass === 'string'
        ? rawClass.trim()
        : (rawClass?.baseVal || '—').trim()
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

    universel_modal.innerHTML = `
      <div style= "padding: 0 16px">
				<div><strong style="color: #020617">Tag:</strong> <span style= "color: #1D4ED8">${tag}</span></div>
				<div><strong style="color: #020617">ID:</strong> <span style= "color: #1D4ED8">${id}</span></div>
				<div><strong style="color: #020617">Class:</strong> <span style= "color: #1D4ED8">${className}</span></div>
				${parentsHTML}
			</div>
			<hr style= "margin-top: 5px; margin-bottom: 5px; color: #E2E8F0">
      <div style= "display: flex; align-items: center; justify-content: end; gap: 5px; margin-top: 10px; padding: 0 16px">
				<button id="close-info" style="margin-right:10px; border-radius: 25px; background-color: #DC2626; border: none; padding: 6px 12px; color: #fff">Close</button>
				<button id="universel_edit-info" style="border-radius: 25px; background-color: #1D4ED8; border: none; padding: 6px 12px; color: #fff; display: flex; align-items: center; justify-content: center; gap: 5px">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M7.99935 13.3332H13.9993M10.9167 2.41449C11.1821 2.1491 11.542 2 11.9173 2C12.2927 2 12.6526 2.1491 12.918 2.41449C13.1834 2.67988 13.3325 3.03983 13.3325 3.41516C13.3325 3.79048 13.1834 4.15043 12.918 4.41582L4.91133 12.4232C4.75273 12.5818 4.55668 12.6978 4.34133 12.7605L2.42667 13.3192C2.3693 13.3359 2.30849 13.3369 2.25061 13.3221C2.19272 13.3072 2.13988 13.2771 2.09763 13.2349C2.05538 13.1926 2.02526 13.1398 2.01043 13.0819C1.9956 13.024 1.9966 12.9632 2.01333 12.9058L2.572 10.9912C2.63481 10.776 2.75083 10.5802 2.90933 10.4218L10.9167 2.41449Z" stroke="#F8FAFC" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
					Edit
				</button>
			</div>
    `

    document.body.appendChild(universel_modal)

    const rect = target.getBoundingClientRect()
    universel_modal.style.top = `${rect.bottom + window.scrollY + 6}px`
    universel_modal.style.left = `${rect.left + window.scrollX}px`

    universel_modal.querySelector('#close-info').onclick = () => {
      universel_renderModal()
      universel_modal.remove()
      // updatePricesForPage()
      universel_updateButtonStates()
    }

    universel_modal.querySelector('#universel_edit-info').onclick = () => {
      const parentHierarchy = getParentHierarchy(target, 3)
      const targetClass = target.className || '—'
      const targetTag = target.tagName.toLowerCase()

      const combinedInfo = {
        targetClass,
        targetTag,
        parentHierarchy,
        dom: target // ✅ store DOM element here
      }

      universel_contentEl = buildSelectorFromHierarchy(combinedInfo)
      universel_targetContent = target
      universel_renderModal()
      universel_modal.remove()
      // updatePricesForPage()
      universel_updateButtonStates()
    }

    // const outsideClickListener = (event) => {
    // 	    if (!universel_modal.contains(event.target)) {
    // 				universel_modal.remove();
    // 	      universel_renderModal();
    // 				updatePricesForPage()
    // 				universel_updateButtonStates()
    // 	      document.removeEventListener('click', outsideClickListener);
    // 	    }
    // 	  };
    // 	  document.addEventListener('click', outsideClickListener);
  }

  // Toggle picker on trigger click
  document.body.addEventListener('click', (e) => {
    const testGroupSelect = document.getElementById('testGroupSelect')
    const priceBtn = document.querySelector('.universel_open-price-option')
    const imgBtn = document.querySelector('.universel_image-section-trigger')
    const triggerBtn = document.querySelector('.universel_open-trigger-option')
    if (e.target.closest('.universel_element-picker-trigger')) {
      e.preventDefault()
      if (picking) {
        stopPicker()
        // Change fill color of all <path> elements inside SVG
        const paths = e.target.closest('.universel_element-picker-trigger')
        paths.style.color = '#020617'
        const button = document.querySelectorAll('.universel_picker-btn-bg')
        if (button) {
          button.forEach((btn) => {
            btn.style.background = '#F1F5F9'
          })
        }

        if (triggerBtn) {
          triggerBtn.disabled = false
          triggerBtn.style.cursor = 'pointer'
          triggerBtn.style.opacity = '1'
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
        const paths = e.target.closest('.universel_element-picker-trigger')
        paths.style.color = '#fff'
        const button = document.querySelectorAll('.universel_picker-btn-bg')
        if (button) {
          button.forEach((btn) => {
            btn.style.background = '#1D4ED8'
          })
        }

        if (triggerBtn) {
          triggerBtn.disabled = true
          triggerBtn.style.cursor = 'not-allowed'
          triggerBtn.style.opacity = '0.6'
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

// function toClassSelectorWithSpaces(classString) {
//   return classString
//     .trim()
//     .split(/\s+/)
//     .filter(cls => /^[a-zA-Z0-9_-]+$/.test(cls)) // Keep only valid class names
//     .map(cls => `.${cls}`)
//     .join(' ')
// }

// for price picking
document.addEventListener('DOMContentLoaded', () => {
  let pickingPrice = false
  let hoverStyle
  let universel_activePriceTrigger = null

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
  const badgeSelectors = [
    '.price__badge-sale',
    '.price__badge',
    '.universel_badge'
  ]
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
      e.target.closest('.universel_regular-price-trigger') ||
      e.target.closest('.universel_compare-at-price-trigger') ||
      e.target.closest('.universel_badge-trigger')
    )
      return
    e.preventDefault()
    e.stopPropagation()

    const match = findPriceElement(e.target)
    if (!match) return

    const { el: target, type } = match
    stopPricePicker()
    target.classList.add('__price-selected')
    universel_showPriceInfoModal(target, type)
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
      e.target.closest('.universel_regular-price-trigger') ||
      e.target.closest('.universel_compare-at-price-trigger') ||
      e.target.closest('.universel_badge-trigger')
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
    universel_showPriceInfoModal(el, type)
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
				outline: 2px dashed orange !important;
				cursor: crosshair !important;
			}
			.__price-selected {
				outline: 3px solid orange !important;
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
    const regular = e.target.closest('.universel_regular-price-trigger')
    const compare = e.target.closest('.universel_compare-at-price-trigger')
    const universel_badge = e.target.closest('.universel_badge-trigger')

    if (regular) {
      e.preventDefault()
      toggleTrigger('regular', regular)
    } else if (compare) {
      e.preventDefault()
      toggleTrigger('compare', compare)
    } else if (universel_badge) {
      toggleTrigger('universel_badge', universel_badge)
    }
  })

  function toggleTrigger(triggerType, buttonEl) {
    const testGroupSelect = document.getElementById('testGroupSelect')
    const contentBtn = document.querySelector(
      '.universel_extra-section-trigger'
    )
    const imgBtn = document.querySelector('.universel_image-section-trigger')
    const button = document.querySelectorAll('.universel_picker-btn-bg')
    const triggerBtn = document.querySelector('.universel_open-trigger-option')

    if (pickingPrice && universel_activePriceTrigger === triggerType) {
      // console.log('trigger from one')
      stopPricePicker()
      universel_activePriceTrigger = null
      buttonEl.style.color = '#020617'
      if (button) {
        button.forEach((btn) => {
          btn.style.background = '#F1F5F9'
        })
      }

      if (triggerBtn) {
        triggerBtn.disabled = false
        triggerBtn.style.cursor = 'pointer'
        triggerBtn.style.opacity = '1'
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
      universel_activePriceTrigger = triggerType
      // console.log('activeTrigger', universel_activePriceTrigger)
      startPricePicker()
      // console.log('pickeingPrice', pickingPrice)
      buttonEl.style.color = '#fff'
      if (button) {
        button.forEach((btn) => {
          btn.style.background = '#1D4ED8'
        })
      }

      if (triggerBtn) {
        triggerBtn.disabled = true
        triggerBtn.style.cursor = 'not-allowed'
        triggerBtn.style.opacity = '0.6'
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

  function universel_showPriceInfoModal(target, type) {
    document.getElementById('price-info-universel_modal')?.remove()

    const universel_modal = document.createElement('div')
    universel_modal.id = 'price-info-universel_modal'
    universel_modal.style.position = 'absolute'
    universel_modal.style.background = 'white'
    universel_modal.style.border = '1px solid #E2E8F0'
    universel_modal.style.borderRadius = '16px'
    universel_modal.style.padding = '16px 0'
    universel_modal.style.fontFamily = 'sans-serif'
    universel_modal.style.fontSize = '14px'
    universel_modal.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
    universel_modal.style.zIndex = '10000'

    const tag = target.tagName.toLowerCase()
    const id = target.id || '—'
    const className = target.className ? target.className.trim() : '—'
    const parents = getParentHierarchy(target)
    console.log('parents', parents)
    let parentsHTML = parents
      .map(
        (p, i) => `
			<div><strong style="color: #020617">Parent ${i + 1}:</strong> 
			<span style="color: #0369A1">${p.tag}</span> 
			<span style="color: #0369A1">${p.ref}</span> 
			<span style="color: #475569">.${p.class}</span>
			</div>`
      )
      .join('')

    universel_modal.innerHTML = `
			<div style="padding: 0 16px">
				<div><strong style="color: #020617">Type:</strong> <span style="color: #1D4ED8">${type}</span></div>
				<div><strong style="color: #020617">Tag:</strong> <span style="color: #1D4ED8">${tag}</span></div>
				<div><strong style="color: #020617">ID:</strong> <span style="color: #1D4ED8">${id}</span></div>
				<div><strong style="color: #020617">Class:</strong> <span style="color: #1D4ED8">${className}</span></div>
				${parentsHTML}
			</div>
			<hr style="margin-top: 5px; margin-bottom: 5px; color: #E2E8F0">
			<div style="display: flex; align-items: center; justify-content: start; gap: 5px; margin-top: 10px; padding: 0 16px">
				<button id="universel_edit-price-info" style="border-radius: 25px; background-color: #1D4ED8; border: none; padding: 6px 12px; color: #fff">Edit</button>
				<button id="universel_close-price-info" style="margin-right:10px; border-radius: 25px; background-color: #DC2626; border: none; padding: 6px 12px; color: #fff">Close</button>
			</div>
		`

    document.body.appendChild(universel_modal)
    const rect = target.getBoundingClientRect()
    universel_modal.style.top = `${rect.bottom + window.scrollY + 6}px`
    universel_modal.style.left = `${rect.left + window.scrollX}px`

    universel_modal.querySelector('#universel_close-price-info').onclick =
      () => {
        universel_modal.remove()
        target.classList.remove('__price-selected')
        universel_renderModal()
        // updatePricesForPage()
        universel_updateButtonStates()
      }

    universel_modal.querySelector('#universel_edit-price-info').onclick =
      () => {
        universel_modal.remove()
        target.classList.remove('__price-selected')
        const parentHierarchy = getParentHierarchy(target, 3)
        const targetClass = target.className || '—'
        const targetTag = target.tagName.toLowerCase()
        const targetRef = target.ref || null

        const combinedInfo = {
          targetClass,
          targetTag,
          parentHierarchy,
          targetRef,
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

        if (universel_activePriceTrigger === 'regular') {
          universel_regularEl = buildSelectorFromHierarchy(combinedInfo)
          universel_regularOriginalText = target.innerText
          universel_regularPriceElement = target
          const container = flattenSelectors(
            combinedInfo?.parentHierarchy
          ).join(' ')
          const value = container.trim()
          if (!universel_productPriceContainer.includes(value)) {
            universel_productPriceContainer.push(container)
          }
        } else if (universel_activePriceTrigger === 'compare') {
          universel_compareEl = buildSelectorFromHierarchy(combinedInfo)
          universel_compareOriginalText = target.innerText
          universel_comparePriceElement = target
          const container = flattenSelectors(
            combinedInfo?.parentHierarchy
          ).join(' ')
          const value = container.trim()
          if (!universel_productPriceContainer.includes(value)) {
            universel_productPriceContainer.push(container)
          }
        } else if (universel_activePriceTrigger === 'universel_badge') {
          universel_badgeEl = buildSelectorFromHierarchy(combinedInfo)
          universel_badgeOrginalText = target.innerText
          universel_badgeElement = target
          const container = flattenSelectors(
            combinedInfo?.parentHierarchy
          ).join(' ')
          const value = container.trim()
          if (!universel_productPriceContainer.includes(value)) {
            universel_productPriceContainer.push(container)
          }
        }
        universel_renderModal()
        // updatePricesForPage()
        universel_updateButtonStates()
      }
  }
})

// for image trigger
function universel_enableImagePickerForOthers() {
  let pickingImage = false
  let disabledElements = []
  let selectedImage = null

  const imageTrigger = document.querySelector('.universel_image-trigger')

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

    // Show universel_modal with image info
    universel_showImageModal(selectedImage)

    // Stop picker mode after selection
    stopImagePicker()
  }

  function universel_showImageModal(target) {
    // Remove existing universel_modal if any
    document.getElementById('image-info-universel_modal')?.remove()

    const universel_modal = document.createElement('div')
    universel_modal.id = 'image-info-universel_modal'
    universel_modal.style.position = 'absolute'
    universel_modal.style.background = 'white'
    universel_modal.style.border = '1px solid #E2E8F0'
    universel_modal.style.borderRadius = '16px'
    universel_modal.style.padding = '16px 0'
    universel_modal.style.fontFamily = 'sans-serif'
    universel_modal.style.fontSize = '14px'
    universel_modal.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
    universel_modal.style.zIndex = '10000'

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

    universel_modal.innerHTML = `
      <div style= "padding: 0 16px">
				<div><strong style="color: #020617">Tag:</strong> <span style= "color: #1D4ED8">${tag}</span></div>
				<div><strong style="color: #020617">ID:</strong> <span style= "color: #1D4ED8">${id}</span></div>
				<div><strong style="color: #020617">Class:</strong> <span style= "color: #1D4ED8">${className}</span></div>
				${parentsHTML}
			</div>
			<hr style= "margin-top: 5px; margin-bottom: 5px; color: #E2E8F0">
      <div style= "display: flex; align-items: center; justify-content: end; gap: 5px; margin-top: 10px; padding: 0 16px">
				<button id="close-image-info" style="margin-right:10px; border-radius: 25px; background-color: #DC2626; border: none; padding: 6px 12px; color: #fff">Close</button>
				<button id="universel_edit-image-info" style="border-radius: 25px; background-color: #1D4ED8; border: none; padding: 6px 12px; color: #fff; display: flex; align-items: center; justify-content: center; gap: 5px">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M7.99935 13.3332H13.9993M10.9167 2.41449C11.1821 2.1491 11.542 2 11.9173 2C12.2927 2 12.6526 2.1491 12.918 2.41449C13.1834 2.67988 13.3325 3.03983 13.3325 3.41516C13.3325 3.79048 13.1834 4.15043 12.918 4.41582L4.91133 12.4232C4.75273 12.5818 4.55668 12.6978 4.34133 12.7605L2.42667 13.3192C2.3693 13.3359 2.30849 13.3369 2.25061 13.3221C2.19272 13.3072 2.13988 13.2771 2.09763 13.2349C2.05538 13.1926 2.02526 13.1398 2.01043 13.0819C1.9956 13.024 1.9966 12.9632 2.01333 12.9058L2.572 10.9912C2.63481 10.776 2.75083 10.5802 2.90933 10.4218L10.9167 2.41449Z" stroke="#F8FAFC" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
					Edit
				</button>
			</div>
    `

    document.body.appendChild(universel_modal)

    const rect = target.getBoundingClientRect()
    universel_modal.style.top = `${rect.bottom + window.scrollY + 6}px`
    universel_modal.style.left = `${rect.left + window.scrollX}px`

    document.getElementById('close-image-info').onclick = () => {
      universel_modal.remove()
      target.classList.remove('__image-selected')
    }

    universel_modal.querySelector('#universel_edit-image-info').onclick =
      () => {
        universel_modal.remove()
        const parentHierarchy = getParentHierarchy(target, 3)
        const targetClass = target.className || '—'
        const targetTag = target.tagName.toLowerCase()

        const combinedInfo = {
          targetClass,
          targetTag,
          parentHierarchy,
          dom: target // ✅ store DOM element here
        }

        universel_targetImage = target

        universel_imageEl = buildSelectorFromHierarchy(combinedInfo)
        universel_renderModal()
        // updatePricesForPage()
        universel_updateButtonStates()
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
        if (!universel_modal.contains(event.target)) {
          universel_modal.remove()
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
let universel_catalogSelectionEnabled = false
let universel_catalogClickListener
const universel_cardListenersMap = new Map()

function universel_fixZIndex() {
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

function universel_removeFixZIndex() {
  const style = document.getElementById('fix-z-index-style')
  if (style) style.remove()
}

function universel_enableCatalogImageSelection() {
  if (universel_catalogSelectionEnabled) return // avoid duplicate init
  // console.log("Enabling catalog image selection...");
  universel_catalogSelectionEnabled = true
  universel_fixZIndex()

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
    card.removeEventListener(
      'mouseenter',
      universel_cleanupPointerEventsOnMouseEnter
    )

    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mouseleave', handleMouseLeave)

    universel_cardListenersMap.set(card, {
      mouseenter: handleMouseEnter,
      mouseleave: handleMouseLeave
    })
  })

  // Show universel_modal function inside universel_enableCatalogImageSelection
  function universel_showImageModal(target) {
    document.getElementById('image-info-universel_modal')?.remove()

    const universel_modal = document.createElement('div')
    universel_modal.id = 'image-info-universel_modal'
    Object.assign(universel_modal.style, {
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

    universel_modal.innerHTML = `
      <div style= "padding: 0 16px">
				<div><strong style="color: #020617">Tag:</strong> <span style= "color: #1D4ED8">${tag}</span></div>
				<div><strong style="color: #020617">ID:</strong> <span style= "color: #1D4ED8">${id}</span></div>
				<div><strong style="color: #020617">Class:</strong> <span style= "color: #1D4ED8">${className}</span></div>
				${parentsHTML}
			</div>
			<hr style= "margin-top: 5px; margin-bottom: 5px; color: #E2E8F0">
      <div style= "display: flex; align-items: center; justify-content: end; gap: 5px; margin-top: 10px; padding: 0 16px">
				<button id="close-image-info" style="margin-right:10px; border-radius: 25px; background-color: #DC2626; border: none; padding: 6px 12px; color: #fff">Close</button>
				<button id="universel_edit-image-info" style="border-radius: 25px; background-color: #1D4ED8; border: none; padding: 6px 12px; color: #fff; display: flex; align-items: center; justify-content: center; gap: 5px">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M7.99935 13.3332H13.9993M10.9167 2.41449C11.1821 2.1491 11.542 2 11.9173 2C12.2927 2 12.6526 2.1491 12.918 2.41449C13.1834 2.67988 13.3325 3.03983 13.3325 3.41516C13.3325 3.79048 13.1834 4.15043 12.918 4.41582L4.91133 12.4232C4.75273 12.5818 4.55668 12.6978 4.34133 12.7605L2.42667 13.3192C2.3693 13.3359 2.30849 13.3369 2.25061 13.3221C2.19272 13.3072 2.13988 13.2771 2.09763 13.2349C2.05538 13.1926 2.02526 13.1398 2.01043 13.0819C1.9956 13.024 1.9966 12.9632 2.01333 12.9058L2.572 10.9912C2.63481 10.776 2.75083 10.5802 2.90933 10.4218L10.9167 2.41449Z" stroke="#F8FAFC" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
					Edit
				</button>
			</div>
    `

    document.body.appendChild(universel_modal)

    const rect = target.getBoundingClientRect()
    universel_modal.style.top = `${rect.bottom + window.scrollY + 6}px`
    universel_modal.style.left = `${rect.left + window.scrollX}px`

    document.getElementById('close-image-info').onclick = () => {
      universel_modal.remove()
      target.classList.remove('__image-selected')
      if (target.parentElement) target.parentElement.style.border = 'none'
      target.style.border = 'none'
      universel_disableCatalogImageSelection()
      universel_renderModal()
      // updatePricesForPage()
      universel_updateButtonStates()
    }

    universel_modal.querySelector('#universel_edit-image-info').onclick =
      () => {
        universel_modal.remove()
        target.classList.remove('__image-selected')
        const parentHierarchy = getParentHierarchy(target, 3)
        const targetClass = target.className || '—'
        const targetTag = target.tagName.toLowerCase()

        const combinedInfo = {
          targetClass,
          targetTag,
          parentHierarchy,
          dom: target // ✅ store DOM element here
        }

        universel_targetImage = target
        target.style.border = 'none'

        universel_imageEl = buildSelectorFromHierarchy(combinedInfo)
        universel_disableCatalogImageSelection()
        universel_renderModal()
        // updatePricesForPage()
        universel_updateButtonStates()
      }

    // setTimeout(() => {
    //   const outsideClickListener = (event) => {
    //     if (!universel_modal.contains(event.target)) {
    //       universel_modal.remove();
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
  universel_catalogClickListener = (e) => {
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

    universel_showImageModal(img)
  }

  document.addEventListener('click', universel_catalogClickListener)
}

function universel_disableCatalogImageSelection() {
  if (!universel_catalogSelectionEnabled) {
    // console.log('Catalog selection already disabled.');
    return
  }
  universel_catalogSelectionEnabled = false

  universel_removeFixZIndex()

  const catalogImages = document.querySelectorAll(
    '.card__media img[data-ig-selectable="true"], .product-media__image[data-ig-selectable="true"]'
  )
  console.log(`Found ${catalogImages.length} selectable images.`)

  // Restore pointer-events and remove listeners on all cards in map
  universel_cardListenersMap.forEach((listeners, card) => {
    // 1. Restore pointer events immediately
    listeners.mouseleave({ currentTarget: card })

    // 2. Remove mouseenter and mouseleave listeners
    card.removeEventListener('mouseenter', listeners.mouseenter)
    card.removeEventListener('mouseleave', listeners.mouseleave)

    // 3. Add cleanup listener on mouseenter to fix any leftover pointer-events:none on hover
    card.addEventListener(
      'mouseenter',
      universel_cleanupPointerEventsOnMouseEnter
    )
  })

  // Clear the map for clean state
  universel_cardListenersMap.clear()

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
  if (universel_catalogClickListener) {
    document.removeEventListener('click', universel_catalogClickListener)
    universel_catalogClickListener = null
  }

  console.log('universel_disableCatalogImageSelection finished.')
}

// Helper: cleanup function on mouseenter for cards
function universel_cleanupPointerEventsOnMouseEnter(e) {
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
  // console.log('[universel_cleanupPointerEventsOnMouseEnter] cleaned card:', card);
}

let universel_imagePickerInstance = null

document.body.addEventListener('click', (e) => {
  const trigger = e.target.closest('.universel_image-trigger')
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
  const contentBtn = document.querySelector('.universel_extra-section-trigger')
  const priceBtn = document.querySelector('.universel_open-price-option')
  const triggerBtn = document.querySelector('.universel_open-trigger-option')

  // Deactivate all triggers and reset styles
  document
    .querySelectorAll('.universel_image-trigger.__active-trigger')
    .forEach((el) => {
      el.classList.remove('__active-trigger')
      el.style.color = '#020617'
    })
  const button = document.querySelectorAll('.universel_picker-btn-bg')
  if (button) {
    button.forEach((btn) => {
      btn.style.background = '#F1F5F9'
    })
  }

  // If already active, deactivate and clean up
  if (isActive) {
    // console.log('Deactivating image picker...');
    if (
      universel_imagePickerInstance &&
      typeof universel_imagePickerInstance.stopImagePicker === 'function'
    ) {
      universel_imagePickerInstance.stopImagePicker()
      universel_imagePickerInstance = null
    }
    if (isCatalog) {
      universel_disableCatalogImageSelection()
    }

    // ✅ Re-enable select when picker stops
    if (triggerBtn) {
      triggerBtn.disabled = false
      triggerBtn.style.cursor = 'pointer'
      triggerBtn.style.opacity = '1'
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
  trigger.style.color = '#F1F5F9'
  if (button) {
    button.forEach((btn) => {
      btn.style.background = '#1D4ED8'
    })
  }

  if (isCatalog) {
    // console.log('Catalog mode');
    universel_enableCatalogImageSelection()
  } else {
    // console.log('Single product mode');
    universel_imagePickerInstance = universel_enableImagePickerForOthers() // returns an instance with stopImagePicker()
  }
  // ✅ Disable select when picker is active
  if (triggerBtn) {
    triggerBtn.disabled = true
    triggerBtn.style.cursor = 'not-allowed'
    triggerBtn.style.opacity = '0.6'
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

// for trigger picking
document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.querySelector('.event-button-trigger')
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
      !target.closest('.event-button-trigger') &&
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
      target.closest('.event-button-trigger') ||
      target.closest('#trigger-info-universel_modal') ||
      isPriceRelated(target) ||
      hasPriceAncestor(target)
    ) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    stopPicker()

    universel_showModal(target)
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

  const universel_showModal = (target) => {
    document.getElementById('trigger-info-universel_modal')?.remove()

    console.log('target', target)

    const universel_modal = document.createElement('div')
    universel_modal.id = 'trigger-info-universel_modal'
    universel_modal.style.position = 'absolute'
    universel_modal.style.background = '#fff'
    universel_modal.style.border = '1px solid #E2E8F0'
    universel_modal.style.borderRadius = '16px'
    universel_modal.style.padding = '16px 0'
    universel_modal.style.fontFamily = 'sans-serif'
    universel_modal.style.fontSize = '14px'
    universel_modal.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
    universel_modal.style.zIndex = '9999'

    const tag = target.tagName.toLowerCase()
    const id = target.id || '—'
    const rawClass = target.className
    const className =
      typeof rawClass === 'string'
        ? rawClass.trim()
        : (rawClass?.baseVal || '—').trim()
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

    universel_modal.innerHTML = `
      <div style= "padding: 0 16px">
				<div><strong style="color: #020617">Tag:</strong> <span style= "color: #1D4ED8">${tag}</span></div>
				<div><strong style="color: #020617">ID:</strong> <span style= "color: #1D4ED8">${id}</span></div>
				<div><strong style="color: #020617">Class:</strong> <span style= "color: #1D4ED8">${className}</span></div>
				${parentsHTML}
			</div>
			<hr style= "margin-top: 5px; margin-bottom: 5px; color: #E2E8F0">
      <div style= "display: flex; align-items: center; justify-content: end; gap: 5px; margin-top: 10px; padding: 0 16px">
				<button id="close-info" style="margin-right:10px; border-radius: 25px; background-color: #DC2626; border: none; padding: 6px 12px; color: #fff">Close</button>
				<button id="universel_edit-info" style="border-radius: 25px; background-color: #1D4ED8; border: none; padding: 6px 12px; color: #fff; display: flex; align-items: center; justify-content: center; gap: 5px">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M7.99935 13.3332H13.9993M10.9167 2.41449C11.1821 2.1491 11.542 2 11.9173 2C12.2927 2 12.6526 2.1491 12.918 2.41449C13.1834 2.67988 13.3325 3.03983 13.3325 3.41516C13.3325 3.79048 13.1834 4.15043 12.918 4.41582L4.91133 12.4232C4.75273 12.5818 4.55668 12.6978 4.34133 12.7605L2.42667 13.3192C2.3693 13.3359 2.30849 13.3369 2.25061 13.3221C2.19272 13.3072 2.13988 13.2771 2.09763 13.2349C2.05538 13.1926 2.02526 13.1398 2.01043 13.0819C1.9956 13.024 1.9966 12.9632 2.01333 12.9058L2.572 10.9912C2.63481 10.776 2.75083 10.5802 2.90933 10.4218L10.9167 2.41449Z" stroke="#F8FAFC" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
					Edit
				</button>
			</div>
    `

    document.body.appendChild(universel_modal)

    const rect = target.getBoundingClientRect()
    universel_modal.style.top = `${rect.bottom + window.scrollY + 6}px`
    universel_modal.style.left = `${rect.left + window.scrollX}px`

    universel_modal.querySelector('#close-info').onclick = () => {
      universel_renderModal()
      universel_modal.remove()
      // updatePricesForPage()
      universel_updateButtonStates()
    }

    universel_modal.querySelector('#universel_edit-info').onclick = () => {
      const className =
        typeof target.className === 'string'
          ? target.className
          : typeof target.className?.baseVal === 'string'
          ? target.className.baseVal
          : ''

      const universel_targetInfo = [
        target.id ? `#${target.id}` : '',
        ...(className
          ? className
              .trim()
              .split(/\s+/)
              .map((cls) => `.${cls}`)
          : [])
      ].join('')
      universel_triggerEl = universel_targetInfo
      console.log('targetEl', universel_triggerEl)
      universel_targetTrigger = target
      universel_renderModal()
      universel_modal.remove()
      // updatePricesForPage()
      universel_updateButtonStates()
    }

    // const outsideClickListener = (event) => {
    // 	    if (!universel_modal.contains(event.target)) {
    // 				universel_modal.remove();
    // 	      universel_renderModal();
    // 				updatePricesForPage()
    // 				universel_updateButtonStates()
    // 	      document.removeEventListener('click', outsideClickListener);
    // 	    }
    // 	  };
    // 	  document.addEventListener('click', outsideClickListener);
  }

  // Toggle picker on trigger click
  document.body.addEventListener('click', (e) => {
    const priceBtn = document.querySelector('.universel_open-price-option')
    const imgBtn = document.querySelector('.universel_image-section-trigger')
    const contenBtn = document.querySelector('.universel_extra-section-trigger')
    const button = document.querySelectorAll('.universel_picker-btn-bg')
    if (e.target.closest('.event-button-trigger')) {
      e.preventDefault()
      if (picking) {
        stopPicker()
        // Change fill color of all <path> elements inside SVG
        const paths = e.target.closest('.event-button-trigger')
        paths.style.color = '#020617'
        if (button) {
          button.forEach((btn) => {
            btn.style.background = '#F1F5F9'
          })
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
        if (contenBtn) {
          contenBtn.disabled = false
          contenBtn.style.cursor = 'pointer'
          contenBtn.style.opacity = '1'
        }
      } else {
        startPicker()
        // Change fill color of all <path> elements inside SVG
        const paths = e.target.closest('.event-button-trigger')
        paths.style.color = '#fff'
        if (button) {
          button.forEach((btn) => {
            btn.style.background = '#1D4ED8'
          })
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
        if (contenBtn) {
          contenBtn.disabled = true
          contenBtn.style.cursor = 'not-allowed'
          contenBtn.style.opacity = '0.6'
        }
      }
    }
  })
})

function findTopmostParentWithClass(el) {
  console.log('el', el)
  const defaultSelectors =
    '[data-product-id], [data-product-handle], .product-card-wrapper, .card-wrapper, product-page, product-card, product-price, [data-pid], product-info, predictive-search-component, .predictive-search, .predictive-search--expanded, predictive-search, #predictive-search'

  container = el.closest(defaultSelectors)
  let matchedSelector
  if (container) {
    matchedSelector = defaultSelectors
      .split(',')
      .map((s) => s.trim())
      .find((sel) => container.matches(sel))
  }
  return matchedSelector
}

document.body.addEventListener('click', (e) => {
  const priceBtn = document.querySelector('.universel_open-price-option')
  const imgBtn = document.querySelector('.universel_image-section-trigger')
  const eventTriggerEl = e.target.closest('.universel_event-trigger')
  const contenBtn = document.querySelector('.universel_extra-section-trigger')
  const button = document.querySelectorAll('.universel_picker-btn-bg')

  if (!universel_triggerEl) {
    return
  }
  if (eventTriggerEl) {
    e.preventDefault()

    if (universel_eventTracker) {
      universel_eventTracker = false
      console.log('Turning OFF')

      const paths = eventTriggerEl.querySelectorAll('path')
      paths.forEach((path) => {
        path.style.color = '#020617'
      })

      if (button) {
        button.forEach((btn) => {
          btn.style.background = '#F1F5F9'
        })
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
      if (contenBtn) {
        contenBtn.disabled = false
        contenBtn.style.cursor = 'pointer'
        contenBtn.style.opacity = '1'
      }
    } else {
      universel_eventTracker = true
      console.log('Turning ON')

      const paths = eventTriggerEl.querySelectorAll('path')
      paths.forEach((path) => {
        path.style.color = '#ffffff'
      })

      if (button) {
        button.forEach((btn) => {
          btn.style.background = '#1D4ED8'
        })
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
      if (contenBtn) {
        contenBtn.disabled = true
        contenBtn.style.cursor = 'not-allowed'
        contenBtn.style.opacity = '0.6'
      }
    }
  }
})

// Your trigger selector and universel_eventTracker flag

function getVisibleElements() {
  return Array.from(document.querySelectorAll('body *')).filter((el) => {
    const style = getComputedStyle(el)
    return el.offsetParent !== null && style.visibility !== 'visible'
      ? false
      : true && style.display !== 'none' && style.opacity !== '0'
  })
}

document.body.addEventListener('click', function (event) {
  if (!universel_eventTracker) return

  const clicked = event.target.closest(universel_triggerEl)
  if (!clicked) return

  console.log('✅ Trigger clicked:', clicked)

  // Wait a bit for universel_modal to appear/change visibility
  setTimeout(() => {
    const visibleElements = getVisibleElements()

    // Find visible universel_modal by role OR ref
    const universel_modal = visibleElements.find((el) => {
      const classes = el.classList

      return (
        // Standard ARIA role or ref
        el.getAttribute?.('role') === 'dialog' ||
        el.getAttribute?.('ref') === 'dialog' ||
        // Shopify-style universel_modal classes
        (classes.contains('popup-universel_modal') &&
          classes.contains('popup-universel_modal--search') &&
          classes.contains('open')) ||
        (classes.contains('js-predictive-search') &&
          classes.contains('open')) ||
        (classes.contains('predictive-search') && classes.contains('open')) ||
        // More general fallback for full-page or active modals
        (classes.contains('universel_modal') && classes.contains('open')) ||
        (classes.contains('popup') && classes.contains('active'))

        // Heuristic: big visible divs with multiple children
        // (el.tagName === 'DIV' &&
        // 	el.offsetWidth > window.innerWidth * 0.5 &&
        // 	el.offsetHeight > window.innerHeight * 0.5 &&
        // 	el.children.length > 2)
      )
    })

    if (!universel_modal) {
      console.log('❌ No visible universel_modal found.')
      return
    }

    console.log('🎯 Visible universel_modal found:', universel_modal)
    const modalClassName =
      typeof universel_modal.className === 'string'
        ? universel_modal.className
        : typeof universel_modal.className?.baseVal === 'string'
        ? universel_modal.className.baseVal
        : ''
    const modalTargetInfo = [
      universel_modal.id ? `#${universel_modal.id}` : '',
      ...(modalClassName
        ? modalClassName
            .trim()
            .split(/\s+/)
            .map((cls) => `.${cls}`)
        : [])
    ].join('')
    universel_modalEl = modalTargetInfo
    universel_targetModal = universel_modal

    // Find visible inputs inside the universel_modal
    const inputs = Array.from(universel_modal.querySelectorAll('input')).filter(
      (input) => {
        const style = getComputedStyle(input)
        return (
          input.offsetParent !== null &&
          style.visibility === 'visible' &&
          style.display !== 'none'
        )
      }
    )

    if (inputs.length === 0) {
      console.log('⚠️ No visible <input> fields inside universel_modal.')
      return
    }

    inputs.forEach((input) => {
      console.log('🧠 Tracking input:', input)
      console.log('inputClass', input.className)
      const className =
        typeof input.className === 'string'
          ? input.className
          : typeof input.className?.baseVal === 'string'
          ? input.className.baseVal
          : ''
      const universel_targetInfo = [
        input.id ? `#${input.id}` : '',
        ...(className
          ? className
              .trim()
              .split(/\s+/)
              .map((cls) => `.${cls}`)
          : [])
      ].join('')
      universel_searchEL = universel_targetInfo
      universel_targetSearch = input
      input.addEventListener('input', (e) => {
        console.log(`⌨️ User typed: "${e.target.value}"`)
      })
      input.addEventListener('focus', () => {
        console.log('🔎 Input focused.')
      })
    })
    universel_renderModal()
    universel_updateButtonStates()
  }, 200) // adjust delay as needed
})
