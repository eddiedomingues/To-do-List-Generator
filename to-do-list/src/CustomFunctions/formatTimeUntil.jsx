import React from "react";
function formatTimeUntil(deadline) {
  const now = new Date();
  const deadlineDate = new Date(deadline);

  // Calculate the difference in milliseconds
  const diff = deadlineDate.getTime() - now.getTime();

  // Handle cases where the deadline has passed
  if (diff <= 0) {
    return "The deadline has passed.";
  }

  // --- Convert milliseconds into different units ---
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  // --- Build the output string ---
  const parts = [];
  if (days > 0) {
    parts.push(`${days} day${days > 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  }
  if (minutes > 0 && days === 0) { // Only show minutes if days are not shown
     parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  }

  if (parts.length === 0) {
    return "Less than a minute left.";
  }

  // Join the first two significant parts (e.g., days and hours)
  return `${parts.slice(0, 2).join(' and ')} left to complete the list`;
}


export default formatTimeUntil;
