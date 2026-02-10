class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0; // 状态信号：当前粒子索引
    this.particleColors = [
      { name: 'Red', color: 0xff0000 },
      { name: 'Green', color: 0x00ff00 },
      { name: 'Blue', color: 0x0000ff },
      { name: 'Yellow', color: 0xffff00 },
      { name: 'Cyan', color: 0x00ffff },
      { name: 'Magenta', color: 0xff00ff },
      { name: 'Orange', color: 0xff8800 },
      { name: 'Purple', color: 0x8800ff },
      { name: 'Pink', color: 0xff88ff },
      { name: 'Lime', color: 0x88ff00 },
      { name: 'Teal', color: 0x008888 },
      { name: 'White', color: 0xffffff }
    ];
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
    // 设置背景色
    this.cameras.main.setBackgroundColor(0x222222);

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, `particle0`, {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      frequency: 50,
      maxParticles: 100,
      blendMode: 'ADD'
    });

    // 创建UI文本显示
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    this.controlText = this.add.text(20, 80, 'Press W/A/S/D to switch particles', {
      fontSize: '18px',
      color: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新显示信息
    this.updateInfo();

    // 设置键盘输入
    this.setupKeyboard();

    // 添加鼠标跟随效果
    this.input.on('pointermove', (pointer) => {
      this.emitter.setPosition(pointer.x, pointer.y);
    });
  }

  setupKeyboard() {
    // 创建WASD键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // W键：上一个粒子
    this.keyW.on('down', () => {
      this.currentParticleIndex = (this.currentParticleIndex - 1 + this.particleColors.length) % this.particleColors.length;
      this.switchParticle();
    });

    // A键：向左跳转（-3）
    this.keyA.on('down', () => {
      this.currentParticleIndex = (this.currentParticleIndex - 3 + this.particleColors.length) % this.particleColors.length;
      this.switchParticle();
    });

    // S键：下一个粒子
    this.keyS.on('down', () => {
      this.currentParticleIndex = (this.currentParticleIndex + 1) % this.particleColors.length;
      this.switchParticle();
    });

    // D键：向右跳转（+3）
    this.keyD.on('down', () => {
      this.currentParticleIndex = (this.currentParticleIndex + 3) % this.particleColors.length;
      this.switchParticle();
    });
  }

  switchParticle() {
    // 切换粒子纹理
    const textureKey = `particle${this.currentParticleIndex}`;
    this.emitter.setTexture(textureKey);
    
    // 添加切换效果：短暂爆发
    this.emitter.explode(20);
    
    // 更新显示信息
    this.updateInfo();
    
    // 输出到控制台供验证
    console.log(`Switched to particle ${this.currentParticleIndex}: ${this.particleColors[this.currentParticleIndex].name}`);
  }

  updateInfo() {
    const currentColor = this.particleColors[this.currentParticleIndex];
    this.infoText.setText(
      `Particle: ${this.currentParticleIndex + 1}/12\n` +
      `Color: ${currentColor.name}\n` +
      `Index: ${this.currentParticleIndex}`
    );
    
    // 更新文本颜色以匹配当前粒子颜色
    const colorHex = '#' + currentColor.color.toString(16).padStart(6, '0');
    this.infoText.setColor(colorHex);
  }

  update(time, delta) {
    // 可选：添加自动旋转效果
    const angle = (time / 50) % 360;
    const radius = 150;
    const centerX = 400;
    const centerY = 300;
    
    // 如果没有鼠标移动，粒子发射器会自动旋转
    if (!this.input.activePointer.isDown) {
      const x = centerX + Math.cos(Phaser.Math.DegToRad(angle)) * radius;
      const y = centerY + Math.sin(Phaser.Math.DegToRad(angle)) * radius;
      this.emitter.setPosition(x, y);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ParticleScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

const game = new Phaser.Game(config);