class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.switchCount = 0;
    
    // 15 种不同颜色的粒子配置
    this.particleConfigs = [
      { name: 'Red Fire', color: 0xff0000, speed: 200, scale: { start: 1, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 2000 },
      { name: 'Blue Water', color: 0x0088ff, speed: 150, scale: { start: 0.8, end: 0.2 }, alpha: { start: 0.8, end: 0 }, lifespan: 3000 },
      { name: 'Green Nature', color: 0x00ff00, speed: 100, scale: { start: 0.5, end: 1 }, alpha: { start: 1, end: 0.3 }, lifespan: 2500 },
      { name: 'Yellow Sun', color: 0xffff00, speed: 250, scale: { start: 1.2, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 1500 },
      { name: 'Purple Magic', color: 0xff00ff, speed: 180, scale: { start: 0.6, end: 0.1 }, alpha: { start: 0.9, end: 0 }, lifespan: 2800 },
      { name: 'Cyan Ice', color: 0x00ffff, speed: 120, scale: { start: 0.7, end: 0.3 }, alpha: { start: 1, end: 0.2 }, lifespan: 3500 },
      { name: 'Orange Flame', color: 0xff8800, speed: 220, scale: { start: 1, end: 0.2 }, alpha: { start: 1, end: 0 }, lifespan: 1800 },
      { name: 'Pink Blossom', color: 0xff88ff, speed: 90, scale: { start: 0.4, end: 0.8 }, alpha: { start: 0.8, end: 0 }, lifespan: 4000 },
      { name: 'White Light', color: 0xffffff, speed: 300, scale: { start: 0.8, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 1200 },
      { name: 'Dark Shadow', color: 0x333333, speed: 80, scale: { start: 1.5, end: 0.5 }, alpha: { start: 0.7, end: 0 }, lifespan: 3000 },
      { name: 'Lime Acid', color: 0x88ff00, speed: 200, scale: { start: 0.6, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 2200 },
      { name: 'Teal Ocean', color: 0x008888, speed: 140, scale: { start: 0.9, end: 0.3 }, alpha: { start: 0.9, end: 0.1 }, lifespan: 2700 },
      { name: 'Violet Dream', color: 0x8800ff, speed: 160, scale: { start: 0.7, end: 0.1 }, alpha: { start: 0.95, end: 0 }, lifespan: 2400 },
      { name: 'Gold Treasure', color: 0xffd700, speed: 110, scale: { start: 1, end: 0.4 }, alpha: { start: 1, end: 0.2 }, lifespan: 3200 },
      { name: 'Silver Mist', color: 0xc0c0c0, speed: 130, scale: { start: 0.8, end: 0.2 }, alpha: { start: 0.85, end: 0 }, lifespan: 2900 }
    ];
  }

  preload() {
    // 预加载阶段（本例不需要外部资源）
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1);
    bg.fillRect(0, 0, 800, 600);

    // 生成粒子纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('particle', 16, 16);
    graphics.destroy();

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, 'particle', {
      speed: this.particleConfigs[0].speed,
      scale: this.particleConfigs[0].scale,
      alpha: this.particleConfigs[0].alpha,
      lifespan: this.particleConfigs[0].lifespan,
      blendMode: 'ADD',
      frequency: 50,
      tint: this.particleConfigs[0].color,
      angle: { min: 0, max: 360 },
      gravityY: 50
    });

    // 创建信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateInfoText();

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.switchParticleType();
      }
    });

    // 监听鼠标移动，让粒子跟随鼠标
    this.input.on('pointermove', (pointer) => {
      this.emitter.setPosition(pointer.x, pointer.y);
    });

    // 初始化信号对象
    window.__signals__ = {
      currentParticleIndex: this.currentParticleIndex,
      currentParticleName: this.particleConfigs[this.currentParticleIndex].name,
      switchCount: this.switchCount,
      totalParticleTypes: this.particleConfigs.length,
      timestamp: Date.now()
    };

    // 添加提示文本
    this.add.text(400, 580, 'Right Click to Switch Particle Type | Move Mouse to Control Position', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    console.log('[PARTICLE_INIT]', JSON.stringify(window.__signals__));
  }

  switchParticleType() {
    // 切换到下一种粒子类型
    this.currentParticleIndex = (this.currentParticleIndex + 1) % this.particleConfigs.length;
    this.switchCount++;

    const config = this.particleConfigs[this.currentParticleIndex];

    // 更新粒子发射器配置
    this.emitter.setConfig({
      speed: config.speed,
      scale: config.scale,
      alpha: config.alpha,
      lifespan: config.lifespan,
      tint: config.color
    });

    // 更新信息文本
    this.updateInfoText();

    // 更新信号
    window.__signals__ = {
      currentParticleIndex: this.currentParticleIndex,
      currentParticleName: config.name,
      currentParticleColor: '0x' + config.color.toString(16).padStart(6, '0'),
      switchCount: this.switchCount,
      totalParticleTypes: this.particleConfigs.length,
      timestamp: Date.now()
    };

    console.log('[PARTICLE_SWITCH]', JSON.stringify(window.__signals__));
  }

  updateInfoText() {
    const config = this.particleConfigs[this.currentParticleIndex];
    this.infoText.setText([
      `Particle Type: ${this.currentParticleIndex + 1}/${this.particleConfigs.length}`,
      `Name: ${config.name}`,
      `Color: 0x${config.color.toString(16).toUpperCase().padStart(6, '0')}`,
      `Switch Count: ${this.switchCount}`
    ]);
  }

  update(time, delta) {
    // 每帧更新（本例中主要逻辑在事件处理中）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ParticleScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);