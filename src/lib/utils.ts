import { clsx, type ClassValue } from "clsx";
import internal from "stream";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatViews(views: number) {
  if (views < 1e3) return views.toString();
  if (views >= 1e3 && views < 1e5) return (views / 1e3).toFixed(1) + "K";
  if (views >= 1e5 && views < 1e7) return (views / 1e5).toFixed(1) + "L";
  if (views >= 1e7 && views < 1e10) return (views / 1e6).toFixed(1) + "M";
  return (views / 1e7).toFixed(1) + "Cr";
}

export function generateRandomId() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let id = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters[randomIndex];
  }
  return id;
}

export async function readableToBlob(readable: internal.Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  return new Blob(chunks);
}

const cookies = [
  {
    domain: ".youtube.com",
    expirationDate: 1782138097.079805,
    hostOnly: false,
    httpOnly: true,
    name: "__Secure-3PSID",
    path: "/",
    sameSite: "no_restriction",
    secure: true,
    session: false,
    storeId: null,
    value:
      "g.a000xAgTWcnhqGjTh45qaEoL_a7OcqsqpJQtrZ_05SHlmBs4tNTh6coNajbFU8TEaWVml2GFtQACgYKASESARESFQHGX2MiZQoTEQBg3G4DKz5dsWn08RoVAUF8yKpNQPUqlpZD0GvLDgw0vFxM0076",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1747579886.209971,
    hostOnly: false,
    httpOnly: true,
    name: "GPS",
    path: "/",
    sameSite: null,
    secure: true,
    session: false,
    storeId: null,
    value: "1",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1779114119.56769,
    hostOnly: false,
    httpOnly: false,
    name: "SIDCC",
    path: "/",
    sameSite: null,
    secure: false,
    session: false,
    storeId: null,
    value:
      "AKEyXzWW--bBUtLnIZk8tAGAywBBUrmL3zeEij-nXTap3pqBsMZCdQ_37QAjX1RdWu2Nfms4Cw",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1782138097.079636,
    hostOnly: false,
    httpOnly: false,
    name: "SID",
    path: "/",
    sameSite: null,
    secure: false,
    session: false,
    storeId: null,
    value:
      "g.a000xAgTWcnhqGjTh45qaEoL_a7OcqsqpJQtrZ_05SHlmBs4tNThTe-JeXM7GaAelRhzrKGgtgACgYKAfUSARESFQHGX2Mi_-Z_QtxU19uoI5F9B37u8hoVAUF8yKrXxmO1_cGpZ-TqdaD5jzWY0076",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1779114090.376531,
    hostOnly: false,
    httpOnly: true,
    name: "__Secure-1PSIDTS",
    path: "/",
    sameSite: null,
    secure: true,
    session: false,
    storeId: null,
    value:
      "sidts-CjEBjplskNdCDXbrd3McAnuWZARhsNHa_7wz9kfPocMe3IXNfG5rZy9ZE5D6UAQQyYRuEAA",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1747578708,
    hostOnly: false,
    httpOnly: false,
    name: "CONSISTENCY",
    path: "/",
    sameSite: null,
    secure: true,
    session: false,
    storeId: null,
    value:
      "AKreu9uM4lT8qnCI97DRNCJxmUm0lUaCZK82-qYEbanJXeXNVsh-lrkPakSK5yVjIT6xjLIgqp1JinD2aPVfOxNO91fOEpnc0QH6FS4DJ2fTrafRo_spLn4fUsgiZin171dqNGBnmCPkBpR5EKvWGOFo",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1782138097.079035,
    hostOnly: false,
    httpOnly: false,
    name: "SAPISID",
    path: "/",
    sameSite: null,
    secure: true,
    session: false,
    storeId: null,
    value: "pbi8QkIFARaeOBOp/A7WNWYUPwH9vdAAFO",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1779114119.567768,
    hostOnly: false,
    httpOnly: true,
    name: "__Secure-1PSIDCC",
    path: "/",
    sameSite: null,
    secure: true,
    session: false,
    storeId: null,
    value:
      "AKEyXzXwtrgk36ZF14ysqMrz-uTYiITiL3-D68TUlWLMfm7Ppv2eHOoU-oFv_2u6Sx2AGxUe",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1782138097.078763,
    hostOnly: false,
    httpOnly: true,
    name: "SSID",
    path: "/",
    sameSite: null,
    secure: true,
    session: false,
    storeId: null,
    value: "AFj2yYtM3BMe0MQ2-",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1747578213.518034,
    hostOnly: false,
    httpOnly: true,
    name: "YTSESSION-1supwba",
    path: "/",
    sameSite: null,
    secure: true,
    session: false,
    storeId: null,
    value:
      "ANPz9KjKPPyxkeITxPaqdaYFtxuDBw27/T+ex6vf5BKxKWhGn7qCXRXlVrsio9haXrB/Dl4SFld+k+mT4m2Z/9aTtWtyHw6QTbNCRt8=",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1782138097.079119,
    hostOnly: false,
    httpOnly: false,
    name: "__Secure-1PAPISID",
    path: "/",
    sameSite: null,
    secure: true,
    session: false,
    storeId: null,
    value: "pbi8QkIFARaeOBOp/A7WNWYUPwH9vdAAFO",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1782138097.079722,
    hostOnly: false,
    httpOnly: true,
    name: "__Secure-1PSID",
    path: "/",
    sameSite: null,
    secure: true,
    session: false,
    storeId: null,
    value:
      "g.a000xAgTWcnhqGjTh45qaEoL_a7OcqsqpJQtrZ_05SHlmBs4tNThkzs2XcZlFh9LzEm181fupgACgYKATsSARESFQHGX2MioEv3A064FfrCw10-Zn0AqhoVAUF8yKoMJtJ67TjSNm5WBUPATZDD0076",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1782138097.079299,
    hostOnly: false,
    httpOnly: false,
    name: "__Secure-3PAPISID",
    path: "/",
    sameSite: "no_restriction",
    secure: true,
    session: false,
    storeId: null,
    value: "pbi8QkIFARaeOBOp/A7WNWYUPwH9vdAAFO",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1779114119.567817,
    hostOnly: false,
    httpOnly: true,
    name: "__Secure-3PSIDCC",
    path: "/",
    sameSite: "no_restriction",
    secure: true,
    session: false,
    storeId: null,
    value:
      "AKEyXzXean3PfqPtCRDJ7kpz1q9nBfQKfW_Zk1Etlv_-Y2ia0K5jAlanTm6mpiGixjn-Nx2NFg",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1779114090.376693,
    hostOnly: false,
    httpOnly: true,
    name: "__Secure-3PSIDTS",
    path: "/",
    sameSite: "no_restriction",
    secure: true,
    session: false,
    storeId: null,
    value:
      "sidts-CjEBjplskNdCDXbrd3McAnuWZARhsNHa_7wz9kfPocMe3IXNfG5rZy9ZE5D6UAQQyYRuEAA",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1782138097.078943,
    hostOnly: false,
    httpOnly: false,
    name: "APISID",
    path: "/",
    sameSite: null,
    secure: false,
    session: false,
    storeId: null,
    value: "-l_hstsHDTojJdGE/AHMmta_9rrP6ccgZf",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1782138097.078415,
    hostOnly: false,
    httpOnly: true,
    name: "HSID",
    path: "/",
    sameSite: null,
    secure: false,
    session: false,
    storeId: null,
    value: "AukfmIl_K22skPyxe",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1782138093.517854,
    hostOnly: false,
    httpOnly: true,
    name: "LOGIN_INFO",
    path: "/",
    sameSite: "no_restriction",
    secure: true,
    session: false,
    storeId: null,
    value:
      "AFmmF2swRAIgFTx5dcJo9P0BtMgGPFxr-czt0TrOaB6ZKKxHot0rtgUCIAsod6tdEStpVF3iXZhvGt2Ln77HY9r71QtzyInwliLr:QUQ3MjNmemZZTzNYVU5FUGNnVkYzMWtMOW9ucG1waHM5NlMtWDBEZ2pPQXRUWDV6bEZpX2JVWlRialUyLWNNNENWZW9GbkVFbGNXemppdFNDWjNVZENEQ1lvVDh3TTBDUlljUlZUc0RILXV5bHpXTlRhWXRhZlFTV2JubVhrMEE2cTd0YUx3dVo5U3d4c0JGNmkyNVRUZTh5ZW91S0tEVDdR",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1782138094.19633,
    hostOnly: false,
    httpOnly: false,
    name: "PREF",
    path: "/",
    sameSite: null,
    secure: true,
    session: false,
    storeId: null,
    value: "f4=4000000&f6=40000000&tz=Asia.Calcutta",
  },
];

export const sanitizedCookies = cookies.map(cookie => ({
  ...cookie,
  sameSite: cookie.sameSite === null ? undefined : cookie.sameSite
}));


export const formatDuration = (totalSeconds: number | null | undefined): string => {
  if (typeof totalSeconds !== 'number' || totalSeconds < 0 || !isFinite(totalSeconds)) {
    return "0m 0s";
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}m ${seconds}s`;
};
