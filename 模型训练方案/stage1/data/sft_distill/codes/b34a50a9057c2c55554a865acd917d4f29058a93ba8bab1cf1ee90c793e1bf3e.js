class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.particleColors = [
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
    // 添加背景色
    this.cameras.main.setBackgroundColor(0x000000);

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

    // 创建信息文本
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建操作提示文本
    this.add.text(20, 560, 'Controls: W/A/S/D to switch particle type', {
      fontSize: '18px',
      color: '#aaaaaa'
    });

    // 更新显示信息
    this.updateInfo();

    // 设置键盘输入
    this.keys = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 监听按键事件
    this.keys.w.on('down', () => this.switchParticle(-1));
    this.keys.a.on('down', () => this.switchParticle(-1));
    this.keys.s.on('down', () => this.switchParticle(1));
    this.keys.d.on('down', () => this.switchParticle(1));

    // 添加鼠标跟随效果
    this.input.on('pointermove', (pointer) => {
      this.emitter.setPosition(pointer.x, pointer.y);
    });

    // 状态信号（用于验证）
    this.particleTypeIndex = 0;
    this.switchCount = 0;
  }

  switchParticle(direction) {
    // 更新粒子索引
    this.currentParticleIndex += direction;
    
    // 循环索引
    if (this.currentParticleIndex < 0) {
      this.currentParticleIndex = this.particleColors.length - 1;
    } else if (this.currentParticleIndex >= this.particleColors.length) {
      this.currentParticleIndex = 0;
    }

    // 更新状态信号
    this.particleTypeIndex = this.currentParticleIndex;
    this.switchCount++;

    // 更新粒子发射器纹理
    this.emitter.setTexture(`particle${this.currentParticleIndex}`);

    // 根据颜色调整粒子效果
    const colorData = this.particleColors[this.currentParticleIndex];
    
    // 为不同颜色设置不同的粒子行为
    switch(this.currentParticleIndex) {
      case 0: // Red - 爆炸效果
        this.emitter.setSpeed({ min: 150, max: 250 });
        this.emitter.setScale({ start: 1.2, end: 0 });
        break;
      case 1: // Green - 缓慢上升
        this.emitter.setSpeed({ min: 50, max: 100 });
        this.emitter.setScale({ start: 0.8, end: 0 });
        this.emitter.setGravityY(-50);
        break;
      case 2: // Blue - 水滴效果
        this.emitter.setSpeed({ min: 80, max: 150 });
        this.emitter.setScale({ start: 1, end: 0.3 });
        this.emitter.setGravityY(100);
        break;
      case 3: // Yellow - 闪烁效果
        this.emitter.setSpeed({ min: 100, max: 200 });
        this.emitter.setScale({ start: 1.5, end: 0 });
        this.emitter.setAlpha({ start: 1, end: 0, ease: 'Sine.easeInOut' });
        this.emitter.setGravityY(0);
        break;
      case 4: // Magenta - 螺旋效果
        this.emitter.setSpeed({ min: 120, max: 180 });
        this.emitter.setScale({ start: 1, end: 0 });
        this.emitter.setGravityY(0);
        break;
      case 5: // Cyan - 扩散效果
        this.emitter.setSpeed({ min: 200, max: 300 });
        this.emitter.setScale({ start: 0.5, end: 0 });
        this.emitter.setGravityY(0);
        break;
      case 6: // Orange - 火焰效果
        this.emitter.setSpeed({ min: 100, max: 150 });
        this.emitter.setScale({ start: 1.2, end: 0 });
        this.emitter.setGravityY(-80);
        break;
      case 7: // Purple - 烟雾效果
        this.emitter.setSpeed({ min: 50, max: 100 });
        this.emitter.setScale({ start: 0.5, end: 2 });
        this.emitter.setAlpha({ start: 0.8, end: 0 });
        this.emitter.setGravityY(-30);
        break;
    }

    // 更新显示信息
    this.updateInfo();
  }

  updateInfo() {
    const colorData = this.particleColors[this.currentParticleIndex];
    this.infoText.setText(
      `Particle Type: ${this.currentParticleIndex + 1}/8 - ${colorData.name}\n` +
      `Switch Count: ${this.switchCount}\n` +
      `Active Particles: ${this.emitter.getAliveParticleCount()}`
    );
    
    // 更新文本颜色以匹配当前粒子
    const hexColor = '#' + colorData.color.toString(16).padStart(6, '0');
    this.infoText.setColor(hexColor);
  }

  update(time, delta) {
    // 每帧更新粒子数量显示
    if (time % 100 < delta) {
      const colorData = this.particleColors[this.currentParticleIndex];
      this.infoText.setText(
        `Particle Type: ${this.currentParticleIndex + 1}/8 - ${colorData.name}\n` +
        `Switch Count: ${this.switchCount}\n` +
        `Active Particles: ${this.emitter.getAliveParticleCount()}`
      );
    }
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
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(config);