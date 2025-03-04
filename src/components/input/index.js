import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber as InputNum } from "primereact/inputnumber";
import { Password as Pwd } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Dropdown as Drp } from "antd";
import { MultiSelect as MulSel } from "primereact/multiselect";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from 'primereact/checkbox';
import { AudioRecorder, NormalLabel } from "@/components";

export const Input = (props) => {
  const {
    inputParentClassName,
    hasIcon,
    inputParentStyle,
    labelProps,
    inputLeftIconProps,
    inputClassName,
    inputRightIconProps,
    labelDownProps,
    isLoading,
    iconProps,
    float,
    floatLabelProps,
    ...restProps
  } = props && props.inputProps;

  const [localIsRecording, setLocalIsRecording] = useState(false);

  const handleAudioRecorded = (audioBlob) => {
    inputRightIconProps?.onRecordValueChange(audioBlob);
  };

  const handleRecordingStateChangeLocal = (isRecord) => {
    setLocalIsRecording(isRecord);
    inputRightIconProps?.onRecordingStateChange(isRecord);
  };

  useEffect(() => {
    if (!inputRightIconProps?.isRecording) {
      setLocalIsRecording(inputRightIconProps?.isRecording);
    }
  }, [inputRightIconProps?.isRecording]);

  return (
    <>
      {labelProps?.text && inputRightIconProps?.display && (
        <>
          <div className={`${labelProps.labelMainClassName || "pb-1"}`}>
            <NormalLabel
              labelClass={labelProps.inputLabelClassName}
              text={labelProps.text}
              labelStyle={labelProps.parentStyle}
              spanText={labelProps.spanText}
              spanClass={labelProps.inputLabelSpanClassName}
            />
          </div>
        </>
      )}
      <div
        className={`custom_input ${inputParentClassName} ${inputRightIconProps?.audio?.display ? "p-input-icon-right" : ""
          } ${hasIcon ? "p-input-icon-right" : ""} ${float ? "p-float-label " : ""
          }`}
        style={inputParentStyle}
      >
        {labelProps?.text && !inputRightIconProps?.display && (
          <div className={`${labelProps.labelMainClassName || "pb-1"}`}>
            <NormalLabel
              labelClass={labelProps.inputLabelClassName}
              text={labelProps.text}
              labelStyle={labelProps.parentStyle}
              spanText={labelProps.spanText}
              spanClass={labelProps.inputLabelSpanClassName}
            />
          </div>
        )}
        {localIsRecording && (
          <i className="flex justify-content-center w-full">
            <i className="pi pi-spin pi-spinner  pl-0 " />
          </i>
        )}
        {isLoading && (
          <i className="flex justify-content-center w-full">
            <i className="flex justify-content center align-items-end pt-2 pb-2 pi pi-spin pi-spinner" />
          </i>
        )}
        {inputLeftIconProps?.display && (
          <>
            {inputLeftIconProps?.audio?.display ? (
              <div>
                <AudioRecorder
                  onAudioRecorded={handleAudioRecorded}
                  onRecordingStateChange={handleRecordingStateChangeLocal}
                  disabled={
                    inputLeftIconProps?.disabled ||
                    (inputLeftIconProps?.isRecording && !localIsRecording)
                  }
                  isRecording={localIsRecording}
                  customClass={inputLeftIconProps.audioCustomClass}
                  customStyle={inputLeftIconProps.audioCustomStyle}
                />
              </div>
            ) : (
              <span className={inputLeftIconProps.inputLeftIconClassName}>
                {inputLeftIconProps.icon}
              </span>
            )}
          </>
        )}
        <InputText
          className={`${inputClassName}`}
          {...restProps}
          autoComplete={process?.env?.NEXT_PUBLIC_AUTO_COMPLETE}
        />
        {inputRightIconProps?.display && (
          <>
            {inputRightIconProps?.audio?.display ? (
              <i className="flex">
                {inputRightIconProps?.password?.display && (<i className={inputRightIconProps?.password?.className} onClick={() => { inputRightIconProps?.password?.onClick() }}></i>)}
                <AudioRecorder
                  onAudioRecorded={handleAudioRecorded}
                  onRecordingStateChange={handleRecordingStateChangeLocal}
                  disabled={
                    inputRightIconProps.disabled ||
                    (inputRightIconProps.isRecording && !localIsRecording)
                  }
                  isRecording={localIsRecording}
                  customParentClassName={`${inputRightIconProps.audioCustomParentClass}`}
                  customClass={inputRightIconProps.audioCustomClass}
                  customStyle={inputRightIconProps.audioCustomStyle}
                />

              </i>
            ) : (
              <span className={inputRightIconProps.inputRightIconClassName}>
                {inputRightIconProps.icon}
              </span>
            )}
          </>
        )}
        {labelDownProps?.text && (
          <div className={`${labelProps.labelMainClassName || "pb-1"}`}>
            <NormalLabel
              labelClass={labelDownProps.inputLabelClassName}
              text={labelDownProps.text}
            />
          </div>
        )}
        {floatLabelProps?.text && (
          <label
            className={`custom-label ${floatLabelProps.inputLabelClassName}`}
            htmlFor={floatLabelProps.id}
          >
            {floatLabelProps.text}
            <span className={floatLabelProps.inputLabelSpanClassName}>
              {floatLabelProps.spanText}
            </span>
          </label>
        )}
      </div>
    </>
  );
};

