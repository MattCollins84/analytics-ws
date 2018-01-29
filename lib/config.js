const defaultConfig = require('../config/default.json')

class Config {

  constructor(...customConfig) {

    let config = Object.assign(
      {},
      defaultConfig
    );

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

  }

  availableClassifiers() {
    return Object.keys(this.classifiers);
  }

  availableClasses() {
    let classes = [];
    this.availableClassifiers().forEach(classifierName => {
      classes = classes.concat(Object.keys(this.classifiers[classifierName].classes));
    });
    return classes;
  }

  getClassifierCommands(classes) {
    
    let commands = [this.classifiers.default.cmd];
    classes.forEach(c => {

      this.availableClassifiers().forEach(classifierName => {
        const classNames = Object.keys(this.classifiers[classifierName].classes);
        if (classNames.indexOf(c) !== -1) {
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