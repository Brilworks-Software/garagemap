"use client"

import * as React from "react"
import { Search, ChevronDown, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchableSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  items: Array<{
    value: string
    label: string | React.ReactNode
    disabled?: boolean
    searchText?: string
    displayText?: string // Optional: text to display in trigger button
  }>
  disabled?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
  itemClassName?: string
  emptyMessage?: string
  triggerStyle?: React.CSSProperties
  contentStyle?: React.CSSProperties
}

export function SearchableSelect({
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  items,
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
  itemClassName,
  emptyMessage = "No items found",
  triggerStyle,
  contentStyle,
}: SearchableSelectProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return items
    }
    const query = searchQuery.toLowerCase()
    return items.filter((item) => {
      const searchText = item.searchText || (typeof item.label === "string" ? item.label : item.value)
      return searchText.toLowerCase().includes(query)
    })
  }, [items, searchQuery])

  // Get selected item label
  const selectedItem = React.useMemo(() => {
    return items.find(item => item.value === value)
  }, [items, value])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setSearchQuery("")
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      // Focus input when opened
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const handleSelect = (itemValue: string) => {
    if (items.find(item => item.value === itemValue)?.disabled) {
      return
    }
    onValueChange(itemValue)
    setOpen(false)
    setSearchQuery("")
  }

  const displayLabel = React.useMemo(() => {
    if (!selectedItem) {
      return placeholder
    }
    // Use displayText if provided
    if (selectedItem.displayText) {
      return selectedItem.displayText
    }
    // Use searchText if label is ReactNode
    if (typeof selectedItem.label !== "string" && selectedItem.searchText) {
      return selectedItem.searchText
    }
    // Use label if it's a string
    if (typeof selectedItem.label === "string") {
      return selectedItem.label
    }
    // Fallback to searchText
    return selectedItem.searchText || "Selected"
  }, [selectedItem, placeholder])

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          "w-full justify-between font-mono border-white/10",
          !value && "text-[#94a3b8] hover:text-[#94a3b8]",
          value && "text-white hover:text-white",
          triggerClassName
        )}
        style={{
          backgroundColor: triggerStyle?.backgroundColor || "#1a1c1e",
          borderColor: "rgba(255, 255, 255, 0.1)",
          ...triggerStyle,
        }}
        onClick={() => {
          if (!disabled) {
            setOpen(!open)
          }
        }}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-[#94a3b8]" />
      </Button>

      {open && (
        <div
          className={cn(
            "absolute z-[9999] mt-1 w-full rounded-md border shadow-lg",
            contentClassName
          )}
          style={{
            ...contentStyle,
            maxHeight: "400px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            borderColor: contentStyle?.borderColor || "rgba(255, 255, 255, 0.1)",
          }}
        >
          <div 
            className="p-2 border-b" 
            style={{ 
              backgroundColor: contentStyle?.backgroundColor || "#25282c",
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50 text-[#94a3b8]" />
              <Input
                ref={inputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false)
                    setSearchQuery("")
                  } else if (e.key === "Enter" && filteredItems.length > 0) {
                    handleSelect(filteredItems[0].value)
                  }
                }}
                className="pl-8 h-8 text-sm bg-[#1a1c1e] border-white/10 text-white placeholder:text-[#94a3b8]"
                style={{ backgroundColor: "#1a1c1e" }}
              />
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "300px", backgroundColor: contentStyle?.backgroundColor || "#25282c" }}>
            {filteredItems.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-[#94a3b8]">
                {emptyMessage}
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = value === item.value
                const isDisabled = item.disabled
                return (
                  <div
                    key={item.value}
                    onClick={() => !isDisabled && handleSelect(item.value)}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors font-mono",
                      isSelected && "bg-white/10 text-white",
                      !isSelected && !isDisabled && "hover:bg-white/5 text-white",
                      isDisabled && "opacity-50 cursor-not-allowed pointer-events-none text-[#94a3b8]",
                      itemClassName
                    )}
                  >
                    {typeof item.label === "string" ? (
                      <span className="truncate">{item.label}</span>
                    ) : (
                      item.label
                    )}
                    {isSelected && (
                      <Check className="ml-auto h-4 w-4 text-[#22d3ee]" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
