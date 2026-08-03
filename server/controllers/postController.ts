import { Response } from "express";
import { Readable } from "stream";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import cloudinary from "../config/cloudinary.js";
import { Generation } from "../models/Generation.js";

//helper to call leonardo
const pollLeonardoJob = async (
  generationId: string,
  apiKey: string,
): Promise<string> => {
  const maxRetries = 20;
  const delay = 5000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(
        `https://cloud.leonardo.ai/api/rest/v2/generations/${generationId}`,
        {
          headers: {
            accept: "application/json",
            authorization: `Bearer ${apikey}`,
          },
        },
      );
      const generation = response.data.generations_by_pk;
      if (generation.status === "COMPLETED") {
        if (
          generation.generated_images &&
          generation.generated_images.length > 0
        ) {
          return generation.generated_images[0].url;
        }
        throw new Error("Generation complete but no images found");
      }
      if (generation.status === "FAILED") {
        throw new Error("Lenaardo.ai geneartion failed");
      }
    } catch (error: any) {
      console.error("POlling error:", error?.response?.data || error.message);
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("Leonardo.ai generation timed out");
};

//generate post
//post /api/posts/generate
export const generatePosts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { prompt, tone, generateImage } = req.body;
    const apikey = process.env.GEMINI_API_KEY;
    if (!apikey) {
      res.status(400).json({
        message:
          "gemini api key is missing.please add it to your server/.env file.",
      });
      return;
    }
    const ai = new GoogleGenAI({ apikey });

    //generate text
    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a social media post base on this prompt;"${prompt}".
      Tone:${tone}.
      Include revalant hashtags.
      Format the response as json with "content" and "imagePrompt" fields.
      The "imagePrompt" should be a highly descriptive prompt for an image 
      generator that complements the posts. 
      `,
    });
    let content = "";
    let imagePrompt = prompt;
    try {
      const rawText = textResponse.text || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const data = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { content: rawText, imagePrompt: prompt };
      content = data.content;
      imagePrompt = data.imagePrompt;
    } catch (e) {
      content = textResponse.text || "";
    }
    let mediaUrl = "";
    if (generateImage) {
      try {
        const leonardokey = process.env.LEONARDO_API_KEY;
        if (leonardokey) {
          const leoResponse = await axios.post(
            "https://cloud.leonardo.ai/api/rest/v2/generations",
            {
              public: false,
              models: "gpt-image-2",
              parameters: {
                quality: "LOW",
                prompt: "imagePrompt",
                quantity: 1,
                width: 1024,
                height: 1024,
                prompt_enhance: "OFF",
              },
            },
            {
              headers: {
                accept: "application/json",
                authorization: `Bearer ${leonardoKey}`,
                "Content-Type": "application/json",
              },
            },
          );
          const generationId = leoResponse.data.generate.generationId;
          const tempUrl = await pollLeonardoJob(generationId, leonardokey);

          //upload to cloudinary
          const upLoadResult = await cloudinary.uploader.upload(tempUrl, {
            folder: "ai-generations",
          });
          mediaUrl = upLoadResult.secure_url;
        }
      } catch (err: any) {
        console.error(
          "Error generating image:",
          err?.response?.data || err.message,
        );
      }
    }

    //save generated post to database
    const generation = await Generation.create({
      userId: req.user._id,
      prompt,
      content,
      mediaUrl,
      mediaType: generateImage ? "image" : "undefined",
      tone,
    });

    res.json({ generation });
  } catch (error) {
    console.error("Error generating post:", error);
    res.status(500).json({
      message: "Error generating post",
    });
  }
};

//get generations
//post /api/posts/generation
export const getGenerations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const generations = await Generation.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ generations });
  } catch (error) {
    console.error("Error fetching generations:", error);
    res.status(500).json({
      message: "Error fetching generations",
    });
  }
};

//get generations
//get /api/posts
export const getPosts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const posts = await Generation.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      message: "Error fetching posts",
    });
  }
};

//scheduled post
//post /api/posts
export const scheduledPosts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { content, platforms, schedulerFor, status } = req.body;

    let parsedPlatforms = platforms;
    if (typeof platforms === "string") {
      try {
        parsedPlatforms = JSON.parse(platforms);
      } catch (err) {
        parsedPlatforms = platforms.split(",").map((p: string) => p.trim());
      }
    }

    let mediaUrl: string | undefined = req.body.mediaUrl;
    let mediaType: string | undefined = req.body.mediaType;

    if (req.file) {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "scheduled-posts" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        const bufferStream = Readable.from(req.file!.buffer);
        bufferStream.on("error", reject);
        bufferStream.pipe(uploadStream);
      });

      mediaUrl = result.secure_url;
      mediaType = result.resource_type === "video" ? "video" : "image";
    }

    const post = await Generation.create({
      userId: req.user._id,
      content,
      mediaUrl,
      mediaType,
      platforms: parsedPlatforms,
      schedulerFor,
      status,
    });
    res.json({ post });
  } catch (error) {
    console.error("Error scheduling post:", error);
    res.status(500).json({
      message: "Error scheduling post",
    });
  }
};
