import { UserRepository } from '../repos/user-repo';
import * as mockIndex from '..';
import * as mockMapper from '../util/result-set-mapper';
import { User } from '../models/user';

jest.mock('..', () =>{
    return{
        connectionPool: {
            connect: jest.fn()
        }
    }
});

// The result-set-mapper module also needs to be mocked
jest.mock('../util/result-set-mapper', () => {
    return {
        mapUserResultSet: jest.fn()
    }
});

describe('userRepo', () => {

    let sut = new UserRepository();
    let mockConnect = mockIndex.connectionPool.connect;

    beforeEach(() => {

        /*
            We can provide a successful retrieval as the default mock implementation
            since it is very verbose. We can provide alternative implementations for
            the query and release methods in specific tests if needed.
        */
        (mockConnect as jest.Mock).mockClear().mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return {
                        rows: [
                            {
                                id: 1,
                                username: 'aanderson',
                                password: 'password',
                                first_name: 'Alex',
                                last_name: 'Anderson',
                                email: 'aanderson@gmail.com',
                                role: 'employee'
                            }
                        ]
                    }
                }), 
                release: jest.fn()
            }
        });
        (mockMapper.mapUserResultSet as jest.Mock).mockClear();
    });

    test('should resolve to an array of users when getAll retrieves records from data source', async () => {
        
        // Arrange
        jest.clearAllMocks();
        expect.hasAssertions();

        let mockUser = new User(1, 'aanderson','password', 'Alex', 'Anderson', 'aanderson@gmail.com', 'employee' );
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        // Act
        let result = await sut.getAll();

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(1);
        expect(mockConnect).toBeCalledTimes(1);

    });

    
    // test('should resolve to an empty array when getAll retrieves no records from data source', async () => {
        
    //     // Arrange
    //     jest.clearAllMocks();
    //     expect.hasAssertions();
    //     (mockConnect as jest.Mock).mockImplementation(() => {
    //         return {
    //             query: jest.fn().mockImplementation(() => { return { rows: [] } }), 
    //             release: jest.fn()
    //         }
    //     });

    //     // Act
    //     let result = await sut.getAll();

    //     // Assert
    //     expect(result).toBeTruthy();
    //     expect(result instanceof Array).toBe(true);
    //     expect(result.length).toBe(0);
    //     expect(mockConnect).toBeCalledTimes(1);

    // });

    // test('should resolve to a user object when getById retrieves a record from data source', async () => {

    //     // Arrange
    //     jest.clearAllMocks();
    //     expect.hasAssertions();

    //     let mockUser = new User(1, 'aanderson','password', 'Alex', 'Anderson', 'aanderson@gmail.com', 'employee' );
    //     (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

    //     // Act
    //     let result = await sut.getById(1);

    //     // Assert
    //     expect(result).toBeTruthy();
    //     expect(result instanceof User).toBe(true);

    // });

    // test('should resolve to a user object when save adds a record to the data source ', async ()=>{

    //     //Arrange
    //     jest.clearAllMocks();
    //     expect.hasAssertions();

    //     let mockUser = new User(1, 'aanderson','password', 'Alex', 'Anderson', 'aanderson@gmail.com', 'employee' );
    //     (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);
    //     //Act

    //     let result = await sut.save(mockUser);

    //     //Assert
    //     expect(result).toBeTruthy();
    //     expect(result instanceof User).toBe(true);
    // });
    
    // test('should resolve to a boolean when update adds a record to the data source weight <= 15', async ()=>{

    //     //Arrange
    //     expect.hasAssertions();

    //     let mockUser = new User(1, 'aanderson','password', 'Alex', 'Anderson', 'aanderson@gmail.com', 'employee' );
    //     (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);
    //     //Act

    //     let result = await sut.update(mockUser);

    //     //Assert
    //     expect(result).toBeTruthy();
    //     expect(result).toBe(true);
    // });

    // test('should resolve to a boolean when update changes a record', async ()=>{

    //     //Arrange
    //     expect.hasAssertions();

    //     let mockUser = new User(1, 'aanderson1','password', 'Alex', 'Anderson', 'aanderson1@gmail.com', 'manager' );
    //     (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);
    //     //Act

    //     let result = await sut.update(mockUser);

    //     //Assert
    //     expect(result).toBeTruthy();
    //     expect(result).toBe(true);
    // });

    
    // test('should resolve to a boolean when delete removes a record to the data source', async ()=>{

    //     //Arrange
    //     expect.hasAssertions();

    //     let mockUser = new User(1, 'aanderson','password', 'Alex', 'Anderson', 'aanderson@gmail.com', 'employee' );
    //     (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);
    //     //Act

    //     let result = await sut.deleteById(mockUser.user_id);

    //     //Assert
    //     expect(result).toBeTruthy();
    //     expect(result).toBe(true);
    // });

}); 