import { Request, Response } from "express";
import { ShippingAddressModel } from "../../models/shippingAddressModel";
import {
    sendErrorResponse,
    sendSuccessResponse,
  } from "../../utils/responseUtils";
import { getUserFromToken } from "../authController";

export class ShippingAddressController {

  public addShippingAddress = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req); // Extract user from token
      const user_id = user?._id;
  
      if (!user_id) {
        sendErrorResponse(res, 401, false, "User not authenticated");
        return;
      }
  
      const { street, city, state, postalCode, country } = req.body;
  
      // Create new shipping address
      const shippingAddress = new ShippingAddressModel({
        user_id,
        street,
        city,
        state,
        postalCode,
        country,
      });
  
      const savedAddress = await shippingAddress.save();
      sendSuccessResponse(res, 201, true, "Shipping address added successfully", savedAddress);
    } catch (error) {
      sendErrorResponse(res, 500, false, "Failed to add shipping address", error);
    }
  };
  

  // Get Shipping Address by ID
  public getShippingAddressById = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req); // Extract user from token
      const user_id = user?._id;
  
      if (!user_id) {
        sendErrorResponse(res, 401, false, "User not authenticated");
        return;
      }
  
      const { _id } = req.params;
  
      // Find the shipping address by both user_id and _id
      const shippingAddress = await ShippingAddressModel.findOne({ _id, user_id });
  
      if (!shippingAddress) {
        return sendErrorResponse(res, 404, false, "Shipping address not found or does not belong to the user");
      }
  
      sendSuccessResponse(res, 200, true, "Shipping address retrieved successfully", shippingAddress);
    } catch (error) {
      sendErrorResponse(res, 500, false, "Failed to retrieve shipping address", error);
    }
  };

  // Update Shipping Address
  public updateShippingAddress = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req); // Assuming this function extracts the user from the token
      const user_id = user?._id;
  
      if (!user_id) {
        sendErrorResponse(res, 401, false, "User not authenticated");
        return;
      }
  
      const { _id } = req.params; // Address ID to update
      const { street, city, state, postal_code, country } = req.body;
  
      // Find and update the address only if it belongs to the authenticated user
      const updatedAddress = await ShippingAddressModel.findOneAndUpdate(
        { _id, user_id }, // Match by address ID and user ID
        { street, city, state, postal_code, country },
        { new: true } // Return the updated document
      );
  
      if (!updatedAddress) {
        return sendErrorResponse(res, 404, false, "Shipping address not found or does not belong to the user");
      }
  
      sendSuccessResponse(res, 200, true, "Shipping address updated successfully", updatedAddress);
    } catch (error) {
      sendErrorResponse(res, 500, false, "Failed to update shipping address", error);
    }
  };
  

  // Delete Shipping Address
  public deleteShippingAddress = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req); // Assuming this function extracts the user from the token
      const user_id = user?._id;
  
      if (!user_id) {
        sendErrorResponse(res, 401, false, "User not authenticated");
        return;
      }
  
      const { _id } = req.params; // Address ID to delete
  
      // Find and delete the address only if it belongs to the authenticated user
      const deletedAddress = await ShippingAddressModel.findOneAndDelete({ _id, user_id });
  
      if (!deletedAddress) {
        return sendErrorResponse(res, 404, false, "Shipping address not found or does not belong to the user");
      }
  
      sendSuccessResponse(res, 200, true, "Shipping address deleted successfully", deletedAddress);
    } catch (error) {
      sendErrorResponse(res, 500, false, "Failed to delete shipping address", error);
    }
  };
  public getAllShippingAddresses = async (req: Request, res: Response) => {
    try {
      // Extract user from token
      const user = await getUserFromToken(req);
      const user_id = user?._id;
  
      // Check if the user is authenticated
      if (!user_id) {
        sendErrorResponse(res, 401, false, "User not authenticated");
        return;
      }
  
      // Fetch all shipping addresses for the authenticated user
      const shippingAddresses = await ShippingAddressModel.find({ user_id });
  
      if (!shippingAddresses || shippingAddresses.length === 0) {
        sendSuccessResponse(res, 200, true, "No shipping addresses found for this user", []);
        return;
      }
  
      sendSuccessResponse(res, 200, true, "Shipping addresses retrieved successfully", shippingAddresses);
    } catch (error) {
      sendErrorResponse(res, 500, false, "Failed to retrieve shipping addresses", error);
    }
  };
  
}
