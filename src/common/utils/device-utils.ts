/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 * on 12/20/2016.
 */
import { RegexTreeUtils } from "./regex-utils";
import { Injectable } from "@angular/core";

export class DeviceConstants {

    public static get BROWSERS() {
        return {
            CHROME: "chrome",
            FIREFOX: "firefox",
            SAFARI: "safari",
            OPERA: "opera",
            IE: "ie",
            MS_EDGE: "ms-edge",
            FB_MESSANGER: "fb-messanger",
            UNKNOWN: "unknown"
        };
    }

    public static get DEVICES() {
        return {
            ANDROID: "android",
            I_PAD: "ipad",
            IPHONE: "iphone",
            I_POD: "ipod",
            BLACKBERRY: "blackberry",
            FIREFOX_OS: "firefox-os",
            CHROME_BOOK: "chrome-book",
            WINDOWS_PHONE: "windows-phone",
            PS4: "ps4",
            VITA: "vita",
            CHROMECAST: "chromecast",
            APPLE_TV: "apple-tv",
            GOOGLE_TV: "google-tv",
            UNKNOWN: "unknown"
        }
    }

    public static get OS() {
        return {
            WINDOWS: "windows",
            MAC: "mac",
            IOS: "ios",
            ANDROID: "android",
            LINUX: "linux",
            UNIX: "unix",
            FIREFOX_OS: "firefox-os",
            CHROME_OS: "chrome-os",
            WINDOWS_PHONE: "windows-phone",
            UNKNOWN: "unknown"
        }
    }

    public static get OS_VERSIONS() {
        return {
            WINDOWS_3_11: "windows-3-11",
            WINDOWS_95: "windows-95",
            WINDOWS_ME: "windows-me",
            WINDOWS_98: "windows-98",
            WINDOWS_CE: "windows-ce",
            WINDOWS_2000: "windows-2000",
            WINDOWS_XP: "windows-xp",
            WINDOWS_SERVER_2003: "windows-server-2003",
            WINDOWS_VISTA: "windows-vista",
            WINDOWS_7: "windows-7",
            WINDOWS_8_1: "windows-8-1",
            WINDOWS_8: "windows-8",
            WINDOWS_10: "windows-10",
            WINDOWS_PHONE_7_5: "windows-phone-7-5",
            WINDOWS_PHONE_8_1: "windows-phone-8-1",
            WINDOWS_PHONE_10: "windows-phone-10",
            WINDOWS_NT_4_0: "windows-nt-4-0",
            MACOSX_15: "mac-os-x-15",
            MACOSX_14: "mac-os-x-14",
            MACOSX_13: "mac-os-x-13",
            MACOSX_12: "mac-os-x-12",
            MACOSX_11: "mac-os-x-11",
            MACOSX_10: "mac-os-x-10",
            MACOSX_9: "mac-os-x-9",
            MACOSX_8: "mac-os-x-8",
            MACOSX_7: "mac-os-x-7",
            MACOSX_6: "mac-os-x-6",
            MACOSX_5: "mac-os-x-5",
            MACOSX_4: "mac-os-x-4",
            MACOSX_3: "mac-os-x-3",
            MACOSX_2: "mac-os-x-2",
            MACOSX: "mac-os-x",
            UNKNOWN: "unknown"
        }
    }
}

export interface DeviceDetail {
    userAgent: string,
    os: any,
    osVersion: any,
    browser: any,
    device: any
}

export interface DeviceInfo {
    raw: DeviceDetail,
    os: string,
    osVersion: string,
    browser: string,
    browserVersion: string,
    device: string,

    isMobile(): boolean,
    isTablet(): boolean,
    isDesktop(): boolean
}

