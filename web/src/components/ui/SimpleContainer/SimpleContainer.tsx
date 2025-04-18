import * as React from "react";
import { classNameMerge } from "@/lib/utils";

// SimpleContainer component for non-pixel UI elements
// Combines elements from both productivity goals and website tracker
export interface SimpleContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  instructionText?: string;
  renderInstructionAfterInput?: boolean; // Flag to control where instruction is rendered
}

const SimpleContainer = React.forwardRef<HTMLDivElement, SimpleContainerProps>(
  ({ className, title, description, instructionText, renderInstructionAfterInput = true, children, ...props }, ref) => {
    // If we need to render instruction after input, we need to modify children
    if (instructionText && renderInstructionAfterInput) {
      // Find all child elements
      const childrenArray = React.Children.toArray(children);
      
      // Find input container (typically first div)
      const inputContainer = childrenArray[0];
      
      // Rest of the children
      const otherChildren = childrenArray.slice(1);
      
      return (
        <div
          ref={ref}
          className={classNameMerge(
            "w-full border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
            className
          )}
          {...props}
        >
          <div className="p-4 border-b border-black">
            <h2 className="text-xl font-bold mb-1">{title}</h2>
            {description && <p className="text-sm text-gray-600">{description}</p>}
          </div>
          <div className="p-4">
            {/* Render input container first */}
            {inputContainer}
            
            {/* Then render the instruction */}
            {instructionText && (
              <div className="my-4 text-sm text-gray-500 bg-gray-50 p-2 border border-gray-200 rounded">
                <span className="font-medium">Tip:</span> {instructionText}
              </div>
            )}
            
            {/* Then render the rest of the children */}
            {otherChildren}
          </div>
        </div>
      );
    }
    
    // Default rendering if not rendering instruction after input
    return (
      <div
        ref={ref}
        className={classNameMerge(
          "w-full border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          className
        )}
        {...props}
      >
        <div className="p-4 border-b border-black">
          <h2 className="text-xl font-bold mb-1">{title}</h2>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        <div className="p-4">
          {instructionText && (
            <div className="mb-4 text-sm text-gray-500 bg-gray-50 p-2 border border-gray-200 rounded">
              <span className="font-medium">Tip:</span> {instructionText}
            </div>
          )}
          {children}
        </div>
      </div>
    );
  }
);

SimpleContainer.displayName = "SimpleContainer";

// SimpleItem component for consistent item styling
export interface SimpleItemProps extends React.HTMLAttributes<HTMLDivElement> {
  backgroundColor?: string;
}

const SimpleItem = React.forwardRef<HTMLDivElement, SimpleItemProps>(
  ({ className, backgroundColor, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNameMerge(
          "p-3 border-2 border-black",
          className
        )}
        style={{ backgroundColor: backgroundColor || "white" }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SimpleItem.displayName = "SimpleItem";

export { SimpleContainer, SimpleItem };
