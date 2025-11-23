// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface INoirVerifier {
    function verifyProof(bytes calldata proof, bytes32[] calldata pubInputs) external view returns (bool);
}

contract TrustVerification {
    INoirVerifier public immutable verifier;

    constructor(address verifierAddress) {
        verifier = INoirVerifier(verifierAddress);
    }

    function verifyProof(bytes calldata proof, bytes32[] calldata pubInputs) external view returns (bool) {
        return verifier.verifyProof(proof, pubInputs);
    }
}
