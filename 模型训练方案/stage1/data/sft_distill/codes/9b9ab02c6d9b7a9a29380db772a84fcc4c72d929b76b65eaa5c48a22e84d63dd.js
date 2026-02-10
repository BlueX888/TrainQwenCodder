class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.particleTypes = [
      { name: 'Red', color: 0xff0000, tint: 0xff0000 },
      { name: 'Green', color: 0x00ff00, tint: 0x00ff00 },
      { name: 'Blue', color: 0x0000ff, tint: 0x0000ff },
      { name: 'Yellow', color: 0xffff00, tint: 0xffff00 },
      { name: 'Magenta', color: 0xff00ff, tint: 0xff00ff },
      { name: 'Cyan', color: 0x00ffff, tint: 0x00ffff },
      { name: 'Orange', color: 0xff8800, tint: 0xff8800 },
      { name: 'Purple', color: 0x8800ff, tint: 0x8800ff }
    ];
    this.switchCount = 0;
  }

  preload() {
    // 预加载阶段 - 创建粒子纹理
    this.createParticleTextures();
  }

  create() {
    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, 'particle_red', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 2000,
      gravityY: 50,
      quantity: 2,
      frequency: 50,
      tint: this.particleTypes[0].tint,
      alpha: { start: 1, end: 0 }
    });

    // 创建信息文本
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(20, 70, '', {
      fontSize: '18px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(400, 550, 'Press SPACE to switch particle type', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.switchParticleType();
    });

    // 更新显示
    this.updateDisplay();

    // 添加鼠标点击效果
    this.input.on('pointerdown', (pointer) => {
      this.createBurst(pointer.x, pointer.y);
    });
  }

  createParticleTextures() {
    // 为每种颜色创建圆形粒子纹理
    this.particleTypes.forEach((type, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(type.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle_${type.name.toLowerCase()}`, 16, 16);
      graphics.destroy();
    });
  }

  switchParticleType() {
    // 切换到下一个粒子类型
    this.currentParticleIndex = (this.currentParticleIndex + 1) % this.particleTypes.length;
    this.switchCount++;

    const currentType = this.particleTypes[this.currentParticleIndex];

    // 更新粒子发射器的纹理和颜色
    this.emitter.setTexture(`particle_${currentType.name.toLowerCase()}`);
    this.emitter.setTint(currentType.tint);

    // 创建切换时的爆发效果
    this.createBurst(400, 300);

    // 更新显示
    this.updateDisplay();
  }

  createBurst(x, y) {
    // 在指定位置创建粒子爆发效果
    const currentType = this.particleTypes[this.currentParticleIndex];
    
    this.add.particles(x, y, `particle_${currentType.name.toLowerCase()}`, {
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      blendMode: 'ADD',
      lifespan: 1500,
      quantity: 30,
      tint: currentType.tint,
      alpha: { start: 1, end: 0 }
    });
  }

  updateDisplay() {
    const currentType = this.particleTypes[this.currentParticleIndex];
    
    this.infoText.setText(`Current Particle: ${currentType.name} (${this.currentParticleIndex + 1}/8)`);
    this.statusText.setText(
      `Switch Count: ${this.switchCount}\n` +
      `Active Particles: ${this.emitter.getAliveParticleCount()}\n` +
      `Color: #${currentType.color.toString(16).padStart(6, '0').toUpperCase()}`
    );

    // 更新文本颜色以匹配当前粒子
    this.infoText.setColor(`#${currentType.color.toString(16).padStart(6, '0')}`);
  }

  update(time, delta) {
    // 每帧更新状态显示（仅更新粒子计数）
    if (time % 100 < delta) {
      const currentType = this.particleTypes[this.currentParticleIndex];
      this.statusText.setText(
        `Switch Count: ${this.switchCount}\n` +
        `Active Particles: ${this.emitter.getAliveParticleCount()}\n` +
        `Color: #${currentType.color.toString(16).padStart(6, '0').toUpperCase()}`
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
      gravity: { y: 0 },
      debug: false
    }
  }
};

new Phaser.Game(config);