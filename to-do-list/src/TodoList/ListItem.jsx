// --- Main ListItem component ---\\
/*
    Used on ToDoList.jsx
*/
import React, { useCallback, useEffect, useState } from "react";

// Components
import AutoResizeTextarea from "../AutoResizeTextarea/AutoResizeTextarea";
// Language translation library
import { useTranslation } from "react-i18next";

// Import Necessary SVGs
import DeletePicture from "./delete.svg?react";
import MoveUp from "./move_up.svg?react";
import MoveDown from "./move_down.svg?react";
import Expand from "./show.svg?react";
import Collapse from "./hide.svg?react";
import EditMode from "./edit.svg?react";
import EditModeOff from "./edit_off.svg?react";

// Main Code
function ListItem({
  task,
  index,
  deleteCurrentTask,
  moveTaskDown,
  moveTaskUp,
  isLast,
  editTask,
  isDeleting,
  isEditing,
  onSetEditing,
}) {
  // -- Global Variables --
  const [descHidden, setDescHidden] = useState(true);
  const [editedTask, setEditedTask] = useState({
    name: task.name,
    desc: task.desc,
  });

  // -- Language Translation Namespaces
  const { t: mainT, i18n } = useTranslation();
  const { t: notificationsT } = useTranslation("notifications");

  // -- Hooks and Handlers --

  // -- Edit Mode
  // Update the element when global variable gets changed on ToDoList.jsx
  useEffect(() => {
    setEditedTask({ name: task.name, desc: task.desc });
  }, [task.name, task.desc, isEditing]);

  // Handle input change for edit mode
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditedTask((prev) => ({ ...prev, [name]: value }));
  };

  // Edits the task and saves
  const handleSaveChanges = useCallback(() => {
    editTask(task.id, { name: editedTask.name, desc: editedTask.desc });
  }, [editTask, task.id, editedTask.name, editedTask.desc]);

  // The toggle EditMode handler
  const handleToggleEditMode = () => {
    if (isEditing) {
      // If we are currently in edit mode, save the changes...
      handleSaveChanges();
      // ... and tell the parent that *no* task is being edited.
      onSetEditing(null);
    } else {
      // If we are not in edit mode, tell the parent to make THIS task the active one.
      window.notificationManager.info(
        notificationsT("main.infos.editMode.heading"),
        notificationsT("main.infos.editMode.content")
      );
      onSetEditing(task.id);
    }
  };

  // -- Move and delete handlers
  // Memoized Handlers for delete/move
  const handleDelete = useCallback(
    () => deleteCurrentTask(task.id),
    [deleteCurrentTask, task.id]
  );
  const handleMoveDown = useCallback(() => {
    setDescHidden(true);
    moveTaskDown(index);
  }, [moveTaskDown, index]);
  const handleMoveUp = useCallback(() => {
    setDescHidden(true);
    moveTaskUp(index);
  }, [moveTaskUp, index]);

  // -- Main Element --
  return (
    <li className={`to-do-item ${isDeleting ? "deleting" : ""}`}>
      <div className={`to-do-item-content`}>
        <div className="to-do-item-topContainer">
          <span className="text name-container">
            <span className={"task-number"}>{index + 1}. </span>
            {/* Task name element as a textarea for easier editing */}
            <div className="task-autoTextareaWrapper">
            <AutoResizeTextarea
              readOnly={!isEditing}
              onChange={handleInputChange}
              className="text-white task-text"
              value={editedTask.name}
              name="name"
                              autocorrect={isEditing ? "on" : "off"}
                autocapitalize={isEditing ? "on" : "off"}
                spellcheck={isEditing ? "true" : "false"}
            />
            </div>
          </span>
          <div className="buttons">
            {/* Expand/Collapse button for description */}
            {task.desc?.trim() && (
              <div className="expand-container">
                <button
                  className="expand-button"
                  onClick={() => setDescHidden((d) => !d)}
                >
                  {descHidden ? (
                    <Expand
                      width="1.5rem"
                      height="1.5rem"
                      fill="rgba(180, 180, 180, 0.87)"
                      className="task-image"
                    />
                  ) : (
                    <Collapse
                      width="1.5rem"
                      height="1.5rem"
                      fill="rgba(180, 180, 180, 0.87)"
                      className="task-image"
                    />
                  )}
                </button>
                <div className="desc-triggerContainer">
                  <span className="text-white desc-trigger-text">
                  {descHidden
                    ? mainT("list.desc_trigger_text.show")
                    : mainT("list.desc_trigger_text.hide")}
                </span>
                </div>
              </div>
            )}
            {/* Edit Button */}
            <button className="edit-button" onClick={handleToggleEditMode}>
              {isEditing ? (
                <EditModeOff
                  width="1.5rem"
                  height="1.5rem"
                  fill="rgba(180, 180, 180, 0.87)"
                  className="add-image"
                />
              ) : (
                <EditMode
                  width="1.5rem"
                  height="1.5rem"
                  fill="rgba(180, 180, 180, 0.87)"
                  className="add-image"
                />
              )}
            </button>
            {/* Move/Delete Buttons */}
            <button
              className="move-button"
              onClick={handleMoveUp}
              disabled={index === 0}
            >
              <MoveUp
                width="1.5rem"
                height="1.5rem"
                fill="rgba(180, 180, 180, 0.87)"
                className="add-image"
              />
            </button>
            <button
              className="move-button"
              onClick={handleMoveDown}
              disabled={isLast}
            >
              <MoveDown
                width="1.5rem"
                height="1.5rem"
                fill="rgba(180, 180, 180, 0.87)"
                className="add-image"
              />
            </button>
            <button className="delete-button" onClick={handleDelete}>
              <DeletePicture
                width="1.5rem"
                height="1.5rem"
                fill="rgba(180, 180, 180, 0.87)"
                className="delete-image"
              />
            </button>
          </div>
        </div>
        {/* Description Section */}
        {task.desc?.trim() && (
          <div
            className={`desc ${
              descHidden ? "no-pointer all no-select hidden" : ""
            }`}
          >
            <div className="task-desc-container">
              {/* Task description element as a textarea for easier editing */}
              <div className="task-autoTextareaWrapper">
              <AutoResizeTextarea
                readOnly={!isEditing}
                onChange={handleInputChange}
                className={`text-white desc-text`}
                value={editedTask.desc}
                name="desc"
                autocorrect={isEditing ? "on" : "off"}
                autocapitalize={isEditing ? "on" : "off"}
                spellcheck={isEditing ? "true" : "false"}
              />
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

// -- Use React.memo for less lagg
export default React.memo(ListItem);