export const TextArea = (props) => {
  const {
    textAreaParentClassName,
    textAreaParentStyle,
    labelProps,
    textAreaClass,
    float,
    floatLabelProps,
    ...restProps
  } = props && props.textAreaProps;

  return (
    <div
      className={`${textAreaParentClassName} ${float ? "p-float-label" : ""}`}
      style={textAreaParentStyle}
    >
      {labelProps?.text && (
        <div className={`${labelProps.labelMainClassName || "pb-1"}`}>
          <NormalLabel
            labelClass={labelProps.textAreaLabelClassName}
            text={labelProps.text}
            id={labelProps.id}
            labelStyle={labelProps.parentStyle}
            spanText={labelProps.spanText}
            spanClass={labelProps.textAreaLabelSpanClassName}
          />
        </div>
      )}
      <InputTextarea
        className={`custom-textArea ${textAreaClass}`}
        {...restProps}
        autoComplete={process?.env?.NEXT_PUBLIC_AUTO_COMPLETE}
      />
      {floatLabelProps?.text && (
        <label
          className={`custom-label ${floatLabelProps.textAreaLabelClassName}`}
          htmlFor={floatLabelProps.id}
        >
          {floatLabelProps.text}
          <span className={floatLabelProps.textAreaLabelSpanClassName}>
            {floatLabelProps.spanText}
          </span>
        </label>
      )}
    </div>
  );
};

