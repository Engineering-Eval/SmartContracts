// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Prices one share order on a linear curve.
///         Share k, with k starting at 1, costs `(remaining + k) * sharePrice` wei.
///         `cost` is that sum, exact, including when the order cannot fill:
///         `sharePrice * shares * (2 * remaining + shares + 1) / 2`.
///         `canFill` is true only when `shares >= 1` and `remaining >= shares`.
///         `shares` and `2 * remaining + shares + 1` have opposite parity.
///         Halve the even factor before multiplying by `sharePrice`.
contract Quote {
    function quote(uint256 sharePrice, uint256 shares, uint256 remaining)
        external
        pure
        returns (uint256 cost, bool canFill)
    {
        return (0, false);
    }
}
