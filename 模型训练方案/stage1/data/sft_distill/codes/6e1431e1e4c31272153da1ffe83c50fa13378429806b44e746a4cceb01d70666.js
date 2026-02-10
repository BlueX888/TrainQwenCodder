class ParticleSwitchScene extends Phaser.Scene {
  constructor() {
    super('ParticleSwitchScene');
    this.currentParticleIndex = 0;
    this.particleColors = [
      { name: 'Red', color: 0xff0000 },
      { name: 'Green', color: 0x00ff00 },
      { name: 'Blue', color: 0x0000ff },
      { name: 'Yellow', color: 0xffff00 },
      { name: 'Purple', color: 0xff00ff }
    ];
    this.emitters = [];
  }

  preload() {
    // 为每种颜色创建粒子纹理
    this.particleColors.forEach((colorData, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(colorData.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${index}`, 16, 16);
      graphics.destroy();
    });
  }

  create() {
    // 添加标题
    this.add.text(400, 50, 'Particle Color Switcher', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加说明文字
    this.add.text(400, 100, 'Press LEFT/RIGHT arrow keys to switch particle colors', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建状态显示文本
    this.statusText = this.add.text(400, 150, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // 为每种颜色创建粒子发射器
    this.particleColors.forEach((colorData, index) => {
      const emitter = this.add.particles(400, 350, `particle${index}`, {
        speed: { min: 100, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 2000,
        frequency: 50,
        maxParticles: 100,
        gravityY: 50,
        blendMode: 'ADD'
      });

      // 初始时只显示第一个发射器
      emitter.setVisible(index === 0);
      this.emitters.push(emitter);
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加键盘事件监听（防止连续触发）
    this.input.keyboard.on('keydown-LEFT', () => {
      this.switchParticle(-1);
    });

    this.input.keyboard.on('keydown-RIGHT', () => {
      this.switchParticle(1);
    });

    // 更新初始状态显示
    this.updateStatusDisplay();

    // 添加粒子计数显示
    this.particleCountText = this.add.text(400, 500, '', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  switchParticle(direction) {
    // 隐藏当前粒子发射器
    this.emitters[this.currentParticleIndex].setVisible(false);

    // 更新索引（循环切换）
    this.currentParticleIndex += direction;
    if (this.currentParticleIndex < 0) {
      this.currentParticleIndex = this.particleColors.length - 1;
    } else if (this.currentParticleIndex >= this.particleColors.length) {
      this.currentParticleIndex = 0;
    }

    // 显示新的粒子发射器
    this.emitters[this.currentParticleIndex].setVisible(true);

    // 更新状态显示
    this.updateStatusDisplay();
  }

  updateStatusDisplay() {
    const currentColor = this.particleColors[this.currentParticleIndex];
    this.statusText.setText(
      `Current Particle: ${this.currentParticleIndex + 1}/5 - ${currentColor.name}`
    );
    this.statusText.setBackgroundColor(
      '#' + currentColor.color.toString(16).padStart(6, '0')
    );
  }

  update(time, delta) {
    // 更新粒子计数（仅显示当前激活的发射器）
    const activeEmitter = this.emitters[this.currentParticleIndex];
    const aliveCount = activeEmitter.getAliveParticleCount();
    this.particleCountText.setText(
      `Active Particles: ${aliveCount} / ${activeEmitter.maxParticles}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ParticleSwitchScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(config);