export const InputNumber = (props) => {
  const {
    inputNumberParentClassName,
    hasIcon,
    inputNumberParentStyle,
    labelProps,
    inputLeftIconProps,
    inputNumberClassName,
    inputRightIconProps,
    labelDownProps,
    isLoading,
    iconProps,
    float,
    floatLabelProps,
    ...restProps
  } = props && props.inputNumberProps;

  const [localIsRecording, setLocalIsRecording] = useState(false);

  const handleAudioRecorded = (audioBlob) => {
    inputRightIconProps?.onRecordValueChange(audioBlob);
  };

  const handleRecordingStateChangeLocal = (isRecord) => {
    setLocalIsRecording(isRecord);
    inputRightIconProps?.onRecordingStateChange(isRecord);
  };

  useEffect(() => {
    if (!inputRightIconProps?.isRecording) {
      setLocalIsRecording(inputRightIconProps?.isRecording);
    }
  }, [inputRightIconProps?.isRecording]);
  return (
    <>
      {labelProps?.text && inputRightIconProps?.display && (
        <>
          <div className={`${labelProps.labelMainClassName || "pb-1"}`}>
            <NormalLabel
              labelClass={labelProps.inputNumberLabelClassName}
              text={labelProps.text}
              labelStyle={labelProps.parentStyle}
              spanText={labelProps.spanText}
              spanClass={labelProps.inputNumberLabelSpanClassName}
            />
          </div>
        </>
      )}
      <div
        className={`${inputNumberParentClassName} ${inputRightIconProps?.audio?.display ? "p-input-icon-right" : ""
          } ${hasIcon ? "p-input-icon-right" : ""}  ${float ? "p-float-label" : ""
          }`}
        style={inputNumberParentStyle}
      >
        {labelProps?.text && !inputRightIconProps?.display && (
          <div className={`${labelProps.labelMainClassName || "pb-1"}`}>
            <NormalLabel
              labelClass={labelProps.inputNumberLabelClassName}
              text={labelProps.text}
              labelStyle={labelProps.parentStyle}
              spanText={labelProps.spanText}
              spanClass={labelProps.inputNumberLabelSpanClassName}
            />
          </div>
        )}
        {localIsRecording && (
          <i className="flex justify-content-center w-full">
            <i className="pi pi-spin pi-spinner  pl-0 " />
          </i>
        )}
        {isLoading && (
          <i className="flex justify-content-center w-full">
            <i className="flex justify-content center align-items-end pt-2 pb-2 pi pi-spin pi-spinner" />
          </i>
        )}
        {inputLeftIconProps?.display && (
          <>
            {inputLeftIconProps?.audio?.display ? (
              <div>
                <AudioRecorder
                  onAudioRecorded={handleAudioRecorded}
                  onRecordingStateChange={handleRecordingStateChangeLocal}
                  disabled={
                    inputLeftIconProps?.disabled ||
                    (inputLeftIconProps?.isRecording && !localIsRecording)
                  }
                  isRecording={localIsRecording}
                  customClass={inputLeftIconProps.audioCustomClass}
                />
              </div>
            ) : (
              <span className={inputLeftIconProps.inputLeftIconClassName}>
                {inputLeftIconProps.icon}
              </span>
            )}
          </>
        )}
        <InputNum
          className={`custom_input ${inputNumberClassName}`}
          {...restProps}
          autoComplete={process?.env?.NEXT_PUBLIC_AUTO_COMPLETE}
        />
        {inputRightIconProps?.display && (
          <>
            {inputRightIconProps?.audio?.display ? (
              <AudioRecorder
                onAudioRecorded={handleAudioRecorded}
                onRecordingStateChange={handleRecordingStateChangeLocal}
                disabled={
                  inputRightIconProps.disabled ||
                  (inputRightIconProps.isRecording && !localIsRecording)
                }
                isRecording={localIsRecording}
                customClass={inputRightIconProps.audioCustomClass}
              />
            ) : (
              <span className={inputRightIconProps.inputRightIconClassName}>
                {inputRightIconProps.icon}
              </span>
            )}
          </>
        )}
        {labelDownProps?.text && (
          <div className={`${labelProps.labelMainClassName || "pb-1"}`}>
            <NormalLabel
              labelClass={labelDownProps.inputLabelClassName}
              text={labelDownProps.text}
            />
          </div>
        )}
        {floatLabelProps?.text && (
          <label
            className={`custom-label ${floatLabelProps.inputNumberLabelClassName}`}
            htmlFor={floatLabelProps.id}
          >
            {floatLabelProps.text}
            <span className={floatLabelProps.inputNumberLabelSpanClassName}>
              {floatLabelProps.spanText}
            </span>
          </label>
        )}
      </div>
    </>
  );
};

export const Password = (props) => {
  const {
    passwordParentClassName,
    passwordParentStyle,
    labelProps,
    passwordClassName,
    float,
    floatLabelProps,
    ...restProps
  } = props && props.passwordProps;

  return (
    <div
      className={`custom_input_password ${passwordParentClassName}  ${float ? "p-float-label" : ""
        }`}
    >
      {labelProps?.text && (
        <div className={`${labelProps.labelMainClassName || "pb-1"}`}>
          <NormalLabel
            labelClass={labelProps.passwordLabelClassName}
            text={labelProps.text}
            labelStyle={labelProps.parentStyle}
            spanText={labelProps.spanText}
            spanClass={labelProps.passwordLabelSpanClassName}
          />
        </div>
      )}
      <Pwd
        className={passwordClassName}
        toggleMask
        feedback={false}
        {...restProps}
        autoComplete={process?.env?.NEXT_PUBLIC_AUTO_COMPLETE_PASSWORD}
      />
      {floatLabelProps?.text && (
        <label
          className={`custom-label ${floatLabelProps.passwordLabelClassName}`}
          htmlFor={floatLabelProps.id}
        >
          {floatLabelProps.text}
          <span className={floatLabelProps.passwordLabelSpanClassName}>
            {floatLabelProps.spanText}
          </span>
        </label>
      )}
    </div>
  );
}

