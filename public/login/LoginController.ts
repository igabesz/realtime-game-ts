/**
 * Created by S on 2015.11.30..
 */

interface ILoginScope extends ng.IScope {
    isLoginView : boolean;
    isSignupView : boolean;

    signupEmail: string;
    signupUsername: string;
    signupPassword: string;

    loginUsername: string;
    loginPassword: string;
}


class LoginController {

    static $inject = ['$scope', '$http', '$interval', '$location'];


    constructor(private $scope: ILoginScope, private $http: ng.IHttpService) {
        $scope.isLoginView = true;
        $scope.isSignupView = false;

        $scope.signupEmail = "";
        $scope.signupUsername = "";
        $scope.signupPassword = "";

        $scope.loginUsername = "";
        $scope.loginPassword = "";

    }

    switchToLoginView(){
        this.$scope.isLoginView = true;
        this.$scope.isSignupView = false;
    }

    switchToSignupView(){
        this.$scope.isLoginView = false;
        this.$scope.isSignupView = true;
    }

    submitLogin(){
        this.post('/login',
            {"username": this.$scope.loginUsername, "password": this.$scope.loginPassword},
            (data) => {
                if(data.status === "success"){
                    this.notify(data.message, "success");
                    sessionStorage["token"] = data.authtoken;
                    sessionStorage["user"] = data.user;

                    if(data.user === "admin"){
                        window.location.href = '/admin/index.html';
                        return;
                    }

                    //window.location.href = "/";
                    this.get('/',
                        (data) => {
                            console.log(data);
                            if(data === "ok"){
                                window.location.href = '/index.html';
                            }
                        }
                    )


                } else {
                    this.notify("Username and password does not match!", "error");
                }
            }
        )
    }

    submitSignup(){
        this.post('/signedup',
            {"email": this.$scope.signupEmail, "username": this.$scope.signupUsername , "password": this.$scope.signupPassword},
            (data) => {
                if(data.status === "success"){

                    this.notify("Successfully signed up!", "success");
                } else {
                    this.notify("Username is already taken!", "error");
                }
            }
        )
    }

    private get(url: string, success: (any) => void): void {
        this.$http.get(url, {
            headers: {
                "Authorization": sessionStorage.getItem('token')
            }
        }).success((data)=>{
            success(data);
        }).error(() => {
            console.info("get error");
        });
    }

    private post(url: string, data: any, success: (any) => void): ng.IHttpPromise<any> {
        return this.$http.post(url, data, {
            headers: {
                "Authorization": sessionStorage.getItem('token')
            }
        }).success((data)=>{
            success(data);
        }).error(() => {console.info("post error");});
    }

    notify(notifyString: string, type){

        $("#notifyable").removeClass();
        var outputNotify = "";
        switch (type) {
            case "error":
                outputNotify += '<span class="glyphicon glyphicon-remove-sign" style="color:red"></span> ';
                $("#notifyable").addClass("alert alert-danger");
                break;
            case "success":
                outputNotify += '<span class="glyphicon glyphicon-ok-sign" style="color:green"></span> ';
                $("#notifyable").addClass("alert alert-success");
                break;
            case "info":
                $("#notifyable").addClass("alert alert-info");
                break;
            default:
                $("#notifyable").addClass("alert alert-info");
        }
        outputNotify += notifyString;
        $("#notifyable").html(outputNotify);

        this.animateNotify();
    }

    animateNotify() {
        $("#notifyable").animate({opacity: 1});
        setTimeout(function () {
            $("#notifyable").animate({opacity: 0});
        }, 4500);
    }
}
