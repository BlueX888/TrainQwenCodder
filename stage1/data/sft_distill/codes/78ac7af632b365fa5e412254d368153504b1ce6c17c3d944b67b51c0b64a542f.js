class ParticleShowcaseScene extends Phaser.Scene {
  constructor() {
    super('ParticleShowcaseScene');
    this.currentParticleIndex = 0;
    this.particleConfigs = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 定义12种粒子配置
    this.particleConfigs = [
      { name: 'Red Fire', color: 0xff0000, speed: 200, lifespan: 2000, scale: { start: 1, end: 0 } },
      { name: 'Blue Water', color: 0x0066ff, speed: 150, lifespan: 3000, scale: { start: 0.8, end: 0.2 } },
      { name: 'Green Nature', color: 0x00ff00, speed: 100, lifespan: 2500, scale: { start: 0.6, end: 0 } },
      { name: 'Yellow Lightning', color: 0xffff00, speed: 300, lifespan: 1000, scale: { start: 1.2, end: 0 } },
      { name: 'Purple Magic', color: 0x9900ff, speed: 120, lifespan: 3500, scale: { start: 0.5, end: 0.1 } },
      { name: 'Orange Flame', color: 0xff6600, speed: 180, lifespan: 2200, scale: { start: 0.9, end: 0 } },
      { name: 'Cyan Ice', color: 0x00ffff, speed: 90, lifespan: 4000, scale: { start: 0.7, end: 0.3 } },
      { name: 'Pink Blossom', color: 0xff66cc, speed: 110, lifespan: 2800, scale: { start: 0.8, end: 0.1 } },
      { name: 'White Snow', color: 0xffffff, speed: 80, lifespan: 3000, scale: { start: 0.5, end: 0 } },
      { name: 'Gray Smoke', color: 0x888888, speed: 70, lifespan: 3500, scale: { start: 1, end: 0.5 } },
      { name: 'Gold Sparkle', color: 0xffd700, speed: 250, lifespan: 1500, scale: { start: 0.6, end: 0 } },
      { name: 'Teal Mist', color: 0x008080, speed: 95, lifespan: 3200, scale: { start: 0.9, end: 0.2 } }
    ];

    // 创建12种颜色的粒子纹理
    this.particleConfigs.forEach((config, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(config.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${index}`, 16, 16);
      graphics.destroy();
    });

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, `particle0`, {
      speed: this.particleConfigs[0].speed,
      lifespan: this.particleConfigs[0].lifespan,
      scale: this.particleConfigs[0].scale,
      blendMode: 'ADD',
      frequency: 50,
      maxParticles: 100,
      angle: { min: 0, max: 360 }
    });

    // 创建UI文本
    this.titleText = this.add.text(400, 50, 'Particle Showcase', {
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.infoText = this.add.text(400, 100, '', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.instructionText = this.add.text(400, 550, 'Press LEFT/RIGHT arrows to switch particle types', {
      fontSize: '18px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // 状态信号变量
    this.particleTypeIndex = 0;
    this.switchCount = 0;

    // 更新显示
    this.updateDisplay();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 防止按键重复触发
    this.lastSwitchTime = 0;
    this.switchCooldown = 200; // 毫秒

    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x111111, 1);
    bg.fillRect(0, 0, 800, 600);
    bg.setDepth(-1);
  }

  update(time, delta) {
    // 检测方向键切换
    if (time - this.lastSwitchTime > this.switchCooldown) {
      if (this.cursors.left.isDown) {
        this.switchParticle(-1);
        this.lastSwitchTime = time;
      } else if (this.cursors.right.isDown) {
        this.switchParticle(1);
        this.lastSwitchTime = time;
      }
    }
  }

  switchParticle(direction) {
    // 切换粒子类型
    this.currentParticleIndex += direction;
    
    // 循环索引
    if (this.currentParticleIndex < 0) {
      this.currentParticleIndex = this.particleConfigs.length - 1;
    } else if (this.currentParticleIndex >= this.particleConfigs.length) {
      this.currentParticleIndex = 0;
    }

    // 更新状态信号
    this.particleTypeIndex = this.currentParticleIndex;
    this.switchCount++;

    // 获取当前配置
    const config = this.particleConfigs[this.currentParticleIndex];

    // 更新发射器
    this.emitter.setTexture(`particle${this.currentParticleIndex}`);
    this.emitter.setSpeed(config.speed);
    this.emitter.setLifespan(config.lifespan);
    this.emitter.setScale(config.scale);

    // 更新显示
    this.updateDisplay();

    // 控制台输出状态（用于验证）
    console.log(`Particle Type: ${this.particleTypeIndex}, Switch Count: ${this.switchCount}`);
  }

  updateDisplay() {
    const config = this.particleConfigs[this.currentParticleIndex];
    this.infoText.setText(
      `[${this.currentParticleIndex + 1}/12] ${config.name}\n` +
      `Speed: ${config.speed} | Lifespan: ${config.lifespan}ms\n` +
      `Switches: ${this.switchCount}`
    );
    
    // 根据当前颜色更新文本颜色
    const colorStr = '#' + config.color.toString(16).padStart(6, '0');
    this.infoText.setColor(colorStr);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ParticleShowcaseScene,
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

new Phaser.Game(config);