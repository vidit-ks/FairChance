export function getNormalizedRole() {
  try {
    const user = JSON.parse(localStorage.getItem("fairchance_user"));
    return String(user?.role || "").trim().toLowerCase();
  } catch {
    return "";
  }
}
