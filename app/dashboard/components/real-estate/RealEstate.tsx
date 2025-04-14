// app/dashboard/components/real-estate/RealEstate.tsx

"use client";

import GenericForm from "@/components/GenericForm";
import { realEstateFields } from "@/lib/db-client-req/GenericFormData";
import { RealEstateProperty } from "@/lib/types/realEstateTypes";
import React from "react";

interface RealEstateProps {
  realEstateData: RealEstateProperty[];
  userId: string;
}

const RealEstate: React.FC<RealEstateProps> = ({ realEstateData, userId }) => {
  // logging the real estate output for easier mapping later
  console.log(realEstateData);

  // logging userid for usage later
  console.log(userId);

  return (
    <div className="real-estate-section">
      <h2 className="text-2xl font-bold mb-4">Real Estate Properties</h2>
      {realEstateData.length === 0 ? (
        <p>No real estate properties found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {realEstateData.map((property) => (
            <div
              key={property.id}
              className="card bg-white shadow-lg p-4 rounded-lg"
            >
              <h3 className="text-xl font-semibold">
                {property.property_type}
              </h3>
              <p className="text-gray-500">{property.property_address}</p>
              <div className="mt-2">
                <p className="font-semibold">
                  Purchase Price: ${property.purchase_price.toLocaleString()}
                </p>
                <p className="font-semibold">
                  Current Value: ${property.current_value.toLocaleString()}
                </p>
                <p className="font-semibold">
                  Rental Income: ${property.rental_income.toLocaleString()}
                </p>
                <p className="font-semibold">
                  Monthly Cash Flow: $
                  {property.monthly_cash_flow.toLocaleString()}
                </p>
                <p className="font-semibold">
                  Yearly Cash Flow: $
                  {property.yearly_cash_flow.toLocaleString()}
                </p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Purchase Date:{" "}
                  {new Date(property.purchase_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Mortgage Payment: $
                  {property.mortgage_monthly_payment.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Mortgage Interest Rate: {property.mortgage_interest_rate}%
                </p>
                <p className="text-sm text-gray-600">
                  Property Tax: ${property.property_tax.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Insurance: ${property.insurance.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Maintenance Costs: $
                  {property.maintenance_costs.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Utilities: ${property.utilities.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <GenericForm
        apiRoute="/api/real-estate"
        userId={userId}
        fields={realEstateFields}
      />
    </div>
  );
};

export default RealEstate;
