import userModel from "../models/userModel.js";

// get user by id
export const getUserById = async (id, res) => {
  const user = await userModel.findById(id);

  if (user) {
    res.status(200).json({
      success: true,
      user,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
};

// Get All users
export const getAllUsersService = async (res) => {
  const users = await userModel.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    users,
  });
};

// update user role
export const updateUserRoleService = async (res, id, role) => {
  const user = await userModel.findByIdAndUpdate(id, { role }, { new: true });

  res.status(200).json({
    success: true,
    user,
  });
};