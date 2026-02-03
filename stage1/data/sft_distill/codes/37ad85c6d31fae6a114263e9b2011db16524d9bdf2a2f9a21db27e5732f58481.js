class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.particleConfigs = [];
  }

  preload() {
    // 创建10种不同颜色的粒子纹理
    const colors = [
      0xFF0000, // 红色
      0x00FF00, // 绿色
      0x0000FF, // 蓝色
      0xFFFF00, // 黄色
      0xFF00FF, // 洋红
      0x00FFFF, // 青色
      0xFF8800, // 橙色
      0x8800FF, // 紫色
      0xFF0088, // 粉色
      0x00FF88  // 青绿色
    ];

    colors.forEach((color, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${index}`, 16, 16);
      graphics.destroy();
    });

    // 定义10种不同的粒子配置
    this.particleConfigs = [
      {
        name: 'Fountain',
        texture: 'particle0',
        speed: { min: 200, max: 400 },
        angle: { min: -120, max: -60 },
        scale: { start: 1, end: 0 },
        lifespan: 2000,
        frequency: 20,
        gravityY: 300
      },
      {
        name: 'Explosion',
        texture: 'particle1',
        speed: { min: 100, max: 300 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.5, end: 1.5 },
        lifespan: 1500,
        frequency: 10,
        gravityY: 0
      },
      {
        name: 'Rain',
        texture: 'particle2',
        speedY: { min: 300, max: 500 },
        speedX: { min: -50, max: 50 },
        scale: { start: 0.3, end: 0.1 },
        lifespan: 3000,
        frequency: 15,
        gravityY: 200
      },
      {
        name: 'Spiral',
        texture: 'particle3',
        speed: 150,
        angle: { min: 0, max: 360 },
        scale: { start: 0.8, end: 0.2 },
        lifespan: 2500,
        frequency: 30,
        gravityY: -50
      },
      {
        name: 'Fire',
        texture: 'particle4',
        speed: { min: 50, max: 150 },
        angle: { min: -100, max: -80 },
        scale: { start: 1.2, end: 0 },
        lifespan: 1000,
        frequency: 10,
        gravityY: -100
      },
      {
        name: 'Snow',
        texture: 'particle5',
        speedY: { min: 50, max: 150 },
        speedX: { min: -30, max: 30 },
        scale: { start: 0.5, end: 0.5 },
        lifespan: 4000,
        frequency: 25,
        gravityY: 50
      },
      {
        name: 'Sparkle',
        texture: 'particle6',
        speed: { min: 50, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.2, end: 1.5, ease: 'Sine.easeInOut' },
        lifespan: 1200,
        frequency: 40,
        gravityY: 0
      },
      {
        name: 'Vortex',
        texture: 'particle7',
        speed: 200,
        angle: { min: 0, max: 360 },
        scale: { start: 0.1, end: 1 },
        lifespan: 2000,
        frequency: 20,
        gravityY: 0,
        rotate: { start: 0, end: 360 }
      },
      {
        name: 'Bubbles',
        texture: 'particle8',
        speedY: { min: -200, max: -100 },
        speedX: { min: -20, max: 20 },
        scale: { start: 0.3, end: 0.8 },
        lifespan: 3000,
        frequency: 30,
        gravityY: -80
      },
      {
        name: 'Confetti',
        texture: 'particle9',
        speed: { min: 150, max: 350 },
        angle: { min: -110, max: -70 },
        scale: { start: 0.6, end: 0.6 },
        lifespan: 2500,
        frequency: 15,
        gravityY: 400,
        rotate: { start: 0, end: 720 }
      }
    ];
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 500, this.particleConfigs[0].texture, {
      speed: this.particleConfigs[0].speed,
      angle: this.particleConfigs[0].angle,
      scale: this.particleConfigs[0].scale,
      lifespan: this.particleConfigs[0].lifespan,
      frequency: this.particleConfigs[0].frequency,
      gravityY: this.particleConfigs[0].gravityY
    });

    // 状态文本
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 提示文本
    this.add.text(400, 550, 'Press SPACE to switch particle type', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.switchParticleType();
    });
  }

  switchParticleType() {
    // 切换到下一个粒子类型
    this.currentParticleIndex = (this.currentParticleIndex + 1) % this.particleConfigs.length;
    const config = this.particleConfigs[this.currentParticleIndex];

    // 停止当前发射器并销毁
    this.emitter.stop();
    this.emitter.destroy();

    // 创建新的粒子发射器
    const emitterConfig = {
      speed: config.speed,
      scale: config.scale,
      lifespan: config.lifespan,
      frequency: config.frequency,
      gravityY: config.gravityY
    };

    // 添加可选配置
    if (config.angle !== undefined) {
      emitterConfig.angle = config.angle;
    }
    if (config.speedX !== undefined) {
      emitterConfig.speedX = config.speedX;
    }
    if (config.speedY !== undefined) {
      emitterConfig.speedY = config.speedY;
    }
    if (config.rotate !== undefined) {
      emitterConfig.rotate = config.rotate;
    }

    this.emitter = this.add.particles(400, 500, config.texture, emitterConfig);

    // 更新状态文本
    this.updateStatusText();
  }

  updateStatusText() {
    const config = this.particleConfigs[this.currentParticleIndex];
    this.statusText.setText(
      `Particle Type: ${this.currentParticleIndex + 1}/10\n` +
      `Name: ${config.name}\n` +
      `Active: ${this.emitter ? this.emitter.getAliveParticleCount() : 0} particles`
    );
  }

  update() {
    // 更新粒子计数
    if (this.emitter) {
      const config = this.particleConfigs[this.currentParticleIndex];
      this.statusText.setText(
        `Particle Type: ${this.currentParticleIndex + 1}/10\n` +
        `Name: ${config.name}\n` +
        `Active: ${this.emitter.getAliveParticleCount()} particles`
      );
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ParticleScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(config);