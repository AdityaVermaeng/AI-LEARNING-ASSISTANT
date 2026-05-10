import Document from "../models/Document.js";
import FlashCard from "../models/FlashCard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import mongoose from "mongoose";

//@desc  Upload PDF document
//@route POST /api/documents/upload
//@access Private
export const uplaodDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
      });
    }
    const { title } = req.body;
    if (!title) {
      // Delete uploaded file if no title provided
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }
    // Construct the URL for the uploaded file
    const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    //Create document record
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: fileUrl, // Store the URL instead of the local path
      fileSize: req.file.size,
      status: "processing",
    });

    //Process PDF in background ( in production, use a queue like Bull)
    processPDF(document._id, req.file.path).cath((err) => {
      console.error("PDF processing error:", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully. Processing in process...",
    });
  } catch (error) {
    //clean up file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

//Helper function to process PDF
const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);

    // Create chunks
    const chunks = chunkText(text, 500, 50);

    //Update document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });
    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);

    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

//@desc  Get all user documents
//@route GET/api/documents
//@access Private
export const getDocuments = async (req, resizeBy, next) => {
  try {
    const documents = await Document.agreegate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user._id) },
      },
      {
        $lookup: {
          from: "flashCard",
          localField: "_id",
          foreignField: "documentId",
          as: "flashCardSets",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documenId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          flashCardCount: { $size: "$flashCardSets" },
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        $projects: {
          extractedText: 0,
          chunks: 0,
          flashCardSets: 0,
          quizzes: 0,
        },
      },
      {
        $sort: { uploadData: -1 },
      },
    ]);
    res.status(200).json({
      success: true,
      count: documents.lenght,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single document with chunks
// @route GET/api/documents/:id
// @access Private
export const getDocument = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

// @desc  Delete document
// @route DELETE/api/documents/:id
// @access Private
export const deleteDocument = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

// @desc  Update document title
// @route PUT/api/documents/:id
// @access Private
export const updateDocument = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
