const notifyModel = require("../Models/notificationModel");
const dateFormat = require("../utils/dateFormat")

const sendNotify = async(datas, category) => {
    try{
        console.log(datas)
        let notifyData = {};

        if(category == "USRG") {    // For Login Notifications
            if(!datas.name && !datas.email && !datas.Mobile) return 0;

            if(notifyData !== null && notifyData !== undefined)
                notifyData = {};

            // Set the notification datas
            notifyData.Title = "New User Registration";
            notifyData.Content = `${datas.name} has Successfully Registered using Mobile No. ${datas.Mobile} and Email ${datas.email}`;
            notifyData.Category = category;
            notifyData.createdDate = dateFormat('NNMMYY|TT:TT');
            notifyData.MarkAsRead = false;

        }

        if(category == "CMTPST"){
            if(!datas.UserId && !datas.productName) return 0;

            if(notifyData !== null && notifyData !== undefined)
                notifyData = {};

            // Set the notification datas
            notifyData.Title = "New Review Posted";
            notifyData.Content = `${datas.UserId} was posted a comment on the product ${datas.productName}`;
            notifyData.Category = category;
            notifyData.createdDate = dateFormat('NNMMYY|TT:TT');
            notifyData.MarkAsRead = false;
        }
        
        if(category == "PRDAD"){
            if(!datas.productId && !datas.productName && !datas.Qty && !datas.Price) return 0;

            if(notifyData !== null && notifyData !== undefined)
                notifyData = {};

            // Set the notification datas
            notifyData.Title = "New Product Added";
            notifyData.Content = `${datas.productId} :${datas.productName} has been added to the stock with ${datas.Qty} units. Price set as ${datas.Price}`;
            notifyData.Category = category;
            notifyData.createdDate = dateFormat('NNMMYY|TT:TT');
            notifyData.MarkAsRead = false;
        }

        if(category == "ORDPRCS"){
            if(!datas.product && !datas.Qty) return 0;

            if(notifyData !== null && notifyData !== undefined)
                notifyData = {};

            // Set the notification datas
            notifyData.Title = "Order Status";
            notifyData.Content = `${datas.product} with ${datas.Qty} was ordered on ${dateFormat('MM-DDTH-YYYY')}`;
            notifyData.Category = category;
            notifyData.createdDate = dateFormat('NNMMYY|TT:TT');
            notifyData.MarkAsRead = false;
        }

        if(category == "ORDPYMT"){
            if(!datas.product && !datas.Qty) return 0;

            if(notifyData !== null && notifyData !== undefined)
                notifyData = {};

            // Set the notification datas
            notifyData.Title = "Order Payment Request";
            notifyData.Content = `${datas.product} : Quantity ${datas.Qty}, Was Ordered through UPI`;
            notifyData.Category = category;
            notifyData.createdDate = dateFormat('NNMMYY|TT:TT');
            notifyData.MarkAsRead = false;
        }

        if(category == "PRDDISP"){
            if(!datas.orderID) return 0;

            if(notifyData !== null && notifyData !== undefined)
                notifyData = {};

            // Set the notification datas
            notifyData.Title = "Order Dispatched";
            notifyData.Content = `${datas.orderID} product was dispatched to the given address.`;
            notifyData.Category = category;
            notifyData.createdDate = dateFormat('NNMMYY|TT:TT');
            notifyData.MarkAsRead = false;
        }
        await notifyModel.create(notifyData);
        return true;
    } catch(err){
        return false;
    }
}

module.exports = sendNotify;