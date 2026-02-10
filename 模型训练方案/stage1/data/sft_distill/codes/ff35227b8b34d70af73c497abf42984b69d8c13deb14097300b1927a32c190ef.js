class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.particleTypes = [
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
    this.particleTypes.forEach((type, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(type.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle_${index}`, 16, 16);
      graphics.destroy();
    });
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, `particle_0`, {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      frequency: 50,
      maxParticles: 100,
      blendMode: 'ADD'
    });

    // 添加中心指示器
    this.indicator = this.add.graphics();
    this.indicator.lineStyle(2, 0xffffff, 1);
    this.indicator.strokeCircle(400, 300, 20);
    this.indicator.fillStyle(0xffffff, 0.3);
    this.indicator.fillCircle(400, 300, 20);

    // 添加UI文本
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    this.instructionText = this.add.text(20, 550, 'Press W/A/S/D to switch particle type', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 状态信号变量
    this.particleSwitchCount = 0;

    // 更新UI
    this.updateUI();

    // 设置键盘输入
    this.setupKeyboard();
  }

  setupKeyboard() {
    const keys = this.input.keyboard.addKeys('W,A,S,D');

    // W键 - 下一个粒子类型
    keys.W.on('down', () => {
      this.switchParticle(1);
    });

    // A键 - 上一个粒子类型
    keys.A.on('down', () => {
      this.switchParticle(-1);
    });

    // S键 - 下一个粒子类型
    keys.S.on('down', () => {
      this.switchParticle(1);
    });

    // D键 - 上一个粒子类型
    keys.D.on('down', () => {
      this.switchParticle(-1);
    });
  }

  switchParticle(direction) {
    // 计算新的索引
    this.currentParticleIndex += direction;
    
    // 循环索引
    if (this.currentParticleIndex < 0) {
      this.currentParticleIndex = this.particleTypes.length - 1;
    } else if (this.currentParticleIndex >= this.particleTypes.length) {
      this.currentParticleIndex = 0;
    }

    // 更新粒子发射器纹理
    this.emitter.setTexture(`particle_${this.currentParticleIndex}`);

    // 更新状态信号
    this.particleSwitchCount++;

    // 更新UI
    this.updateUI();

    // 创建一个爆发效果
    this.emitter.explode(20);
  }

  updateUI() {
    const currentType = this.particleTypes[this.currentParticleIndex];
    this.infoText.setText([
      `Particle Type: ${this.currentParticleIndex + 1}/12`,
      `Color: ${currentType.name}`,
      `Switches: ${this.particleSwitchCount}`
    ]);

    // 更新指示器颜色
    this.indicator.clear();
    this.indicator.lineStyle(3, currentType.color, 1);
    this.indicator.strokeCircle(400, 300, 20);
    this.indicator.fillStyle(currentType.color, 0.3);
    this.indicator.fillCircle(400, 300, 20);
  }

  update(time, delta) {
    // 可选：添加粒子发射器的轻微旋转效果
    const angle = Math.sin(time * 0.001) * 0.5;
    this.emitter.setAngle({ min: -180 + angle * 10, max: 180 + angle * 10 });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ParticleScene,
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(config);