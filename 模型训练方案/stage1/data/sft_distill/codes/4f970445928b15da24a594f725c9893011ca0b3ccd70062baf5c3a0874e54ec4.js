class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.particleConfigs = [];
    this.particleTextures = [];
  }

  preload() {
    // 定义10种不同颜色和配置的粒子
    this.particleConfigs = [
      { color: 0xff0000, name: 'Red Fire', speed: 200, lifespan: 2000, scale: { start: 1, end: 0 } },
      { color: 0x00ff00, name: 'Green Sparkle', speed: 150, lifespan: 1500, scale: { start: 0.5, end: 1.5 } },
      { color: 0x0000ff, name: 'Blue Water', speed: 100, lifespan: 3000, scale: { start: 0.8, end: 0.2 } },
      { color: 0xffff00, name: 'Yellow Lightning', speed: 300, lifespan: 1000, scale: { start: 1.2, end: 0 } },
      { color: 0xff00ff, name: 'Magenta Magic', speed: 180, lifespan: 2500, scale: { start: 0.6, end: 1.2 } },
      { color: 0x00ffff, name: 'Cyan Ice', speed: 120, lifespan: 2800, scale: { start: 1, end: 0.3 } },
      { color: 0xff8800, name: 'Orange Flame', speed: 220, lifespan: 1800, scale: { start: 1.5, end: 0 } },
      { color: 0x8800ff, name: 'Purple Smoke', speed: 80, lifespan: 3500, scale: { start: 0.4, end: 2 } },
      { color: 0xffffff, name: 'White Star', speed: 250, lifespan: 1200, scale: { start: 1, end: 0.5 } },
      { color: 0x888888, name: 'Gray Dust', speed: 60, lifespan: 4000, scale: { start: 0.3, end: 1.5 } }
    ];
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x111111, 1);
    bg.fillRect(0, 0, 800, 600);

    // 为每种粒子生成纹理
    this.particleConfigs.forEach((config, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(config.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${index}`, 16, 16);
      graphics.destroy();
      this.particleTextures.push(`particle${index}`);
    });

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, this.particleTextures[0], {
      speed: this.particleConfigs[0].speed,
      lifespan: this.particleConfigs[0].lifespan,
      scale: this.particleConfigs[0].scale,
      blendMode: 'ADD',
      frequency: 50,
      maxParticles: 200,
      angle: { min: 0, max: 360 }
    });

    // 添加UI文本
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    this.controlText = this.add.text(20, 560, 'Controls: W/S - Switch | A/D - Cycle', {
      fontSize: '18px',
      color: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateInfoText();

    // 键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 防止重复触发
    this.keyW.on('down', () => this.switchParticle(-1));
    this.keyS.on('down', () => this.switchParticle(1));
    this.keyA.on('down', () => this.switchParticle(-1));
    this.keyD.on('down', () => this.switchParticle(1));

    // 添加鼠标跟随效果
    this.input.on('pointermove', (pointer) => {
      this.emitter.setPosition(pointer.x, pointer.y);
    });

    // 添加点击爆发效果
    this.input.on('pointerdown', () => {
      this.emitter.explode(50);
    });
  }

  switchParticle(direction) {
    // 更新索引（循环）
    this.currentParticleIndex += direction;
    if (this.currentParticleIndex < 0) {
      this.currentParticleIndex = this.particleConfigs.length - 1;
    } else if (this.currentParticleIndex >= this.particleConfigs.length) {
      this.currentParticleIndex = 0;
    }

    // 获取当前配置
    const config = this.particleConfigs[this.currentParticleIndex];
    const texture = this.particleTextures[this.currentParticleIndex];

    // 更新粒子发射器
    this.emitter.setTexture(texture);
    this.emitter.setConfig({
      speed: config.speed,
      lifespan: config.lifespan,
      scale: config.scale,
      blendMode: 'ADD',
      frequency: 50,
      maxParticles: 200,
      angle: { min: 0, max: 360 }
    });

    // 更新UI
    this.updateInfoText();

    // 触发爆发效果展示新粒子
    this.emitter.explode(30);
  }

  updateInfoText() {
    const config = this.particleConfigs[this.currentParticleIndex];
    this.infoText.setText(
      `Particle Type: ${this.currentParticleIndex + 1}/10\n` +
      `Name: ${config.name}\n` +
      `Speed: ${config.speed} | Lifespan: ${config.lifespan}ms`
    );

    // 改变文本颜色以匹配粒子颜色
    const colorHex = '#' + config.color.toString(16).padStart(6, '0');
    this.infoText.setColor(colorHex);
  }

  update(time, delta) {
    // 可验证的状态信号
    this.currentTime = time;
    this.particleCount = this.emitter.getAliveParticleCount();
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
      debug: false
    }
  }
};

const game = new Phaser.Game(config);