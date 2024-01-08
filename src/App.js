import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  const [forms, setForms] = useState([
    {
      version: 1.0,
      name: "Version 1", // Add a name field
      fields: [
        { role: "system", content: "" },
        { role: "user", content: "" },
      ],
    },
  ]);
  const [currentVersion, setCurrentVersion] = useState(1.0);
  const [currentForm, setCurrentForm] = useState(forms[0]);
  const [highestVersion, setHighestVersion] = useState(1.0);

  console.log("\n\nforms", forms);

  const textAreaRef = useRef([]);

  const adjustHeight = (index) => {
    const textArea = textAreaRef.current[index];
    if (textArea) {
      textArea.style.height = "auto";
      textArea.style.height = textArea.scrollHeight + "px";
    }
  };

  useEffect(() => {
    currentForm.fields.forEach((_, index) => adjustHeight(index));
  }, [currentForm.fields]);

  const handleVersionNameChange = (e, version) => {
    const updatedForms = forms.map((form) =>
      form.version === version ? { ...form, name: e.target.value } : form
    );
    setForms(updatedForms);
  };

  const handleFieldChange = (index, value) => {
    const updatedForm = { ...currentForm };
    updatedForm.fields[index].content = value;
    setCurrentForm(updatedForm);
    adjustHeight(index);
  };

  const handleDeleteField = (index) => {
    const updatedFields = currentForm.fields.filter((_, idx) => idx !== index);
    const updatedForm = { ...currentForm, fields: updatedFields };
    setCurrentForm(updatedForm);
    updateFormInState(updatedForm);
  };

  const deleteVersion = () => {
    if (forms.length <= 1) {
      alert("Cannot delete the last remaining version.");
      return;
    }

    const updatedForms = forms.filter(
      (form) => form.version !== currentVersion
    );
    setForms(updatedForms);

    // Optionally, select the first version after deletion
    const nextCurrentForm = updatedForms[0];
    setCurrentVersion(nextCurrentForm.version);
    setCurrentForm(nextCurrentForm);
  };

  const addMessageField = () => {
    const lastFieldType =
      currentForm.fields[currentForm.fields.length - 1].role;
    const newFieldType = lastFieldType === "user" ? "assistant" : "user";

    const updatedForm = {
      ...currentForm,
      fields: [...currentForm.fields, { role: newFieldType, content: "" }],
    };
    setCurrentForm(updatedForm);
    updateFormInState(updatedForm);
  };

  const createNewVersion = () => {
    // Calculate the new version number as a whole number
    const newVersionNumber = Math.floor(highestVersion) + 1;

    // Update the highest version number if necessary
    setHighestVersion(Math.max(newVersionNumber, highestVersion));

    const newVersion = {
      version: newVersionNumber,
      name: `Version ${newVersionNumber}`, // Default name for the new version
      fields: [
        { role: "system", content: "" },
        { role: "user", content: "" },
      ],
    };

    setForms([...forms, newVersion]);
    setCurrentVersion(newVersionNumber);
    setCurrentForm(newVersion);
  };

  const duplicateVersion = () => {
    // Calculate the new version number and round it to one decimal place
    let newVersionNumber = parseFloat((highestVersion + 0.1).toFixed(1));

    // Ensure the new version number is greater than the highest version number
    if (newVersionNumber <= highestVersion) {
      newVersionNumber = parseFloat((highestVersion + 0.1).toFixed(1));
    }

    // Update the highest version number
    setHighestVersion(newVersionNumber);

    // Deep copy the fields
    const duplicatedFields = currentForm.fields.map((field) => ({ ...field }));

    // Determine the name for the new version
    const newVersionName = `Version ${newVersionNumber} (copy of Version ${currentVersion})`;

    // Create a new version with the determined name
    const newVersion = {
      version: newVersionNumber,
      name: newVersionName,
      fields: duplicatedFields,
    };

    // Add the new version to the forms array and update the state
    setForms([...forms, newVersion]);
    setCurrentVersion(newVersionNumber);
    setCurrentForm(newVersion);
  };

  const handleSubmit = async () => {
    // Simulate sending data to ChatGPT and getting a response
    const response = "Simulated ChatGPT Response";
    const updatedForm = {
      ...currentForm,
      fields: [...currentForm.fields, { role: "assistant", content: response }],
    };
    setCurrentForm(updatedForm);
    updateFormInState(updatedForm);
  };

  const updateFormInState = (updatedForm) => {
    const updatedForms = forms.map((f) =>
      f.version === currentVersion ? updatedForm : f
    );
    setForms(updatedForms);
  };

  const handleVersionChange = (version) => {
    const selectedForm = forms.find((f) => f.version === parseFloat(version));
    setCurrentVersion(parseFloat(version));
    setCurrentForm(selectedForm);
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-1"></div>{" "}
        {/* This empty column aligns with the label column */}
        <div className="col-md-10">
          <div className="mb-2">
            <button
              className="btn btn-primary px-4 mb-3"
              onClick={createNewVersion}
            >
              New
            </button>
          </div>
          <div className="row mt-2 mb-1">
            <div className="col-md-3">
              <select
                className="form-select"
                onChange={(e) => handleVersionChange(e.target.value)}
                value={currentVersion}
              >
                {forms.map((form) => (
                  <option key={form.version} value={form.version}>
                    {form.name || `Version ${form.version}`}
                    {/* Display the version name */}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-center">
              <button
                className="btn btn-danger px-4 me-4"
                onClick={deleteVersion}
              >
                Delete Version
              </button>
              <button className="btn btn-info px-4" onClick={duplicateVersion}>
                Duplicate
              </button>
            </div>
            <div className="row mb-3">
              <div className="col-md-3 mt-1">
                <label htmlFor="versionName" className="form-label">
                  Version Name:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="versionName"
                  placeholder="Enter version name"
                  value={
                    forms.find((form) => form.version === currentVersion)
                      ?.name || ""
                  }
                  onChange={(e) => handleVersionNameChange(e, currentVersion)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <form className="mt-4">
        {currentForm.fields.map((field, index) => (
          <div key={index} className="row mb-3 align-items-center">
            <div className="col-md-1">
              <label className="form-label wrapped-label fw-bold">
                {field.role}
              </label>
            </div>
            <div className="col-md-9">
              <textarea
                ref={(el) => (textAreaRef.current[index] = el)}
                className="form-control"
                value={field.content}
                onChange={(e) => handleFieldChange(index, e.target.value)}
                style={{ overflowY: "hidden" }}
              />
            </div>
            <div className="col-md-1">
              {field.role !== "system" && (
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteField(index)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </form>

      <div className="row">
        <div className="col-md-1"></div>{" "}
        {/* This empty column aligns with the label column */}
        <div className="col-md-10">
          <div className="d-flex justify-content-between mb-3">
            <button
              className="btn btn-secondary me-2 px-4"
              onClick={addMessageField}
            >
              Add
            </button>
            <button
              className="btn btn-success me-2 px-4"
              onClick={handleSubmit}
              disabled={
                currentForm.fields.length === 0 ||
                currentForm.fields[currentForm.fields.length - 1].role !==
                  "user"
              }
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
