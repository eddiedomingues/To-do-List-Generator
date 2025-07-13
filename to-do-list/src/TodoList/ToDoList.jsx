// -- Main To-do List component script -- \\

// -- Imports --

// React and functions needed
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";

// Language Translation Library
import { useTranslation } from "react-i18next";

// Custom Hooks
import useMediaQuery from '../CustomFunctions/useMediaQuery.jsx';

// Components
import ListItem from "./ListItem.jsx";
import Window from "../Window/Window.jsx";
import Themes from "../Themes/Themes.jsx";

import Select from "../Select/Select.jsx";

// Context for firebas authentication
import {useAuth } from '../Firebase/AuthContext';

// SVG Imports for buttons
import ExportImage from "./export.svg?react";
import ImportImage from "./import.svg?react";
import DeletePicture from "./delete.svg?react";

// Global Variable Declerations
// Export
let documentUrl = {};

// Export methods of which they support a theme for the document
const validMethodsExportThemes = ["html", "pdf", "word"];

// HTML Export Base
const htmlExportSample = `<html>
  <head>
    <style>
      :root {
        /* Theme */
        

        /* Typography */
        --font-family: Arial, Helvetica, sans-serif;
      }

      body {
        background-color: var(--body-background-color);
        font-family: var(--font-family);
        color: var(--color-text);
        padding: 2rem;
        display: grid;
        grid-auto-rows: min-content;
        gap: 0px;
        column-gap: 0rem;
        row-gap: 0rem;
      }

      /* Aditives */
      .lineSeperator {
        width: 100%;
        height: 1px;
        background-color: var(--seperator-color);
      }

      /* Main */

      /* Header */
      header {
        display: grid;
        justify-content: center;
      }

      #listName {
        font-size: 2.5rem;
        color: var(--color-text-secondary);
      }

      .date {
        color: var(--color-text-secondary);
        font-weight: lighter;
      }

      .date.hidden {
        display: none;
      }

      /* Content */
      .listContainer {
        overflow-x: hidden;
        overflow-y: auto;
        width: 100%;
        height: fit-content;
      }

      #list {
        display: grid;
        grid-auto-columns: 1fr;
        grid-auto-rows: min-content;
        gap: 0px 0px;
        list-style: none;
        padding: 0;
      }

      .toDoItem {
        display: grid;
        grid-auto-columns: auto min-content;
        padding-top: 1rem;
        padding-bottom: 1rem;
        padding-left: 0.7rem;
        grid-template-rows: auto minmax(0, min-content);
      }

      .toDoItem:nth-child(odd) {
        background-color: var(--taskOddColor);
      }

      .taskNameContainer {
        display: grid;
        grid-template-columns: min-content auto min-content;
        grid-template-rows: min-content;
        align-items: center;
      }

      .taskName {
        white-space: normal;
        overflow: hidden;
        overflow-wrap: anywhere;
        color: var(--color-text-secondary);
        font-weight: bold;
        padding-left: 0.3rem;
      }

      #taskListIndicator {
        color: var(--color-heading-primary);
        user-select: none;
      }

      /* Description */

      .buttonContainer {
        display: flex;
        flex-direction: row;
      }

      .descBtn {
        width: fit-content;
        height: fit-content;
        background-color: transparent;
        border: transparent;
        border-width: 0px;
      }

      .descSVG {
        fill: var(--svg-fill-color);
        width: 1.7rem;
        background-color: transparent;
      }

      .desc {
        display: grid;
        transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
        font-style: italic;
      }

      .desc.hidden {
        line-height: 0;
        opacity: 0;
        overflow: hidden;
      }

      /* Footer */

      .footer {
        display: grid;
        text-align: center;
        margin-top: 1rem;
      }
    </style>

    <script>
      // Initial Variables
      const data = {};

      const taskElements = [];

      // SVG Imports
      const showSVG = '<svg class="descSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-120 300-300l44-44 136 136 136-136 44 44-180 180ZM344-612l-44-44 180-180 180 180-44 44-136-136-136 136Z"/></svg>';

      const hideSVG = '<svg class="descSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="48px" fill="#e3e3e3"><path d="m343-160-43-43 180-180 180 180-43 43-137-137-137 137Zm137-417L300-757l43-43 137 137 137-137 43 43-180 180Z"/></svg>';

      // Functions
      function createListItem(task, index) {
        // Create a new list item element
        const newListItem = document.createElement("li");

        // Add content and classes to it
        newListItem.classList.add("toDoItem"); // Add a class for styling

        const taskNameCon = document.createElement("div");
        newListItem.appendChild(taskNameCon);
        taskNameCon.classList.add("taskNameContainer");

        const indexNumber = document.createElement("span");
        taskNameCon.appendChild(indexNumber);
        indexNumber.textContent = (index + 1) + '. ';
        indexNumber.classList.add("taskNumber");

        const taskName = document.createElement("span");
        taskNameCon.appendChild(taskName);
        taskName.classList.add("taskName");
        taskName.textContent = task.name;

        // Description

        const buttonContainer = document.createElement("div");
        taskNameCon.appendChild(buttonContainer);
        buttonContainer.classList.add("buttonContainer");

        const desc = document.createElement("div");
        desc.classList.add("desc");
        newListItem.appendChild(desc);

        if (task.desc.trim() !== "") {
          desc.textContent = task.desc;

          let descHidden = task.descHidden ? task.descHidden : true;

          const showDescButton = document.createElement("button");
          buttonContainer.appendChild(showDescButton);
          showDescButton.classList.add("descBtn");

          const toggleDesc = () => {
            if (descHidden === true) {
              desc.classList.add("hidden");
              showDescButton.innerHTML = showSVG;
            } else {
              desc.classList.remove("hidden");
              showDescButton.innerHTML = hideSVG;
            }
          };

          const handleDescClick = (event) => {
            descHidden = !descHidden;
            toggleDesc();
          };

          toggleDesc();

          showDescButton.onclick = handleDescClick;
        }

        return newListItem;
      }

      // Wait until document has loaded
      document.addEventListener("DOMContentLoaded", () => {
        const listNameTitle = document.getElementById("listName");
        const taskList = document.getElementById("list");
        const taskInput = document.getElementById("new-task-input");
        const date = document.getElementById("date");

        if (data.metaData.date) {
          if (data.metaData.date.trim() !== "") {
            date.textContent = "[[dateLabel]]" + data.metaData.date;
            date.classList.remove("hidden");
          }
        }

        data.tasks.map((task, index) => {
          const listElement = createListItem(task, index);
          taskList.appendChild(listElement);
        });

        data.metaData.listName
          ? (listNameTitle.textContent = data.metaData.listName)
          : (listNameTitle.textContent = "To-Do List");
      });
    </script>
  </head>
  <body>
    <header>
      <h1 id="listName"></h1>
    </header>
    <h4 id="date" class="date hidden"></h4>
    <h2 id="taskListIndicator">[[taskIndicator]]</h2>
    <div class="lineSeperator"></div>
    <div class="listContainer">
      <ul id="list"></ul>
    </div>
    <div class="lineSeperator"></div>
    <footer class="footer">
      [[footer]]
    </footer>
  </body>
</html>
`;

