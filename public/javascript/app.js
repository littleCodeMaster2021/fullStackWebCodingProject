/* global angular */
/* eslint-disable prefer-arrow-callback, no-restricted-syntax, prefer-destructuring */
/* eslint-disable no-unused-vars, func-names, no-alert */
/* eslint no-restricted-globals: ["error", "event"] */

const app = angular.module('CIS557', []);
const { localStorage } = window;
localStorage.clear();

app.controller('resetPasswordController', function ($scope, $http, $window) {
  $scope.returnBack = async function () {
    window.location.assign('/index');
  };
});
//   $scope.onExit = function () {
//     $http.get('/session/destroy').then((res) => {
//       window.location.href = '/index';
//     });
//   };
//   // $window.onbeforeunload =  $scope.onExit;

//   // Get user id from URL
//   const url = window.location.search;
//   // // console.log(url);
//   $scope.email = url.substring(1).split('?')[0];
//   // Set Some redirect functions
//   $scope.getUpdateInfoPage = function () {
//     return `/updateProfile?${$scope.email}`;
//   };

//   $scope.changeImgToURL = function (postid) {
//     const filesSelected = document.getElementById(postid).files;
//     if (filesSelected.length > 0) {
//       const fileToLoad = filesSelected[0];
//       const fileReader = new FileReader();
//       fileReader.onload = function (fileLoadedEvent) {
//         $scope.imageSrcNew = fileLoadedEvent.target.result;
//         // console.log('1', $scope.imageSrcNew);
//         if ($scope.imageSrcNew !== undefined) {
//           const newpostid = postid.slice(1);
//           document.getElementById('3'.concat(newpostid)).src = $scope.imageSrcNew;
//           $scope.imageSrcNew = $scope.imageSrcNew.split(',')[1];
//           // // console.log($scope.imageSrcNew);
//           const corrPostID = newpostid;
//           const request1 = $http({
//             url: `/editImage/${corrPostID}`,
//             method: 'POST',
//             data: {
//               imageSrcNew: $scope.imageSrcNew,
//             },
//           });
//           request1.then(() => {
//             // console.log('success in changing');
//           },
//           (err) => {
//             throw new Error(`reject sending image data: ${err}`);
//           });
//         }
//       };
//       fileReader.readAsDataURL(fileToLoad);
//     }
//   };

//   $scope.changePicture = async function (postid) {
//     const imgRoot = document.getElementById(postid);
//     const input = document.createElement('input');
//     input.setAttribute('id', '6'.concat(postid));
//     input.setAttribute('type', 'file');
//     input.setAttribute('class', 'text-center center-block file-upload');
//     input.setAttribute('onchange', 'angular.element(this).scope().changeImgToURL(this.id)');
//     imgRoot.appendChild(input);
//   };

//   /**
//    * Sign out logic:
//    * Clear all the cookies as well as the session.
//    * */
//   $scope.signOut = function () {
//     const request = $http({
//       url: '/signOut',
//       method: 'GET',
//       params: {
//         user: $scope.email,
//       },
//     });
//     request.then((res) => {
//       if (res.status === 200) {
//         window.location.href = '/index';
//       }
//     });
//   };

//   $scope.curPage = 1;
//   $scope.itemsPerPage = 3;
//   $scope.maxSize = 5;
// });


app.controller('registerController', function ($scope, $http) {
  $scope.passwordStrength = {
    width: '40px',
    height: '20px',
    'margin-left': '5px',
    flex: 1,
  };

  const strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#%&])(?=.{8,})');
  const mediumRegex = new RegExp('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})');

  $scope.analyze = function (value) {
    if (strongRegex.test(value)) {
      $scope.passwordStrength['background-color'] = 'green';
    } else if (mediumRegex.test(value)) {
      $scope.passwordStrength['background-color'] = 'orange';
    } else {
      $scope.passwordStrength['background-color'] = 'red';
    }
  };

  $scope.returnBack = async function () {
    window.location.assign('/index');
  };
  $scope.register = async function () {
    // console.log(`Test ${$scope.email}`);

    const request = $http({
      url: '/register',
      method: 'POST',
      data: {
        name: $scope.name,
        email: $scope.email,
        pass: $scope.password,
        rePass: $scope.rePass,
        agreeTerm: $scope.agree,
        imageSrc: 'http://ssl.gstatic.com/accounts/ui/avatar_2x.png',
      },
    });
    // console.log(request.$scope.data);
    await request.then(
      (response) => {
        // console.log(response);
        if (response.status === 200) {
          window.location.assign('/signIn');
          // console.log(response);
        } else {
          // console.log(`${response.status}: ${response.data}`);
          window.alert(response.data);
          window.location.assign('/register');
        }
      }, (error) => {
        window.alert(error.data);
        window.location.assign('/register');
      },
    );
  };
  // $http.location.href = "/signIn";
});