export class DeviceUtils {
    static OS_RE = {
        WINDOWS: {and: [{or: [/\bWindows|(Win\d\d)\b/, /\bWin 9x\b/]}, {not: /\bWindows Phone\b/}]},
        MAC: {and: [/\bMac OS\b/, {not: /Windows Phone/}]},
        IOS: {and: [{or: [/\biPad\b/, /\biPhone\b/, /\biPod\b/]}, {not: /Windows Phone/}]},
        ANDROID: {and: [/\bAndroid\b/, {not: /Windows Phone/}]},
        LINUX: /\bLinux\b/,
        UNIX: /\bUNIX\b/,
        FIREFOX_OS: {and: [/\bFirefox\b/, /Mobile\b/]},
        CHROME_OS: /\bCrOS\b/,
        WINDOWS_PHONE: {or: [/\bIEMobile\b/, /\bWindows Phone\b/]},
        PS4: /\bMozilla\/5.0 \(PlayStation 4\b/,
        VITA: /\bMozilla\/5.0 \(Play(S|s)tation Vita\b/
    };

    static BROWSERS_RE = {
        CHROME: {and: [{or: [/\bChrome\b/, /\bCriOS\b/]}, {not: {or: [/\bOPR\b/, /\bEdge\b/]}}]},
        FIREFOX: /\bFirefox\b/,
        SAFARI: {and: [/^((?!CriOS).)*\Safari\b.*$/, {not: {or: [/\bOPR\b/, /\bEdge\b/, /Windows Phone/]}}]},
        OPERA: {or: [/Opera\b/, /\bOPR\b/]},
        IE: {or: [/\bMSIE\b/, /\bTrident\b/, /^Mozilla\/5\.0 \(Windows NT 10\.0; Win64; x64\)$/]},
        MS_EDGE: {or: [/\bEdge\b/]},
        PS4: /\bMozilla\/5.0 \(PlayStation 4\b/,
        VITA: /\bMozilla\/5.0 \(Play(S|s)tation Vita\b/,
        FB_MESSANGER: /\bFBAN\/MessengerForiOS\b/
    };

    static DEVICES_RE = {
        ANDROID: {and: [/\bAndroid\b/, {not: /Windows Phone/}]},
        I_PAD: /\biPad\b/,
        IPHONE: {and: [/\biPhone\b/, {not: /Windows Phone/}]},
        I_POD: /\biPod\b/,
        BLACKBERRY: /\bblackberry\b/,
        FIREFOX_OS: {and: [/\bFirefox\b/, /\bMobile\b/]},
        CHROME_BOOK: /\bCrOS\b/,
        WINDOWS_PHONE: {or: [/\bIEMobile\b/, /\bWindows Phone\b/]},
        PS4: /\bMozilla\/5.0 \(PlayStation 4\b/,
        CHROMECAST: /\bCrKey\b/,
        APPLE_TV: /^iTunes-AppleTV\/4.1$/,
        GOOGLE_TV: /\bGoogleTV\b/,
        VITA: /\bMozilla\/5.0 \(Play(S|s)tation Vita\b/
    };

    static OS_VERSIONS_RE = {
        WINDOWS_3_11: /Win16/,
        WINDOWS_95: /(Windows 95|Win95|Windows_95)/,
        WINDOWS_ME: /(Win 9x 4.90|Windows ME)/,
        WINDOWS_98: /(Windows 98|Win98)/,
        WINDOWS_CE: /Windows CE/,
        WINDOWS_2000: /(Windows NT 5.0|Windows 2000)/,
        WINDOWS_XP: /(Windows NT 5.1|Windows XP)/,
        WINDOWS_SERVER_2003: /Windows NT 5.2/,
        WINDOWS_VISTA: /Windows NT 6.0/,
        WINDOWS_7: /(Windows 7|Windows NT 6.1)/,
        WINDOWS_8_1: /(Windows 8.1|Windows NT 6.3)/,
        WINDOWS_8: /(Windows 8|Windows NT 6.2)/,
        WINDOWS_10: /(Windows NT 10.0)/,
        WINDOWS_PHONE_7_5: /(Windows Phone OS 7.5)/,
        WINDOWS_PHONE_8_1: /(Windows Phone 8.1)/,
        WINDOWS_PHONE_10: /(Windows Phone 10)/,
        WINDOWS_NT_4_0: {and: [/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/, {not: /Windows NT 10.0/}]},
        MACOSX: /(MAC OS X\s*[^ 0-9])/,
        MACOSX_3: /(Darwin 10.3|Mac OS X 10.3)/,
        MACOSX_4: /(Darwin 10.4|Mac OS X 10.4)/,
        MACOSX_5: /(Mac OS X 10.5)/,
        MACOSX_6: /(Mac OS X 10.6)/,
        MACOSX_7: /(Mac OS X 10.7)/,
        MACOSX_8: /(Mac OS X 10.8)/,
        MACOSX_9: /(Mac OS X 10.9)/,
        MACOSX_10: /(Mac OS X 10.10)/,
        MACOSX_11: /(Mac OS X 10.11)/,
        MACOSX_12: /(Mac OS X 10.12)/,
        MACOSX_13: /(Mac OS X 10.13)/,
        MACOSX_14: /(Mac OS X 10.14)/,
        MACOSX_15: /(Mac OS X 10.15)/
    };

    static BROWSER_VERSIONS_RE_MAP = {
        CHROME: [/\bChrome\/([\d\.]+)\b/, /\bCriOS\/([\d\.]+)\b/],
        FIREFOX: /\bFirefox\/([\d\.]+)\b/,
        SAFARI: /\bVersion\/([\d\.]+)\b/,
        OPERA: [/\bVersion\/([\d\.]+)\b/, /\bOPR\/([\d\.]+)\b/],
        IE: [/\bMSIE ([\d\.]+\w?)\b/, /\brv:([\d\.]+\w?)\b/],
        MS_EDGE: /\bEdge\/([\d\.]+)\b/
    };

    static BROWSER_VERSIONS_RE =
        Object.keys(DeviceUtils.BROWSER_VERSIONS_RE_MAP)
            .reduce(function (obj, key) {
                obj[DeviceConstants.BROWSERS[key]] = DeviceUtils.BROWSER_VERSIONS_RE_MAP[key];
                return obj;
            }, {});

    public static getDeviceInfo(): DeviceInfo {
        let ua: string = window.navigator.userAgent;

        let deviceDetail: DeviceDetail = {
            userAgent: ua,
            os: {},
            osVersion: {},
            browser: {},
            device: {}
        };
        deviceDetail.os = Object.keys(DeviceConstants.OS).reduce((obj, item) => {
            obj[DeviceConstants.OS[item]] =
                RegexTreeUtils.test(ua, DeviceUtils.OS_RE[item]);
            return obj;
        }, {});

        deviceDetail.browser = Object.keys(DeviceConstants.BROWSERS).reduce((obj, item) => {
            obj[DeviceConstants.BROWSERS[item]] =
                RegexTreeUtils.test(ua, DeviceUtils.BROWSERS_RE[item]);
            return obj;
        }, {});

        deviceDetail.device = Object.keys(DeviceConstants.DEVICES).reduce((obj, item) => {
            obj[DeviceConstants.DEVICES[item]] =
                RegexTreeUtils.test(ua, DeviceUtils.DEVICES_RE[item]);
            return obj;
        }, {});

        deviceDetail.osVersion = Object.keys(DeviceConstants.OS_VERSIONS).reduce((obj, item) => {
            obj[DeviceConstants.OS_VERSIONS[item]] =
                RegexTreeUtils.test(ua, DeviceUtils.OS_VERSIONS_RE[item]);
            return obj;
        }, {});

        var deviceInfo: DeviceInfo = {
            raw: deviceDetail,
            os: '',
            osVersion: '',
            browser: '',
            browserVersion: '',
            device: '',
            isMobile: null,
            isTablet: null,
            isDesktop: null
        };

        deviceInfo.os = [
            DeviceConstants.OS.WINDOWS,
            DeviceConstants.OS.IOS,
            DeviceConstants.OS.MAC,
            DeviceConstants.OS.ANDROID,
            DeviceConstants.OS.LINUX,
            DeviceConstants.OS.UNIX,
            DeviceConstants.OS.FIREFOX_OS,
            DeviceConstants.OS.CHROME_OS,
            DeviceConstants.OS.WINDOWS_PHONE
        ].reduce(function (previousValue, currentValue) {
            return (previousValue === DeviceConstants.OS.UNKNOWN &&
            deviceDetail.os[currentValue]) ? currentValue : previousValue;
        }, DeviceConstants.OS.UNKNOWN);

        deviceInfo.browser = [
            DeviceConstants.BROWSERS.CHROME,
            DeviceConstants.BROWSERS.FIREFOX,
            DeviceConstants.BROWSERS.SAFARI,
            DeviceConstants.BROWSERS.OPERA,
            DeviceConstants.BROWSERS.IE,
            DeviceConstants.BROWSERS.MS_EDGE,
            DeviceConstants.BROWSERS.FB_MESSANGER
        ].reduce(function (previousValue, currentValue) {
            return (previousValue === DeviceConstants.BROWSERS.UNKNOWN &&
            deviceDetail.browser[currentValue]) ? currentValue : previousValue;
        }, DeviceConstants.BROWSERS.UNKNOWN);

        deviceInfo.device = [
            DeviceConstants.DEVICES.ANDROID,
            DeviceConstants.DEVICES.I_PAD,
            DeviceConstants.DEVICES.IPHONE,
            DeviceConstants.DEVICES.I_POD,
            DeviceConstants.DEVICES.BLACKBERRY,
            DeviceConstants.DEVICES.FIREFOX_OS,
            DeviceConstants.DEVICES.CHROME_BOOK,
            DeviceConstants.DEVICES.WINDOWS_PHONE,
            DeviceConstants.DEVICES.PS4,
            DeviceConstants.DEVICES.CHROMECAST,
            DeviceConstants.DEVICES.APPLE_TV,
            DeviceConstants.DEVICES.GOOGLE_TV,
            DeviceConstants.DEVICES.VITA
        ].reduce(function (previousValue, currentValue) {
            return (previousValue === DeviceConstants.DEVICES.UNKNOWN &&
            deviceDetail.device[currentValue]) ? currentValue : previousValue;
        }, DeviceConstants.DEVICES.UNKNOWN);

        deviceInfo.osVersion = [
            DeviceConstants.OS_VERSIONS.WINDOWS_3_11,
            DeviceConstants.OS_VERSIONS.WINDOWS_95,
            DeviceConstants.OS_VERSIONS.WINDOWS_ME,
            DeviceConstants.OS_VERSIONS.WINDOWS_98,
            DeviceConstants.OS_VERSIONS.WINDOWS_CE,
            DeviceConstants.OS_VERSIONS.WINDOWS_2000,
            DeviceConstants.OS_VERSIONS.WINDOWS_XP,
            DeviceConstants.OS_VERSIONS.WINDOWS_SERVER_2003,
            DeviceConstants.OS_VERSIONS.WINDOWS_VISTA,
            DeviceConstants.OS_VERSIONS.WINDOWS_7,
            DeviceConstants.OS_VERSIONS.WINDOWS_8_1,
            DeviceConstants.OS_VERSIONS.WINDOWS_8,
            DeviceConstants.OS_VERSIONS.WINDOWS_10,
            DeviceConstants.OS_VERSIONS.WINDOWS_PHONE_7_5,
            DeviceConstants.OS_VERSIONS.WINDOWS_PHONE_8_1,
            DeviceConstants.OS_VERSIONS.WINDOWS_PHONE_10,
            DeviceConstants.OS_VERSIONS.WINDOWS_NT_4_0,
            DeviceConstants.OS_VERSIONS.MACOSX,
            DeviceConstants.OS_VERSIONS.MACOSX_3,
            DeviceConstants.OS_VERSIONS.MACOSX_4,
            DeviceConstants.OS_VERSIONS.MACOSX_5,
            DeviceConstants.OS_VERSIONS.MACOSX_6,
            DeviceConstants.OS_VERSIONS.MACOSX_7,
            DeviceConstants.OS_VERSIONS.MACOSX_8,
            DeviceConstants.OS_VERSIONS.MACOSX_9,
            DeviceConstants.OS_VERSIONS.MACOSX_10,
            DeviceConstants.OS_VERSIONS.MACOSX_11,
            DeviceConstants.OS_VERSIONS.MACOSX_12,
            DeviceConstants.OS_VERSIONS.MACOSX_13,
            DeviceConstants.OS_VERSIONS.MACOSX_14,
            DeviceConstants.OS_VERSIONS.MACOSX_15
        ].reduce(function (previousValue, currentValue) {
            return (previousValue === DeviceConstants.OS_VERSIONS.UNKNOWN &&
            deviceDetail.osVersion[currentValue]) ? currentValue : previousValue;
        }, DeviceConstants.OS_VERSIONS.UNKNOWN);

        deviceInfo.browserVersion = "0";
        if (deviceInfo.browser !== DeviceConstants.BROWSERS.UNKNOWN) {
            var re = DeviceUtils.BROWSER_VERSIONS_RE[deviceInfo.browser];
            var res = RegexTreeUtils.exec(ua, re);
            if (!!res) {
                deviceInfo.browserVersion = res[1];
            }
        }

        deviceInfo.isMobile = function () {
            return [
                DeviceConstants.DEVICES.ANDROID,
                DeviceConstants.DEVICES.I_PAD,
                DeviceConstants.DEVICES.IPHONE,
                DeviceConstants.DEVICES.I_POD,
                DeviceConstants.DEVICES.BLACKBERRY,
                DeviceConstants.DEVICES.FIREFOX_OS,
                DeviceConstants.DEVICES.WINDOWS_PHONE,
                DeviceConstants.DEVICES.VITA
            ].some(function (item) {
                return deviceInfo.device == item;
            });
        };

        deviceInfo.isTablet = function () {
            return [
                DeviceConstants.DEVICES.I_PAD,
                DeviceConstants.DEVICES.FIREFOX_OS
            ].some(function (item) {
                return deviceInfo.device == item;
            });
        };

        deviceInfo.isDesktop = function () {
            return [
                DeviceConstants.DEVICES.PS4,
                DeviceConstants.DEVICES.CHROME_BOOK,
                DeviceConstants.DEVICES.UNKNOWN
            ].some(function (item) {
                return deviceInfo.device == item;
            });
        };

        return deviceInfo;
    }
}