export const InputGroup = (props) => {
  const {
    inputGroupParentClassName,
    inputGroupParentStyle,
    labelProps,
    inputGroupClassName,
    leftIcon,
    rightIcon,
    float,
    floatLabelProps,
    ...restProps
  } = props && props.inpuGroupProps;

  return (
    <>
      {labelProps?.text && (
        <div className={`${labelProps.labelMainClassName || "pb-1"}`}>
          <NormalLabel
            labelClass={labelProps.inputGroupLabelClassName}
            text={labelProps.text}
            spanText={labelProps.spanText}
            spanClass={labelProps.inputGroupLabelSpanClassName}
            labelStyle={labelProps.parentStyle}
          />
        </div>
      )}
      <div
        className={`p-inputgroup ${inputGroupParentClassName}  ${float ? "p-float-label" : ""
          }`}
        style={inputGroupParentStyle}
      >
        {leftIcon && (
          <span
            className={`p-inputgroup-addon ${leftIcon.leftClassName} `}
            style={leftIcon.leftStyleName}
          >
            <i className={`${leftIcon.icon} `}>{leftIcon.antLeftIcon}</i>
          </span>
        )}
        <InputText
          className={`custom_input ${inputGroupClassName}`}
          {...restProps}
          autoComplete={process?.env?.NEXT_PUBLIC_AUTO_COMPLETE}
        />
        {floatLabelProps?.text && (
          <label
            className={`custom-label ${floatLabelProps.inputGroupLabelClassName}`}
            htmlFor={floatLabelProps.id}
          >
            {floatLabelProps.text}
            <span className={floatLabelProps.inputGroupLabelSpanClassName}>
              {floatLabelProps.spanText}
            </span>
          </label>
        )}
        {rightIcon && (
          <span
            className={`p-inputgroup-addon ${rightIcon.rightClassName}`}
            style={rightIcon.rightStyle}
          >
            <i className={`${rightIcon.icon} `}>{rightIcon.antRightIcon}</i>
          </span>
        )}
      </div>
    </>
  );
};

export const InputDropdown = (props) => {
  const {
    inputDropdownParentClassName,
    inputDropdownParentStyle,
    labelProps,
    inputDropdownClassName,
    inputPanelDropdownClassName,
    customPanelDropdownClassName,
    float,
    floatLabelProps,
    ...restProps
  } = props && props.inputDropdownProps;

  return (
    <div
      className={`custom-select ${inputDropdownParentClassName} ${float ? "p-float-label" : ""
        }`}
      style={inputDropdownParentStyle}
    >
      {labelProps?.text && (
        <div className={`${labelProps.labelMainClassName || "pb-1"}`}>
          <NormalLabel
            labelClass={labelProps.inputDropdownLabelClassName}
            text={labelProps.text}
            spanText={labelProps.spanText}
            spanClass={labelProps.inputDropdownLabelSpanClassName}
            labelStyle={labelProps.parentStyle}
          />
        </div>
      )}
      <Dropdown
        className={`${inputDropdownClassName}`}
        panelClassName={`custom_dropdownPanel ${inputPanelDropdownClassName} ${customPanelDropdownClassName}`}
        {...restProps}
      />
      {floatLabelProps?.text && (
        <label
          className={`custom-label ${floatLabelProps.inputDropdownLabelClassName}`}
          htmlFor={floatLabelProps.id}
        >
          {floatLabelProps.text}
          <span className={floatLabelProps.inputDropdownLabelSpanClassName}>
            {floatLabelProps.spanText}
          </span>
        </label>
      )}
    </div>
  );
};

/**
 *
 * @param {*} props
 * @returns Multi select dropdown component
 */
