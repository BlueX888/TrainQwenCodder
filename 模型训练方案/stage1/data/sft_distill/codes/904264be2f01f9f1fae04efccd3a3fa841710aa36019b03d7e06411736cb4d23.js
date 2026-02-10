class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0; // 可验证状态
    this.particleConfigs = [
      { name: 'Red', color: 0xff0000 },
      { name: 'Green', color: 0x00ff00 },
      { name: 'Blue', color: 0x0000ff },
      { name: 'Yellow', color: 0xffff00 },
      { name: 'Magenta', color: 0xff00ff },
      { name: 'Cyan', color: 0x00ffff },
      { name: 'Orange', color: 0xff8800 },
      { name: 'Purple', color: 0x8800ff }
    ];
  }

  preload() {
    // 创建8种颜色的粒子纹理
    this.particleConfigs.forEach((config, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(config.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${index}`, 16, 16);
      graphics.destroy();
    });
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建粒子发射器
    this.particleEmitter = this.add.particles(400, 300, `particle0`, {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      blendMode: 'ADD',
      frequency: 50,
      maxParticles: 200,
      gravityY: 50
    });

    // 创建UI文本
    this.titleText = this.add.text(400, 50, 'Particle Color Switcher', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.infoText = this.add.text(400, 100, '', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.instructionText = this.add.text(400, 550, 'Use LEFT/RIGHT arrow keys to switch particle colors', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 更新显示信息
    this.updateInfo();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 防止快速连续切换
    this.lastSwitchTime = 0;
    this.switchCooldown = 200; // 200ms冷却时间
  }

  update(time, delta) {
    // 检测左右方向键切换
    if (time - this.lastSwitchTime > this.switchCooldown) {
      if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
        this.switchParticle(-1);
        this.lastSwitchTime = time;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        this.switchParticle(1);
        this.lastSwitchTime = time;
      }
    }
  }

  switchParticle(direction) {
    // 更新索引（循环）
    this.currentParticleIndex += direction;
    if (this.currentParticleIndex < 0) {
      this.currentParticleIndex = this.particleConfigs.length - 1;
    } else if (this.currentParticleIndex >= this.particleConfigs.length) {
      this.currentParticleIndex = 0;
    }

    // 更新粒子发射器纹理
    const textureName = `particle${this.currentParticleIndex}`;
    this.particleEmitter.setTexture(textureName);

    // 添加切换动画效果
    this.particleEmitter.explode(30, 400, 300);

    // 更新显示信息
    this.updateInfo();

    // 播放切换音效（视觉反馈）
    this.cameras.main.flash(100, 255, 255, 255, false, 0.1);
  }

  updateInfo() {
    const config = this.particleConfigs[this.currentParticleIndex];
    const colorHex = '#' + config.color.toString(16).padStart(6, '0');
    
    this.infoText.setText(
      `Current: ${config.name} (${this.currentParticleIndex + 1}/8)\n` +
      `Color: ${colorHex}`
    );
    
    // 设置文本颜色为当前粒子颜色
    this.infoText.setColor(colorHex);

    // 输出状态到控制台（便于验证）
    console.log(`Particle switched to index: ${this.currentParticleIndex}, color: ${config.name}`);
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

const game = new Phaser.Game(config);