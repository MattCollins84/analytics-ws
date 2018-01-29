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
    this.hash = this.generateClassHash();

  }

  generateClassHash() {
    const hash = {};
    this.getAvailableClassifiers().forEach(classifierName => {
      const classifier = this.classifiers[classifierName];
      const classNames = Object.keys(classifier.classes);
      classNames.forEach(className => {
        classifier.classes[className].forEach(itemName => {
          hash[itemName] = className;
        })
      })
    });
    return hash;
  }

  getAvailableClassifiers() {
    return Object.keys(this.classifiers);
  }

  getAvailableClasses() {
    let classes = ['misc'];
    this.getAvailableClassifiers().forEach(classifierName => {
      classes = classes.concat(Object.keys(this.classifiers[classifierName].classes));
    });
    return classes;
  }

  getAvailableClassesVerbose() {
    let classes = [
      {
        name: 'misc'
      }
    ];
    this.getAvailableClassifiers().forEach(classifierName => {
      Object.keys(this.classifiers[classifierName].classes).forEach(className => {
        classes = classes.concat(
          {
            name: className,
            items: this.classifiers[classifierName].classes[className]
          }
        )
      })
    });
    return classes;
  }

  getClassifierCommands(classes = []) {
    
    const commands = [this.classifiers.default.cmd];
    classes.forEach(c => {

      this.getAvailableClassifiers().forEach(classifierName => {
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