import React, { useRef } from "react";
import useDetectClose from "../../hooks/useDetectClose";
import "../../css/Dropdown.css";

function DropdownMenu({ options, selectedOption, onOptionChange }) {
  const dropDownRef = useRef(null);
  const [isOpen, setIsOpen] = useDetectClose(dropDownRef, false);

  const handleOptionChange = (option) => {
    onOptionChange(option);
    setIsOpen(false);
  };

  return (
    <div className="dropdown-menu">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {selectedOption}
      </button>
      <ul ref={dropDownRef} className={`menu ${isOpen ? "active" : ""}`}>
        {options.map((option) => (
          <li
            key={option.value}
            onClick={(e) => {
              e.stopPropagation();
              handleOptionChange(option.value);
            }}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DropdownMenu;
