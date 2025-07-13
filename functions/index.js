// Main API function script
/*
  Makes a document on the cloud using the .DOCX library and uses adobe cloud services to convert the .docx to a pdf document
*/
const { onRequest, runWith } = require("firebase-functions/v2/https");

/* Firebase admin and get secrets that contain the keys for adobe services */
const admin = require("firebase-admin");
const { defineSecret } = require("firebase-functions/params");

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const stream = require("stream"); // Needed to convert buffer to stream

/* Secret keys to adobe pdf services */
const clientId = defineSecret("ADOBE_CLIENT_ID");
const clientSecret = defineSecret("ADOBE_CLIENT_SECRET");

admin.initializeApp();

// Destructure everything needed from the docx package
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  PageBorders,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  VerticalAlign,
  TableBorders,
} = require("docx");

// Destructure everything needed from the Adobe SDK
const {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  CreatePDFJob,
  CreatePDFResult,
} = require("@adobe/pdfservices-node-sdk");

// --- Initialize Express App ---
const app = express();

app.set("trust proxy", 1);

// ✅ Create the authentication middleware
const checkAuth = async (req, res, next) => {
  // 1. Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).send("Unauthorized: No token provided.");
  }
  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const validRoles = ["admin", "guest"];
    // Check if user is a user with a valid role (To prevent unauthorised access)
    if (!validRoles.includes(decodedToken.role)) {
      return res.status(403).send("Forbidden: Requires valid privileges.");
    }

    // If the claim exists, proceed to the main route handler
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error while verifying Firebase ID token:", error);
    res.status(403).send("Unauthorized: Invalid token.");
  }
};

// Rate limited to prevent spam
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 9, // Limit each IP to 20 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after a minute.",
});

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
app.use(express.json());
app.use(limiter);

