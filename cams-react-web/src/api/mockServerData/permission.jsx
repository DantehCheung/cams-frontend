import Mock from 'mockjs'
export default {
  getMenu: config => {
    const { username, password } = JSON.parse(config.body)

    if (username === 'admin' && password === 'admin') {
      return {
        code: 20000,
        data: {
          menu: [
            {
              path: "/home",
              name: "home",
              label: "Home",
              url: "/home/index",
            },
            {
              path: "/br",
              label: "Borrow & Return", 
              children: [
                {
                  path: "/br/borrow",
                  name: "borrow",
                  label: "Borrow",
                  url: "/br/borrow",
                },
                {
                  path: "/br/return",
                  name: "return",
                  label: "Return",
                  url: "/br/return",
                }
              ],
            },
            {
              path: "/manage",
              label: "Data Manage",
             
              children: [
                {
                  path: "/manage/addUser",
                  name: "addUser",
                  label: "Add User",
                  url: "/manage/addUser",
                },
                {
                  path: "/manage/genReport",
                  name: "genReport",
                  label: "Report",
                  url: "/manage/genReport",
                },
                {
                  path:"/manage/manageCampus",
                  name:"manageCampus",
                  label:"Campus",
                  url:"/manage/manageCampus"
                },
                {
                  path:"/manage/manageRoom",
                  name:"manageRoom",
                  label:"Room",
                  url:"/manage/manageRoom"
                },
                {
                  path:"/manage/manageItem",
                  name:"manageItem",
                  label:"Item",
                  url:"/manage/manageItem"
                }
              ],
            },
            {
              path: "/other",
              label: "Other",
              
              children: [
                {
                  path: "/other/connectRFID",
                  name: "connectRFID",
                  label: "Connect RFID",
                  url: "/other/connectRFID",
                },
                {
                  path:"/other/downloadVer",
                  name:"downloadVer",
                  label:"Download Version",
                  url:"/other/downloadVer"
                }
              ],
            }
          ],
          token: Mock.Random.guid(),
          message: 'Extracted successfully'
        }
      }
    } else if (username === 'xiaoxiao' && password === 'xiaoxiao') {
      return {
        code: 20000,
        data: {
          menu: [
            {
              path: "/home",
              name: "home",
              label: "Home",
              url: "/home/index",
            },
            {
              path: "/br",
              label: "Borrow & Return", 
              children: [
                {
                  path: "/br/borrow",
                  name: "borrow",
                  label: "Borrow",
                  url: "/br/borrow",
                },
                {
                  path: "/br/return",
                  name: "return",
                  label: "Return",
                  url: "/br/return",
                }
              ],
            },
            {
              path: "/manage",
              label: "Data Manage",
             
              children: [
                {
                  path: "/manage/addUser",
                  name: "addUser",
                  label: "Add User",
                  url: "/manage/addUser",
                },
                {
                  path: "/manage/genReport",
                  name: "genReport",
                  label: "Report",
                  url: "/manage/genReport",
                },
                {
                  path:"/manage/manageCampus",
                  name:"manageCampus",
                  label:"Campus",
                  url:"/manage/manageCampus"
                },
                {
                  path:"/manage/manageRoom",
                  name:"manageRoom",
                  label:"Room",
                  url:"/manage/manageRoom"
                },
                {
                  path:"/manage/manageItem",
                  name:"manageItem",
                  label:"Item",
                  url:"/manage/manageItem"
                }
              ],
            },
            {
              path: "/other",
              label: "Other",
              
              children: [
                {
                  path: "/other/connectRFID",
                  name: "connectRFID",
                  label: "Connect RFID",
                  url: "/other/connectRFID",
                },
                {
                  path:"/other/downloadVer",
                  name:"downloadVer",
                  label:"Download Version",
                  url:"/other/downloadVer"
                }
              ],
            }
          ],
          token: Mock.Random.guid(),
          message: 'Extracted successfully'
        }
      }
    } else {
      return {
        code: -999,
        data: {
          message: 'Incorrect account or password'
        }
      }
    }

  }
}