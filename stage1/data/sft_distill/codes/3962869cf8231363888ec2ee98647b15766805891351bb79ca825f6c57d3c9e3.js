class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleType = 0; // 状态信号：当前粒子类型索引 (0-2)
    this.particleConfigs = [];
    this.emitter = null;
  }

  preload() {
    // 创建3种颜色的粒子纹理
    this.createParticleTextures();
  }

  create() {
    // 初始化粒子配置
    this.initParticleConfigs();

    // 创建粒子发射器
    const particles = this.add.particles(0, 0, 'particle_red');
    
    this.emitter = particles.createEmitter({
      x: 400,
      y: 300,
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      frequency: 50,
      maxParticles: 100,
      blendMode: 'ADD'
    });

    // 应用初始配置
    this.applyParticleConfig(this.currentParticleType);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.switchParticleType();
      }
    });

    // 添加UI文本显示当前粒子类型
    this.particleTypeText = this.add.text(10, 10, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateUI();

    // 添加提示文本
    this.add.text(10, 50, 'Click to switch particle type', {
      fontSize: '18px',
      fill: '#cccccc'
    });
  }

  createParticleTextures() {
    // 创建红色粒子纹理
    const graphicsRed = this.add.graphics();
    graphicsRed.fillStyle(0xff0000, 1);
    graphicsRed.fillCircle(8, 8, 8);
    graphicsRed.generateTexture('particle_red', 16, 16);
    graphicsRed.destroy();

    // 创建绿色粒子纹理
    const graphicsGreen = this.add.graphics();
    graphicsGreen.fillStyle(0x00ff00, 1);
    graphicsGreen.fillCircle(8, 8, 8);
    graphicsGreen.generateTexture('particle_green', 16, 16);
    graphicsGreen.destroy();

    // 创建蓝色粒子纹理
    const graphicsBlue = this.add.graphics();
    graphicsBlue.fillStyle(0x0088ff, 1);
    graphicsBlue.fillCircle(8, 8, 8);
    graphicsBlue.generateTexture('particle_blue', 16, 16);
    graphicsBlue.destroy();
  }

  initParticleConfigs() {
    // 配置1: 红色爆炸效果
    this.particleConfigs.push({
      name: 'Red Explosion',
      texture: 'particle_red',
      config: {
        speed: { min: 150, max: 300 },
        angle: { min: 0, max: 360 },
        scale: { start: 1.5, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 1500,
        frequency: 30,
        quantity: 3,
        gravityY: 100
      }
    });

    // 配置2: 绿色喷泉效果
    this.particleConfigs.push({
      name: 'Green Fountain',
      texture: 'particle_green',
      config: {
        speed: { min: 200, max: 400 },
        angle: { min: -110, max: -70 },
        scale: { start: 0.8, end: 0.2 },
        alpha: { start: 1, end: 0.3 },
        lifespan: 2500,
        frequency: 20,
        quantity: 2,
        gravityY: 300
      }
    });

    // 配置3: 蓝色螺旋效果
    this.particleConfigs.push({
      name: 'Blue Spiral',
      texture: 'particle_blue',
      config: {
        speed: { min: 80, max: 150 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 3000,
        frequency: 15,
        quantity: 1,
        gravityY: -50,
        rotate: { start: 0, end: 360 }
      }
    });
  }

  switchParticleType() {
    // 切换到下一个粒子类型
    this.currentParticleType = (this.currentParticleType + 1) % this.particleConfigs.length;
    this.applyParticleConfig(this.currentParticleType);
    this.updateUI();
    
    console.log(`Switched to particle type ${this.currentParticleType}: ${this.particleConfigs[this.currentParticleType].name}`);
  }

  applyParticleConfig(index) {
    const config = this.particleConfigs[index];
    
    // 更改粒子纹理
    this.emitter.setTexture(config.texture);
    
    // 应用新配置
    this.emitter.setConfig(config.config);
    
    // 重启发射器以应用新配置
    this.emitter.stop();
    this.emitter.start();
  }

  updateUI() {
    const config = this.particleConfigs[this.currentParticleType];
    this.particleTypeText.setText(`Current: ${config.name} (Type ${this.currentParticleType})`);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 例如让发射器位置随鼠标移动
    const pointer = this.input.activePointer;
    if (pointer.isDown) {
      this.emitter.setPosition(pointer.x, pointer.y);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ParticleScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(config);