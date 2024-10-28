
export const loadContract = async (name, web3) => {
    const res = await fetch(`/contracts/${name}.json`);
    const Artifact = await res.json();

    // 確保 Artifact 包含 abi 和 networks
    if (!Artifact.abi || !Artifact.networks) {
        throw new Error("Contract artifact does not contain ABI or network information");
    }

    const networkId = await web3.eth.net.getId(); // 獲取當前網絡 ID
    // console.log(networkId);
    const deployedNetwork = Artifact.networks[networkId];

    if (!deployedNetwork) {
        throw new Error(`Contract not found in network with id ${networkId}`);
    }

    const _contract = new web3.eth.Contract(Artifact.abi, deployedNetwork.address);

    return _contract;
}
