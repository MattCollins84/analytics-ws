const defaultConfig = require('../config/default.json')

class Config {

  constructor(...customConfig) {

    // load the default config
    let config = Object.assign(
      {},
      defaultConfig
    );

    // store enironment variables
    this.hostname = config.hostname;

    // load in custom configurations
    customConfig.forEach(c => {
      
      const loadedConfig = require(`../config/${c}.json`);
      if (!loadedConfig.classifiers) throw new Error(`No classifier object in ${c}.json`)
      
      const classifiers = Object.keys(loadedConfig.classifiers)
      classifiers.forEach(classifierName => {
        const classifier = loadedConfig.classifiers[classifierName]
        config.classifiers[classifierName] = classifier;
      });

    });

    this.classifiers = config.classifiers;
    this.hash = this.generateGroupHash();

  }

  generateGroupHash() {
    const hash = {};
    this.getAvailableClassifiers().forEach(classifierName => {
      const classifier = this.classifiers[classifierName];
      const groupNames = Object.keys(classifier.groups);
      groupNames.forEach(groupName => {
        classifier.groups[groupName].forEach(itemName => {
          hash[itemName] = groupName;
        })
      })
    });
    return hash;
  }

  getAvailableClassifiers() {
    return Object.keys(this.classifiers);
  }

  getAvailableGroups() {
    let groups = ['misc'];
    this.getAvailableClassifiers().forEach(classifierName => {
      groups = groups.concat(Object.keys(this.classifiers[classifierName].groups));
    });
    return groups;
  }

  getAvailableGroupsVerbose() {
    let groups = [
      {
        name: 'misc'
      }
    ];
    this.getAvailableClassifiers().forEach(classifierName => {
      Object.keys(this.classifiers[classifierName].groups).forEach(groupName => {
        groups = groups.concat(
          {
            name: groupName,
            items: this.classifiers[classifierName].groups[groupName]
          }
        )
      })
    });
    return groups;
  }

  getClassifierCommands(groups = []) {
    if (groups.length === 0) return [this.classifiers.default.cmd];
    const commands = [];
    groups.forEach(g => {

      this.getAvailableClassifiers().forEach(classifierName => {
        const groupNames = Object.keys(this.classifiers[classifierName].groups);
        if (groupNames.indexOf(g) !== -1) {
          commands.push(this.classifiers[classifierName].cmd);
        }
      });

    });

    return commands.filter((value, index, self) => {
      return self.indexOf(value) === index;
    })
    
  }

}

module.exports = Config