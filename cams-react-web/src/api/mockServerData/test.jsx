import Mock from 'mockjs'

let List = []

export default {
  returnData : () => {
    return {
        code: 10000,
        data: {
            videoData: [
                {
                name: '小米',
                value: 2999
                },
                {
                name: '苹果',
                value: 5999
                },  
                {
                name: 'vivo',
                value: 1500
                },
                {
                name: 'oppo',
                value: 1999
                },
                {
                name: '魅族',
                value: 2200
                },
                {
                name: '三星',
                value: 4500
                }
            ],
            userData: [
                {
                date: '周一',
                new: 5,
                active: 200
                },
                {
                date: '周二',
                new: 10,
                active: 200
                },
                {
                date: '周三',
                new: 15,
                active: 200
                },
                {
                date: '周四',
                new: 20,
                active: 200
                },
                {
                date: '周五',
                new: 25,
                active: 200
                },
                {
                date: '周六',
                new: 30,
                active: 200
                },
                {
                date: '周日',
                new: 35,
                active: 200
                }
            ]
        }
    }
  }
  
}