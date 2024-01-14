import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const BASE_URL = "http://localhost:3000/versions";

const App = () => {
  const [forms, setForms] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [currentForm, setCurrentForm] = useState(null);
  const [highestVersion, setHighestVersion] = useState(1.0);
  const textAreaRef = useRef([]);

  useEffect(() => {
    axios
      .get(BASE_URL)
      .then((response) => {
        const versions = response.data;
        console.log("Fetched versions:", versions);
        setForms(versions);
        if (versions.length > 0) {
          const latestVersion = Math.max(...versions.map((v) => v.version));
          setCurrentVersion(latestVersion);
          const selectedForm = versions.find(
            (v) => v.version === latestVersion
          );
          if (selectedForm && selectedForm.fields) {
            // Sort fields by id
            const sortedFields = [...selectedForm.fields].sort(
              (a, b) => a.id - b.id
            );
            setCurrentForm({ ...selectedForm, fields: sortedFields });
          } else {
            setCurrentForm(selectedForm);
          }
          setHighestVersion(latestVersion);
        }
      })
      .catch((error) => console.error("Error fetching versions:", error));
  }, []);

  const adjustHeight = (index) => {
    const textArea = textAreaRef.current[index];
    if (textArea) {
      textArea.style.height = "auto";
      textArea.style.height = textArea.scrollHeight + "px";
    }
  };

  useEffect(() => {
    if (currentForm && currentForm.fields) {
      currentForm.fields.forEach((_, index) => adjustHeight(index));
    }
  }, [currentForm]);

  const handleVersionChange = (versionValue) => {
    console.log("Version changed:", versionValue);
    const version = parseFloat(versionValue);
    const selectedForm = forms.find((form) => form.version === version);

    if (selectedForm && selectedForm.fields) {
      // Sort fields by id
      const sortedFields = [...selectedForm.fields].sort((a, b) => a.id - b.id);
      setCurrentForm({ ...selectedForm, fields: sortedFields });
    } else {
      setCurrentForm(selectedForm);
    }

    setCurrentVersion(version);
  };

  // this is working great!!!!!!!!!!!!!!!!

  const handleVersionNameChange = async (e, version) => {
    console.log("Version name changed:", e.target.value, version);
    const updatedForms = forms.map((form) =>
      form.version === version ? { ...form, name: e.target.value } : form
    );
    setForms(updatedForms);

    // Find the form that was updated
    const updatedForm = updatedForms.find((form) => form.version === version);

    // Update the backend with the new version name
    try {
      await axios.put(`${BASE_URL}/${updatedForm.id}`, updatedForm);
      console.log("Version name updated in backend");
    } catch (error) {
      console.error("Error updating version name:", error);
    }
  };

  const handleFieldChange = async (index, value) => {
    const updatedForm = { ...currentForm };
    updatedForm.fields[index].content = value;
    setCurrentForm(updatedForm);
    adjustHeight(index);

    // Update the backend with the new field value
    try {
      await axios.put(`${BASE_URL}/${currentForm.id}`, updatedForm);
      updateFormInState(updatedForm);
      console.log("Field updated");
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const handleDeleteField = async (index) => {
    // Remove the field from the current form
    const updatedFields = currentForm.fields.filter((_, idx) => idx !== index);
    const updatedForm = { ...currentForm, fields: updatedFields };
    setCurrentForm(updatedForm);

    // Send the updated form to the backend
    try {
      await axios.put(`${BASE_URL}/${currentForm.id}`, updatedForm);
      updateFormInState(updatedForm);
      console.log("Field deleted");
    } catch (error) {
      console.error("Error deleting field:", error);
    }
  };

  const updateFormInState = (updatedForm) => {
    const updatedForms = forms.map((f) =>
      f.version === currentVersion ? updatedForm : f
    );
    setForms(updatedForms);
  };

  const createNewVersion = async () => {
    const newVersionNumber = Math.floor(highestVersion) + 1;
    setHighestVersion(newVersionNumber);

    const newVersion = {
      version: newVersionNumber,
      name: `Version ${newVersionNumber}`,
      fields: [
        { role: "system", content: "" },
        { role: "user", content: "" },
      ],
    };

    try {
      const response = await axios.post(BASE_URL, newVersion);
      console.log("Created new version:", response.data);
      setForms([...forms, response.data]);
      setCurrentVersion(newVersionNumber);
      setCurrentForm(response.data);
    } catch (error) {
      console.error("Error creating new version:", error);
    }
  };
  // working great!!!!!!!!
  const deleteVersion = async () => {
    if (forms.length <= 1) {
      alert("Cannot delete the last remaining version.");
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/${currentForm.id}`);
      const updatedForms = forms.filter(
        (form) => form.version !== currentVersion
      );
      setForms(updatedForms);

      if (updatedForms.length > 0) {
        setCurrentVersion(updatedForms[0].version);
        setCurrentForm(updatedForms[0]);
      } else {
        setCurrentVersion(null);
        setCurrentForm(null);
      }
    } catch (error) {
      console.error("Error deleting version:", error);
    }
  };

  const duplicateVersion = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/duplicate/${currentForm.id}`
      );
      const duplicatedVersion = response.data;

      // Assign a new version number
      const newVersionNumber = Math.floor(highestVersion) + 1;
      duplicatedVersion.version = newVersionNumber;
      setHighestVersion(newVersionNumber);

      // Update state with the new duplicated version
      const newForms = [...forms, duplicatedVersion];
      setForms(newForms);
      setCurrentVersion(newVersionNumber);
      setCurrentForm(duplicatedVersion);
    } catch (error) {
      console.error("Error duplicating version:", error);
    }
  };

  const handleSubmit = async () => {
    if (!currentForm?.fields) {
      console.error("Current form or fields is undefined.");
      return;
    }

    const responseContent = "Simulated ChatGPT Response";
    const updatedFields = [
      ...currentForm.fields,
      { role: "assistant", content: responseContent },
    ];

    const updatedForm = {
      ...currentForm,
      fields: updatedFields,
      // Ensure the name is also sent
      name: currentForm.name,
    };

    try {
      const response = await axios.put(
        `${BASE_URL}/${currentForm.id}`,
        updatedForm
      );
      const updatedFormFromResponse = response.data;

      // Update the current form and forms array with the updated data
      setCurrentForm(updatedFormFromResponse);
      updateFormInState(updatedFormFromResponse);
      console.log("Form updated in backend");
    } catch (error) {
      console.error("Error updating form:", error);
    }
  };

  const addMessageField = async () => {
    if (!currentForm || !currentForm.fields) {
      console.error("Current form or fields is undefined.");
      return;
    }

    // Determine the role for the new field based on the last field's role
    const lastFieldType =
      currentForm.fields[currentForm.fields.length - 1]?.role || "user";
    console.log("lastFieldType", lastFieldType);
    const newFieldType = lastFieldType === "user" ? "assistant" : "user";
    console.log("newFieldType", newFieldType);

    // Append the new field to the current form's fields
    const updatedFields = [
      ...currentForm.fields,
      { role: newFieldType, content: "" },
    ];
    console.log("updatedFields", updatedFields);
    const updatedForm = { ...currentForm, fields: updatedFields };
    console.log("updatedForm", updatedForm);

    // Update the backend and then the local state
    try {
      const response = await axios.put(
        `${BASE_URL}/${currentForm.id}`,
        updatedForm
      );
      const updatedFormFromResponse = response.data;
      console.log("updatedFormFromResponse", updatedFormFromResponse);

      // Update the current form and forms array with the updated data from the backend
      setCurrentForm(updatedFormFromResponse);
      updateFormInState(updatedFormFromResponse);
      console.log("Form updated in backend with new field");
    } catch (error) {
      console.error("Error updating form with new field:", error);
    }
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
                value={currentVersion || ""}
              >
                {forms.map((form) => (
                  <option key={form.id || form.version} value={form.version}>
                    {" "}
                    {/* Use a unique identifier */}
                    {form.name || `Version ${form.version}`}
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
        {currentForm?.fields?.map((field, index) => (
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
              // disabled={
              //   currentForm?.fields?.length === 0 ||
              //   currentForm?.fields[currentForm?.fields?.length - 1]?.role !==
              //     "user"
              // }
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
