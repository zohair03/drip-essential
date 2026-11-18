/**
 * Standardized API response helpers and MongoDB document serializers.
 */

/**
 * Return a successful JSON response.
 */
export function successResponse(data, message = "Success", status = 200) {
  return Response.json({ success: true, message, ...data }, { status });
}

/**
 * Return an error JSON response.
 * Never exposes raw error details in production.
 */
export function errorResponse(error, status = 400) {
  const message =
    typeof error === "string"
      ? error
      : error?.message || "An error occurred";

  // Log server-side for debugging
  if (status >= 500) {
    console.error(`[API Error ${status}]:`, error);
  }

  return Response.json({ success: false, error: message }, { status });
}

/**
 * Safely serialize a Mongoose document to a plain object.
 * Converts _id → id, removes __v, handles populated brand.
 */
export function serializeDoc(doc) {
  if (!doc) return null;

  const obj =
    typeof doc.toObject === "function"
      ? doc.toObject({ virtuals: true })
      : { ...doc };

  // Normalize _id → id
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  delete obj.__v;

  // If brand is populated, serialize it too
  if (obj.brand && typeof obj.brand === "object" && obj.brand._id) {
    obj.brand.id = obj.brand._id.toString();
    delete obj.brand._id;
    delete obj.brand.__v;
  }

  return obj;
}

/**
 * Serialize an array of Mongoose documents.
 */
export function serializeDocs(docs) {
  return (docs || []).map(serializeDoc);
}
