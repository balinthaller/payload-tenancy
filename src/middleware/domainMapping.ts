import { Handler } from "express";
import { Payload } from "payload";
import { Config } from "payload/config";
import { TenancyOptions } from "../options";
import { RequestWithTenant } from "../utils/requestWithTenant";

/**
 * Map the requested hostname to correct tenant. Adds the tenant to the request
 * object.
 *
 * @returns Express middleware
 */
export const createDomainMapping =
  ({
    options,
    payload,
  }: {
    options: TenancyOptions;
    config: Config;
    payload: Payload;
  }): Handler =>
  async (req: RequestWithTenant, res, next) => {
    // Check that tenant exists and attach it to the request.
    const hostnameSegments = req.hostname.split(".");
    if (hostnameSegments.length < 3) {
      res.status(404).send();
      return;
    }
    const tenantSlug = hostnameSegments[0];
    req.tenant = (
      await payload.find({
        collection: options.tenantCollection,
        where: { slug: { equals: tenantSlug } },
      })
    ).docs[0];
    if (!req.tenant) {
      res.status(404).send();
      return;
    }

    next();
  };