// -- Main Function
function ToDoList() {
  // Main Variables

  // Firebase authentication variables (Using context from another script)
  const {user} = useAuth(); 

  // Tasks
  const [tasks, setTasks] = useState([]);

  // New task variable
  const [newTask, setNewTask] = useState({
    name: "",
    desc: "",
    descHidden: false,
    editMode: false,
    delete: false,
  });

  const [editingTaskId, setEditingTaskId] = useState(null); // Holds the ID of the task being edited, or null

  // Translations

  // Different Namespaces
  const { t: mainT, i18n } = useTranslation();
  const { t: windowsT } = useTranslation("windows");
  const { t: notificationsT } = useTranslation("notifications");
  const { t: listT } = useTranslation("list");

  // --- Hooks

  // Memoized functions for actions

  // Delete Task
  const memoizedDeleteTask = useCallback((taskIdToDelete) => {
    setTasks((prevTasks) => {
      return prevTasks.map((task) =>
        task.id === taskIdToDelete ? { ...task, delete: true } : task
      );
    });
    setTimeout(() => {
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskIdToDelete)
      );
    }, 200); // Wait for animation
  }, []);

  // Move a task up
  const memoizedMoveTaskUp = useCallback((index) => {
    if (index > 0) {
      setTasks((prevTasks) => {
        const updatedTasks = [...prevTasks];
        [updatedTasks[index], updatedTasks[index - 1]] = [
          updatedTasks[index - 1],
          updatedTasks[index],
        ];
        return updatedTasks;
      });
    }
  }, []);

  // Move atask down
  const memoizedMoveTaskDown = useCallback(
    (index) => {
      if (index < tasks.length - 1) {
        setTasks((prevTasks) => {
          const updatedTasks = [...prevTasks];
          [updatedTasks[index], updatedTasks[index + 1]] = [
            updatedTasks[index + 1],
            updatedTasks[index],
          ];
          return updatedTasks;
        });
      }
    },
    [tasks.length]
  ); // Dependency: tasks.length
  const memoizedEditTask = useCallback(
    (taskId, updatedData) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? {...task, ...updatedData} : task
        )
      );
      window.notificationManager.success(notificationsT('main.successes.editMode.heading'), notificationsT('main.successes.editMode.content'));
    },
    [window.notificationManager, mainT]
  ); // Dependency on notif object

  // Handler for editing task
  const handleSetEditingId = useCallback((taskId) => {
    // This function simply sets which task ID is currently being edited.
    setEditingTaskId(taskId);
  }, []);

  // Turn on edit mode for a specific task
  const memoizedEditModeTask = useCallback((index) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task, i) => {
        if (task.editMode === undefined || task.editMode === null) {
          task.editMode = false;
        }
        if ((index !== i) & (task.editMode === true)) {
          task.editMode
            ? window.notificationManager.success(
                notificationsT("main.successes.editMode.heading"),
                notificationsT("main.successes.editMode.content")
              )
            : [];
          task.editMode = false;
        } else if (i === index) {
          task.editMode === true
            ? window.notificationManager.success(
                notificationsT("main.successes.editMode.heading"),
                notificationsT("main.successes.editMode.content")
              )
            : window.notificationManager.info(
                notificationsT("main.infos.editMode.heading"),
                notificationsT("main.infos.editMode.content")
              );
          task.editMode = !task.editMode;
        }
        return task;
      });
      return updatedTasks;
    });
  }, []);

  // Handle input changes for setting a new task
  const handleInputChange = useCallback((event) => {
    if (event.target.id === "task-name") {
      setNewTask((oldNewTask) => ({ ...oldNewTask, name: event.target.value }));
    } else if (event.target.id === "task-desc") {
      setNewTask((oldNewTask) => ({ ...oldNewTask, desc: event.target.value }));
    }
  }, []);

  // Function to add a task
  const addTask = useCallback(() => {
    if (newTask.name.trim() === "") {
      // Check for empty name
      window.notificationManager.warning(
        notificationsT("main.warnings.heading"),
        notificationsT("main.warnings.content.invalidTaskName")
      );
      return;
    }
    // Generate a unique ID for the new task
    const newTaskId = Date.now(); // A simple unique ID for now
    setTasks((t) => [...t, { ...newTask, id: newTaskId }]); // Add the new task with an ID
    document.getElementById("task-name").value = "";
    document.getElementById("task-desc").value = "";
    setNewTask({ name: "", desc: "", descHidden: true, id: 0 }); // Clear the input field after adding
  }, [newTask]); // Dependency: newTask state for the new task object being added

  // Handler for the export window when the close button is closed
  const handleExportCloseClick = () => {
    setExportWindowVis(false);
  };

  // --- End of hook definitions ---

  // -- Export --

  // -- GLobal Variables
  const [exportMethod, setExportMethod] = useState("");
  const [exportFileName, setExportFileName] = useState("");
  const [exportDate, setExportDate] = useState("");
  const [listName, setListName] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [gFileName, setGFileName] = useState("");
  const [fExtension, setFExtension] = useState("");
  const [exportDocTheme, setExportDocTheme] = useState("dark");

  // Mobile Detection
  const isMobile = useMediaQuery('(max-width: 768px)');

  // -- References
  const themeSelect = useState(null);

  // -- Functions

  // Download the document generated
  const downloadDocument = () => {
    if (documentUrl.url) {
      // Create an <a> element with a href of the blob object of the document generated and download it
      const link = document.createElement("a");
      link.href = documentUrl.url;
      link.download = `${gFileName}.${fExtension}`;

      // Append it to document
      document.body.appendChild(link);
      link.click(); // Simulate a click
      document.body.removeChild(link); // Remove the link after clicking

      // Revoke the object URL to free up memory
      Object.keys(documentUrl).forEach((key) => {
        URL.revokeObjectURL(documentUrl[key]);
      });
    }
  };

  // File Generation Success Notification Function
  // For efficiency
  const notitifyFileGenSuccess = useCallback(
    (fileName, fileType) => {
      window.notificationManager.success(
        notificationsT("export.successes.fileGeneration.heading"),
        `${notificationsT(
          "export.successes.fileGeneration.content"
        )} "${fileName}.${fileType}"`
      );
    },
    [window.notificationManager, exportMethod]
  ); // Wait for dependencies

  // Export Data Function
  const exportData = async (method) => {
    // Set global function variables here for efficiency

    // Firebase authentication
    let authorizationToken = ""
    try {
      user ? authorizationToken = (await user.getIdToken()) : [];
    } catch(error) {
      authorizationToken = "null"
    }

    console.log(authorizationToken)

    // File Name
    let fileName =
      exportFileName.trim() !== ""
        ? exportFileName
        : new Date().getTime().toString();

    // MetaData
    let metaData = {};
    listName.trim() !== ""
      ? (metaData["listName"] = listName)
      : (metaData["listName"] = listT("title"));
    metaData.indicator = listT("indicator");
    metaData.footer = listT("footer");
    metaData.dateLabel = listT("dateLabel");
    exportDate.trim() !== "" ? (metaData["date"] = exportDate) : null; // Changed "" to null for consistency, though "" would also work for boolean check

    // Tasks variable to export
    const newTasks = tasks.map((task, index) => {
      // Only export the name, and desc variables for efficiency and file size reduction purposes
      return { name: task.name, desc: task.desc };
    });

    // Server url, uses a reference from the vite config file that automatically replaces 'api/' with the server address
    const serverUrl = "https://api-qowqtvbp2a-uc.a.run.app";

    // Set is exporting to trye
    setIsExporting(true);

    // Check the export method
    if (exportMethod === "json") {
      // JSON export method

      // MetaData
      // Only export necessary metaData
      metaData.footer = undefined;
      metaData.indicator = undefined;
      metaData.dateLabel = undefined;

      // Tasks
      const dataToExport = {
        tasks: newTasks,
        metaData: metaData,
      };

      const jsonString = JSON.stringify(dataToExport, null, 2); // Stringify the data

      // Create a Blob from the JSON string
      const blob = new Blob([jsonString], { type: "application/json" });

      // Create an object URL from the Blob
      const url = URL.createObjectURL(blob);

      // Create a temporary <a> element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.json`; // Set the desired filename

      // Programmatically click the link to trigger the download
      document.body.appendChild(link); // Append to body
      link.click(); // Simulate a click
      document.body.removeChild(link); // Remove the link after clicking

      // Clean up: Revoke the object URL to free up memory
      URL.revokeObjectURL(url);

      // Success Notification
      notitifyFileGenSuccess(fileName, exportMethod);
    } else if (exportMethod === "word") {
      // Word export method
      setFExtension("docx");
      setGFileName(fileName);
      // Request a pdf for preview
      try {
        // Give export message
        setExportMessage(
          windowsT("export.exportMain.footer.exportProgress.genPreview")
        );
        // Make a post request to the server
        const response = await fetch(serverUrl + "/export-word?format=pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authorizationToken}`
          },
          body: JSON.stringify({
            tasks: newTasks,
            fileName: fileName,
            metaData: metaData,
            docTheme: window.app.themes.exportDocThemes[exportDocTheme],
          }),
        });
        if (!response.ok) {
          // If not successful
          setIsExporting(false);
          window.notificationManager.error(
            notificationsT("export.errors.heading"),
            `${notificationsT("export.errors.content.httpError")} ${
              response.status
            } - ${response.statusText}`
          );
          throw new Error(
            `HTTP error! status: ${response.status} - ${response.statusText}`
          );
        }
        // Set the preview as a .pdf document to view the document
        const blob = await response.blob();
        let urlPrev = window.URL.createObjectURL(blob);
        documentUrl.urlPrev = urlPrev;
        urlPrev += "#toolbar=0&navpanes=0&scrollbar=0&view=FitH";
        setDocPreLink(urlPrev);
      } catch (error) {
        // Error
        setIsExporting(false);
        window.notificationManager.error(
          notificationsT("export.errors.heading"),
          notificationsT("export.errors.content.failConnectServer")
        );
        return;
      }
      try {
        // Request the final .docx document for download
        setExportMessage(
          windowsT("export.exportMain.footer.exportProgress.genFinal")
        );
        const response2 = await fetch(serverUrl + "/export-word", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authorizationToken}`
          },
          body: JSON.stringify({
            tasks: newTasks,
            fileName: fileName,
            metaData: metaData,
            docTheme: window.app.themes.exportDocThemes[exportDocTheme],
          }),
        });

        // Check if the server response was successful

        if (!response2.ok) {
          // If not successful notify the user and throw an error
          setIsExporting(false);
          window.notificationManager.error(
            notificationsT("export.errors.heading"),
            `${notificationsT("export.errors.content.httpError")}`
          );
          throw new Error(
            `HTTP error! status: ${response.status} - ${response.statusText}`
          );
        }

        // Get the file content from the server's response as a Blob
        const downloadBlob = await response2.blob();

        // --- Triggering the Download in the Browser ---
        // Create a temporary URL for the Blob

        const url = window.URL.createObjectURL(downloadBlob);
        documentUrl.url = url; // Set the current download URL
      } catch (error) {
        // In case of an error
        setIsExporting(false);
        window.notificationManager.error(
          notificationsT("export.errors.heading"),
          notificationsT("export.errors.content.wordError")
        );
        return;
      }
      // Notify the succcess and show the preview window
      notitifyFileGenSuccess(fileName, exportMethod);
      setDocPreWindowVis(true);
    } else if (exportMethod === "pdf") {
      // Export PDF method
      setFExtension("pdf");
      setGFileName(fileName);
      try {
        setExportMessage(
          windowsT("export.exportMain.footer.exportProgress.genFinal")
        );
        const response = await fetch(serverUrl + "/export-word?format=pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authorizationToken}`
          },
          body: JSON.stringify({
            tasks: newTasks,
            fileName: fileName,
            metaData: metaData,
            docTheme: window.app.themes.exportDocThemes[exportDocTheme],
          }),
        });
        if (!response.ok) {
          setIsExporting(false);
          window.notificationManager.error(
            notificationsT("export.errors.heading"),
            `${notificationsT("export.errors.content.httpError")}`
          );
          throw new Error(
            `HTTP error! status: ${response.status} - ${response.statusText}`
          );
        }

        // Set the preview and download link
        const blob = await response.blob();
        let urlPrev = window.URL.createObjectURL(blob);
        documentUrl.url = urlPrev;
        documentUrl.urlPrev = urlPrev;
        urlPrev += "#toolbar=0&navpanes=0&scrollbar=0&view=FitH";
        setDocPreLink(urlPrev);
      } catch (error) {
        setIsExporting(false);
        // In case of connection error
        window.notificationManager.error(
          notificationsT("export.errors.heading"),
          notificationsT("export.errors.content.failConnectServer")
        );
        return;
      }
      // Notify success and show preview window
      notitifyFileGenSuccess(fileName, exportMethod);
      setDocPreWindowVis(true);
    } else if (exportMethod === "html") {
      // HTML export method
      setExportMessage(
        windowsT("export.exportMain.footer.exportProgress.genHTML")
      );
      try {
        // Parse data
        const dataToExport = {
          metaData: metaData,
          tasks: newTasks,
        };
        setFExtension("html");
        setGFileName(fileName);

        // Add the data from the tasks to the HTML code sample as a new var
        let finalHtml = htmlExportSample.replace(
          "const data = {};",
          `const data = ${JSON.stringify(dataToExport, null, 2)}`
        );

        // Add the theme variables to the document
        finalHtml = finalHtml.replace(
          `/* Theme */`,
          `/* Theme */
                --color-text: #${window.app.themes.exportDocThemes[exportDocTheme].colorText};
        --color-text-secondary: #${window.app.themes.exportDocThemes[exportDocTheme].colorTextSecondary};
        --color-heading-primary: #${window.app.themes.exportDocThemes[exportDocTheme].colorHeadingPrimary};
        --body-background-color: #${window.app.themes.exportDocThemes[exportDocTheme].bodyBackgroundColor};
        --taskOddColor: #${window.app.themes.exportDocThemes[exportDocTheme].taskOddColor};

        --seperator-color: #${window.app.themes.exportDocThemes[exportDocTheme].seperatorColor};
        --svg-fill-color: #${window.app.themes.exportDocThemes[exportDocTheme].svgFillColor};
        `
        );

        // Add the translated content to the document
        finalHtml = finalHtml.replace("[[dateLabel]]", listT("dateLabel"));
        finalHtml = finalHtml.replace("[[footer]]", listT("footer"));
        finalHtml = finalHtml.replace("[[taskIndicator]]", listT("indicator"));

        // Set the download and preview link
        const blob = new Blob([finalHtml], { type: "text/html" });
        let url = URL.createObjectURL(blob);
        documentUrl.url = url;
        documentUrl.urlPrev = url;
        url += "#toolbar=0&navpanes=0&scrollbar=0";
        setDocPreLink(url);
      } catch (error) {
        // In case of error
        setIsExporting(false);
        window.notificationManager.error(
          notificationsT("export.errors.heading"),
          notificationsT("export.errors.content.unexpectedError")
        );
        return;
      }
      // Notify of success and show preview window
      notitifyFileGenSuccess(fileName, exportMethod);
      setDocPreWindowVis(true);
    } else if (exportMethod === "txt") {
      // Text export method
      setExportMessage(
        windowsT("export.exportMain.footer.exportProgress.genTXT")
      );
      try {
        setFExtension("txt");
        setGFileName(fileName);

        // Generate TXT based of the data
        // Add the headings and date first
        let finalText = metaData.listName;
        metaData.date
          ? (finalText += "\n    " + listT("dateLabel") + metaData.date)
          : [];
        finalText += "\n    " + metaData.indicator;

        // Finally add the tasks
        tasks.map((task, i) => {
          finalText += "\n      " + task.name;
          task.desc
            ? task.desc.trim() !== ""
              ? (finalText += "\n          " + task.desc)
              : []
            : [];
        });

        // Add the footer
        finalText += "\n" + listT("footer");

        // Create a blob from the plain text
        const blob = new Blob([finalText], {
          type: "text/plain;charset=utf-8",
        });

        let url = URL.createObjectURL(blob);

        // Set the download and preview link
        documentUrl.url = url;
        documentUrl.urlPrev = url;
        url += "#toolbar=0&navpanes=0&scrollbar=0";
        setDocPreLink(url);
      } catch (error) {
        // In case of error
        setIsExporting(false);
        window.notificationManager.error(
          notificationsT("export.errors.heading"),
          notificationsT("export.errors.content.unexpectedError")
        );
        return;
      }
      // Notify of success and show preview window
      notitifyFileGenSuccess(fileName, exportMethod);
      setDocPreWindowVis(true);
    } else {
      // In case of unselected method or invalid method type
      // Warns the user with a notification
      window.notificationManager.warning(
        notificationsT("export.warnings.exportMethodFail.heading"),
        notificationsT("export.warnings.exportMethodFail.content")
      );
    }
    // Runs after the function has completed
    // Turns off the exporting animation on the export button
    setIsExporting(false);
  };

  // Hook functions

  // Show export window button
  const handleToggleExportWindowVis = (event) => {
    event.target.id === "export-window-btn" ? setExportWindowVis(true) : [];
  };

  // Handle export form input change
  const handleExportInputChange = (event) => {
    if (event.target.id === "ex-method") {
      setExportMethod(event.target.value);
    }
    if (event.target.id === "ex-fname") {
      setExportFileName(event.target.value);
    }
    if (event.target.id === "ex-date") {
      setExportDate(event.target.value);
    }
    if (event.target.id === "ex-lname") {
      setListName(event.target.value);
    }
    if (event.target.id === "ex-theme") {
      setExportDocTheme(event.target.value);
    }
  };

    const handleChangeTheme = (value) => {
      setExportDocTheme(value)
    }
        const handleChangeMethod = (value) => {
      setExportMethod(value)
    }

  // -- Import
  // Global Variables
  const importInput = useRef(null); // Reference for the input element

  // Functions

  // Import The Data
  const importData = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const newData = JSON.parse(e.target.result);
      if (newData.tasks) {
        const newTasks = newData.tasks.map((task, index) => {
          // Add the task but also create a new stable ID
          return { ...task, id: new Date().getTime() + index };
        });
        setTasks(newTasks);
      }

      // Import the metaData from the JSON file
      const metaData = newData.metaData;
      metaData.listName ? setListName(metaData.listName) : [];
      metaData.date ? setExportDate(metaData.date) : [];
      event.target.value = null;
    };
    reader.readAsText(selectedFile);
  };

  // Handler of the import button
  const handleImportClick = (event) => {
    // If you already have some progress it will warn you that by importing a file you are currently losing all your progress
    tasks.length > 0
      ? window.notificationManager.warning(
          notificationsT("main.warnings.heading"),
          notificationsT("main.warnings.content.importFile")
        )
      : [];
    importInput ? importInput.current.click() : [];
  };

  // -- Document Preview

  // Global variables
  const [docPreWindowVis, setDocPreWindowVis] = useState(false);
  const [docPreLink, setDocPreLink] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [exportWindowVis, setExportWindowVis] = useState(false);

  // Hook Functions

  const handleDocPreCloseClick = () => {
    setDocPreWindowVis(false);
    Object.keys(documentUrl).forEach((key) => {
      URL.revokeObjectURL(documentUrl[key]);
    });
  };

  useEffect(() => {
    return () => {
      if (docPreLink) {
        URL.revokeObjectURL(docPreLink);
      }
    };
  }, [docPreLink]); // Dependency

  // -- Delete Tasks

  // Global variable for 'Are you sure?' window visibility
  const [rUSureDeleteVis, setRUSureDeleteVis] = useState(false);

  // Hook function
  const handleToggleRUSure = (event) => {
    event
      ? event.target.id === "rusure-no-btn"
        ? setRUSureDeleteVis(false)
        : setRUSureDeleteVis(true)
      : setRUSureDeleteVis(false);
  };

  // Main function
  const handleDeleteTasks = () => {
    setTasks([]);
    handleToggleRUSure();
  };

  // Theme Options
  const themeOptions = useMemo(() => {
    if (
      window.app &&
      window.app.themes &&
      typeof window.app.themes.getExportThemes === "function"
    ) {
      // Use .map to create a new array of <option> elements
      return window.app.themes.getExportThemes().map((theme, i) => (
        <Select.Option key={theme.themeIndex || i} value={theme.themeIndex}>
        {theme.themeName}
        </Select.Option>
      ));
    }

    // If the function doesn't exist, return an empty array
    return [];
  }, [window.app]); // The dependency array ensures this code only re-runs if `window.app` changes

  // Main return
  return (
    <>
      {/* Themes component */}
      <Themes />

      {/* -- Windows -- */}
      {/* Document Preview window */}
      <Window
        zIndex={1001}
        visible={docPreWindowVis}
        className="appWindow preview-window"
        onClose={handleDocPreCloseClick}
      >
        <Window.Header>
          <h3 className="text-heading">
            {windowsT("export.exportPreview.heading")} ({gFileName}.{fExtension}
            )
          </h3>
        </Window.Header>
        <Window.Content className="docPreviewContent">
          <div className={`docPreviewContainer ${(fExtension === "html") ? "html" : "pdf"}`}>
          <iframe
            fullscreen
            className="docPreview"
            src={docPreLink || undefined}
          ></iframe>
          </div>
        </Window.Content>
        <Window.Footer>
          <button onClick={downloadDocument} className="download-btn">
            {windowsT("export.exportPreview.footer.downloadButton")}
          </button>
        </Window.Footer>
      </Window>

      {/* 'Are you sure?' window */}
      <Window
        zIndex={1002}
        visible={rUSureDeleteVis}
        className="appWindow delete-window"
        onClose={handleToggleRUSure}
      >
        <Window.Header>
          <h3 className="text-heading">{windowsT("rUSure.heading")}</h3>
        </Window.Header>
        <Window.Content>{windowsT("rUSure.content")}</Window.Content>
        <Window.Footer className="rUSure-footer">
          <button
            id="rusure-no-btn"
            onClick={handleToggleRUSure}
            className="rUSure-no-btn"
          >
            {windowsT("rUSure.footer.noButton")}
          </button>
          <button onClick={handleDeleteTasks} className="rUSure-yes-btn">
            {windowsT("rUSure.footer.yesButton")}
          </button>
        </Window.Footer>
      </Window>

      {/* Export Window */}
      <Window
        zIndex={1000}
        className="appWindow export-window"
        visible={exportWindowVis}
        onClose={handleExportCloseClick}
      >
        <Window.Header>
          <h3 className="text-heading">
            {windowsT("export.exportMain.heading")}
          </h3>
        </Window.Header>
        <Window.Content>
          <div className="export-form">
            <div className="export-method">
              <label>
                {windowsT("export.exportMain.content.method.label")}
              </label>
              <Select 
          onChange={handleChangeMethod}
          ref={themeSelect}
          name="method"
          defaultValue={exportMethod}
          className="select"
        contentClassName="selectContent"
          contentWrapperClassName="selectContentWrapper"
          toggleButtonClassName="selectToggleButton"
          headerClassName="selectHeader"
          optionClassName="selectOption"
          style={{"zIndex": "1001"}}
          width={isMobile ? "100%" : undefined}
        >
          <Select.Option key={new Date().getTime() + 1} value="">
                  {windowsT(
                    "export.exportMain.content.method.values.unselected"
                  )}
                </Select.Option>
                <Select.Option key={new Date().getTime() + 2} value="json">
                  {windowsT("export.exportMain.content.method.values.json")}
                </Select.Option>
                <Select.Option key={new Date().getTime() + 3} value="word">
                  {windowsT("export.exportMain.content.method.values.word")}
                </Select.Option>
                <Select.Option key={new Date().getTime() + 4} value="html">
                  {windowsT("export.exportMain.content.method.values.html")}
                </Select.Option>
                <Select.Option key={new Date().getTime() + 5} value="pdf">
                  {windowsT("export.exportMain.content.method.values.pdf")}
                </Select.Option>
                <Select.Option key={new Date().getTime() + 6} value="txt">
                  {windowsT("export.exportMain.content.method.values.text")}
                </Select.Option>
        </Select>
            </div>
            <div className="export-name">
              <label>
                {windowsT("export.exportMain.content.fileName.label")}
              </label>
              <input
                id="ex-fname"
                onChange={handleExportInputChange}
                value={exportFileName}
                type="text"
                name=""
                minLength="1"
                maxLength="25"
              />
            </div>
            <div className="export-lname">
              <label>
                {windowsT("export.exportMain.content.listName.label")}
              </label>
              <input
                id="ex-lname"
                onChange={handleExportInputChange}
                value={listName}
                type="text"
                name=""
                minLength="1"
                maxLength="25"
              />
            </div>
            <div className="export-date">
              <label>
                {windowsT("export.exportMain.content.listCompletionDate.label")}
              </label>
              <input
                id="ex-date"
                onChange={handleExportInputChange}
                value={exportDate}
                type="date"
                name="list_date"
                placeholder="The list date that you need to complete it by"
              />
            </div>
            <div
              className={`export-theme ${
                validMethodsExportThemes.includes(exportMethod)
                  ? ""
                  : "disabled hidden"
              }`}
            >
              <label>
                {windowsT("export.exportMain.content.documentTheme.label")}
              </label>
              <Select 
          onChange={handleChangeTheme}
          ref={themeSelect}
          name="theme"
          defaultValue={exportDocTheme}
          className="select"
        contentClassName="selectContent"
          contentWrapperClassName="selectContentWrapper"
          toggleButtonClassName="selectToggleButton"
          headerClassName="selectHeader"
          optionClassName="selectOption"
          width={isMobile ? "100%" : undefined}
          style={{"zIndex": "1001"}}
        >
          {themeOptions}
        </Select>
            </div>
          </div>
        </Window.Content>
        <Window.Footer>
          {isExporting ? (
            <div className="loaderContainer">
              <span>{exportMessage}</span>
              <div className="loader"></div>
            </div>
          ) : (
            <button onClick={exportData} className="export-btn">
              {windowsT("export.exportMain.footer.exportButton")}
            </button>
          )}
        </Window.Footer>
      </Window>

      {/* -- Main Content -- */}
      <div className="to-do-list">
        {/* Heading */}
        <h1 className="text-heading mainAppHeading">{mainT("main_heading")}</h1>

        {/* To-Do List */}
        <div className="list-backdrop">
          {/* Add Task form */}
          <div className="flex-break content-container">
          <div id="task-name-group" className="input-group">
            <input
            id="task-name"
            type="text"
            placeholder={mainT("list_backdrop.task_name")}
            value={newTask.name}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTask();
              }
            }}
          />
          <button className="add-button" onClick={addTask}>
            {mainT("list_backdrop.add_button")}
          </button>
          </div>
          </div>
          <div className="flex-break content-container">
            <textarea
              id="task-desc"
              type="text"
              onChange={handleInputChange}
              placeholder={mainT("list_backdrop.task_desc")}
            />
          </div>

          {/* Export, Clear Tasks and Import buttons */}
          <div className="flex-break content-container">
            <div id="buttonsFunctionsContainer">
            <button
              id="export-window-btn"
              onClick={handleToggleExportWindowVis}
              disabled={tasks.length < 1}
              className="genericButton export-button"
            >
              {mainT("list_backdrop.export_button")}
              <ExportImage className="export-image"></ExportImage>
            </button>
            <button
              onClick={handleToggleRUSure}
              disabled={tasks.length < 1}
              className="genericButton delete-button"
            >
              {mainT("list_backdrop.delete_button")}
              <DeletePicture className="delete-image"></DeletePicture>
            </button>
            <button onClick={handleImportClick} className="genericButton import-button">
              {mainT("list_backdrop.import_button")}
              <ImportImage className="import-image"></ImportImage>
            </button>
            {/* Import File Input (Not visible) */}
            <input
              ref={importInput}
              onChange={importData}
              type="file"
              id="importInput"
              className="hiddenImport"
              accept=".json"
            />
            </div>
          </div>
        </div>
        {/* Main List */}
        <main className="scrollable-list-wrapper-grid">
          <ul className={`list-container`}>
            {tasks.length === 0 ? (
              <p className="no-tasks-message">{mainT("list.no_tasks")}</p>
            ) : (
              tasks.map((task, index) => (
                // Use ListItem component
                <ListItem
                  // Pass all the necessary props
                  key={task.id || index}
                  task={task}
                  index={index}
                  isLast={tasks.length - 1 === index}
                  deleteCurrentTask={memoizedDeleteTask}
                  moveTaskDown={memoizedMoveTaskDown}
                  moveTaskUp={memoizedMoveTaskUp}
                  editTask={memoizedEditTask}
                  handleEditMode={memoizedEditModeTask}
                  isDeleting={tasks[index].delete}
                  isEditing={editingTaskId === task.id}
                  onSetEditing={handleSetEditingId}
                />
              ))
            )}
          </ul>
        </main>
      </div>
    </>
  );
}

export default ToDoList;
