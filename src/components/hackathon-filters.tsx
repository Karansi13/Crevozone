"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/Button";
import { Link } from "react-router-dom";
import { CirclePlus, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";


interface FilterProps {
  filters: {
    managedByDevpost: boolean;
    location: {
      online: boolean;
      inPerson: boolean;
    };
    status: {
      upcoming: boolean;
      open: boolean;
      ended: boolean;
    };
    length: {
      shortTerm: boolean;
      longTerm: boolean;
    };
  };
  onFilterChange: (filterType: string, value: string, checked: boolean) => void;
}

export function HackathonFilters({ filters, onFilterChange }: FilterProps) {
  const { isAdmin } = useAuth();
  const [isFilterOpen, setIsFilterOpen] = useState(false); // State for mobile modal
  

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        {
          isAdmin && (
            <Link to="/publish-hackathon">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all text-white gap-2">
            <CirclePlus />
            Publish Competitions
          </Button>
        </Link>
          )
        }

        {/* Mobile Filter Button */}
        <Button
          className="md:hidden flex items-center gap-2 bg-gray-200 text-black px-4 py-2 rounded-md"
          onClick={() => setIsFilterOpen(true)}
        >
          <Filter size={18} />
          Filters
        </Button>
      </div>

      {/* Desktop Filters (Hidden on Mobile) */}
      <div className="hidden md:block space-y-4">
        <FilterSection
          title="Location"
          filterGroup="location"
          filters={filters.location}
          onFilterChange={onFilterChange}
        />
        <FilterSection
          title="Status"
          filterGroup="status"
          filters={filters.status}
          onFilterChange={onFilterChange}
        />
        <FilterSection
          title="Length"
          filterGroup="length"
          filters={filters.length}
          onFilterChange={onFilterChange}
        />
      </div>

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <FilterSection
              title="Location"
              filterGroup="location"
              filters={filters.location}
              onFilterChange={onFilterChange}
            />
            <FilterSection
              title="Status"
              filterGroup="status"
              filters={filters.status}
              onFilterChange={onFilterChange}
            />
            <FilterSection
              title="Length"
              filterGroup="length"
              filters={filters.length}
              onFilterChange={onFilterChange}
            />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setIsFilterOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🔹 Reusable Component for Filter Sections
function FilterSection({
  title,
  filterGroup,
  filters,
  onFilterChange,
}: {
  title: string;
  filterGroup: string;
  filters: Record<string, boolean>;
  onFilterChange: (filterType: string, value: string, checked: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm">{title}</h3>
      {Object.entries(filters).map(([key, value]) => (
        <div key={key} className="flex items-center space-x-2">
          <Checkbox
            id={key}
            checked={value}
            onCheckedChange={(checked) =>
              onFilterChange(filterGroup, key, checked as boolean)
            }
          />
          <Label
            htmlFor={key}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {key.replace(/([A-Z])/g, " $1").trim()}{" "}
            {/* Format camelCase keys to readable text */}
          </Label>
        </div>
      ))}
    </div>
  );
}