import React, { useState } from "react";
import html2pdf from 'html2pdf.js';

function InvoiceForm() {
  const [formData, setFormData] = useState({
    image: null,
    invoiceTitle: "Tax Invoice",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [lineItems, setLineItems] = useState([
    { description: "", hsnSac: "", qty: 1, rate: 0, sgst: 0, cgst: 0, cess: 0, amount: 0 }
  ]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 1048576) {
      const reader = new FileReader();
      reader.onload = () => setFormData({ ...formData, image: reader.result });
      reader.readAsDataURL(file);
    } else {
      alert("Image size must be less than 1MB.");
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedLineItems = [...lineItems];
  
    if (field === "description" || field === "hsnSac") {
      updatedLineItems[index][field] = value; 
    } else {
      updatedLineItems[index][field] = parseFloat(value) || 0;  
    }
  
    updatedLineItems[index].amount =
      (parseFloat(updatedLineItems[index].qty) || 0) * (parseFloat(updatedLineItems[index].rate) || 0);
  
    setLineItems(updatedLineItems);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: "", hsnSac: "", qty: 1, rate: 0, sgst: 0, cgst: 0, cess: 0, amount: 0 }
    ]);
  };

  const deleteLineItem = (index) => {
    const updatedLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedLineItems);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((acc, item) => acc + item.amount, 0);
  };

  const calculateTax = (taxType) => {
    return lineItems.reduce((acc, item) => acc + item[taxType], 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax("sgst") + calculateTax("cgst") + calculateTax("cess");
  };

  const downloadPDF = () => {
    const element = document.querySelector(".invoice-container");
  
    const options = {
      margin: 1,
      filename: 'invoice.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true }, 
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
  
    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        console.log("PDF generated successfully!");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  return (
    <div className="mt-20 max-w-4xl mx-auto p-6 border-2 border-gray-300 rounded-lg shadow-lg invoice-container">
      <div className="flex justify-between items-start">
        <div className="flex">
          <div
            className="border-2 hover:border-solid border-dashed border-blue-300 cursor-pointer rounded-lg p-4 flex flex-col items-center justify-center"
            onClick={() => document.getElementById("file-upload").click()}
          >
            {!formData.image ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-5-4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <label htmlFor="file-upload" className="block cursor-pointer text-lg text-blue-500 py-2 px-4 rounded-lg text-center w-full">Upload</label>
                <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </>
            ) : (
              <img src={formData.image} alt="Uploaded logo" className="w-24 h-24 rounded-lg object-cover" />
            )}
          </div>
          <div className="mx-5 mt-2">
            <h5>Upload Logo</h5>
            <p className="text-sm w-[60%] text-gray-500 text-left">240 x 240 pixels @ 72 DPI, Maximum size of 1MB.</p>
          </div>
        </div>

        <div className={`p-2 border ${isEditing ? "border-blue-300" : "border-transparent"}`}>
          <h1
            className="text-6xl font-thin outline-none"
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onMouseEnter={() => setIsEditing(true)}
            onMouseLeave={() => setIsEditing(false)}
            onBlur={(e) => {
              handleFieldChange("invoiceTitle", e.target.innerText);
              setIsEditing(false);
            }}
          >
            {formData.invoiceTitle}
          </h1>
        </div>
      </div>

      <div className="mt-5 flex flex-col space-y-3 w-1/2 p-1">
        {["Your Company", "Your Name", "Company's GSTIN", "Company's Address", "City", "State", "Country"].map((placeholder, index) => (
          <input key={index} type="text" className="outline-none border py-1 border-transparent hover:border-blue-300 transition" placeholder={placeholder} />
        ))}
      </div>

      <div className="mt-10 flex flex-row justify-between">
        <div className="flex flex-col space-y-3">
          <h2 className="font-bold">Bill To:</h2>
          {["Your Client's Company", "Client's GSTIN", "Client's Address", "City", "State", "Country"].map((placeholder, index) => (
            <input key={index} type="text" className="outline-none border py-1 border-transparent hover:border-blue-300 transition" placeholder={placeholder} />
          ))}
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <h4 className="font-bold w-32 ">Invoice#</h4>
            <input type="text" className="outline-none border border-transparent hover:border-blue-300 transition flex-1" placeholder="INV-12" />
          </div>
          <div className="flex flex-row justify-between items-center mt-1">
            <h4 className="font-bold w-32">Invoice Date</h4>
            <input type="date" className="outline-none border border-transparent hover:border-blue-300 transition flex-1" />
          </div>
          <div className="flex flex-row justify-between items-center mt-1">
            <h4 className="font-bold w-32">Due Date</h4>
            <input type="date" className="outline-none border border-transparent hover:border-blue-300 transition flex-1" />
          </div>
        </div>
      </div>
      <div className="flex mt-8">
        <h4 className="mr-4">Place of Supply:</h4>
        <input type="text" className="outline-none border border-transparent hover:border-blue-300 transition flex-1" placeholder="State" />
      </div>

      <div className="mt-8">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left bg-black text-white">
              <th className="p-2">Item Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>SGST</th>
              <th>CGST</th>
              <th>Cess</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index} className="border-b">
                <td>
                  <input
                    type="text"
                    placeholder="Enter item name/description"
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                    className="outline-none w-[50%] mt-2 border border-transparent hover:border-blue-300 transition"
                  />
                  <input
                    type="text"
                    placeholder="HSN/SAC"
                    value={item.hsnSac}
                    onChange={(e) => handleLineItemChange(index, "hsnSac", e.target.value)}
                    className="outline-none w-full mt-4 mb-4 border border-transparent hover:border-blue-300 transition"
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => handleLineItemChange(index, "qty", parseFloat(e.target.value))}
                    className="outline-none w-16 text-right border border-transparent hover:border-blue-300 transition"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.rate}
                    onChange={(e) => handleLineItemChange(index, "rate", parseFloat(e.target.value))}
                    className="outline-none w-20 text-right border border-transparent hover:border-blue-300 transition"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.sgst}
                    onChange={(e) => handleLineItemChange(index, "sgst", parseFloat(e.target.value))}
                    className="outline-none w-16 text-right border border-transparent hover:border-blue-300 transition"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.cgst}
                    onChange={(e) => handleLineItemChange(index, "cgst", parseFloat(e.target.value))}
                    className="outline-none w-16 text-right border border-transparent hover:border-blue-300 transition"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.cess}
                    onChange={(e) => handleLineItemChange(index, "cess", parseFloat(e.target.value))}
                    className="outline-none w-16 text-right border border-transparent hover:border-blue-300 transition"
                  />
                </td>
                <td className="text-right">{item.amount.toFixed(2)}</td>
                <td className="text-right">
                  <button onClick={() => deleteLineItem(index)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 flex justify-between items-center">
          <button onClick={addLineItem} className="text-blue-500 -mt-[16%] rounded-lg">
            + Add Line Item
          </button>

          <div className="w-[30vw] flex flex-col justify-between">
            <div className="mt-2 flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-gray-600">SGST(6%)</span>
              <span>{calculateTax("sgst").toFixed(2)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-gray-600">CGST(6%)</span>
              <span>{calculateTax("cgst").toFixed(2)}</span>
            </div>
            <div className="mt-2 flex justify-between bg-gray-100 py-3 rounded-xl px-1">
              <span className="text-gray-600">TOTAL</span>
              <span>{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <h4>Notes</h4>
        <input type="text" className="text-black w-full mt-2 outline-none border-2 border-transparent hover:border-blue-300 transition" placeholder="It was great doing business with you." />
      </div>
      <div className="mt-4">
        <h4>Terms & Conditions</h4>
        <input type="text" className="text-black w-full mt-2 outline-none border-2 border-transparent hover:border-blue-300 transition" placeholder="Please make the payment by the due date." />
      </div>

      <button onClick={downloadPDF} className="mt-5 bg-blue-500 text-white py-2 px-4 rounded">
        Download Invoice
      </button>
    </div>
  );
}

export default InvoiceForm;
