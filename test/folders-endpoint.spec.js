const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray, makeMaliciousFolder } = require('./Folders.fixtures')

describe.only('Folder Endpoints', function() {
    let db

    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL,
      })
      app.set('db', db)
    })
  
    after('disconnect from db', () => db.destroy())
  
    before('clean the table', () => db('noteful_folders').truncate())

    afterEach('cleanup', () => db('noteful_folders').truncate())

describe(`GET /api/folders`, () => {
    context(`Given no folders`, () => {
             it(`responds with 200 and an empty list`, () => {
              return supertest(app)
                .get('/api/folders')
                 .expect(200, [])
             })
           })
    context('Given there are folders in the database', () => {
        const testFolders = makeFoldersArray()

        beforeEach('insert folders', () => {
          return db
            .into('noteful_folders')
            .insert(testFolders)
        })

        it('responds with 200 and all of the folder', () => {
            return supertest(app)
              .get('/api/folders')
              .expect(200, testFolders)
          })
    })
       
context(`Given an XSS attack folder`, () => {
    const { maliciousFolder , expectedFolder } = makeMaliciousFolder()

    beforeEach('insert malicious folder', () => {
      return db
        .into('noteful_folders')
        .insert([ maliciousFolder ])
    })

    it('removes XSS attack content', () => {
      return supertest(app)
        .get(`/api/folders`)
        .expect(200)
        .expect(res => {
          expect(res.body[0].title).to.eql(expectedFolder.title)
        })
    })
  })
})

describe(`GET /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
             it(`responds with 404`, () => {
               const folderId = 123456
               return supertest(app)
                 .get(`/api/folders/${folderId}`)
                 .expect(404, { error: { message: `Folder doesn't exist` } })
             })
           })
        
    context('Given there are folders in the database', () => {
        const testFolders = makeFoldersArray()

        beforeEach('insert folders', () => {
          return db
            .into('noteful_folders')
            .insert(testFolders)
        })

          it('GET /api/folder/:folder_id responds with 200 and the specified folder', () => {
            const folderId = 2
            const expectedFolder = testFolders[folderId - 1]
            return supertest(app)
              .get(`/api/folders/${folderId}`)
              .expect(200, expectedFolder)
          })
      })
})

describe(`POST /api/folders`, () => {
    it(`creates a new folder, responding with 201 and the folder`,  function() {
        it(`creates a folder, responding with 201 and the new folder`, function() {
            this.retries(3)
        const newFolder = {
            title: 'New Folder',
        }
      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(201)
            .expect(res => {
                expect(res.body.title).to.eql(newFolder.title)
            })
            .then(postRes =>
                supertest(app)
                .get(`/api/folders/${postRes.body.id}`)
                .expect(postRes.body)
            )
        })
    })

  const requiredFields = ['title']

  requiredFields.forEach(field => {
    const newFolder = {
      title: 'Test new folder'
    }

    it(`responds with 400 and an error message when the '${field}' is missing`, () => {
      delete newFolder[field]
      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(400, {
          error: { message: `Missing '${field}' in request body` }
        })
    })
  })

  
  it('removes XSS attack content from response', () => {
    const { maliciousFolder , expectedFolder } = makeMaliciousFolder()
    return supertest(app)
      .post(`/api/folders`)
      .send(maliciousFolder)
      .expect(201)
      .expect(res => {
        expect(res.body.title).to.eql(expectedFolder.title)
      })
  })
})

describe(`DELETE /api/folders/:id`, () => {
    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray()
 
      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
      })
 
      it('responds with 204 and removes the article', () => {
        const idToRemove = 2
        const expectedFolders = testFolders.filter(folder => folder.id !== idToRemove)
        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/folders`)
              .expect(expectedFolders))
      })
    }) 
     
    context(`Given no folders`, () => {
        it(`responds with 404`, () => {
          const folderId = 123456
          return supertest(app)
            .delete(`/api/folders/${folderId}`)
            .expect(404, { error: { message: `Folder doesn't exist` } })
        })
      })
})

describe(`PATCH /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456
        return supertest(app)
          .patch(`/api/folders/${folderId}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      })
    })

    context('Given there are folders in the database', () => {
        const testFolders = makeFoldersArray()
   
        beforeEach('insert folder', () => {
          return db
            .into('noteful_folders')
            .insert(testFolders)
        })
   
        it('responds with 204 and updates the folder', () => {
          const idToUpdate = 2
          const updateFolder = {
            title: 'updated folder title'
          }
          const expectedFolder = {
            ...testFolders[idToUpdate - 1],
            ...updateFolder
          }  
          return supertest(app)
            .patch(`/api/folders/${idToUpdate}`)
            .send(updateFolder)
            .expect(204)
            .then(res =>
                supertest(app)
                    .get(`/api/folders/${idToUpdate}`)
                    .expect(expectedFolder))
        })
        
        it(`responds with 400 when no required fields supplied`, () => {
            const idToUpdate = 2
            return supertest(app)
              .patch(`/api/folders/${idToUpdate}`)
              .send({ irrelevantField: 'foo' })
              .expect(400, {
                error: {
                  message: `Request body must contain a 'title'`
                }
              })
           })

        })
    
      })
   
   
 })
