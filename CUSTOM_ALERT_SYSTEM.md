# Custom Alert System

This document provides information about the custom alert system implemented to replace JavaScript's default alert boxes with themed, consistent overlay boxes.

## Components Added

1. **CustomAlert Component**:
   - Located at: `/components/CustomAlert/CustomAlert.jsx` & `/components/CustomAlert/CustomAlert.css`
   - A reusable component that renders different types of alerts: info, success, warning, and error
   - Supports showing a message, title, and action buttons
   - Supports optional text input fields

2. **AlertContext**:
   - Located at: `/components/AlertContext/AlertContext.jsx`
   - Provides application-wide access to alert functionality
   - Includes three main methods:
     - `showAlert()`: Simple notification (replaces window.alert)
     - `showConfirm()`: Confirmation dialog (replaces window.confirm)
     - `showPrompt()`: Input dialog (replaces window.prompt)

## Usage

### Basic Alert
```jsx
const { showAlert } = useAlert();
showAlert("Your message here", "Optional Title", "info");
// Types: "info", "success", "warning", "error"
```

### Confirmation Dialog
```jsx
const { showConfirm } = useAlert();
const result = await showConfirm("Are you sure?", "Confirmation", "warning");
if (result) {
  // User clicked Yes
} else {
  // User clicked No or closed the dialog
}
```

### Prompt Dialog
```jsx
const { showPrompt } = useAlert();
const userInput = await showPrompt("Enter a value:", "placeholder text", "Input Required", false, "info");
if (userInput !== null) {
  // User submitted input
  console.log(userInput);
} else {
  // User canceled
}
```

## Important Notes

1. All string inputs in prompt dialogs are now optional by default
2. Consistent with design system variables for colors, spacing, and typography
3. Fully responsive and mobile-friendly
4. Features smooth transitions and animations
5. Prevents background scrolling when alerts are active

## Components Updated

- **OrderFulfillment**: Replaced default alerts and prompts with custom alerts
- **InventoryManagement**: Replaced default alerts with custom success alerts for stock requests
- **App.js**: Added AlertProvider to wrap the entire application

## Future Enhancements

1. Add timeout option for auto-dismissing alerts
2. Add support for stacked alerts
3. Add animation variants
4. Add support for HTML content in messages
