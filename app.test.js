var app = require("./app.js")
var request = require("supertest")
var mongoose = require('mongoose');

beforeAll(() => {
  
  var options = {
    connectTimeoutMS: 5000,
    useNewUrlParser: true,
    useUnifiedTopology : true
   }
   mongoose.connect(process.env.MONGO_PASS, 
      options,         
      function(err) {
       console.log(err || "MongoDb connecté");
      }
   );
    });

  afterAll(() => {
    mongoose.disconnect();
});

describe('TEST for route skills', () => {
  test("GET/searchskills return array's objects", async () => {
    await request(app).get("/skills/searchskills")
      .send({ "cat": "Cuisine" })
      .then(
        response => {
          expect(response.body).toEqual(
              expect.arrayContaining([
                expect.any(Object)
              ])
          )})
    })

    test("POST/searchskills with category = 'cuisine'", async () => {
      await request(app).post("/skills/searchskills")
        .send({ "cat": "Cuisine" })
        .then(
          response => {
            // console.log('response:', response.body)
            expect(response.body).toEqual(
                expect.objectContaining({
                  searchedSkills: expect.arrayContaining([
                    expect.objectContaining({category: "Cuisine"})
                  ])
                }) 
            )})
      })

      test("POST/searchskills with subCategory = 'Plomberie'", async () => {
        await request(app).post("/skills/searchskills")
          .send({ "subCat": "Plomberie" })
          .then(
            response => {
              // console.log('response:', response.body)
              expect(response.body).toEqual(
                  expect.objectContaining({
                    searchedSkills: expect.arrayContaining([
                      expect.objectContaining({subcategory: "Plomberie"})
                    ])
                  }) 
              )})
        })

        test("POST/searchskills with subCategory and location", async () => {
          await request(app).post("/skills/searchskills")
            .send({ "subCat": "Menuiserie", "citySelected": "Paris" })
            .then(
              response => {
                // console.log('response:', response.body)
                expect(response.body).toEqual(
                    expect.objectContaining({
                      searchedSkills: expect.arrayContaining([
                        expect.objectContaining({subcategory: "Menuiserie", location: "Paris"})
                      ])
                    }) 
                )})
          })

          test("POST/searchUserskills with teacherId", async () => {
            await request(app).post("/skills/searchUserskills")
              .send({ "userId": "610132b7f5015e1d0b13d884" })
              .then(
                response => {
                  // console.log('response:', response.body)
                  expect(response.body).toEqual(
                      expect.arrayContaining([
                          expect.objectContaining({teacher: "610132b7f5015e1d0b13d884"})
                        ])
                       
                  )})
            })


})

describe('TEST for route users', () => {

  
  test("POST users/Signin with email and good password", async () => {
    await request(app).post("/users/signin")
      .send({ "email": "will@swap.fr", password: "Will" })
      .then(
        response => {
          // console.log('response:', response.body)
          expect(response.body).toEqual(
                  expect.objectContaining({
                    status: true, 
                    message: expect.objectContaining({
                      token: expect.any(String)
                    })
                  })
          )})
    })

    test("POST users/Signin with email and wrong password", async () => {
      await request(app).post("/users/signin")
        .send({ "email": "will@swap.fr", password: "xxxx" })
        .then(
          response => {
            // console.log('response:', response.body)
            expect(response.body).toEqual(
                    expect.objectContaining({
                      status: false, 
                      message: expect.anything()
                    })
            )})
      })

      test("POST users/Signup with empty email ", async () => {
        await request(app).post("/users/signup")
          .send({ "email": "", password: "12gfhfghd", username: "bob", avatar:"www.google.fr" })
          .then(
            response => {
              //console.log('response:', response.body)
              expect(response.body).toEqual(
                      expect.objectContaining({
                        status: false, 
                        message: expect.objectContaining({email: expect.any(String)}) 
                      })
              )})
        })

        test("POST users/Signup with no password ou password too short ", async () => {
          await request(app).post("/users/signup")
            .send({ "email": "mika@google.com", password: "123", username: "bob", avatar:"www.google.fr" })
            .then(
              response => {
                // console.log('response:', response.body)
                expect(response.body).toEqual(
                        expect.objectContaining({
                          status: false, 
                          message: expect.objectContaining({password: expect.any(String)}) 
                        })
                )})
          })

          test("POST users/Signup password hash with Bcrypt ", async () => {
            await request(app).post("/users/signup")
              .send({ "email": "", password: "12345678", username: "", avatar:"www.google.fr", test: true })
              .then(
                response => {
                  expect(response.body.hash.length).toBeGreaterThan(50)
                  expect(response.body).toEqual(
                          expect.objectContaining({
                            
                            hash: expect.any(String)
                          })
                  )})
            })
})