app.controller('updateUserInformation', function ($scope, $http) {
  $scope.onExit = function () {
    $http.get('/session/destroy').then((res) => {
      window.location.href = '/index';
    });
  };
  $scope.passwordStrength = {
    width: '620px',
    height: '20px',
    'margin-right': '50px',
    flex: 1,
  };
  const strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#%&])(?=.{8,})');
  const mediumRegex = new RegExp('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})');
  $scope.analyze = function (value) {
    if (strongRegex.test(value)) {
      $scope.passwordStrength['background-color'] = 'green';
    } else if (mediumRegex.test(value)) {
      $scope.passwordStrength['background-color'] = 'orange';
    } else {
      $scope.passwordStrength['background-color'] = 'red';
    }
  };


  /* GET method resolved */
  const url = window.location.search;
  const email = url.substring(1).split('?')[0];
  const getRequest = $http.get(`/updateProfile/${email}`);
  getRequest.then((response) => {
    const data = response.data[0];
    $scope.userName = data.fullName;
    $scope.DateOfBirth = new Date(data.birth);
    $scope.date = data.birth;
    $scope.gender = data.gender;
    $scope.marrageStatus = data.marriage;
    $scope.Country = data.country;
    $scope.state = data.state;
    $scope.area = data.area;
    $scope.street = data.street;
    $scope.phone = data.phone;
    $scope.email = data.email;
    $scope.company = data.company;
    $scope.college = data.college;
    $scope.selfIntro = data.selfIntro;
    $scope.image = data.imageSrc;
    $scope.imageSrc_old = data.imageSrc;
  },
  (error) => {
    console.log(error);
  });

  /* Set up jump url */
  $scope.getUpdateInfoPage = function () {
    // console.log(`test: /updateProfile/${email}`);
    return `/updateProfile?${$scope.email}`;
  };

  /* POST method resolved */
  $scope.changePassword = function () {
    $scope.newPassword = document.getElementById('newPassword').value;
    if ($scope.newPassword !== '') {
      const newPassword = $scope.newPassword;
      const request = $http({
        url: `/changePassword/${email}`,
        method: 'POST',
        data: {
          newPassword,
        },
      });
      request.then(
        (response) => {
          location.reload();
        },
        (error) => {
        },
      );
    } else {
      alert('Please enter a password!');
    }
  };

  // $scope.changeUsername = async function () {
  //   $scope.newUsername = document.getElementById('newUsername').value;
  //   $scope.oldUserName = document.getElementById('oldUserName').textContent;
  //   console.log($scope.oldUserName);
  //   if ($scope.newUsername !== '') {
  //     const newUsername = $scope.newUsername;
  //     const oldUserName = $scope.oldUserName;
  //     const request = $http({
  //       url: '/changeUsername',
  //       method: 'POST',
  //       data: {
  //         newUsername,
  //         oldUserName,
  //       },
  //     });
  //     await request.then(
  //       (response) => {
  //         if (response.status === 200) {
  //           window.location.assign('/sign');
  //           location.reload();
  //         }
  //       },
  //       (error) => {
  //       },
  //     );
  //   } else {
  //     alert('Please enter a username!');
  //   }
  // };

  $scope.convertImageAsURL = function () {
    const filesSelected = document.getElementById('inputFileToLoad').files;
    if (filesSelected.length > 0) {
      const fileToLoad = filesSelected[0];
      const fileReader = new FileReader();
      fileReader.onload = function (fileLoadedEvent) {
        $scope.imageSrc = fileLoadedEvent.target.result;
        // // console.log($scope.imageSrc);
        document.getElementById('userImage').src = $scope.imageSrc;
      };
      fileReader.readAsDataURL(fileToLoad);
    }
  };
  $scope.getPassword = function () {
    const req = $http.get(`/getPassword/${email}`);
    req.then((response) => {
      const data = response.data[0];
      $scope.currentPassword = data.password;
      $scope.currentUsername = data.email;
    });
  };
  /* POST method resolved */
  $scope.submitSavedValues = function () {
    // // console.log($scope.imageSrc);
    if ($scope.imageSrc == null) {
      $scope.imageSrc = $scope.imageSrc_old;
    }
    const request = $http({
      url: `/updateProfile/${email}`,
      method: 'POST',
      data: {
        userName: $scope.userName,
        DateOfBirth: $scope.DateOfBirth,
        Gender: $scope.gender,
        marriageStatus: $scope.marrageStatus,
        selectedCountry: $scope.Country,
        state: $scope.state,
        area: $scope.area,
        street: $scope.street,
        phone: $scope.phone,
        email: $scope.email,
        company: $scope.company,
        college: $scope.college,
        selfIntro: $scope.selfIntro,
        imageSrc: $scope.imageSrc,
      },
    });
    request.then(
      (response) => {
        location.reload();
      },
      (error) => {
      },
    );
  };

  $scope.signOut = function () {
    const request = $http({
      url: '/signOut',
      method: 'GET',
      params: {
        user: $scope.email,
      },
    });
    request.then((res) => {
      if (res.status === 200) {
        window.location.href = '/index';
      }
    });
  };

  $scope.checkIfContinue = function () {
    if (confirm('Your login session is already 2 mins. Click ok to continue!')) {
      setTimeout($scope.checkIfContinue, 2 * 60 * 1000); // start the timer again
    } else {
      window.location.assign('/signIn');
    }
  };
  setTimeout($scope.checkIfContinue, 2 * 60 * 1000);
});


