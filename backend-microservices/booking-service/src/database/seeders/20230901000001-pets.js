'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create sample pet owners
    const owners = [
      {
        id: uuidv4(),
        name: 'John Doe'
      },
      {
        id: uuidv4(),
        name: 'Jane Smith'
      },
      {
        id: uuidv4(),
        name: 'Robert Johnson'
      },
      {
        id: uuidv4(),
        name: 'Maria Garcia'
      }
    ];

    // Create sample pets
    const pets = [];
    
    // Dogs
    pets.push({
      id: uuidv4(),
      name: 'Max',
      species: 'dog',
      breed: 'Golden Retriever',
      birth_date: '2020-05-15',
      weight: 30.5,
      owner_id: owners[0].id,
      gender: 'male',
      microchip_id: 'CHIP123456',
      medical_notes: 'Allergic to chicken',
      profile_picture: 'https://storage.googleapis.com/petpro/pets/golden-retriever.jpg',
      created_at: new Date(),
      updated_at: new Date()
    });

    pets.push({
      id: uuidv4(),
      name: 'Luna',
      species: 'dog',
      breed: 'German Shepherd',
      birth_date: '2021-03-10',
      weight: 28.2,
      owner_id: owners[1].id,
      gender: 'female',
      microchip_id: 'CHIP789012',
      medical_notes: 'Regular hip examinations required',
      profile_picture: 'https://storage.googleapis.com/petpro/pets/german-shepherd.jpg',
      created_at: new Date(),
      updated_at: new Date()
    });

    pets.push({
      id: uuidv4(),
      name: 'Cooper',
      species: 'dog',
      breed: 'Beagle',
      birth_date: '2019-11-22',
      weight: 12.7,
      owner_id: owners[2].id,
      gender: 'male',
      microchip_id: 'CHIP345678',
      medical_notes: 'Previous leg fracture, healed',
      profile_picture: 'https://storage.googleapis.com/petpro/pets/beagle.jpg',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Cats
    pets.push({
      id: uuidv4(),
      name: 'Bella',
      species: 'cat',
      breed: 'Maine Coon',
      birth_date: '2020-01-05',
      weight: 6.8,
      owner_id: owners[0].id,
      gender: 'female',
      microchip_id: 'CHIP901234',
      medical_notes: 'Dental cleaning performed last year',
      profile_picture: 'https://storage.googleapis.com/petpro/pets/maine-coon.jpg',
      created_at: new Date(),
      updated_at: new Date()
    });

    pets.push({
      id: uuidv4(),
      name: 'Oliver',
      species: 'cat',
      breed: 'Siamese',
      birth_date: '2021-07-14',
      weight: 4.5,
      owner_id: owners[1].id,
      gender: 'male',
      microchip_id: 'CHIP567890',
      medical_notes: 'Sensitive stomach, special diet',
      profile_picture: 'https://storage.googleapis.com/petpro/pets/siamese.jpg',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Others
    pets.push({
      id: uuidv4(),
      name: 'Coco',
      species: 'rabbit',
      breed: 'Holland Lop',
      birth_date: '2022-02-10',
      weight: 1.2,
      owner_id: owners[3].id,
      gender: 'female',
      microchip_id: null,
      medical_notes: 'Regular nail trimming needed',
      profile_picture: 'https://storage.googleapis.com/petpro/pets/holland-lop.jpg',
      created_at: new Date(),
      updated_at: new Date()
    });

    pets.push({
      id: uuidv4(),
      name: 'Rocky',
      species: 'bird',
      breed: 'African Grey Parrot',
      birth_date: '2018-09-30',
      weight: 0.4,
      owner_id: owners[3].id,
      gender: 'male',
      microchip_id: null,
      medical_notes: 'Annual beak check recommended',
      profile_picture: 'https://storage.googleapis.com/petpro/pets/african-grey.jpg',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Insert all pets
    return queryInterface.bulkInsert('pets', pets, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('pets', null, {});
  }
};
