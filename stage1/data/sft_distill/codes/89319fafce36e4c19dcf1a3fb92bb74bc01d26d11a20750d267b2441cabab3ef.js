class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.colorConfigs = [
      { name: 'Red', color: 0xff0000, tint: [0xff0000, 0xff6666] },
      { name: 'Orange', color: 0xff8800, tint: [0xff8800, 0xffaa44] },
      { name: 'Yellow', color: 0xffff00, tint: [0xffff00, 0xffff88] },
      { name: 'Green', color: 0x00ff00, tint: [0x00ff00, 0x66ff66] },
      { name: 'Cyan', color: 0x00ffff, tint: [0x00ffff, 0x66ffff] },
      { name: 'Blue', color: 0x0000ff, tint: [0x0000ff, 0x6666ff] },
      { name: 'Purple', color: 0x8800ff, tint: [0x8800ff, 0xaa66ff] },
      { name: 'Pink', color: 0xff00ff, tint: [0xff00ff, 0xff66ff] }
    ];
  }

  preload() {
    // 为每种颜色创建纹理
    this.colorConfigs.forEach((config, index) => {
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
    this.emitter = this.add.particles(400, 300, `particle0`, {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      blendMode: 'ADD',
      frequency: 50,
      maxParticles: 200,
      tint: this.colorConfigs[0].tint
    });

    // 显示当前粒子类型
    this.particleText = this.add.text(400, 50, '', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // 显示提示文本
    this.add.text(400, 550, 'Press SPACE to switch particle type', {
      fontSize: '20px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // 更新显示
    this.updateParticleDisplay();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.switchParticle();
    });

    // 粒子发射器跟随鼠标（增强视觉效果）
    this.input.on('pointermove', (pointer) => {
      this.emitter.setPosition(pointer.x, pointer.y);
    });
  }

  switchParticle() {
    // 切换到下一个粒子类型
    this.currentParticleIndex = (this.currentParticleIndex + 1) % this.colorConfigs.length;
    
    // 更新粒子发射器
    const currentConfig = this.colorConfigs[this.currentParticleIndex];
    
    // 停止当前发射器
    this.emitter.stop();
    
    // 创建新的发射器
    const x = this.emitter.x;
    const y = this.emitter.y;
    this.emitter.destroy();
    
    this.emitter = this.add.particles(x, y, `particle${this.currentParticleIndex}`, {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      blendMode: 'ADD',
      frequency: 50,
      maxParticles: 200,
      tint: currentConfig.tint
    });

    // 更新显示
    this.updateParticleDisplay();

    // 恢复鼠标跟随
    this.input.on('pointermove', (pointer) => {
      this.emitter.setPosition(pointer.x, pointer.y);
    });
  }

  updateParticleDisplay() {
    const currentConfig = this.colorConfigs[this.currentParticleIndex];
    this.particleText.setText(`Particle Type: ${currentConfig.name} (${this.currentParticleIndex + 1}/8)`);
    
    // 更新文本颜色以匹配粒子颜色
    const colorString = '#' + currentConfig.color.toString(16).padStart(6, '0');
    this.particleText.setColor(colorString);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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

// 可验证的状态信号
game.registry.set('currentParticleType', 0);
game.events.on('step', () => {
  if (game.scene.scenes[0]) {
    game.registry.set('currentParticleType', game.scene.scenes[0].currentParticleIndex);
  }
});