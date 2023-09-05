import { InputNumber as InputNum } from 'primereact/inputnumber';

const InputNumber = (props) => {
  const { parentClass, inputNumberProps = {} } = props
  const { inputNumberClass, height, id, value, name, onValueChange, showButtons, mode, ref, required, readOnly, disabled, currency } = inputNumberProps

  return (
    <div className={`${parentClass}`}>
      <InputNum className={`${inputNumberClass} ${height || 'custom_input'}`}
        id={id}
        value={value}
        name={name}
        onValueChange={onValueChange}
        showButtons={showButtons}
        mode={mode}
        ref={ref}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        currency={currency} />
    </div>
  )
}
export default InputNumber;