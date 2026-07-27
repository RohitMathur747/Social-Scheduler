import { Request, Response } from "express";

//helper to ensure user has a zernio profile
const getOrCreateZernioProfile = async (user: any): Promise<string> => {
  try {
    const result = await zernio.profiles.listProfiles();
    const data = result.data as any;
  } catch (error) {
    res.status(500).json({ message: error?.message || "Server Error" });
  }
};

// generated Oauth authorization URL
// get /api/auth/:platform

export const generateAuthUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { platform } = req.params;
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server Error" });
  }
};
