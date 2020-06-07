sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"

], function (Controller, MessageToast, Fragment, ResourceModel, Filter,  FilterOperator, Sorter) {
   "use strict";
   return Controller.extend("org.ubb.books.controller.BookList", {
    onInit: function(){
        this.book = {
            ISBN : "",
            Title:"",
            Author:"",
            DatePublished: "",
            Language:"",
            TotalNumber:"",
            AvailbleNumber: 0
        }
    },
       
        // opens  a new  dialog box
        sort: function (){
            this._oDialog = sap.ui.xmlfragment("org.ubb.books.view.utils.sort", this);
            this.getView().addDependent(this._oDialog);
            this._oDialog.open();
        },

        onConfirmSort(oEvent){
            var oView = this.getView();
            var oTable = oView.byId("idBooksTable");
            var mParams = oEvent.getParameters();
            var oBinding = oTable.getBinding("items");

            // apply the sorter
            var aSorters = [];
            var sPath = mParams.sortItem.getKey();
            var bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));
            oBinding.sort(aSorters);             
        
        
        },

       
        delete(oEvent){
         
            
            const aSelContexts = this.byId("idBooksTable").getSelectedContexts();
            if (aSelContexts.length != 0){
                const sBookPath = aSelContexts[0].getPath();
                this.getView().getModel().remove(sBookPath);
            } else {
                MessageToast.show("No book selected"); 
            }
        },

        insert(oEvent){
            this.clearData();
            if(!this.newBookDialog){
                this.newBookDialog = sap.ui.xmlfragment("org.ubb.books.view.utils.insert",this);
            }
           
            // Set the JSON Model and open Fragment
            var oModel = new sap.ui.model.json.JSONModel();
            this.getView().addDependent(this.newBookDialog);
            this.newBookDialog.setModel(oModel);
            this.newBookDialog.getModel().setData(this.book);
            this.newBookDialog.open();
        },
       
        parse(oBook ){ 
            var dateString = oBook.DatePublished;
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
            var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;
            var parsedDate = new Date(dateFormat.parse(dateString).getTime() - TZOffsetMs).getTime();
            oBook.DatePublished ="\/Date(" + parsedDate + ")\/";
            return oBook;
        },

        parseUpdate(oBook){
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" }); 
            var date = new Date(oBook.DatePublished);
            var dateStr = dateFormat.format(date);
            oBook.DatePublished = dateStr;
  
            return oBook;
    
            },
  
    
        /*
        * Triggers when the saveBook button on the Insert Fragment is pressed.
        */
        saveBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
           
                // Parse the date and insert
                this.book = this.parse(this.book);
                var oModel = this.getView().getModel();
                oModel.create('/Books', this.book, {
                    success: function() {
                        MessageToast.show(oResourceBundle.getText("saveSuccess"));
                    },
                    error: function(){
                        MessageToast.show(oResourceBundle.getText("saveError"));
                    }
                });
            
                this.newBookDialog.close();
           
        },


       update(oEvent){
        var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
        const aSelContext = this.byId("idBooksTable").getSelectedContexts();
        if (aSelContext.length != 0){
            // Get the selected Book and fills the inputs of the fragment
            var oBook = aSelContext[0].getObject();
            oBook = this.parseUpdate(oBook);
            this.book = oBook;
            if(!this.updateBookDialog){
                this.updateBookDialog = sap.ui.xmlfragment("org.ubb.books.view.utils.update",this);
            }
            // Set the JSON Model and open Fragment
            var oModel = new sap.ui.model.json.JSONModel();
            this.getView().addDependent(this.updateBookDialog);
            this.updateBookDialog.setModel(oModel);
            this.updateBookDialog.getModel().setData(this.book);
            this.updateBookDialog.open();
        } else {
            MessageToast.show(oResourceBundle.getText("noSelectionUpdateError"));
        }
    },

        updateBook(oEvent){           
           
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            
                // Get the Path of the selected book and update
                this.book = this.parse(this.book);
                const aSelContexts = this.byId("idBooksTable").getSelectedContexts();
                const sBookPath = aSelContexts[0].getPath();
                var oModel = this.getView().getModel();
                oModel.update(sBookPath, this.book, {
                    success: function() {
                        MessageToast.show(oResourceBundle.getText("updateSuccess"));
                    },
                    error: function(){
                        MessageToast.show(oResourceBundle.getText("updateError"));
                    }
                });
                this.updateBookDialog.close();
          
        },

        checkout(oEvent){
            this.clearData();
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const aSelContexts = this.byId("idBooksTable").getSelectedContexts();
            const sBookPath = aSelContexts[0].getPath();

           
            // Get the Path of the selected book and update
            var oBook = aSelContexts[0].getObject();
            oBook = this.parseUpdate(oBook);
            oBook.AvailbleNumber = oBook.AvailbleNumber -1;
            oBook= this.parse(oBook)
            var oModel = this.getView().getModel();
            oModel.update(sBookPath, oBook, {
                success: function() {
                    MessageToast.show(oResourceBundle.getText("checkoutSuccess"));
                },
                error: function(){
                    MessageToast.show(oResourceBundle.getText("updateError"));
                }
            });
           
        },

      
        clearData(){
            this.book.ISBN = "";
            this.book.Title = "";
            this.book.Author = "";
            this.book.DatePublished = "";
            this.book.Language = "";
            this.book.TotalNumber = 0;
            this.book.AvailbleNumber = 0;
        },
     
    });
       

});