// If post contains "/export-word"
app.post("/export-word", checkAuth, async (req, res) => {
  try {
    // Get data from post request
    const { tasks, fileName, metaData, docTheme } = req.body;
    const format = req.query.format || "docx";

    // This variable is used for odd colouring for the items
    let isOdd = false;

    // Create a document object
    // Style it based on the style the post request has
    const doc = new Document({
      background: {
        color: docTheme.bodyBackgroundColor,
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
            // CORRECTED: The pageBorders property is part of the section properties.
            // This structure creates a border on all sides of the page.
            pageBorders: {
              display: "allPages",
              border: {
                style: BorderStyle.SINGLE,
                size: 24, // Size is in 1/8ths of a point. 48 was very thick.
                color: docTheme.seperatorColor,
                space: 24,
              },
            },
          },
          children: [
            // Header information (Title, Export Date, etc.) remains largely the same
            new Paragraph({
              children: [
                new TextRun({
                  text: metaData.listName ? metaData.listName : "To-Do List",
                  font: { name: "Arial" },
                  size: 48,
                  bold: true,
                  color: docTheme.colorTextSecondary,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            ...(Object.keys(metaData).length > 0 && metaData.date
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${metaData.dateLabel}${metaData.date}`,
                        font: { name: "Arial" },
                        size: 20,
                        color: docTheme.colorTextSecondary,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                ]
              : []),
            new Paragraph({
              children: [
                new TextRun({
                  text: metaData.indicator,
                  font: { name: "Arial" },
                  size: 36,
                  bold: true,
                  color: docTheme.colorHeadingPrimary,
                }),
              ],
              spacing: { before: 400 },
            }),
            new Paragraph({
              spacing: { after: 200 },
              border: {
                bottom: {
                  color: docTheme.seperatorColor,
                  style: BorderStyle.SINGLE,
                  size: 10,
                },
              },
            }),

            // Table with tasks
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              // Create a table for the tasks
              borders: TableBorders.NONE,
              rows: [
                ...tasks.map((task, index) => {
                  isOdd = !isOdd;
                  const fillColor = isOdd
                    ? docTheme.taskOddColor
                    : docTheme.bodyBackgroundColor;

                  // Create a new paragraph for each task
                  const cellChildren = [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${index + 1}. `,
                          size: 24,
                          font: { name: "Arial" },
                          color: docTheme.colorText,
                        }),
                        // Use flatMap to handle line breaks correctly.
                        ...task.name.split("\n").flatMap((line, i, arr) => {
                          const runs = [
                            new TextRun({
                              text: line,
                              bold: true,
                              size: 24,
                              font: { name: "Arial" },
                              color: task.completed
                                ? docTheme.textColorMuted
                                : docTheme.colorTextSecondary,
                              strike: task.completed,
                            }),
                          ];
                          // Add a break if it's not the last line
                          if (i < arr.length - 1) {
                            runs.push(new TextRun({ break: 1 }));
                          }
                          return runs;
                        }),
                      ],
                    }),
                  ];

                  if (task.desc && task.desc.trim() !== "") {
                    cellChildren.push(
                      new Paragraph({
                        // Apply the same flatMap logic for the description
                        children: task.desc
                          .split("\n")
                          .flatMap((line, i, arr) => {
                            const runs = [
                              new TextRun({
                                text: `    ${line}`,
                                italics: true,
                                size: 20,
                                color: docTheme.colorText,
                                font: { name: "Arial" },
                              }),
                            ];
                            if (i < arr.length - 1) {
                              runs.push(new TextRun({ break: 1 }));
                            }
                            return runs;
                          }),
                        spacing: { before: 100 },
                      })
                    );
                  }

                  return new TableRow({
                    children: [
                      new TableCell({
                        shading: {
                          type: ShadingType.SOLID,
                          color: fillColor,
                          fill: fillColor,
                        },
                        verticalAlign: VerticalAlign.CENTER,
                        margins: {
                          top: 100,
                          bottom: 100,
                          left: 200,
                          right: 200,
                        },
                        children: cellChildren,
                      }),
                    ],
                  });
                }),
              ],
            }),

            // Message if no tasks
            ...(tasks.length === 0
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "No tasks were found in the list.",
                        italics: true,
                        color: docTheme.colorText,
                        size: 24,
                        font: { name: "Arial" },
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 400 },
                  }),
                ]
              : []),

            // Footer
            new Paragraph({
              spacing: { before: 400, after: 100 },
              border: {
                bottom: {
                  color: docTheme.seperatorColor,
                  style: BorderStyle.SINGLE,
                  size: 10,
                },
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: metaData.footer,
                  size: 18,
                  font: { name: "Arial" },
                  color: docTheme.textColorMuted,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        },
      ],
    });

    // Generate the DOCX buffer in memory
    const docxBuffer = await Packer.toBuffer(doc);

    if (format === "pdf") {
      // If the request format is a PDF it uses adobe pdf services to convert the .DOCX to a .PDF
      const credentials = new ServicePrincipalCredentials({
        clientId: clientId.value(),
        clientSecret: clientSecret.value(),
      });

      // Secret credentials for the adobe pdf services
      const pdfServices = new PDFServices({ credentials });

      // Create a readable stream from our in-memory DOCX buffer
      const readStream = stream.Readable.from(docxBuffer);

      // Upload the stream asset
      const inputAsset = await pdfServices.upload({
        readStream,
        mimeType: MimeType.DOCX,
      });

      // Creates a new job instance
      const job = new CreatePDFJob({ inputAsset });

      // Submit the job and get the job result
      const pollingURL = await pdfServices.submit({ job });
      const pdfServicesResponse = await pdfServices.getJobResult({
        pollingURL,
        resultType: CreatePDFResult,
      });

      // Get content from the resulting asset
      const resultAsset = pdfServicesResponse.result.asset;
      const streamAsset = await pdfServices.getContent({ asset: resultAsset });

      // Send the PDF buffer back to the client
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${fileName}.pdf"`
      );
      streamAsset.readStream.pipe(res);
    } else {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}.docx"`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.send(docxBuffer);
    }
  } catch (error) {
    // In case of error
    console.error("Error generating or converting document:", error);
    res.status(500).send("Error processing your document.");
  }
});

// Expose Express API as a single Cloud Function: 'api'
exports.api = onRequest(
  { secrets: ["ADOBE_CLIENT_ID", "ADOBE_CLIENT_SECRET"] },
  app
);
