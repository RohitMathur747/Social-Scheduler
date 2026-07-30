import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { Account } from "../models/account.js";

//get all account
// get /api/accounts
export const getAccounts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const accounts = await Account.create({
      user: req.user._id,
    });
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server Error" });
  }
};

//Add account
// post /api/accounts
export const addAccounts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { platform, handle, avatarUrl } = req.body;
    const accounts = await Account.create({
      user: req.user._id,
      platform,
      handle,
      avatarUrl,
    });
    res.status(200).json(accounts);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server Error" });
  }
};

//Disconnect account
//delete /api/accounts/:id

export const disconnectAccounts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!account) {
      res.status(404).json({ message: "Acccount not Found" });
      return;
    }
    if (account.zernioAccountId) {
      try {
        await zernio.accounts.deleteAccount({
          path: { accountId: account.zernioAccountId },
        });
      } catch (error) {
        res
          .status(500)
          .json({ message: error?.response?.data?.message || error?.message });
        return;
      }
    }
    await account.deleteOne();
    res.json({ message: "Account Disconnect Successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server Error" });
  }
};
