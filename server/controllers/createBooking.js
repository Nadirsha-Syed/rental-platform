const createBooking = async (req, res) => {
  try {
    const { rentalItemId, startTime, endTime } = req.body;

    if (!rentalItemId || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing booking data" });
    }

    const rentalItem = await RentalItem.findById(rentalItemId);

    if (!rentalItem) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const hours = (end - start) / (1000 * 60 * 60);

    if (hours <= 0) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    // 🔥 conflict check
    const conflictingBooking = await Booking.findOne({
      rentalItem: rentalItemId,
      status: "confirmed",
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (conflictingBooking) {
      return res.status(400).json({
        message: "Already booked for selected time",
      });
    }

    const totalPrice = hours * rentalItem.pricePerHour;

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const booking = await Booking.create({
      rentalItem: rentalItemId,
      user: req.user._id,
      startTime: start,
      endTime: end,
      totalPrice,
      status: "pending", // 🔥 better flow
      expiresAt
    });

    return res.status(201).json(booking);

  } catch (error) {
    console.log("BOOKING ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};