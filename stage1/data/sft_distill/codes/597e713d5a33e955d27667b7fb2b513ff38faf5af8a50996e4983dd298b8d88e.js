class ParticleSwitchScene extends Phaser.Scene {
  constructor() {
    super('ParticleSwitchScene');
    this.currentParticleIndex = 0;
    this.particleConfigs = [];
  }

  preload() {
    // 定义8种颜色配置
    this.particleConfigs = [
      { name: 'Red', color: 0xff0000, tint: 0xff0000 },
      { name: 'Green', color: 0x00ff00, tint: 0x00ff00 },
      { name: 'Blue', color: 0x0000ff, tint: 0x0000ff },
      { name: 'Yellow', color: 0xffff00, tint: 0xffff00 },
      { name: 'Magenta', color: 0xff00ff, tint: 0xff00ff },
      { name: 'Cyan', color: 0x00ffff, tint: 0x00ffff },
      { name: 'Orange', color: 0xff8800, tint: 0xff8800 },
      { name: 'Purple', color: 0x8800ff, tint: 0x8800ff }
    ];
  }

  create() {
    // 创建8种颜色的粒子纹理
    this.particleConfigs.forEach((config, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(config.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${index}`, 16, 16);
      graphics.destroy();
    });

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

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.leftKeyPressed = false;
    this.rightKeyPressed = false;

    // 显示当前粒子类型信息
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示操作提示
    this.add.text(20, 560, 'Press LEFT/RIGHT arrow keys to switch particle type', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化显示
    this.updateParticleType();
  }

  update() {
    // 检测左键按下（边缘触发）
    if (this.cursors.left.isDown && !this.leftKeyPressed) {
      this.leftKeyPressed = true;
      this.currentParticleIndex--;
      if (this.currentParticleIndex < 0) {
        this.currentParticleIndex = this.particleConfigs.length - 1;
      }
      this.updateParticleType();
    } else if (this.cursors.left.isUp) {
      this.leftKeyPressed = false;
    }

    // 检测右键按下（边缘触发）
    if (this.cursors.right.isDown && !this.rightKeyPressed) {
      this.rightKeyPressed = true;
      this.currentParticleIndex++;
      if (this.currentParticleIndex >= this.particleConfigs.length) {
        this.currentParticleIndex = 0;
      }
      this.updateParticleType();
    } else if (this.cursors.right.isUp) {
      this.rightKeyPressed = false;
    }
  }

  updateParticleType() {
    const config = this.particleConfigs[this.currentParticleIndex];
    
    // 更新粒子发射器纹理
    this.emitter.setTexture(`particle${this.currentParticleIndex}`);
    
    // 更新粒子颜色（使用tint）
    this.emitter.setTint(config.tint);
    
    // 更新信息文本
    this.infoText.setText(
      `Particle Type: ${this.currentParticleIndex + 1}/8 - ${config.name}\n` +
      `Color: #${config.color.toString(16).padStart(6, '0').toUpperCase()}`
    );
    
    // 验证状态信号
    console.log(`Current Particle Index: ${this.currentParticleIndex}`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ParticleSwitchScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(config);