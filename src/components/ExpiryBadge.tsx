export default function ExpiryBadge({ expiryDate }: { expiryDate: string }) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysLeft = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  let bg: string;
  let text: string;
  let label: string;

  if (daysLeft < 0) {
    bg = "bg-red-100";
    text = "text-red-700";
    label = "Expired";
  } else if (daysLeft <= 7) {
    bg = "bg-red-100";
    text = "text-red-700";
    label = `${daysLeft}d left`;
  } else if (daysLeft <= 30) {
    bg = "bg-amber-100";
    text = "text-amber-700";
    label = `${daysLeft}d left`;
  } else {
    bg = "bg-green-100";
    text = "text-green-700";
    label = `${daysLeft}d left`;
  }

  return (
    <span className={`${bg} ${text} text-xs font-semibold px-2 py-1 rounded-full`}>
      {label}
    </span>
  );
}
