const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Quote", function () {
  async function deploy() {
    const Factory = await ethers.getContractFactory("Quote");
    return Factory.deploy();
  }

  it("prices a fillable order on the curve", async function () {
    const quote = await deploy();
    const [cost, canFill] = await quote.quote(100, 4, 10);
    expect(cost).to.equal(5000n);
    expect(canFill).to.equal(true);
  });

  it("fills an order that takes the last shares", async function () {
    const quote = await deploy();
    const [cost, canFill] = await quote.quote(100, 4, 4);
    expect(cost).to.equal(2600n);
    expect(canFill).to.equal(true);
  });

  it("still prices an order that is short, and marks it unfilled", async function () {
    const quote = await deploy();
    const [cost, canFill] = await quote.quote(100, 4, 3);
    expect(cost).to.equal(2200n);
    expect(canFill).to.equal(false);
  });

  it("does not truncate an odd intermediate product", async function () {
    const quote = await deploy();
    const [cost, canFill] = await quote.quote(3, 3, 1);
    expect(cost).to.equal(27n);
    expect(canFill).to.equal(false);
  });

  it("does not treat a zero-share order as filled", async function () {
    const quote = await deploy();
    const [cost, canFill] = await quote.quote(100, 0, 10);
    expect(cost).to.equal(0n);
    expect(canFill).to.equal(false);
  });

  it("multiplies a large wei price", async function () {
    const quote = await deploy();
    const sharePrice = ethers.parseEther("0.05");
    const [cost, canFill] = await quote.quote(sharePrice, 250, 1000);
    expect(cost).to.equal(ethers.parseEther("14068.75"));
    expect(canFill).to.equal(true);
  });

  it("fits a quote whose price is applied after the halving", async function () {
    const quote = await deploy();
    const sharePrice = 1n << 254n;
    const [cost, canFill] = await quote.quote(sharePrice, 1, 1);
    expect(cost).to.equal(1n << 255n);
    expect(canFill).to.equal(true);
  });

  it("halves the even factor when the span is odd", async function () {
    const quote = await deploy();
    const sharePrice = 1n << 254n;
    const [cost, canFill] = await quote.quote(sharePrice, 2, 0);
    expect(cost).to.equal(3n * sharePrice);
    expect(canFill).to.equal(false);
  });

  it("prices a long order in closed form", async function () {
    const quote = await deploy();
    const [cost, canFill] = await quote.quote(7, 8000, 20000);
    expect(cost).to.equal(1344028000n);
    expect(canFill).to.equal(true);
    const gas = await quote.quote.estimateGas(7, 8000, 20000);
    expect(gas).to.be.lessThan(100000n);
  });

  it("matches the BrickFi API quote for property 1", async function () {
    const url = "http://localhost:4000/api/properties/1/quote?shares=4";
    let response;
    try {
      response = await fetch(url);
    } catch {
      expect.fail("BrickFi API must be running at http://localhost:4000");
    }
    expect(response.ok, "BrickFi API must be running at http://localhost:4000").to.equal(true);

    const body = await response.json();
    const quote = await deploy();
    const [cost, canFill] = await quote.quote(body.sharePrice, body.shares, body.remaining);
    expect(cost).to.equal(BigInt(body.cost));
    expect(canFill).to.equal(body.canFill);
  });
});
