class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.particleEmitter = null;
    this.statusText = null;
    
    // 定义20种不同颜色
    this.particleColors = [
      0xFF0000, // 红色
      0x00FF00, // 绿色
      0x0000FF, // 蓝色
      0xFFFF00, // 黄色
      0xFF00FF, // 品红
      0x00FFFF, // 青色
      0xFF8800, // 橙色
      0x8800FF, // 紫色
      0x00FF88, // 青绿
      0xFF0088, // 玫红
      0x88FF00, // 黄绿
      0x0088FF, // 天蓝
      0xFF8888, // 浅红
      0x88FF88, // 浅绿
      0x8888FF, // 浅蓝
      0xFFFF88, // 浅黄
      0xFF88FF, // 浅品红
      0x88FFFF, // 浅青
      0xFFFFFF, // 白色
      0x888888  // 灰色
    ];
  }

  preload() {
    // 为每种颜色创建粒子纹理
    this.particleColors.forEach((color, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${index}`, 16, 16);
      graphics.destroy();
    });
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建粒子发射器
    this.particleEmitter = this.add.particles(400, 300, `particle0`, {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 2000,
      blendMode: 'ADD',
      frequency: 50,
      maxParticles: 100,
      gravityY: 50
    });

    // 添加状态文本
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加说明文本
    this.add.text(20, 560, 'Click Left Mouse Button to Switch Particle Type', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.switchParticleType();
      }
    });

    // 让粒子跟随鼠标
    this.input.on('pointermove', (pointer) => {
      this.particleEmitter.setPosition(pointer.x, pointer.y);
    });
  }

  switchParticleType() {
    // 切换到下一种粒子类型
    this.currentParticleIndex = (this.currentParticleIndex + 1) % this.particleColors.length;
    
    // 更新粒子发射器的纹理
    this.particleEmitter.setTexture(`particle${this.currentParticleIndex}`);
    
    // 根据不同类型设置不同的粒子效果
    const configs = [
      { speed: { min: 100, max: 200 }, gravityY: 50, angle: { min: 0, max: 360 } },
      { speed: { min: 150, max: 250 }, gravityY: -50, angle: { min: 0, max: 360 } },
      { speed: { min: 50, max: 100 }, gravityY: 100, angle: { min: 0, max: 360 } },
      { speed: 200, gravityY: 0, angle: { min: 0, max: 360 } },
      { speed: { min: 100, max: 300 }, gravityY: 30, angle: { min: -45, max: 45 } },
      { speed: { min: 80, max: 150 }, gravityY: 80, angle: { min: 180, max: 360 } },
      { speed: 250, gravityY: -30, angle: { min: 0, max: 360 } },
      { speed: { min: 120, max: 180 }, gravityY: 0, angle: { min: 90, max: 270 } },
      { speed: { min: 50, max: 150 }, gravityY: 120, angle: { min: 0, max: 360 } },
      { speed: 300, gravityY: 0, angle: { min: 0, max: 360 } },
      { speed: { min: 100, max: 200 }, gravityY: -80, angle: { min: 0, max: 360 } },
      { speed: { min: 150, max: 250 }, gravityY: 60, angle: { min: 0, max: 180 } },
      { speed: 180, gravityY: 40, angle: { min: 0, max: 360 } },
      { speed: { min: 80, max: 120 }, gravityY: 150, angle: { min: 0, max: 360 } },
      { speed: { min: 200, max: 300 }, gravityY: -60, angle: { min: 0, max: 360 } },
      { speed: { min: 100, max: 180 }, gravityY: 0, angle: { min: 0, max: 360 } },
      { speed: 220, gravityY: 90, angle: { min: 0, max: 360 } },
      { speed: { min: 150, max: 200 }, gravityY: -40, angle: { min: 0, max: 360 } },
      { speed: { min: 100, max: 250 }, gravityY: 70, angle: { min: 0, max: 360 } },
      { speed: { min: 120, max: 200 }, gravityY: 50, angle: { min: 0, max: 360 } }
    ];

    const config = configs[this.currentParticleIndex % configs.length];
    this.particleEmitter.setSpeed(config.speed);
    this.particleEmitter.setGravityY(config.gravityY);
    this.particleEmitter.setAngle(config.angle);
    
    // 更新状态文本
    this.updateStatusText();
  }

  updateStatusText() {
    const colorHex = this.particleColors[this.currentParticleIndex].toString(16).padStart(6, '0').toUpperCase();
    this.statusText.setText(
      `Particle Type: ${this.currentParticleIndex + 1}/20\n` +
      `Color: #${colorHex}`
    );
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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