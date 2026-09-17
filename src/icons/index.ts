/**
 * Every SVG copied out of `sevenpm-web/public/assets` and exported from the
 * app Figma file, reachable by the same path the data files write.
 *
 * The data in `src/data` carries strings like "/assets/ic-ticket-24.svg".
 * Metro cannot resolve a require from a variable, so every file is imported
 * here once and the map below turns the path back into a component. Port data
 * verbatim and look its icon up with `icon()` rather than rewriting the data
 * to hold a component.
 *
 * Generated from the directory listing — regenerate rather than hand-editing
 * when icons are added, or `icon()` returns undefined and the mark silently
 * does not draw.
 */
import type { SvgProps } from "react-native-svg";

import IcCardSheen from "./card-sheen.svg";
import IcIcAcctBookings from "./ic-acct-bookings.svg";
import IcIcAcctLogout from "./ic-acct-logout.svg";
import IcIcAcctLoyalty from "./ic-acct-loyalty.svg";
import IcIcAcctPayments from "./ic-acct-payments.svg";
import IcIcAcctProfile from "./ic-acct-profile.svg";
import IcIcAcctWallet from "./ic-acct-wallet.svg";
import IcIcAge from "./ic-age.svg";
import IcIcAnimals from "./ic-animals.svg";
import IcIcApple20 from "./ic-apple-20.svg";
import IcIcApplepay24 from "./ic-applepay-24.svg";
import IcIcArrowLeft20 from "./ic-arrow-left-20.svg";
import IcIcArrowRight20 from "./ic-arrow-right-20.svg";
import IcIcBeatsBurn from "./ic-beats-burn.svg";
import IcIcBeatsEarn from "./ic-beats-earn.svg";
import IcIcCalendar20 from "./ic-calendar-20.svg";
import IcIcCamera20 from "./ic-camera-20.svg";
import IcIcCard24 from "./ic-card-24.svg";
import IcIcCheckOff from "./ic-check-off.svg";
import IcIcCheckOn from "./ic-check-on.svg";
import IcIcChevronDown16 from "./ic-chevron-down-16.svg";
import IcIcChevronDownRow from "./ic-chevron-down-row.svg";
import IcIcChevronRight20 from "./ic-chevron-right-20.svg";
import IcIcChevronRight from "./ic-chevron-right.svg";
import IcIcClear20 from "./ic-clear-20.svg";
import IcIcClock16 from "./ic-clock-16.svg";
import IcIcClockBrand20 from "./ic-clock-brand-20.svg";
import IcIcClose from "./ic-close.svg";
import IcIcCopy20 from "./ic-copy-20.svg";
import IcIcCrown24 from "./ic-crown-24.svg";
import IcIcCurrency8 from "./ic-currency-8.svg";
import IcIcDelivery24 from "./ic-delivery-24.svg";
import IcIcDialogClose from "./ic-dialog-close.svg";
import IcIcDownload16 from "./ic-download-16.svg";
import IcIcDress from "./ic-dress.svg";
import IcIcDropdown20 from "./ic-dropdown-20.svg";
import IcIcFood from "./ic-food.svg";
import IcIcGates from "./ic-gates.svg";
import IcIcGlobe from "./ic-globe.svg";
import IcIcGoogle20 from "./ic-google-20.svg";
import IcIcInfo13 from "./ic-info-13.svg";
import IcIcInfo16 from "./ic-info-16.svg";
import IcIcInfo20 from "./ic-info-20.svg";
import IcIcInstallment24 from "./ic-installment-24.svg";
import IcIcLastEntry from "./ic-last-entry.svg";
import IcIcLock16 from "./ic-lock-16.svg";
import IcIcLockLocked16 from "./ic-lock-locked-16.svg";
import IcIcLogout from "./ic-logout.svg";
import IcIcMapPin from "./ic-map-pin.svg";
import IcIcMenuBookings from "./ic-menu-bookings.svg";
import IcIcMenuLanguage from "./ic-menu-language.svg";
import IcIcMenuNotifications from "./ic-menu-notifications.svg";
import IcIcMenuPayments from "./ic-menu-payments.svg";
import IcIcMenuResale from "./ic-menu-resale.svg";
import IcIcMenuRewards from "./ic-menu-rewards.svg";
import IcIcMenuSettings from "./ic-menu-settings.svg";
import IcIcMenuWallet from "./ic-menu-wallet.svg";
import IcIcMenu from "./ic-menu.svg";
import IcIcMinus16 from "./ic-minus-16.svg";
import IcIcMinus from "./ic-minus.svg";
import IcIcNavigate20 from "./ic-navigate-20.svg";
import IcIcParking16 from "./ic-parking-16.svg";
import IcIcParking from "./ic-parking.svg";
import IcIcPhone16 from "./ic-phone-16.svg";
import IcIcPin16 from "./ic-pin-16.svg";
import IcIcPlus13 from "./ic-plus-13.svg";
import IcIcPlus16 from "./ic-plus-16.svg";
import IcIcPlus20 from "./ic-plus-20.svg";
import IcIcPlus from "./ic-plus.svg";
import IcIcPromo24 from "./ic-promo-24.svg";
import IcIcPromocode24 from "./ic-promocode-24.svg";
import IcIcSendOutline20 from "./ic-send-outline-20.svg";
import IcIcSend from "./ic-send.svg";
import IcIcShare16 from "./ic-share-16.svg";
import IcIcShare20 from "./ic-share-20.svg";
import IcIcShowtime from "./ic-showtime.svg";
import IcIcSocialFacebook from "./ic-social-facebook.svg";
import IcIcSocialInstagram from "./ic-social-instagram.svg";
import IcIcSocialTiktok from "./ic-social-tiktok.svg";
import IcIcSocialX from "./ic-social-x.svg";
import IcIcSocialYoutube from "./ic-social-youtube.svg";
import IcIcStar12 from "./ic-star-12.svg";
import IcIcStar16 from "./ic-star-16.svg";
import IcIcSwitchCheck16 from "./ic-switch-check-16.svg";
import IcIcTabBookings from "./ic-tab-bookings.svg";
import IcIcTabDiscover from "./ic-tab-discover.svg";
import IcIcTabMenu from "./ic-tab-menu.svg";
import IcIcTabNews from "./ic-tab-news.svg";
import IcIcTabResale from "./ic-tab-resale.svg";
import IcIcTicket16 from "./ic-ticket-16.svg";
import IcIcTicket24 from "./ic-ticket-24.svg";
import IcIcTicket from "./ic-ticket.svg";
import IcIcTierCheck from "./ic-tier-check.svg";
import IcIcTierLock from "./ic-tier-lock.svg";
import IcIcTrash16 from "./ic-trash-16.svg";
import IcIcTrashDim16 from "./ic-trash-dim-16.svg";
import IcIcTrashRed16 from "./ic-trash-red-16.svg";
import IcIcTshirt16 from "./ic-tshirt-16.svg";
import IcIcTxIn from "./ic-tx-in.svg";
import IcIcTxOut from "./ic-tx-out.svg";
import IcIcUser from "./ic-user.svg";
import IcIcWallet from "./ic-wallet.svg";
import IcLogoMark from "./logo-mark.svg";
import IcPayAmex from "./pay-amex.svg";
import IcPayCmi from "./pay-cmi.svg";
import IcPayMastercard from "./pay-mastercard.svg";
import IcPayVisaMark from "./pay-visa-mark.svg";
import IcPayVisa from "./pay-visa.svg";
import IcSponsorAdidas from "./sponsor-adidas.svg";
import IcSponsorCocacola from "./sponsor-cocacola.svg";
import IcSponsorSaham from "./sponsor-saham.svg";
import IcSponsorSpotify from "./sponsor-spotify.svg";
import IcStubBodyDark from "./stub-body-dark.svg";
import IcStubNotchDark from "./stub-notch-dark.svg";
import IcWordmark from "./wordmark.svg";

