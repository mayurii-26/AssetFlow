// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AssetRegistry
 * @notice On-chain audit trail for AssetFlow ERP.
 *         Records tamper-proof events for every asset lifecycle action.
 */
contract AssetRegistry {
    // -------------------------------------------------------------------------
    // Data structures
    // -------------------------------------------------------------------------

    struct AssetEvent {
        string  assetId;
        string  eventType;   // e.g. "CREATED", "ALLOCATED", "TRANSFERRED", "MAINTENANCE"
        string  eventHash;   // SHA-256 / keccak hash of the off-chain event payload
        string  performer;   // user ID or wallet address that triggered the event
        string  metadata;    // JSON-encoded extra data (optional)
        uint256 timestamp;   // block timestamp at recording time
    }

    // assetId => ordered list of events
    mapping(string => AssetEvent[]) private _assetHistory;

    // assetId => eventHash => existence flag (for O(1) verification)
    mapping(string => mapping(string => bool)) private _hashExists;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event AssetEventRecorded(
        string  indexed assetId,
        string          eventType,
        string          eventHash,
        string          performer,
        uint256         timestamp
    );

    // -------------------------------------------------------------------------
    // Write functions
    // -------------------------------------------------------------------------

    /**
     * @notice Record a new lifecycle event for an asset.
     * @param assetId   Unique identifier of the asset (matches ERP asset ID).
     * @param eventType Human-readable event category.
     * @param eventHash Cryptographic hash of the off-chain event payload.
     * @param performer Identifier of the user / system that raised the event.
     * @param metadata  Optional JSON string with additional context.
     */
    function recordEvent(
        string calldata assetId,
        string calldata eventType,
        string calldata eventHash,
        string calldata performer,
        string calldata metadata
    ) external {
        require(bytes(assetId).length   > 0, "AssetRegistry: assetId required");
        require(bytes(eventType).length > 0, "AssetRegistry: eventType required");
        require(bytes(eventHash).length > 0, "AssetRegistry: eventHash required");
        require(bytes(performer).length > 0, "AssetRegistry: performer required");

        AssetEvent memory newEvent = AssetEvent({
            assetId:   assetId,
            eventType: eventType,
            eventHash: eventHash,
            performer: performer,
            metadata:  metadata,
            timestamp: block.timestamp
        });

        _assetHistory[assetId].push(newEvent);
        _hashExists[assetId][eventHash] = true;

        emit AssetEventRecorded(assetId, eventType, eventHash, performer, block.timestamp);
    }

    // -------------------------------------------------------------------------
    // Read functions
    // -------------------------------------------------------------------------

    /**
     * @notice Retrieve the full event history for an asset.
     * @param assetId Unique identifier of the asset.
     * @return events Array of AssetEvent structs in chronological order.
     */
    function getAssetHistory(string calldata assetId)
        external
        view
        returns (AssetEvent[] memory events)
    {
        return _assetHistory[assetId];
    }

    /**
     * @notice Verify whether a specific event hash exists in an asset's history.
     * @param assetId   Unique identifier of the asset.
     * @param eventHash The hash to look up.
     * @return exists   True if the hash was previously recorded for this asset.
     */
    function verifyHash(string calldata assetId, string calldata eventHash)
        external
        view
        returns (bool exists)
    {
        return _hashExists[assetId][eventHash];
    }

    /**
     * @notice Return the total number of events recorded for an asset.
     * @param assetId Unique identifier of the asset.
     */
    function getEventCount(string calldata assetId)
        external
        view
        returns (uint256 count)
    {
        return _assetHistory[assetId].length;
    }
}
