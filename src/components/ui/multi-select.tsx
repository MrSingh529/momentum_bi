"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, X, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

const multiSelectVariants = cva(
  "flex items-center justify-between w-full p-1 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  selected: string[]
  onChange: React.Dispatch<React.SetStateAction<string[]>>
  placeholder?: string
  asChild?: boolean
}

const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      className,
      variant,
      options,
      selected,
      onChange,
      placeholder = "Select items...",
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)

    const handleUnselect = (e: React.MouseEvent, item: string) => {
      e.preventDefault();
      e.stopPropagation();
      onChange(selected.filter((i) => i !== item))
    }

    const onSelect = (value: string) => {
      onChange(
        selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value]
      )
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between h-auto min-h-10", className)}
            onClick={() => setOpen(!open)}
            {...props}
          >
            <div className="flex gap-1 flex-wrap max-h-20 overflow-y-auto">
              {selected.length > 0 ? (
                selected.length === options.length ? (
                  <span className="text-muted-foreground px-2 py-1">All items selected</span>
                ) : (
                  selected.map((item) => {
                    const option = options.find(opt => opt.value === item);
                    return (
                      <Badge
                        variant="secondary"
                        key={item}
                        className="mr-1"
                        onClick={(e) => handleUnselect(e, item)}
                      >
                        {option?.label ?? item}
                        <span className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          <X className="h-3 w-3" />
                        </span>
                      </Badge>
                    )
                  })
                )
              ) : (
                <span className="text-muted-foreground px-2 py-1">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command className={className}>
            <CommandInput placeholder="Search ..." />
            <CommandList>
              <CommandEmpty>No item found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => onSelect(option.value)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selected.includes(option.value)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      {option.label}
                    </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)

MultiSelect.displayName = "MultiSelect"

export { MultiSelect }
