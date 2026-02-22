const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

const booking = await Booking.create({
  ...req.body,
  user: req.user._id,
  expiresAt
});