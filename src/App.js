import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  const [forms, setForms] = useState([
    {
      version: 1.0,
      fields: [
        { label: "SYSTEM", value: "" },
        { label: "USER", value: "" },
      ],
    },
  ]);
  const [currentVersion, setCurrentVersion] = useState(1.0);
  const [currentForm, setCurrentForm] = useState(forms[0]);

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

  const handleFieldChange = (index, value) => {
    const updatedForm = { ...currentForm };
    updatedForm.fields[index].value = value;
    setCurrentForm(updatedForm);
    adjustHeight(index);
  };

  const handleDeleteField = (index) => {
    const updatedFields = currentForm.fields.filter((_, idx) => idx !== index);
    const updatedForm = { ...currentForm, fields: updatedFields };
    setCurrentForm(updatedForm);
    updateFormInState(updatedForm);
  };

  const addMessageField = () => {
    const lastFieldType =
      currentForm.fields[currentForm.fields.length - 1].label;
    const newFieldType = lastFieldType === "USER" ? "ASSISTANT" : "USER";

    const updatedForm = {
      ...currentForm,
      fields: [...currentForm.fields, { label: newFieldType, value: "" }],
    };
    setCurrentForm(updatedForm);
    updateFormInState(updatedForm);
  };

  const createNewVersion = () => {
    const newVersion = {
      version: Math.floor(currentVersion) + 1,
      fields: [
        { label: "SYSTEM", value: "" },
        { label: "USER", value: "" },
      ],
    };
    setForms([...forms, newVersion]);
    setCurrentVersion(newVersion.version);
    setCurrentForm(newVersion);
  };

  const duplicateVersion = () => {
    const newVersion = {
      version: currentVersion + 0.1,
      fields: [...currentForm.fields],
    };
    setForms([...forms, newVersion]);
    setCurrentVersion(newVersion.version);
    setCurrentForm(newVersion);
  };

  const handleSubmit = async () => {
    // Simulate sending data to ChatGPT and getting a response
    const response = "Simulated ChatGPT Response";
    const updatedForm = {
      ...currentForm,
      fields: [...currentForm.fields, { label: "ASSISTANT", value: response }],
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
            <button className="btn btn-primary px-4" onClick={createNewVersion}>
              New
            </button>
          </div>
          <div className="row mt-2">
            <div className="col-md-3">
              <select
                className="form-select"
                onChange={(e) => handleVersionChange(e.target.value)}
                value={currentVersion}
              >
                {forms.map((form) => (
                  <option key={form.version} value={form.version}>
                    Version {form.version}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-center">
              <button className="btn btn-info px-4" onClick={duplicateVersion}>
                Duplicate
              </button>
            </div>
          </div>
        </div>
      </div>

      <form className="mt-4">
        {currentForm.fields.map((field, index) => (
          <div key={index} className="row mb-3 align-items-center">
            <div className="col-md-1">
              <label className="form-label wrapped-label fw-bold">
                {field.label}
              </label>
            </div>
            <div className="col-md-9">
              <textarea
                ref={(el) => (textAreaRef.current[index] = el)}
                className="form-control"
                value={field.value}
                onChange={(e) => handleFieldChange(index, e.target.value)}
                style={{ overflowY: "hidden" }}
              />
            </div>
            <div className="col-md-1">
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteField(index)}
              >
                Delete
              </button>
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
                currentForm.fields[currentForm.fields.length - 1].label !==
                  "USER"
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
