class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.particleEmitter = null;
    this.statusText = null;
    
    // 定义 12 种颜色配置
    this.particleConfigs = [
      { name: 'Red', color: 0xff0000, tint: 0xff0000 },
      { name: 'Green', color: 0x00ff00, tint: 0x00ff00 },
      { name: 'Blue', color: 0x0000ff, tint: 0x0000ff },
      { name: 'Yellow', color: 0xffff00, tint: 0xffff00 },
      { name: 'Cyan', color: 0x00ffff, tint: 0x00ffff },
      { name: 'Magenta', color: 0xff00ff, tint: 0xff00ff },
      { name: 'Orange', color: 0xff8800, tint: 0xff8800 },
      { name: 'Purple', color: 0x8800ff, tint: 0x8800ff },
      { name: 'Pink', color: 0xff69b4, tint: 0xff69b4 },
      { name: 'Lime', color: 0xccff00, tint: 0xccff00 },
      { name: 'Turquoise', color: 0x40e0d0, tint: 0x40e0d0 },
      { name: 'Gold', color: 0xffd700, tint: 0xffd700 }
    ];
  }

  preload() {
    // 创建粒子纹理
    this.createParticleTextures();
  }

  create() {
    // 设置背景色
    this.cameras.main.setBackgroundColor(0x000000);

    // 创建状态文本
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建初始粒子发射器
    this.createParticleEmitter();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.switchParticleType();
    });

    // 更新状态显示
    this.updateStatus();

    // 添加提示文本
    this.add.text(20, 560, 'Press SPACE to switch particle type', {
      fontSize: '18px',
      color: '#888888'
    });
  }

  createParticleTextures() {
    // 为每种颜色创建纹理
    this.particleConfigs.forEach((config, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(config.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle_${index}`, 16, 16);
      graphics.destroy();
    });
  }

  createParticleEmitter() {
    const config = this.particleConfigs[this.currentParticleIndex];
    
    // 销毁旧的发射器
    if (this.particleEmitter) {
      this.particleEmitter.destroy();
    }

    // 创建新的粒子发射器
    this.particleEmitter = this.add.particles(400, 300, `particle_${this.currentParticleIndex}`, {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      frequency: 50,
      maxParticles: 100,
      blendMode: 'ADD',
      tint: config.tint,
      // 使用固定的随机种子确保行为确定性
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Circle(0, 0, 10)
      }
    });

    // 设置发射器位置随鼠标移动
    this.input.on('pointermove', (pointer) => {
      if (this.particleEmitter) {
        this.particleEmitter.setPosition(pointer.x, pointer.y);
      }
    });
  }

  switchParticleType() {
    // 切换到下一种粒子类型
    this.currentParticleIndex = (this.currentParticleIndex + 1) % this.particleConfigs.length;
    
    // 重新创建粒子发射器
    this.createParticleEmitter();
    
    // 更新状态显示
    this.updateStatus();
  }

  updateStatus() {
    const config = this.particleConfigs[this.currentParticleIndex];
    this.statusText.setText([
      `Particle Type: ${this.currentParticleIndex + 1}/12`,
      `Color: ${config.name}`,
      `Hex: #${config.color.toString(16).padStart(6, '0').toUpperCase()}`
    ]);
  }

  update(time, delta) {
    // 可选：添加额外的更新逻辑
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
      gravity: { y: 0 },
      debug: false
    }
  }
};

new Phaser.Game(config);