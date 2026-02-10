class ParticleColorScene extends Phaser.Scene {
  constructor() {
    super('ParticleColorScene');
    this.currentIndex = 0;
    this.particleColors = [
      { name: 'Red', color: 0xff0000, tint: 0xff0000 },
      { name: 'Green', color: 0x00ff00, tint: 0x00ff00 },
      { name: 'Blue', color: 0x0000ff, tint: 0x0000ff },
      { name: 'Yellow', color: 0xffff00, tint: 0xffff00 },
      { name: 'Cyan', color: 0x00ffff, tint: 0x00ffff },
      { name: 'Magenta', color: 0xff00ff, tint: 0xff00ff },
      { name: 'Orange', color: 0xff8800, tint: 0xff8800 },
      { name: 'Purple', color: 0x8800ff, tint: 0x8800ff },
      { name: 'Pink', color: 0xff88ff, tint: 0xff88ff },
      { name: 'Lime', color: 0x88ff00, tint: 0x88ff00 },
      { name: 'Teal', color: 0x008888, tint: 0x008888 },
      { name: 'White', color: 0xffffff, tint: 0xffffff }
    ];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建白色圆形纹理作为粒子基础（后续通过tint着色）
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('particle', 16, 16);
    graphics.destroy();

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, 'particle', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 2000,
      frequency: 50,
      maxParticles: 100,
      tint: this.particleColors[0].tint,
      blendMode: 'ADD'
    });

    // 创建UI文本显示当前颜色
    this.colorText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.add.text(20, 60, 'Press SPACE to switch color', {
      fontSize: '18px',
      color: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建状态显示文本（可验证的状态信号）
    this.statusText = this.add.text(20, 100, '', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.switchParticleColor();
    });

    // 初始化显示
    this.updateDisplay();
  }

  switchParticleColor() {
    // 切换到下一个颜色
    this.currentIndex = (this.currentIndex + 1) % this.particleColors.length;
    
    // 更新粒子发射器的颜色
    const currentColor = this.particleColors[this.currentIndex];
    this.emitter.setParticleTint(currentColor.tint);
    
    // 更新显示
    this.updateDisplay();
  }

  updateDisplay() {
    const currentColor = this.particleColors[this.currentIndex];
    
    // 更新颜色文本
    this.colorText.setText(`Color: ${currentColor.name} (${this.currentIndex + 1}/12)`);
    
    // 更新状态文本（可验证的状态信号）
    this.statusText.setText(
      `Index: ${this.currentIndex}\n` +
      `Hex: 0x${currentColor.color.toString(16).toUpperCase().padStart(6, '0')}\n` +
      `Active: ${this.emitter.getAliveParticleCount()} particles`
    );
  }

  update(time, delta) {
    // 每帧更新粒子数量显示
    const currentColor = this.particleColors[this.currentIndex];
    this.statusText.setText(
      `Index: ${this.currentIndex}\n` +
      `Hex: 0x${currentColor.color.toString(16).toUpperCase().padStart(6, '0')}\n` +
      `Active: ${this.emitter.getAliveParticleCount()} particles`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ParticleColorScene
};

new Phaser.Game(config);