export const MultiSelect = (props) => {
  const {
    multiSelectParentClassName,
    multiSelectParentStyle,
    labelProps,
    multiSelectClassName,
    float,
    floatLabelProps,
    onChange,
    selectAllLabel="Select All", // Default label for "Select All"
    ...restProps
  } = props && props.multiSelectProps;

  const disabledOptions = restProps.options?.filter((option) => option.disabled).map((option) => option.value) || [];

  // Ensure disabled options are always selected initially
  const [selectedValues, setSelectedValues] = useState(() => [
    ...new Set([...disabledOptions, ...(restProps.value || [])]),
  ]);
  // State for allValues, updated dynamically
  const [allValues, setAllValues] = useState(
    restProps.options?.map((option) => option.value) || []
  );
  const [allSelected, setAllSelected] = useState(false);
  useEffect(() => {
    setSelectedValues(() => [
      ...new Set([...disabledOptions, ...(restProps.value || [])]),
    ]);
  }, [restProps.value]);
    useEffect(() => {
      setAllSelected(selectedValues.length === allValues.length && allValues.length > 0);
    }, [selectedValues, allValues,restProps.value]);

  // Toggle Select All functionality
   const toggleSelectAll = () => {
    let updatedValues = allSelected ? [] : allValues;

    // Ensure disabled options remain selected
    updatedValues = [...new Set([...disabledOptions, ...updatedValues])];

    setSelectedValues(updatedValues);
    if (onChange) {
      onChange({ value: updatedValues });
    }
  };

  // Handle selection change
  const handleSelectionChange = (e) => {
    let updatedValues = e.value;

    // Ensure disabled options remain selected
    updatedValues = [...new Set([...disabledOptions, ...updatedValues])];

    setSelectedValues(updatedValues);
    if (onChange) {
      onChange(e);
    }
  };

  // Custom panel header with a "Select All" checkbox and label
  const panelHeaderTemplate = () => (
    <div className="flex justify-content-start p-multiselect-header">
      <Checkbox inputId="selectAll" checked={allSelected} onChange={toggleSelectAll} />
      <label htmlFor="selectAll" className="ml-2">{selectAllLabel}</label>
    </div>
  );

  return (
    <div
      className={`custom-select ${multiSelectParentClassName} ${float ? "p-float-label" : ""}`}
      style={multiSelectParentStyle}
    >
      {labelProps?.text && (
        <div className={`${labelProps.labelMainClassName || "pb-1"}`}>
          <NormalLabel
            labelClass={labelProps.inputMultiSelectLabelClassName}
            text={labelProps.text}
            spanText={labelProps.spanText}
            labelStyle={labelProps.parentStyle}
            spanClass={labelProps.inputMultiSelectLabelSpanClassName}
          />
        </div>
      )}
      <MulSel
        className={multiSelectClassName}
        value={selectedValues}
        onChange={(e)=>{
          handleSelectionChange(e);
        }}
        panelHeaderTemplate={panelHeaderTemplate} // Custom panel header with "Select All" checkbox
        {...restProps}
      />
      {floatLabelProps?.text && (
        <label
          className={`custom-label ${floatLabelProps.inputMultiSelectLabelClassName}`}
          htmlFor={floatLabelProps.id}
        >
          {floatLabelProps.text}
          <span className={floatLabelProps.inputMultiSelectLabelSpanClassName}>
            {floatLabelProps.spanText}
          </span>
        </label>
      )}
    </div>
  );
};

export const DropdownSelect = (props) => {
  const {
    dropDownSelectParentClassName,
    dropDownSelectParentStyle,
    items,
    icon,
    text,
  } = props;

  return (
    <div
      className={`custom-select ${dropDownSelectParentClassName}`}
      style={dropDownSelectParentStyle}
    >
      <Drp overlay={items}>
        <button type="button" className="p-link layout-topbar-button">
          {text && <div className="header-dropdown-name">{text}</div>}
          {icon}
        </button>
      </Drp>
    </div>
  );
};

export const InputGroups = (props) => {
  const { custom, parentClass, parentStyle, inputGroupProps = {} } = props;
  const {
    leftClass,
    leftStyle,
    leftIcon,
    onLeftClick,
    type,
    inputClass,
    value,
    id,
    name,
    style,
    keyfilter,
    placeholder,
    onChange,
    onBlur,
    ref,
    required,
    readOnly,
    disabled,
    rightClass,
    rightStyle,
    rightIcon,
    onRightClick,
    leftDisabled,
    rightDisabled,
    maxLength,
    minLength,
    ...restProps
  } = inputGroupProps;

  return (
    <div
      className={`p-inputgroup flex-1${custom || "custom_input"
        } ${parentClass} `}
      style={parentStyle}
    >
      <Button
        type="button"
        icon={`${leftIcon}`}
        className={`${leftClass}`}
        style={leftStyle}
        onClick={onLeftClick}
        disabled={leftDisabled}
      />
      {props.supplies && (
        <Button
          type="button"
          icon={`${rightIcon}`}
          className={`${rightClass}`}
          style={rightStyle}
          onClick={onRightClick}
          disabled={rightDisabled}
        />
      )}
      <InputText
        type={type || "text"}
        className={`${inputClass}`}
        value={value}
        id={id}
        name={name}
        style={style}
        keyfilter={keyfilter}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        {...restProps}
        autoComplete={process?.env?.NEXT_PUBLIC_AUTO_COMPLETE}
      />
      {props.register && (
        <Button
          type="button"
          icon={`${rightIcon}`}
          className={`${rightClass}`}
          style={rightStyle}
          onClick={onRightClick}
          disabled={rightDisabled}
        />
      )}
    </div>
  );
};