app.controller('signInController', function ($scope, $http) {
  /* Set up jump url */
  $scope.resetPassword = function () {
    return '/resetPassword';
  };

  $scope.signIn = function () {
    const { userName } = $scope;
    const { password } = $scope;
    if (localStorage.getItem(userName) !== null && localStorage.getItem(userName) > 10) {
      const storeTime = parseInt(localStorage.getItem(userName), 10);
      const now = new Date();
      const curTime = 3600 * now.getHours() + 60 * now.getMinutes() + now.getSeconds();
      console.log(`${storeTime}  ${curTime}`);
      if (curTime > storeTime) {
        localStorage.removeItem(userName);
      } else {
        window.alert('Your account has been locked.');
        window.location.assign('/signIn');
      }
    }

    const request = $http({
      url: '/signIn',
      method: 'POST',
      data: {
        userName,
        password,
      },
    });
    request.then(
      (response) => {
        window.location.assign(`/updateProfile?${userName}`);
      },
      (error) => {
        // console.log(`login fail: ${error}`);
        /* Logout according to the given policies:
          * 1. If the user tried logging in for 5 times, the account would be locked.
          * 2. The locked time would be 30 minutes. */
        if (error.status === 422) {
          window.alert(error.data);
          window.location.href = 'signIn';
        } else if (error.status === 409) {
          window.alert(error.data);
          window.location.href = 'signIn';
        } else {
          if (localStorage.getItem(userName) === null) {
            localStorage.setItem(userName, '1');
          } else if (parseInt(localStorage.getItem(userName), 10) < 5) {
            const current = parseInt(localStorage.getItem(userName), 10);
            localStorage.setItem(userName, current + 1);
          }
          if (localStorage.getItem(userName) < 5) {
            window.alert(`Invalid password! Please try again! You have tried ${localStorage.getItem(userName)} times!`);
          } else {
            window.alert('Your account has been locked!');
            const url = `/signIn/${userName}/lock`;
            $http.get(url).then((res) => {
              window.location.href = '/signIn';
            });
          }
        }
      },
    );
  };
});
