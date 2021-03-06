describe("WebApiClient", function() {
    var fakeUrl = "http://unit-test.local";
    var account;
    var contact;
    var xhr;
    var successMock = {
        result: "Success"
    };
    
    Xrm = {};
    Xrm.Page = {};
    Xrm.Page.context = {};
    Xrm.Page.context.getClientUrl = function() {
        return fakeUrl;
    }
    
    RegExp.escape= function(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}   ;
    
    beforeEach(function() {
        account = { 
            Name: "Adventure Works"
        };
        
        contact = {
            FirstName: "Joe"
        };

        xhr = sinon.fakeServer.create();
        
        // Respond to Create Request for account with No-Content response and created entity url in header
        var createAccountUrl = new RegExp(RegExp.escape(fakeUrl + "/api/data/v8.0/accounts", "g"));
        xhr.respondWith("POST", createAccountUrl,
            [204, { "Content-Type": "application/json", "OData-EntityId": "Fake-Account-Url" }, JSON.stringify(successMock)]
        );
        
        // Respond to Retrieve by id Request for account 
        var retrieveAccountUrl = RegExp.escape(fakeUrl + "/api/data/v8.0/accounts(00000000-0000-0000-0000-000000000001)");
        xhr.respondWith("GET", new RegExp(retrieveAccountUrl, "g"),
            [200, { "Content-Type": "application/json" }, JSON.stringify(account)]
        );
        
        // Respond to Retrieve by id Request for account 
        var retrieveAccountUrl = RegExp.escape(fakeUrl + "/api/data/v8.0/accounts?$select=name,revenue,&$orderby=revenue asc,name desc&$filter=revenue ne null");
        xhr.respondWith("GET", new RegExp(retrieveAccountUrl, "g"),
            [200, { "Content-Type": "application/json" }, JSON.stringify([account])]
        );
        
        // Respond to Retrieve Request for contact with alternate key 
        var retrieveByAlternateKeyUrl = RegExp.escape(fakeUrl + "/api/data/v8.0/contacts(firstname='Joe',emailaddress1='abc@example.com')");
        xhr.respondWith("GET", new RegExp(retrieveByAlternateKeyUrl, "g"),
            [200, { "Content-Type": "application/json" }, JSON.stringify(contact)]
        );
        
        // Respond to update Request for account 
        var updateAccountUrl = RegExp.escape(fakeUrl + "/api/data/v8.0/accounts(00000000-0000-0000-0000-000000000001)");
        xhr.respondWith("PATCH", new RegExp(updateAccountUrl, "g"),
            [204, { "Content-Type": "application/json" }, JSON.stringify(successMock)]
        );
        
        // Respond to Delete Request for account 
        var deleteAccountUrl = RegExp.escape(fakeUrl + "/api/data/v8.0/accounts(00000000-0000-0000-0000-000000000001)");
        xhr.respondWith("DELETE", new RegExp(deleteAccountUrl, "g"),
            [204, { "Content-Type": "application/json" }, JSON.stringify(successMock)]
        );
        
        // Respond to Associate Request for account 
        var associateAccountUrl = RegExp.escape(fakeUrl + "/api/data/v8.0/accounts(00000000-0000-0000-0000-000000000002)/opportunity_customer_accounts/$ref");
        xhr.respondWith("POST", new RegExp(associateAccountUrl, "g"),
            [204, { "Content-Type": "application/json" }, JSON.stringify(successMock)]
        );
        
        // Respond to Delete Request for account 
        var disassociateAccountUrl = RegExp.escape(fakeUrl + "/api/data/v8.0/accounts(00000000-0000-0000-0000-000000000002)/opportunity_customer_accounts(00000000-0000-0000-0000-000000000001)/$ref");
        xhr.respondWith("DELETE", new RegExp(disassociateAccountUrl, "g"),
            [204, { "Content-Type": "application/json" }, JSON.stringify(successMock)]
        );
        
        // Respond to overridden set name requests
        var boundOverriddenSetUrl = fakeUrl + "/api/data/v8.0/contactleadscollection(00000000-0000-0000-0000-000000000003)";
        var unboundOverriddenSetUrl = fakeUrl + "/api/data/v8.0/contactleadscollection";
        
        xhr.respondWith("GET", boundOverriddenSetUrl,
            [200, { "Content-Type": "application/json" }, JSON.stringify(successMock)]
        );
        
        xhr.respondWith("POST", boundOverriddenSetUrl,
            [204, { "Content-Type": "application/json" }, JSON.stringify(successMock)]
        );
        
        xhr.respondWith("POST", unboundOverriddenSetUrl,
            [204, { "Content-Type": "application/json" }, JSON.stringify(successMock)]
        );
        
        xhr.respondWith("PATCH", boundOverriddenSetUrl,
            [204, { "Content-Type": "application/json" }, JSON.stringify(successMock)]
        );
        
        xhr.respondWith("DELETE", boundOverriddenSetUrl,
            [204, { "Content-Type": "application/json" }, JSON.stringify(successMock)]
        );
        
        // Respond to Associate Request for account 
        var associateOverriddenUrl = RegExp.escape(fakeUrl + "/api/data/v8.0/contactleadscollection(00000000-0000-0000-0000-000000000003)/opportunity_customer_accounts/$ref");
        xhr.respondWith("POST", new RegExp(associateOverriddenUrl, "g"),
            [204, { "Content-Type": "application/json" }, JSON.stringify(successMock)]
        );
        
        // Respond to Delete Request for account 
        var disassociateOverriddenUrl = RegExp.escape(fakeUrl + "/api/data/v8.0/contactleadscollection(00000000-0000-0000-0000-000000000003)/opportunity_customer_accounts(00000000-0000-0000-0000-000000000003)/$ref");
        xhr.respondWith("DELETE", new RegExp(disassociateOverriddenUrl, "g"),
            [204, { "Content-Type": "application/json" }, JSON.stringify(successMock)]
        );
    });
    
    afterEach(function() {
       xhr.restore(); 
    });
    
    describe("Operations", function() {
        it("should know the create operation", function() {
            expect(WebApiClient.Create).toBeDefined();
        }); 
      
        it("should know the retrieve operation", function() {
            expect(WebApiClient.Retrieve).toBeDefined();
        });
        
        it("should know the update operation", function() {
            expect(WebApiClient.Update).toBeDefined();
        });
        
        it("should know the delete operation", function() {
            expect(WebApiClient.Delete).toBeDefined();
        });
        
        it("should know the associate operation", function() {
            expect(WebApiClient.Associate).toBeDefined();
        });
        
        it("should know the disassociate operation", function() {
            expect(WebApiClient.Disassociate).toBeDefined();
        });
    });
    
    describe("SetNames", function() {
        it("should append s if no special ending", function() {
            var accountSet = WebApiClient.GetSetName("account");
            expect(accountSet).toEqual("accounts");
        }); 
        
        it("should append ies if ends in y", function() {
            var citySet = WebApiClient.GetSetName("city");
            expect(citySet).toEqual("cities");
        });
        
        it("should append es if ends in s", function() {
            // I know that this is grammatically incorrect, WebApi does this however
            var settingsSet = WebApiClient.GetSetName("settings");
            expect(settingsSet).toEqual("settingses");
        });
        
        it("should allow to override set names for all requests", function(done) {
            var requests = [];
            
            var createRequest = {
                overriddenSetName: "contactleadscollection",
                entity: {name: "Contoso"}
            };
            requests.push(WebApiClient.Create(createRequest));
            
            var retrieveRequest = {
                overriddenSetName: "contactleadscollection",
                entityId: "00000000-0000-0000-0000-000000000003"
            };
            requests.push(WebApiClient.Retrieve(retrieveRequest));
            
            var updateRequest = {
                overriddenSetName: "contactleadscollection",
                entityId: "00000000-0000-0000-0000-000000000003",
                entity: {name: "Contoso"}
            };
            requests.push(WebApiClient.Update(updateRequest));
            
            var deleteRequest = {
                overriddenSetName: "contactleadscollection",
                entityId: "00000000-0000-0000-0000-000000000003"
            };
            requests.push(WebApiClient.Delete(deleteRequest));
            
            var associateRequest = {
                relationShip: "opportunity_customer_accounts",
                source: 
                    {
                        overriddenSetName: "contactleadscollection",
                        entityId: "00000000-0000-0000-0000-000000000003"
                    },
                target: 
                    {
                        overriddenSetName: "contactleadscollection",
                        entityId: "00000000-0000-0000-0000-000000000003"
                    }
            };
            requests.push(WebApiClient.Associate(associateRequest));
            
            var disassociateRequest = {
                relationShip: "opportunity_customer_accounts",
                source: 
                    {
                        overriddenSetName: "contactleadscollection",
                        entityId: "00000000-0000-0000-0000-000000000003"
                    },
                target: 
                    {
                        overriddenSetName: "contactleadscollection",
                        entityId: "00000000-0000-0000-0000-000000000003"
                    }
            };
            requests.push(WebApiClient.Disassociate(disassociateRequest));
            
            Promise.all(requests)
            .then(function (results){})
            .catch(function (error) {
                expect(error).toBeUndefined();
            })
            .finally(done);
            
            xhr.respond();
        });
    });
    
    describe("Create", function() {      
        it("should fail if no entity name passed", function(){
            expect(function() {
                WebApiClient.Create({entity: account});
            }).toThrow();
        });
        
        it("should fail if no update entity passed", function(){
            expect(function() {
                WebApiClient.Create({entityName: "account"});
            }).toThrow();
        });
        
        it("should create record and return record URL", function(done){
            WebApiClient.Create({entityName: "account", entity: account})
                .then(function(response){
                    expect(response).toEqual("Fake-Account-Url");
                })
                .catch(function(error) {
                    expect(error).toBeUndefined();
                })
                // Wait for promise
                .finally(done);
            
            xhr.respond();
        });
    });

    describe("Retrieve", function() {      
        it("should fail if no entity name passed", function(){
            expect(function() {
                WebApiClient.Retrieve({});
            }).toThrow();
        });
        
        it("should retrieve by id", function(done){
            WebApiClient.Retrieve({entityName: "account", entityId: "00000000-0000-0000-0000-000000000001"})
                .then(function(response){
                    expect(response).toEqual(account);
                })
                .catch(function(error) {
                    expect(error).toBeUndefined();
                })
                // Wait for promise
                .finally(done);
            
            xhr.respond();
        });
        
        it("should retrieve multiple with query params", function(done){
            var request = {
                entityName: "account", 
                queryParams: "?$select=name,revenue,&$orderby=revenue asc,name desc&$filter=revenue ne null"
            };
            
            WebApiClient.Retrieve(request)
                .then(function(response){
                    expect(response).toEqual([account]);
                })
                .catch(function(error) {
                    expect(error).toBeUndefined();
                })
                // Wait for promise
                .finally(done);
            
            xhr.respond();
        });
        
        it("should retrieve by alternative key", function(done){
            WebApiClient.Retrieve(
            {
                entityName: "contact", 
                alternateKey: 
                    [
                        { property: "firstname", value: "Joe" },
                        { property: "emailaddress1", value: "abc@example.com"}
                    ]
            })
            .then(function(response){
                expect(response).toEqual(contact);
            })
            .catch(function(error) {
                expect(error).toBeUndefined();
            })
            // Wait for promise
            .finally(done);
            
            xhr.respond();
        });
    });
    
    describe("Update", function() {
        it("should fail if no entity Id passed", function(){
            expect(function() {
                WebApiClient.Update({entityName: "account", entity: account});
            }).toThrow();
        });
        
        it("should fail if no entity name passed", function(){
            expect(function() {
                WebApiClient.Update({entityId: "00000000-0000-0000-0000-000000000001", entity: account});
            }).toThrow();
        });
        
        it("should fail if no update entity passed", function(){
            expect(function() {
                WebApiClient.Update({entityName: "account", entityId: "00000000-0000-0000-0000-000000000001"});
            }).toThrow();
        });
        
        it("should update record and return", function(done){
            WebApiClient.Update({entityName: "account", entityId: "00000000-0000-0000-0000-000000000001",  entity: account})
                .then(function(response){
                    expect(response).toBeDefined();
                })
                .catch(function(error) {
                    expect(error).toBeUndefined();
                })
                // Wait for promise
                .finally(done);
            
            xhr.respond();
        });
    });
    
    describe("Delete", function() {
        it("should fail if no entity Id passed", function(){
            expect(function() {
                WebApiClient.Delete({entityName: "account"});
            }).toThrow();
        });
        
        it("should fail if no entity name passed", function(){
            expect(function() {
                WebApiClient.Delete({entityId: "00000000-0000-0000-0000-000000000001"});
            }).toThrow();
        });
        
        it("should delete record and return", function(done){
            WebApiClient.Delete({entityName: "account", entityId: "00000000-0000-0000-0000-000000000001"})
                .then(function(response){
                    expect(response).toBeDefined();
                })
                .catch(function(error) {
                    expect(error).toBeUndefined();
                })
                // Wait for promise
                .finally(done);
            
            xhr.respond();
        });
    });
    
    describe("Associate", function() {
        it("should fail if no target passed", function(){
            expect(function() {
                WebApiClient.Associate(
                {
                    relationShip: "opportunity_customer_accounts",
                    source: 
                        {
                            entityName: "opportunity",
                            entityId: "00000000-0000-0000-0000-000000000001"
                        }
                });
            }).toThrow();
        });
        
        it("should fail if no source passed", function(){
            expect(function() {
                WebApiClient.Associate(
                {
                    relationShip: "opportunity_customer_accounts",
                    target: 
                        {
                            entityName: "account",
                            entityId: "00000000-0000-0000-0000-000000000002"
                        }
                });
            }).toThrow();
        });
        
        it("should fail if no relationShip passed", function(){
            expect(function() {
                WebApiClient.Associate(
                {
                    source: 
                        {
                            entityName: "opportunity",
                            entityId: "00000000-0000-0000-0000-000000000001"
                        },
                    target: 
                        {
                            entityName: "account",
                            entityId: "00000000-0000-0000-0000-000000000002"
                        }
                });
            }).toThrow();
        });
        
        it("should associate record and return", function(done){
            WebApiClient.Associate(
                {
                    relationShip: "opportunity_customer_accounts",
                    source: 
                        {
                            entityName: "opportunity",
                            entityId: "00000000-0000-0000-0000-000000000001"
                        },
                    target: 
                        {
                            entityName: "account",
                            entityId: "00000000-0000-0000-0000-000000000002"
                        }
                })
                .then(function(response){
                    expect(response).toBeDefined();
                })
                .catch(function(error) {
                    expect(error).toBeUndefined();
                })
                // Wait for promise
                .finally(done);
            
            xhr.respond();
        });
    });
    
    describe("Disassociate", function() {
        it("should fail if no target passed", function(){
            expect(function() {
                WebApiClient.Disassociate(
                {
                    relationShip: "opportunity_customer_accounts",
                    source: 
                        {
                            entityName: "opportunity",
                            entityId: "00000000-0000-0000-0000-000000000001"
                        }
                });
            }).toThrow();
        });
        
        it("should fail if no source passed", function(){
            expect(function() {
                WebApiClient.Disassociate(
                {
                    relationShip: "opportunity_customer_accounts",
                    target: 
                        {
                            entityName: "account",
                            entityId: "00000000-0000-0000-0000-000000000002"
                        }
                });
            }).toThrow();
        });
        
        it("should fail if no relationShip passed", function(){
            expect(function() {
                WebApiClient.Disassociate(
                {
                    source: 
                        {
                            entityName: "opportunity",
                            entityId: "00000000-0000-0000-0000-000000000001"
                        },
                    target: 
                        {
                            entityName: "account",
                            entityId: "00000000-0000-0000-0000-000000000002"
                        }
                });
            }).toThrow();
        });
                
        it("should disassociate record and return", function(done){
            WebApiClient.Disassociate(
                {
                    relationShip: "opportunity_customer_accounts",
                    source: 
                        {
                            entityName: "opportunity",
                            entityId: "00000000-0000-0000-0000-000000000001"
                        },
                    target: 
                        {
                            entityName: "account",
                            entityId: "00000000-0000-0000-0000-000000000002"
                        }
                })
                .then(function(response){
                    expect(response).toBeDefined();
                })
                .catch(function(error) {
                    expect(error).toBeUndefined();
                })
                // Wait for promise
                .finally(done);
            
            xhr.respond();
        });
    });
    
    describe("Headers", function() {
        it("should set default headers", function(){
            expect(WebApiClient.GetDefaultHeaders()).toBeDefined();
        });
        
        it("should allow to add own default headers", function(){
            var testHeader = {key: "newHeader", value: "newValue"};
            WebApiClient.AppendToDefaultHeaders (testHeader);
            
            var defaultHeaders = WebApiClient.GetDefaultHeaders();
            
            expect(defaultHeaders[defaultHeaders.length - 1]).toEqual(testHeader);
        });
    });
    
    describe("API Version", function() {
        it("should default to 8.0", function() {
            expect(WebApiClient.GetApiVersion()).toEqual("8.0");
        }); 
        
        it("should be editable", function() {
            WebApiClient.SetApiVersion("8.1")
            
            expect(WebApiClient.GetApiVersion()).toEqual("8.1");
        }); 
    });
});