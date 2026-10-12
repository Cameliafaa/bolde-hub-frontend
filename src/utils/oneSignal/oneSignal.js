import OneSignal from "react-onesignal";

let initPromise = null;

export const initOneSignal = async (user) => {
  const userId = user?.user_id || user?.id;
  if (!userId) return;

  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await OneSignal.init({
        appId: process.env.REACT_APP_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: "OneSignalSDKWorker.js",
        serviceWorkerParam: { scope: "/" },
      });

      OneSignal.Notifications.addEventListener(
        "foregroundWillDisplay",
        (event) => {
          event.preventDefault();

          const notif = event.notification;
          const data = notif?.additionalData || {};

          if (data.type === "announcement") {
            window.dispatchEvent(new Event("announcement-notification"));
            return;
          }

          const newNotif = {
            id: data.notification_id || Date.now(),
            title: notif?.title || "Marketing Labs",
            description: notif?.body || "Ada notifikasi baru",
            date: new Date().toISOString(),
            isRead: false,
            type: data.type || "notification",
          };

          const oldNotifs = JSON.parse(
            localStorage.getItem("webNotifications") || "[]",
          );

          localStorage.setItem(
            "webNotifications",
            JSON.stringify([newNotif, ...oldNotifs]),
          );

          window.dispatchEvent(new Event("web-notification-updated"));
        },
      );

      OneSignal.Notifications.addEventListener("click", (event) => {
        const data = event?.notification?.additionalData || {};

        if (data.target_url) {
          window.location.href = data.target_url;
        }
      });

      await OneSignal.Notifications.requestPermission();

      if (OneSignal.Notifications.permission) {
        await OneSignal.login(String(userId));
      }
    } catch (error) {
      console.error("OneSignal init error:", error);
      initPromise = null;
    }
  })();

  return initPromise;
};