export const icons: Record<string, React.FC<SvgProps>> = {
  "/assets/card-sheen.svg": IcCardSheen,
  "/assets/ic-acct-bookings.svg": IcIcAcctBookings,
  "/assets/ic-acct-logout.svg": IcIcAcctLogout,
  "/assets/ic-acct-loyalty.svg": IcIcAcctLoyalty,
  "/assets/ic-acct-payments.svg": IcIcAcctPayments,
  "/assets/ic-acct-profile.svg": IcIcAcctProfile,
  "/assets/ic-acct-wallet.svg": IcIcAcctWallet,
  "/assets/ic-age.svg": IcIcAge,
  "/assets/ic-animals.svg": IcIcAnimals,
  "/assets/ic-apple-20.svg": IcIcApple20,
  "/assets/ic-applepay-24.svg": IcIcApplepay24,
  "/assets/ic-arrow-left-20.svg": IcIcArrowLeft20,
  "/assets/ic-arrow-right-20.svg": IcIcArrowRight20,
  "/assets/ic-beats-burn.svg": IcIcBeatsBurn,
  "/assets/ic-beats-earn.svg": IcIcBeatsEarn,
  "/assets/ic-calendar-20.svg": IcIcCalendar20,
  "/assets/ic-camera-20.svg": IcIcCamera20,
  "/assets/ic-card-24.svg": IcIcCard24,
  "/assets/ic-check-off.svg": IcIcCheckOff,
  "/assets/ic-check-on.svg": IcIcCheckOn,
  "/assets/ic-chevron-down-16.svg": IcIcChevronDown16,
  "/assets/ic-chevron-down-row.svg": IcIcChevronDownRow,
  "/assets/ic-chevron-right-20.svg": IcIcChevronRight20,
  "/assets/ic-chevron-right.svg": IcIcChevronRight,
  "/assets/ic-clear-20.svg": IcIcClear20,
  "/assets/ic-clock-16.svg": IcIcClock16,
  "/assets/ic-clock-brand-20.svg": IcIcClockBrand20,
  "/assets/ic-close.svg": IcIcClose,
  "/assets/ic-copy-20.svg": IcIcCopy20,
  "/assets/ic-crown-24.svg": IcIcCrown24,
  "/assets/ic-currency-8.svg": IcIcCurrency8,
  "/assets/ic-delivery-24.svg": IcIcDelivery24,
  "/assets/ic-dialog-close.svg": IcIcDialogClose,
  "/assets/ic-download-16.svg": IcIcDownload16,
  "/assets/ic-dress.svg": IcIcDress,
  "/assets/ic-dropdown-20.svg": IcIcDropdown20,
  "/assets/ic-food.svg": IcIcFood,
  "/assets/ic-gates.svg": IcIcGates,
  "/assets/ic-globe.svg": IcIcGlobe,
  "/assets/ic-google-20.svg": IcIcGoogle20,
  "/assets/ic-info-13.svg": IcIcInfo13,
  "/assets/ic-info-16.svg": IcIcInfo16,
  "/assets/ic-info-20.svg": IcIcInfo20,
  "/assets/ic-installment-24.svg": IcIcInstallment24,
  "/assets/ic-last-entry.svg": IcIcLastEntry,
  "/assets/ic-lock-16.svg": IcIcLock16,
  "/assets/ic-lock-locked-16.svg": IcIcLockLocked16,
  "/assets/ic-logout.svg": IcIcLogout,
  "/assets/ic-map-pin.svg": IcIcMapPin,
  "/assets/ic-menu-bookings.svg": IcIcMenuBookings,
  "/assets/ic-menu-language.svg": IcIcMenuLanguage,
  "/assets/ic-menu-notifications.svg": IcIcMenuNotifications,
  "/assets/ic-menu-payments.svg": IcIcMenuPayments,
  "/assets/ic-menu-resale.svg": IcIcMenuResale,
  "/assets/ic-menu-rewards.svg": IcIcMenuRewards,
  "/assets/ic-menu-settings.svg": IcIcMenuSettings,
  "/assets/ic-menu-wallet.svg": IcIcMenuWallet,
  "/assets/ic-menu.svg": IcIcMenu,
  "/assets/ic-minus-16.svg": IcIcMinus16,
  "/assets/ic-minus.svg": IcIcMinus,
  "/assets/ic-navigate-20.svg": IcIcNavigate20,
  "/assets/ic-parking-16.svg": IcIcParking16,
  "/assets/ic-parking.svg": IcIcParking,
  "/assets/ic-phone-16.svg": IcIcPhone16,
  "/assets/ic-pin-16.svg": IcIcPin16,
  "/assets/ic-plus-13.svg": IcIcPlus13,
  "/assets/ic-plus-16.svg": IcIcPlus16,
  "/assets/ic-plus-20.svg": IcIcPlus20,
  "/assets/ic-plus.svg": IcIcPlus,
  "/assets/ic-promo-24.svg": IcIcPromo24,
  "/assets/ic-promocode-24.svg": IcIcPromocode24,
  "/assets/ic-send-outline-20.svg": IcIcSendOutline20,
  "/assets/ic-send.svg": IcIcSend,
  "/assets/ic-share-16.svg": IcIcShare16,
  "/assets/ic-share-20.svg": IcIcShare20,
  "/assets/ic-showtime.svg": IcIcShowtime,
  "/assets/ic-social-facebook.svg": IcIcSocialFacebook,
  "/assets/ic-social-instagram.svg": IcIcSocialInstagram,
  "/assets/ic-social-tiktok.svg": IcIcSocialTiktok,
  "/assets/ic-social-x.svg": IcIcSocialX,
  "/assets/ic-social-youtube.svg": IcIcSocialYoutube,
  "/assets/ic-star-12.svg": IcIcStar12,
  "/assets/ic-star-16.svg": IcIcStar16,
  "/assets/ic-switch-check-16.svg": IcIcSwitchCheck16,
  "/assets/ic-tab-bookings.svg": IcIcTabBookings,
  "/assets/ic-tab-discover.svg": IcIcTabDiscover,
  "/assets/ic-tab-menu.svg": IcIcTabMenu,
  "/assets/ic-tab-news.svg": IcIcTabNews,
  "/assets/ic-tab-resale.svg": IcIcTabResale,
  "/assets/ic-ticket-16.svg": IcIcTicket16,
  "/assets/ic-ticket-24.svg": IcIcTicket24,
  "/assets/ic-ticket.svg": IcIcTicket,
  "/assets/ic-tier-check.svg": IcIcTierCheck,
  "/assets/ic-tier-lock.svg": IcIcTierLock,
  "/assets/ic-trash-16.svg": IcIcTrash16,
  "/assets/ic-trash-dim-16.svg": IcIcTrashDim16,
  "/assets/ic-trash-red-16.svg": IcIcTrashRed16,
  "/assets/ic-tshirt-16.svg": IcIcTshirt16,
  "/assets/ic-tx-in.svg": IcIcTxIn,
  "/assets/ic-tx-out.svg": IcIcTxOut,
  "/assets/ic-user.svg": IcIcUser,
  "/assets/ic-wallet.svg": IcIcWallet,
  "/assets/logo-mark.svg": IcLogoMark,
  "/assets/pay-amex.svg": IcPayAmex,
  "/assets/pay-cmi.svg": IcPayCmi,
  "/assets/pay-mastercard.svg": IcPayMastercard,
  "/assets/pay-visa-mark.svg": IcPayVisaMark,
  "/assets/pay-visa.svg": IcPayVisa,
  "/assets/sponsor-adidas.svg": IcSponsorAdidas,
  "/assets/sponsor-cocacola.svg": IcSponsorCocacola,
  "/assets/sponsor-saham.svg": IcSponsorSaham,
  "/assets/sponsor-spotify.svg": IcSponsorSpotify,
  "/assets/stub-body-dark.svg": IcStubBodyDark,
  "/assets/stub-notch-dark.svg": IcStubNotchDark,
  "/assets/wordmark.svg": IcWordmark,
};

/** The component for a web asset path, or undefined if it was never copied. */
export function icon(path: string | undefined) {
  return path ? icons[path] : undefined;
}
