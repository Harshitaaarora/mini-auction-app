import PDFDocument from "pdfkit";
import fs from "fs";

export async function generateInvoicePDF({ auction, buyer, seller, amount }) {
  const path = `/tmp/invoice-auction-${auction.id}.pdf`;
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(path);
  doc.pipe(stream);
  doc.fontSize(18).text("Auction Invoice", { align: "center" }).moveDown();
  doc.fontSize(12)
    .text(`Auction: ${auction.itemName}`)
    .text(`Amount: ₹${amount}`)
    .text(`Seller: ${seller.name} (${seller.email})`)
    .text(`Buyer: ${buyer.name} (${buyer.email})`)
    .text(`Auction ID: ${auction.id}`)
    .moveDown()
    .text("Thank you for using Mini Auction!");
  doc.end();
  await new Promise((res) => stream.on("finish", res));
  return path;
}
