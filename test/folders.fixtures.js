function makeFoldersArray() {
    return [
        {
            id: 1,
            title: 'First Folder'
          },
          {
            id: 2,
            title: 'Second Folder'
          },
          {
            id: 3,
            title: 'Second Folder'
          },
    ];
  }
  
function makeMaliciousFolder() {
    const maliciousFolder = {
      id: 911,
      title: 'Naughty naughty very naughty <script>alert("xss");</script>'
    }
    const expectedFolder = {
      ...maliciousFolder,
      title: 'Naughty naughty very naughty <script>alert("xss");</script>'
    }
    return {
      maliciousFolder,
      expectedFolder,
    }
  }

  module.exports = {
    makeFoldersArray, makeMaliciousFolder,
  }