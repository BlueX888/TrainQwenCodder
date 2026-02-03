class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.switchCount = 0; // 可验证的状态信号
  }

  preload() {
    // 定义12种不同颜色的粒子配置
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
      { name: 'Gold', color: 0xffd700 }
    ];
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
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      frequency: 50,
      maxParticles: 100,
      tint: this.particleColors[0].color
    });

    // 创建文本显示
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    this.instructionText = this.add.text(20, 80, 
      'Press W/A/S/D to switch particle colors\nW: Previous | S: Next\nA: -3 | D: +3', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建状态显示
    this.statusText = this.add.text(20, 550, '', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 防止重复触发
    this.wKey.on('down', () => this.switchParticle(-1));
    this.sKey.on('down', () => this.switchParticle(1));
    this.aKey.on('down', () => this.switchParticle(-3));
    this.dKey.on('down', () => this.switchParticle(3));

    // 初始化显示
    this.updateDisplay();

    // 添加鼠标跟随效果
    this.input.on('pointermove', (pointer) => {
      this.emitter.setPosition(pointer.x, pointer.y);
    });
  }

  switchParticle(offset) {
    // 更新索引（循环）
    this.currentParticleIndex = (this.currentParticleIndex + offset + this.particleColors.length) % this.particleColors.length;
    
    // 更新粒子颜色
    const currentColor = this.particleColors[this.currentParticleIndex];
    this.emitter.setTint(currentColor.color);
    
    // 增加切换计数
    this.switchCount++;
    
    // 更新显示
    this.updateDisplay();
    
    // 创建切换特效（短暂爆发）
    this.emitter.explode(20);
  }

  updateDisplay() {
    const currentColor = this.particleColors[this.currentParticleIndex];
    
    this.infoText.setText(
      `Current Particle: ${currentColor.name} (${this.currentParticleIndex + 1}/12)`
    );

    this.statusText.setText(
      `Status - Switch Count: ${this.switchCount} | Active Particles: ${this.emitter.getAliveParticleCount()}`
    );
  }

  update(time, delta) {
    // 每帧更新状态显示
    this.statusText.setText(
      `Status - Switch Count: ${this.switchCount} | Active Particles: ${this.emitter.getAliveParticleCount()}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ParticleScene,
  parent: 'game-container'
};

new Phaser.Game(config);