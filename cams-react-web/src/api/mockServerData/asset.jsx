// mock data simulation
import Mock from 'mockjs';

// School asset data list
let schoolAssetList = [];
const campusNames = ['CW', 'NW', 'SW'];
const roomNumbers = ['RM349', 'RM201', 'RM512'];
const itemNames = ['robot', '3D printer', 'microscope'];
const itemParts = ['rtx4090', 'robot legs', 'print head', 'lens'];

// Generate 10 pieces of mock school asset data
for (let i = 0; i < 10; i++) {
    const campus = Mock.Random.pick(campusNames);
    const room = Mock.Random.pick(roomNumbers);
    const item = Mock.Random.pick(itemNames);
    const part = Mock.Random.pick(itemParts);
    const quantity = Mock.Random.integer(1, 10);
    const purchaseDate = Mock.Random.date('yyyy-MM-dd');
    const price = Mock.Random.float(100, 10000, 0, 2);
    // Generate a unique ID
    const uniqueId = Mock.Random.guid();

    schoolAssetList.push({
        campus: campus,
        room: room,
        item: item,
        part: part,
        quantity: quantity,
        purchaseDate: purchaseDate,
        price: price,
        uniqueId: uniqueId
    });
}

export default {
    getSchoolAssetData: () => {
        return {
            code: 20000,
            data: {
                // Pie chart data for asset category distribution
                assetCategoryData: [
                    {
                        name: 'Robots',
                        value: Mock.Random.integer(10, 50)
                    },
                    {
                        name: '3D Printers',
                        value: Mock.Random.integer(5, 30)
                    },
                    {
                        name: 'Microscopes',
                        value: Mock.Random.integer(3, 20)
                    }
                ],
                // Bar chart data for asset quantity in each campus
                campusAssetQuantityData: [
                    {
                        campus: 'CW',
                        quantity: Mock.Random.integer(20, 100)
                    },
                    {
                        campus: 'NW',
                        quantity: Mock.Random.integer(15, 80)
                    },
                    {
                        campus: 'SW',
                        quantity: Mock.Random.integer(10, 60)
                    }
                ],
                // Line chart data for asset purchase trend over time
                purchaseTrendData: {
                    dates: ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01', '2024-06-01'],
                    data: [
                        Mock.Random.integer(5, 20),
                        Mock.Random.integer(8, 25),
                        Mock.Random.integer(10, 30),
                        Mock.Random.integer(12, 35),
                        Mock.Random.integer(15, 40),
                        Mock.Random.integer(18, 45)
                    ]
                },
                // Table data for detailed school asset information
                detailedAssetTableData: schoolAssetList
            }
        };
    }
};