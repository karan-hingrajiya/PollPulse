export const buildUserDoc = ({ name, email, password, verificationToken }) => {
  return {
    name: name.trim(),
    email,
    password,
    isVerified: false,
    verificationToken,
    refreshToken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
