class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.particleConfigs = [
      {
        name: 'Red Fire',
        color: 0xff0000,
        speed: { min: 100, max: 200 },
        scale: { start: 1, end: 0 },
        lifespan: 2000,
        gravityY: -100,
        blendMode: 'ADD'
      },
      {
        name: 'Blue Water',
        color: 0x0088ff,
        speed: { min: 50, max: 150 },
        scale: { start: 0.8, end: 0.2 },
        lifespan: 3000,
        gravityY: 200,
        blendMode: 'NORMAL'
      },
      {
        name: 'Green Nature',
        color: 0x00ff00,
        speed: { min: 20, max: 80 },
        scale: { start: 0.5, end: 1.5 },
        lifespan: 2500,
        gravityY: 0,
        blendMode: 'ADD'
      },
      {
        name: 'Yellow Lightning',
        color: 0xffff00,
        speed: { min: 200, max: 400 },
        scale: { start: 1.2, end: 0 },
        lifespan: 1000,
        gravityY: -50,
        blendMode: 'ADD'
      },
      {
        name: 'Purple Magic',
        color: 0xff00ff,
        speed: { min: 80, max: 160 },
        scale: { start: 0.6, end: 0.1 },
        lifespan: 3500,
        gravityY: -30,
        blendMode: 'SCREEN'
      },
      {
        name: 'Cyan Ice',
        color: 0x00ffff,
        speed: { min: 30, max: 100 },
        scale: { start: 1, end: 0.3 },
        lifespan: 4000,
        gravityY: 50,
        blendMode: 'NORMAL'
      },
      {
        name: 'Orange Flame',
        color: 0xff8800,
        speed: { min: 120, max: 220 },
        scale: { start: 1.5, end: 0 },
        lifespan: 1800,
        gravityY: -150,
        blendMode: 'ADD'
      },
      {
        name: 'Pink Love',
        color: 0xff88cc,
        speed: { min: 60, max: 120 },
        scale: { start: 0.8, end: 0.8 },
        lifespan: 3000,
        gravityY: -20,
        blendMode: 'NORMAL'
      },
      {
        name: 'White Light',
        color: 0xffffff,
        speed: { min: 150, max: 250 },
        scale: { start: 0.4, end: 0 },
        lifespan: 1500,
        gravityY: 0,
        blendMode: 'ADD'
      },
      {
        name: 'Dark Shadow',
        color: 0x333333,
        speed: { min: 40, max: 90 },
        scale: { start: 1.2, end: 2 },
        lifespan: 5000,
        gravityY: 100,
        blendMode: 'MULTIPLY'
      }
    ];
  }

  preload() {
    // 设置固定随机种子以确保行为可复现
    Phaser.Math.RND.sow(['particle-seed-12345']);
  }

  create() {
    // 创建粒子纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('particle', 16, 16);
    graphics.destroy();

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, 'particle', {
      speed: this.particleConfigs[0].speed,
      scale: this.particleConfigs[0].scale,
      lifespan: this.particleConfigs[0].lifespan,
      gravityY: this.particleConfigs[0].gravityY,
      blendMode: this.particleConfigs[0].blendMode,
      tint: this.particleConfigs[0].color,
      frequency: 50,
      maxParticles: 200,
      angle: { min: 0, max: 360 }
    });

    // 创建信息文本
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    this.instructionText = this.add.text(20, 560, 
      'Use LEFT/RIGHT arrow keys to switch particle types', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新信息显示
    this.updateInfoText();

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 防止按键重复触发
    this.lastKeyTime = 0;
    this.keyDelay = 200;
  }

  update(time, delta) {
    // 检测左右键切换粒子类型
    if (time - this.lastKeyTime > this.keyDelay) {
      if (this.cursors.left.isDown) {
        this.currentParticleIndex--;
        if (this.currentParticleIndex < 0) {
          this.currentParticleIndex = this.particleConfigs.length - 1;
        }
        this.switchParticle();
        this.lastKeyTime = time;
      } else if (this.cursors.right.isDown) {
        this.currentParticleIndex++;
        if (this.currentParticleIndex >= this.particleConfigs.length) {
          this.currentParticleIndex = 0;
        }
        this.switchParticle();
        this.lastKeyTime = time;
      }
    }
  }

  switchParticle() {
    const config = this.particleConfigs[this.currentParticleIndex];
    
    // 更新粒子发射器配置
    this.emitter.setConfig({
      speed: config.speed,
      scale: config.scale,
      lifespan: config.lifespan,
      gravityY: config.gravityY,
      blendMode: config.blendMode,
      tint: config.color,
      frequency: 50,
      maxParticles: 200,
      angle: { min: 0, max: 360 }
    });

    // 更新信息文本
    this.updateInfoText();
  }

  updateInfoText() {
    const config = this.particleConfigs[this.currentParticleIndex];
    const colorHex = '#' + config.color.toString(16).padStart(6, '0');
    
    this.infoText.setText([
      `Particle Type: ${this.currentParticleIndex + 1}/10`,
      `Name: ${config.name}`,
      `Color: ${colorHex}`,
      `Speed: ${config.speed.min}-${config.speed.max}`,
      `Lifespan: ${config.lifespan}ms`,
      `Gravity Y: ${config.gravityY}`,
      `Blend Mode: ${config.blendMode}`
    ]);
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